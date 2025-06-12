import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Registro de usuário
router.post('/registro', (req, res) => authController.register(req, res));

// Login
router.post('/login', (req, res) => authController.login(req, res));

export { router as authRoutes };
