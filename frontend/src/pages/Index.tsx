import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Olá, Colaborador</h1>
          <p className="text-zinc-400 text-lg">Escolha uma das opções</p>
        </div>

        <div className="space-y-4">
          <Link to="/login" className="block">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-medium bg-primary hover:bg-primary/90 text-white rounded-full"
            >
              Já tenho conta
            </Button>
          </Link>

          <Link to="/register" className="block">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-medium bg-primary hover:bg-primary/90 text-white rounded-full"
            >
              Não tenho conta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
