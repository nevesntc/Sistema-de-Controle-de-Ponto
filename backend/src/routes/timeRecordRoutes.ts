import { Router } from 'express';
import { TimeRecordController } from '@/controllers/TimeRecordController';
import { authMiddleware } from '@/middleware/authMiddleware';

const router = Router();
const timeRecordController = new TimeRecordController();

// Todas as rotas de ponto precisam de autenticação
router.use(authMiddleware);

// Registrar ponto (entrada/saída)
router.post('/registrar', (req, res) => timeRecordController.registrarPonto(req, res));

// Obter histórico de trabalho
router.get('/historico', (req, res) => timeRecordController.obterHistorico(req, res));

// Obter status atual (se está trabalhando)
router.get('/status', (req, res) => timeRecordController.obterStatusAtual(req, res));

// Baixar relatório CSV de pontos do usuário autenticado
router.get('/relatorio', (req, res) => timeRecordController.baixarRelatorio(req, res));

export { router as timeRecordRoutes };
