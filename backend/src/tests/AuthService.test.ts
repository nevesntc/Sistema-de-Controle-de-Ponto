import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock do UserRepository
jest.mock('@/repositories/UserRepository');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    authService = new AuthService(mockUserRepository);
    // Mock do bcrypt
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    // Mock do jwt
    (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');
    (jwt.verify as jest.Mock).mockReturnValue({ userId: '1', email: 'test@example.com' });
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        nome: 'Test User',
        senha: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: '1',
        email: userData.email,
        nome: userData.nome,
        createdAt: new Date(),
      });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.sucesso).toBe(true);
      expect(result.dados?.user.email).toBe(userData.email);
      expect(result.dados?.token).toBeDefined();
    });

    it('deve retornar erro se e-mail já existir', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        nome: 'Test User',
        senha: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: userData.email,
        nome: userData.nome,
        senha: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.sucesso).toBe(false);
      expect(result.erro).toBe('E-mail já está em uso');
    });
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        senha: 'password123',
      };

      const mockUser = {
        id: '1',
        email: loginData.email,
        nome: 'Test User',
        senha: '$2a$10$hash', // senha hasheada
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
    });
  });
});
