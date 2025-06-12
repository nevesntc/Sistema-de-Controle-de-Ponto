import { TimeRecordService } from '../services/TimeRecordService';
import { TimeRecordRepository } from '../repositories/TimeRecordRepository';

jest.mock('@/repositories/TimeRecordRepository');

describe('TimeRecordService', () => {
  let timeRecordService: TimeRecordService;
  let mockTimeRecordRepository: jest.Mocked<TimeRecordRepository>;

  beforeEach(() => {
    mockTimeRecordRepository = new TimeRecordRepository() as jest.Mocked<TimeRecordRepository>;
    timeRecordService = new TimeRecordService(mockTimeRecordRepository);
  });

  describe('registrarPonto', () => {
    it('deve registrar entrada se não houver registro anterior', async () => {
      mockTimeRecordRepository.getLatestRecord.mockResolvedValue(null);
      mockTimeRecordRepository.createWorkSession.mockResolvedValue({} as any);
      mockTimeRecordRepository.createRecord.mockResolvedValue({ tipo: 'entrada', dataHora: new Date() } as any);
      const result = await timeRecordService.registrarPonto('user-id');
      expect(result.sucesso).toBe(true);
      expect(result.dados?.tipo).toBe('entrada');
    });
    it('deve registrar saída se último registro for entrada', async () => {
      mockTimeRecordRepository.getLatestRecord.mockResolvedValue({ tipo: 'entrada' } as any);
      mockTimeRecordRepository.getCurrentWorkSession.mockResolvedValue({ id: 'sessao-id', entrada: new Date() } as any);
      mockTimeRecordRepository.updateWorkSession.mockResolvedValue({} as any);
      mockTimeRecordRepository.createRecord.mockResolvedValue({ tipo: 'saida', dataHora: new Date() } as any);
      const result = await timeRecordService.registrarPonto('user-id');
      expect(result.sucesso).toBe(true);
      expect(result.dados?.tipo).toBe('saida');
    });
  });

  describe('obterHistoricoTrabalho', () => {
    it('deve retornar histórico paginado', async () => {
      mockTimeRecordRepository.getWorkHistory.mockResolvedValue({ records: [{ data: '01-01-2024', totalHoras: 8, emAndamento: false }], total: 1 });
      const result = await timeRecordService.obterHistoricoTrabalho('user-id', 1, 10);
      expect(result.sucesso).toBe(true);
      expect(result.dados?.historico.length).toBe(1);
    });
  });

  describe('obterStatusAtual', () => {
    it('deve retornar emAndamento true se houver sessão aberta', async () => {
      mockTimeRecordRepository.getCurrentWorkSession.mockResolvedValue({ entrada: new Date() } as any);
      const result = await timeRecordService.obterStatusAtual('user-id');
      expect(result.sucesso).toBe(true);
      expect(result.dados?.emAndamento).toBe(true);
    });
    it('deve retornar emAndamento false se não houver sessão aberta', async () => {
      mockTimeRecordRepository.getCurrentWorkSession.mockResolvedValue(null);
      const result = await timeRecordService.obterStatusAtual('user-id');
      expect(result.sucesso).toBe(true);
      expect(result.dados?.emAndamento).toBe(false);
    });
  });
});
