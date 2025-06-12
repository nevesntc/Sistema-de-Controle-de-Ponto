import { Response } from 'express';
import { z } from 'zod';
import { TimeRecordService } from '@/services/TimeRecordService';
import { TimeRecordRepository } from '@/repositories/TimeRecordRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { AuthRequest } from '@/middleware/authMiddleware';

const historyQuerySchema = z.object({
  query: z.object({
    pagina: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limite: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  }),
});

export class TimeRecordController {
  private timeRecordService: TimeRecordService;
  private userRepository: UserRepository;

  constructor() {
    this.timeRecordService = new TimeRecordService(new TimeRecordRepository());
    this.userRepository = new UserRepository();
  }

  async registrarPonto(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          sucesso: false,
          erro: 'Usuário não autenticado',
        });
        return;
      }

      const result = await this.timeRecordService.registrarPonto(req.user.userId);
      
      if (result.sucesso) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
      });
    }
  }

  async obterHistorico(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          sucesso: false,
          erro: 'Usuário não autenticado',
        });
        return;
      }

      const { query } = historyQuerySchema.parse({ query: req.query });
      
      const result = await this.timeRecordService.obterHistoricoTrabalho(
        req.user.userId,
        query.pagina,
        query.limite
      );
      
      if (result.sucesso) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          sucesso: false,
          erro: 'Parâmetros inválidos',
          detalhes: error.errors,
        });
        return;
      }

      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
      });
    }
  }

  async obterStatusAtual(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          sucesso: false,
          erro: 'Usuário não autenticado',
        });
        return;
      }

      const result = await this.timeRecordService.obterStatusAtual(req.user.userId);
      
      if (result.sucesso) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
      });
    }
  }

  async baixarRelatorio(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ sucesso: false, erro: 'Usuário não autenticado' });
        return;
      }
      // Busca dados do usuário
      const user = await this.userRepository.findById(req.user.userId);
      // Busca todos os registros do usuário
      const { records } = await this.timeRecordService['timeRecordRepository'].getWorkHistory(req.user.userId, 1, 10000);
      // Monta CSV bonito
      let csv = '';
      if (user) {
        csv += `Relatório de Ponto\nUsuário: ${user.nome} (${user.email})\n\n`;
      }
      csv += 'Data,Entrada,Saída,Horas Totais\n';
      records.forEach((r: any) => {
        csv += `${r.data},${r.entrada ?? '-'},${r.saida ?? '-'},${r.totalHoras !== undefined && r.totalHoras !== null ? Number(r.totalHoras).toFixed(1) : '-'}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio_ponto.csv"');
      res.status(200).send(csv);
    } catch (error) {
      res.status(500).json({ sucesso: false, erro: 'Erro ao gerar relatório' });
    }
  }
}
