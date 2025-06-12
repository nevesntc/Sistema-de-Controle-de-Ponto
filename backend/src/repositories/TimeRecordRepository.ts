import { TimeRecord, CreateTimeRecordDTO, WorkSession, DailyWorkSummary } from '@/types/TimeRecord';
import database from '@/database/connection';
import { format } from 'date-fns';

export interface ITimeRecordRepository {
  createRecord(recordData: CreateTimeRecordDTO): Promise<TimeRecord>;
  getLatestRecord(userId: string): Promise<TimeRecord | null>;
  getWorkHistory(userId: string, page: number, limit: number): Promise<{ records: DailyWorkSummary[]; total: number }>;
  getCurrentWorkSession(userId: string): Promise<WorkSession | null>;
  updateWorkSession(sessionId: string, exitTime: Date): Promise<WorkSession | null>;
  createWorkSession(userId: string, entryTime: Date): Promise<WorkSession>;
}

export class TimeRecordRepository implements ITimeRecordRepository {
  async createRecord(recordData: CreateTimeRecordDTO): Promise<TimeRecord> {
    const query = `
      INSERT INTO registros_ponto (user_id, data_hora, tipo)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, data_hora, tipo, created_at
    `;
    
    const result = await database.query(query, [
      recordData.userId,
      new Date(),
      recordData.tipo,
    ]);

    const record = result.rows[0];
    return {
      id: record.id,
      userId: record.user_id,
      dataHora: record.data_hora,
      tipo: record.tipo,
      createdAt: record.created_at,
    };
  }

  async getLatestRecord(userId: string): Promise<TimeRecord | null> {
    const query = `
      SELECT id, user_id, data_hora, tipo, created_at 
      FROM registros_ponto 
      WHERE user_id = $1 
      ORDER BY data_hora DESC 
      LIMIT 1
    `;
    
    const result = await database.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const record = result.rows[0];
    return {
      id: record.id,
      userId: record.user_id,
      dataHora: record.data_hora,
      tipo: record.tipo,
      createdAt: record.created_at,
    };
  }

  async getWorkHistory(userId: string, page: number, limit: number): Promise<{ records: DailyWorkSummary[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Consulta para obter o histórico agrupado por data
    const query = `
      WITH daily_records AS (
        SELECT 
          DATE(data_hora) as data,
          MIN(CASE WHEN tipo = 'entrada' THEN data_hora END) as entrada,
          MAX(CASE WHEN tipo = 'saida' THEN data_hora END) as saida
        FROM registros_ponto 
        WHERE user_id = $1
        GROUP BY DATE(data_hora)
        ORDER BY data DESC
        LIMIT $2 OFFSET $3
      )
      SELECT 
        data,
        entrada,
        saida,
        CASE 
          WHEN entrada IS NOT NULL AND saida IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (saida - entrada)) / 3600
          ELSE 0
        END as total_horas
      FROM daily_records
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT DATE(data_hora)) as total
      FROM registros_ponto 
      WHERE user_id = $1
    `;

    const [recordsResult, countResult] = await Promise.all([
      database.query(query, [userId, limit, offset]),
      database.query(countQuery, [userId]),
    ]);

    const records: DailyWorkSummary[] = recordsResult.rows.map((row: any) => ({
      data: format(row.data, 'dd-MM-yyyy'),
      entrada: row.entrada ? format(row.entrada, 'HH:mm') : undefined,
      saida: row.saida ? format(row.saida, 'HH:mm') : undefined,
      totalHoras: Number(row.total_horas) || 0,
      emAndamento: row.entrada && !row.saida,
    }));

    return {
      records,
      total: Number(countResult.rows[0].total),
    };
  }

  async getCurrentWorkSession(userId: string): Promise<WorkSession | null> {
    const query = `
      SELECT id, user_id, entrada, saida, total_horas, data, created_at, updated_at
      FROM sessoes_trabalho 
      WHERE user_id = $1 AND saida IS NULL 
      ORDER BY entrada DESC 
      LIMIT 1
    `;
    
    const result = await database.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const session = result.rows[0];
    return {
      id: session.id,
      userId: session.user_id,
      entrada: session.entrada,
      saida: session.saida,
      totalHoras: session.total_horas,
      data: session.data,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    };
  }

  async createWorkSession(userId: string, entryTime: Date): Promise<WorkSession> {
    const query = `
      INSERT INTO sessoes_trabalho (user_id, entrada, data)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, entrada, saida, total_horas, data, created_at, updated_at
    `;
    
    const result = await database.query(query, [
      userId,
      entryTime,
      format(entryTime, 'yyyy-MM-dd'),
    ]);

    const session = result.rows[0];
    return {
      id: session.id,
      userId: session.user_id,
      entrada: session.entrada,
      saida: session.saida,
      totalHoras: session.total_horas,
      data: session.data,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    };
  }

  async updateWorkSession(sessionId: string, exitTime: Date): Promise<WorkSession | null> {
    // Primeiro, obter a sessão atual
    const getSessionQuery = `
      SELECT entrada FROM sessoes_trabalho WHERE id = $1
    `;
    const sessionResult = await database.query(getSessionQuery, [sessionId]);
    
    if (sessionResult.rows.length === 0) {
      return null;
    }

    const entryTime = sessionResult.rows[0].entrada;
    const totalHours = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);

    const updateQuery = `
      UPDATE sessoes_trabalho 
      SET saida = $1, total_horas = $2
      WHERE id = $3
      RETURNING id, user_id, entrada, saida, total_horas, data, created_at, updated_at
    `;
    
    const result = await database.query(updateQuery, [exitTime, totalHours, sessionId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const session = result.rows[0];
    return {
      id: session.id,
      userId: session.user_id,
      entrada: session.entrada,
      saida: session.saida,
      totalHoras: session.total_horas,
      data: session.data,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    };
  }
}
