import { useParams, Link } from 'react-router-dom';
import { condutores, eventosDetalhados } from '@/data/mockData';
import ClassificationBadge from '@/components/ClassificationBadge';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalisePreditivaCondutor, { buildCondutorPreditivo } from '@/components/AnalisePreditivaCondutor';
import { useMemo } from 'react';

export default function DetalheCondutor() {
  const { nome } = useParams();
  const decodedNome = decodeURIComponent(nome || '');
  const condutor = condutores.find(c => c.nome === decodedNome);
  const eventos = eventosDetalhados.filter(e => e.condutor === decodedNome);

  // Mapeia pontuação (0-100, maior = melhor) para IRC (0-100, maior = pior)
  const condutorPreditivo = useMemo(() => {
    if (!condutor) return null;
    const baseIrc = Math.max(5, Math.min(95, 100 - (condutor.pontuacao ?? 50)));
    return buildCondutorPreditivo(condutor.nome, baseIrc);
  }, [condutor]);

  if (!condutor) {
    return <div className="text-center py-20 text-muted-foreground">Condutor não encontrado</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/performance-condutores" className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">{condutor.nome}</h1>
          <p className="page-subtitle">{condutor.funcao} — {condutor.departamento} — {condutor.negocio}</p>
        </div>
      </div>

      <Tabs defaultValue="ranking" className="w-full">
        <TabsList>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="preditiva">Análise Preditiva</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="space-y-6 mt-4">
          {/* Info cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-card rounded-lg border p-4">
              <p className="text-[10px] text-muted-foreground uppercase">Pontuação</p>
              <p className="text-2xl font-bold mt-1">{condutor.pontuacao}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-[10px] text-muted-foreground uppercase">Classificação</p>
              <div className="mt-2"><ClassificationBadge classificacao={condutor.classificacao} size="md" /></div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-[10px] text-muted-foreground uppercase">Gestor</p>
              <p className="text-sm font-medium mt-1">{condutor.gestor}</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-[10px] text-muted-foreground uppercase">Centro de Custo</p>
              <p className="text-sm font-medium mt-1">{condutor.centroCusto}</p>
            </div>
          </div>

          {/* Monthly scores */}
          {condutor.pontuacoesMensais && (
            <div className="bg-card rounded-lg border p-5">
              <h3 className="section-title">Pontuações Mensais</h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(condutor.pontuacoesMensais).map(([mes, pts]) => (
                  <div key={mes} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">{mes}</p>
                    <p className="text-lg font-bold mt-1">{pts}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          <div className="bg-card rounded-lg border p-5">
            <h3 className="section-title">Eventos Registrados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b text-muted-foreground">
                  <th className="text-left py-2">Data</th><th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Gravidade</th><th className="text-right py-2">Impacto</th>
                  <th className="text-right py-2 px-2">Status</th>
                </tr></thead>
                <tbody>
                  {eventos.length > 0 ? eventos.map(e => (
                    <tr key={e.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 text-muted-foreground">{e.data}</td>
                      <td className="py-2">{e.tipo}</td>
                      <td className="py-2">{e.gravidade}</td>
                      <td className="py-2 text-right font-bold text-danger">{e.impactoPontuacao}</td>
                      <td className="py-2 px-2 text-right text-muted-foreground">{e.status}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum evento registrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preditiva" className="mt-4">
          {condutorPreditivo && <AnalisePreditivaCondutor condutor={condutorPreditivo} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
