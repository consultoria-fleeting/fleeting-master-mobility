import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import DashboardRanking from "./pages/DashboardRanking";
import DashboardParametros from "./pages/DashboardParametros";
import DetalhamentoInfracao from "./pages/DetalhamentoInfracao";
import PerformanceCondutores from "./pages/PerformanceCondutores";
import MatrizPontuacao from "./pages/MatrizPontuacao";
import GestaoExcecoes from "./pages/GestaoExcecoes";
import AnalisesPreditivas from "./pages/AnalisesPreditivas";
import CondutoresCategoria from "./pages/CondutoresCategoria";
import DetalheCondutor from "./pages/DetalheCondutor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard-ranking" replace />} />
            <Route path="/dashboard-ranking" element={<DashboardRanking />} />
            <Route path="/dashboard-parametros" element={<DashboardParametros />} />
            <Route path="/dashboard-parametros/:id" element={<DetalhamentoInfracao />} />
            <Route path="/performance-condutores" element={<PerformanceCondutores />} />
            <Route path="/performance-condutores/:nome" element={<DetalheCondutor />} />
            <Route path="/matriz-pontuacao" element={<MatrizPontuacao />} />
            <Route path="/gestao-excecoes" element={<GestaoExcecoes />} />
            <Route path="/analises-preditivas" element={<AnalisesPreditivas />} />
            <Route path="/condutores-categoria/:categoria" element={<CondutoresCategoria />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
