import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/AuthService';
import { UserRepository } from '@/repositories/UserRepository';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        sucesso: false,
        erro: 'Token de acesso é obrigatório',
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        sucesso: false,
        erro: 'Token inválido',
      });
      return;
    }

    const userRepository = new UserRepository();
    const authService = new AuthService(userRepository);
    
    const decoded = await authService.verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        sucesso: false,
        erro: 'Token inválido ou expirado',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor',
    });
  }
};

export { AuthRequest };
