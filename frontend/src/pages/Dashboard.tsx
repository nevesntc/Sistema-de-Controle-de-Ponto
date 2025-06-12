import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";

interface WorkRecord {
  date: string;
  entryTime: string;
  exitTime: string;
  totalHours: number;
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [connectionError, setConnectionError] = useState(false);
  const [stoppedTime, setStoppedTime] = useState<string | null>(null);
  const navigate = useNavigate();

  // Busca dados do usuário logado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.nome ?? payload.email ?? "Usuário");
    } catch {
      setUserName("");
    }
  }, []);

  // Busca histórico do backend
  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3001/api/ponto/historico", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro de conexão");
      const data = await res.json();
      if (data.sucesso && data.dados?.historico) {
        // Filtra apenas os últimos 7 dias com registro
        const ultimos7 = data.dados.historico.slice(0, 7);
        setWorkRecords(
          ultimos7.map((item: any) => ({
            date: item.data ?? "-",
            entryTime: item.entrada ?? "-",
            exitTime: item.saida ?? "-",
            totalHours: item.totalHoras !== undefined && item.totalHoras !== null
              ? Number(item.totalHoras).toFixed(1)
              : "-",
          }))
        );
        setConnectionError(false);
      } else {
        setError(data.erro ?? "Erro ao buscar histórico");
      }
    } catch {
      setConnectionError(true);
      setError("Erro de conexão com o servidor");
    }
  };

  // Busca status atual (se está trabalhando)
  const fetchStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3001/api/ponto/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro de conexão");
      const data = await res.json();
      if (data.sucesso && data.dados?.emAndamento) {
        setIsWorking(true);
        if (data.dados.tempoDecorrido) {
          const now = new Date();
          setStartTime(new Date(now.getTime() - data.dados.tempoDecorrido * 1000));
        }
        setConnectionError(false);
      } else {
        setIsWorking(false);
        setStartTime(null);
        setCurrentTime("00:00:00");
      }
    } catch {
      setConnectionError(true);
      setError("Erro ao buscar status atual");
    }
  };

  // Atualiza histórico e status a cada 10 segundos
  useEffect(() => {
    fetchHistory();
    fetchStatus();
    const interval = setInterval(() => {
      fetchHistory();
      fetchStatus();
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // Atualiza o timer em tempo real sincronizado com o backend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorking && startTime) {
      setStoppedTime(null); // Reset ao iniciar turno
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCurrentTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }, 1000);
    } else if (stoppedTime) {
      setCurrentTime(stoppedTime); // Mostra o tempo parado
    } else {
      setCurrentTime("00:00:00");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorking, startTime, stoppedTime]);

  // Iniciar ou parar turno
  const handleToggleWork = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3001/api/ponto/registrar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.sucesso) {
        fetchHistory();
        fetchStatus();
        // Se parou o turno, mostra o tempo total até o momento
        if (isWorking && startTime) {
          const now = new Date();
          const diff = now.getTime() - startTime.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setStoppedTime(
            `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
          );
        } else {
          setStoppedTime(null);
        }
      } else {
        setError(data.erro ?? "Erro ao registrar ponto");
      }
    } catch {
      setError("Erro ao registrar ponto");
    }
  };

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Função para baixar relatório CSV
  const handleDownloadCSV = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3001/api/ponto/relatorio", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao baixar relatório");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio_ponto.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Erro ao baixar relatório");
    }
  };

  // O histórico agora só mostra registros reais, limitados aos últimos 7 dias
  const historyToShow = workRecords;

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-2 sm:p-4 relative">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-0">
        <div className="text-white text-lg sm:text-xl font-bold font-mono text-center sm:text-left">
          {userName ? `Colaborador: ${userName}` : "Colaborador"}
        </div>
        <Button
          onClick={handleLogout}
          className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 rounded-full shadow-lg w-full sm:w-auto"
        >
          Sair
        </Button>
      </div>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Feedback visual de conexão */}
        {connectionError && (
          <div className="bg-red-600 text-white text-center rounded p-2 font-semibold animate-pulse">
            Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está rodando.
          </div>
        )}
        {/* Timer Section */}
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <div className="relative w-full flex justify-center">
            <Button
              onClick={handleToggleWork}
              className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-primary hover:bg-primary/90 text-white flex flex-col items-center justify-center text-lg sm:text-xl font-medium shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="text-xl sm:text-2xl font-mono mb-2">{currentTime}</div>
              <div className="text-base sm:text-lg">
                {isWorking ? "Parar turno" : "Iniciar turno"}
              </div>
            </Button>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {/* Botão de download do relatório CSV */}
        <div className="flex justify-end mb-2">
          <Button
            onClick={handleDownloadCSV}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded shadow font-semibold w-full sm:w-auto"
          >
            Baixar relatório (CSV)
          </Button>
        </div>
        {/* Work History */}
        <div className="space-y-4">
          {historyToShow.length === 0 && (
            <div className="text-zinc-400 text-center">Nenhum registro encontrado.</div>
          )}
          {historyToShow.map((record) => (
            <div key={record.date} className="bg-zinc-800 rounded-lg p-3 sm:p-4 space-y-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
              <div className="text-white font-medium text-sm sm:text-base">Data: {record.date}</div>
              <div className="text-zinc-400 text-xs sm:text-sm">Entrada: {record.entryTime}</div>
              <div className="text-zinc-400 text-xs sm:text-sm">Saída: {record.exitTime}</div>
              <div className="text-zinc-400 text-xs sm:text-sm">Horas totais: {record.totalHours}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
