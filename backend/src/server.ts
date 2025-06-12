import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRoutes } from '@/routes';
import config from '@/config';
import createTables from '@/database/migrate';
import seedDatabase from '@/database/seed';

const app = express();

// Middlewares de segurança
app.use(helmet());

// Configuração CORS
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api', apiRoutes);

// Middleware de tratamento de erros global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  
  res.status(500).json({
    sucesso: false,
    erro: 'Erro interno do servidor',
    ...(config.nodeEnv === 'development' && { detalhes: err.message }),
  });
});

// Middleware para rotas não encontradas
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    sucesso: false,
    erro: 'Rota não encontrada',
  });
});

// Inicialização do servidor
const startServer = async (): Promise<void> => {
  try {
    // Executar migrações
    console.log(' - Executando migrações...');
    await createTables();

    // Executar seed (dados iniciais)
    console.log(' - Executando seed...');
    await seedDatabase();

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`   - Servidor rodando na porta ${config.port}`);
      console.log(`   - Ambiente: ${config.nodeEnv}`);
      console.log(`   - CORS habilitado para: ${config.cors.allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('   - Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais para fechamento gracioso
process.on('SIGTERM', () => {
  console.log('   - Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('   - Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

// Iniciar servidor se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

export default app;
