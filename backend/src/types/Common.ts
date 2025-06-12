export interface ApiResponse<T = any> {
  sucesso: boolean;
  dados?: T;
  mensagem?: string;
  erro?: string;
}

export interface PaginationParams {
  pagina?: number;
  limite?: number;
}

export interface AuthPayload {
  userId: string;
  email: string;
}
