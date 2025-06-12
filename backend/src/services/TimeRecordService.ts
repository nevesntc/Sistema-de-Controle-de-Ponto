import { CreateTimeRecordDTO, WorkHistoryResponse, DailyWorkSummary } from '@/types/TimeRecord';
import { ApiResponse } from '@/types/Common';
import { ITimeRecordRepository } from '@/repositories/TimeRecordRepository';

export interface ITimeRecordService {
  registrarPonto(userId: string): Promise<ApiResponse<{ tipo: string; dataHora: Date }>>;
  obterHistoricoTrabalho(userId: string, pagina: number, limite: number): Promise<ApiResponse<WorkHistoryResponse>>;
  obterStatusAtual(userId: string): Promise<ApiResponse<{ emAndamento: boolean; tempoDecorrido?: number }>>;
}

export class TimeRecordService implements ITimeRecordService {
  constructor(private timeRecordRepository: ITimeRecordRepository) {}

  async registrarPonto(userId: string): Promise<ApiResponse<{ tipo: string; dataHora: Date }>> {
    try {
      // Verificar o último registro
      const ultimoRegistro = await this.timeRecordRepository.getLatestRecord(userId);
      
      let tipo: 'entrada' | 'saida';
      
      if (!ultimoRegistro || ultimoRegistro.tipo === 'saida') {
        tipo = 'entrada';
        // Criar nova sessão de trabalho
        await this.timeRecordRepository.createWorkSession(userId, new Date());
      } else {
        tipo = 'saida';
        // Finalizar sessão de trabalho atual
        const sessaoAtual = await this.timeRecordRepository.getCurrentWorkSession(userId);
        if (sessaoAtual) {
          await this.timeRecordRepository.updateWorkSession(sessaoAtual.id, new Date());
        }
      }

      // Registrar o ponto
      const registro = await this.timeRecordRepository.createRecord({
        userId,
        tipo,
      });

      return {
        sucesso: true,
        dados: {
          tipo: registro.tipo,
          dataHora: registro.dataHora,
        },
        mensagem: `Ponto de ${tipo} registrado com sucesso`,
      };
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      return {
        sucesso: false,
        erro: 'Erro ao registrar ponto',
      };
    }
  }

  async obterHistoricoTrabalho(
    userId: string,
    pagina: number = 1,
    limite: number = 10
  ): Promise<ApiResponse<WorkHistoryResponse>> {
    try {
      const { records, total } = await this.timeRecordRepository.getWorkHistory(userId, pagina, limite);
      
      const totalPaginas = Math.ceil(total / limite);

      return {
        sucesso: true,
        dados: {
          historico: records,
          totalPaginas,
          paginaAtual: pagina,
        },
        mensagem: 'Histórico obtido com sucesso',
      };
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      return {
        sucesso: false,
        erro: 'Erro ao obter histórico de trabalho',
      };
    }
  }

  async obterStatusAtual(userId: string): Promise<ApiResponse<{ emAndamento: boolean; tempoDecorrido?: number }>> {
    try {
      const sessaoAtual = await this.timeRecordRepository.getCurrentWorkSession(userId);
      
      if (!sessaoAtual) {
        return {
          sucesso: true,
          dados: { emAndamento: false },
          mensagem: 'Nenhuma sessão de trabalho ativa',
        };
      }

      const agora = new Date();
      const tempoDecorrido = Math.floor((agora.getTime() - sessaoAtual.entrada.getTime()) / 1000);

      return {
        sucesso: true,
        dados: {
          emAndamento: true,
          tempoDecorrido,
        },
        mensagem: 'Status atual obtido com sucesso',
      };
    } catch (error) {
      console.error('Erro ao obter status atual:', error);
      return {
        sucesso: false,
        erro: 'Erro ao obter status atual',
      };
    }
  }
}
