export interface User {
  id: string;
  email: string;
  nome: string;
  senha: string;
  cargo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  nome: string;
  senha: string;
  cargo?: string;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface UserResponse {
  id: string;
  email: string;
  nome: string;
  cargo?: string;
  createdAt: Date;
}
