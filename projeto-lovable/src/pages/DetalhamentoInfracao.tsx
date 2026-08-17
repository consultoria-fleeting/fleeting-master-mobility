import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { parametrosRanking, condutores, getClassificacao } from '@/data/mockData';
import { ArrowLeft } from 'lucide-react';
import ClassificationBadge from '@/components/ClassificationBadge';

// Generate mock events for each parametro using condutores
function generateEvents(paramId: string, paramLabel: string) {
  return condutores.map((c, i) => ({
    id: `${paramId}-${i}`,
    data: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/02/2026`,
    condutor: c.nome,
    gestor: c.gestor,
    departamento: c.departamento,
    funcao: c.funcao,
    negocio: c.negocio,
    classificacao: c.classificacao,
  }));
}

const ITEMS_PER_PAGE = 15;

export default function DetalhamentoInfracao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const param = parametrosRanking.find(p => p.id === id);
  const [page, setPage] = useState(1);

  if (!param) {
    return <div className="text-center py-20 text-muted-foreground">Parâmetro não encontrado</div>;
  }

  const allEvents = generateEvents(param.id, param.label);
  const totalPages = Math.ceil(allEvents.length / ITEMS_PER_PAGE);
  const events = allEvents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Determine group color for the header badge
  const groupColors: Record<string, { bg: string; text: string; label: string }> = {
    alta: { bg: 'bg-[hsl(var(--alta-exposicao))]', text: 'text-white', label: 'Alta Exposição' },
    media: { bg: 'bg-[hsl(var(--media-exposicao))]', text: 'text-white', label: 'Média Exposição' },
    baixa: { bg: 'bg-[hsl(var(--baixa-exposicao))]', text: 'text-black', label: 'Baixa / Referência' },
  };
  const groupInfo = groupColors[param.grupo] || groupColors.baixa;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard-parametros" className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="page-title">{param.label}</h1>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-medium ${groupInfo.bg} ${groupInfo.text}`}>
              {groupInfo.label}
            </span>
          </div>
          <p className="page-subtitle">{param.total} eventos registrados</p>
        </div>
      </div>

      {/* Period indicator */}
      <div className="text-xs text-muted-foreground bg-card border rounded-md px-4 py-2">
        📅 Período: <span className="font-semibold text-foreground">Fevereiro / 2026</span>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">Data</th>
                <th className="text-left py-2 px-2">Condutor</th>
                <th className="text-left py-2 px-2">Gestor</th>
                <th className="text-left py-2 px-2">Filial</th>
                <th className="text-left py-2 px-2">Departamento</th>
                <th className="text-left py-2 px-2">Unidade</th>
                <th className="text-left py-2 px-2">Classificação</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr
                  key={e.id}
                  className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/performance-condutores/${encodeURIComponent(e.condutor)}`)}
                >
                  <td className="py-2 px-2 text-muted-foreground">{e.data}</td>
                  <td className="py-2 px-2 font-medium">{e.condutor}</td>
                  <td className="py-2 px-2 text-muted-foreground">{e.gestor}</td>
                  <td className="py-2 px-2 text-muted-foreground">{e.departamento}</td>
                  <td className="py-2 px-2 text-muted-foreground">{e.funcao}</td>
                  <td className="py-2 px-2 text-muted-foreground">{e.negocio}</td>
                  <td className="py-2 px-2">
                    <ClassificationBadge classificacao={e.classificacao} />
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum evento encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Página {page} de {totalPages} · {allEvents.length} registros
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs border rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-2.5 py-1 text-xs rounded-md ${page === pageNum ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs border rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
