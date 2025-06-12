import { authMiddleware } from '../middleware/authMiddleware';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';

jest.mock('@/services/AuthService');
jest.mock('@/repositories/UserRepository');

describe('authMiddleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = new AuthService(new UserRepository()) as jest.Mocked<AuthService>;
    (AuthService as jest.Mock).mockImplementation(() => mockAuthService);
    req = { headers: { authorization: 'Bearer token' } };
    res = { status: jest.fn(() => res), json: jest.fn() };
    next = jest.fn();
  });

  it('deve chamar next se token válido', async () => {
    mockAuthService.verifyToken.mockResolvedValue({ userId: '1', email: 'a@a.com' });
    await authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it('deve retornar 401 se token inválido', async () => {
    mockAuthService.verifyToken.mockResolvedValue(null);
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
