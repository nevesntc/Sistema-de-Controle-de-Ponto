import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { timeRecordRoutes } from './timeRecordRoutes';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de controle de ponto
router.use('/ponto', timeRecordRoutes);

// Rota de status da API
router.get('/status', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'API de Controle de Ponto funcionando',
    versao: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export { router as apiRoutes };
