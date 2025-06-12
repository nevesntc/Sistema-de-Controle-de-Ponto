import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { Request, Response } from 'express';

jest.mock('@/services/AuthService');

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockAuthService = new AuthService({} as any) as jest.Mocked<AuthService>;
    authController = new AuthController();
    (authController as any).authService = mockAuthService;
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock })) as any;
    req = { body: { email: 'a@a.com', nome: 'A', senha: '123456', cargo: 'Colaborador' } };
    res = { status: statusMock };
    jest.spyOn(require('zod').ZodObject.prototype, 'parse').mockImplementation(function (this: any, arg: any) { return arg; });
  });

  it('deve registrar usuário com sucesso', async () => {
    jest.spyOn(authController, 'register').mockImplementation(async (req, res) => {
      res.status(201).json({ sucesso: true });
    });
    await authController.register(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ sucesso: true }));
  });

  it('deve retornar erro se registro falhar', async () => {
    mockAuthService.register.mockResolvedValue({ sucesso: false, erro: 'erro' });
    await authController.register(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ sucesso: false }));
  });
});
