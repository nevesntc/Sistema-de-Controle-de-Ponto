import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { CreateUserDTO, LoginDTO, UserResponse } from '@/types/User';
import { ApiResponse, AuthPayload } from '@/types/Common';
import { IUserRepository } from '@/repositories/UserRepository';
import config from '@/config';

export interface IAuthService {
  register(userData: CreateUserDTO): Promise<ApiResponse<{ user: UserResponse; token: string }>>;
  login(loginData: LoginDTO): Promise<ApiResponse<{ user: UserResponse; token: string }>>;
  verifyToken(token: string): Promise<AuthPayload | null>;
}

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(userData: CreateUserDTO): Promise<ApiResponse<{ user: UserResponse; token: string }>> {
    try {
      // Verificar se o usuário já existe
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        return {
          sucesso: false,
          erro: 'E-mail já está em uso',
        };
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.senha, 10);
      
      // Criar usuário
      const user = await this.userRepository.create({
        ...userData,
        senha: hashedPassword,
      });

      // Gerar token
      const signOptions = { expiresIn: config.jwt.expiresIn } as unknown as SignOptions;
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        String(config.jwt.secret),
        signOptions
      );

      return {
        sucesso: true,
        dados: { user, token },
        mensagem: 'Usuário registrado com sucesso',
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: 'Erro interno do servidor',
      };
    }
  }

  async login(loginData: LoginDTO): Promise<ApiResponse<{ user: UserResponse; token: string }>> {
    try {
      // Buscar usuário
      const user = await this.userRepository.findByEmail(loginData.email);
      if (!user) {
        return {
          sucesso: false,
          erro: 'E-mail ou senha inválidos',
        };
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(loginData.senha, user.senha);
      if (!isPasswordValid) {
        return {
          sucesso: false,
          erro: 'E-mail ou senha inválidos',
        };
      }

      // Gerar token
      const signOptionsLogin = { expiresIn: config.jwt.expiresIn } as unknown as SignOptions;
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        String(config.jwt.secret),
        signOptionsLogin
      );

      // Preparar resposta do usuário (sem senha)
      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        nome: user.nome,
        cargo: user.cargo,
        createdAt: user.createdAt,
      };

      return {
        sucesso: true,
        dados: { user: userResponse, token },
        mensagem: 'Login realizado com sucesso',
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: 'Erro interno do servidor',
      };
    }
  }

  async verifyToken(token: string): Promise<AuthPayload | null> {
    try {
      const decoded = jwt.verify(token, String(config.jwt.secret)) as AuthPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
