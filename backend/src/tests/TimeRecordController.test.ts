import { TimeRecordController } from '../controllers/TimeRecordController';
import { TimeRecordService } from '../services/TimeRecordService';
import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

jest.mock('@/services/TimeRecordService');

describe('TimeRecordController', () => {
  let controller: TimeRecordController;
  let mockService: jest.Mocked<TimeRecordService>;
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockService = new TimeRecordService({} as any) as jest.Mocked<TimeRecordService>;
    controller = new TimeRecordController();
    (controller as any).timeRecordService = mockService;
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock })) as any;
    req = { user: { userId: 'user-id', email: 'user@example.com' }, query: {} };
    res = { status: statusMock };
  });

  it('deve registrar ponto com sucesso', async () => {
    mockService.registrarPonto.mockResolvedValue({ sucesso: true });
    await controller.registrarPonto(req as AuthRequest, res as Response);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ sucesso: true }));
  });

  it('deve retornar erro se não autenticado', async () => {
    await controller.registrarPonto({} as AuthRequest, res as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
  });
});
