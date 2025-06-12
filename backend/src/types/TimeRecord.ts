export interface TimeRecord {
  id: string;
  userId: string;
  dataHora: Date;
  tipo: 'entrada' | 'saida';
  createdAt: Date;
}

export interface CreateTimeRecordDTO {
  userId: string;
  tipo: 'entrada' | 'saida';
}

export interface WorkSession {
  id: string;
  userId: string;
  entrada: Date;
  saida?: Date;
  totalHoras?: number;
  data: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyWorkSummary {
  data: string;
  entrada?: string;
  saida?: string;
  totalHoras: number;
  emAndamento: boolean;
}

export interface WorkHistoryResponse {
  historico: DailyWorkSummary[];
  totalPaginas: number;
  paginaAtual: number;
}
