import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '@/services/AuthService';
import { UserRepository } from '@/repositories/UserRepository';

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('E-mail inválido'),
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    cargo: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(1, 'Senha é obrigatória'),
  }),
});

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService(new UserRepository());
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { body } = registerSchema.parse({ body: req.body });
      
      const result = await this.authService.register(body);
      
      if (result.sucesso) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          detalhes: error.errors,
        });
        return;
      }

      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { body } = loginSchema.parse({ body: req.body });
      
      const result = await this.authService.login(body);
      
      if (result.sucesso) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          detalhes: error.errors,
        });
        return;
      }

      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
      });
    }
  }
}
