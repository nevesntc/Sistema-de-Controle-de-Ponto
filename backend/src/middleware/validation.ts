import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          detalhes: error.errors.map(err => ({
            campo: err.path.join('.'),
            mensagem: err.message,
          })),
        });
        return;
      }
      
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
      });
    }
  };
};
