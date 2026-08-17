import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { excecoesData } from '@/data/mockData';

const ITEMS_PER_PAGE = 15;

export default function GestaoExcecoes() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const totalPages = Math.ceil(excecoesData.length / ITEMS_PER_PAGE);
  const items = excecoesData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="page-title">Gestão de Exceções</h1>
        <p className="page-subtitle">Análise de exceções ao ranking</p>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <h3 className="section-title">Histórico</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">Tipo</th>
                <th className="text-left py-2 px-2">Condutor</th>
                <th className="text-left py-2 px-2">Data/Hora</th>
                <th className="text-left py-2 px-2">Justificativa</th>
                <th className="text-center py-2 px-2">Pontuação Antes</th>
                <th className="text-center py-2 px-2">Pontuação Depois</th>
              </tr>
            </thead>
            <tbody>
              {items.map(e => (
                <tr
                  key={e.id}
                  onClick={() => navigate(`/condutor/${encodeURIComponent(e.condutor)}`)}
                  className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                >
                  <td className="py-2 px-2">{e.tipoEvento.length > 30 ? e.tipoEvento.substring(0, 30) + '...' : e.tipoEvento}</td>
                  <td className="py-2 px-2 font-medium">{e.condutor}</td>
                  <td className="py-2 px-2 text-muted-foreground">{e.dataHora}</td>
                  <td className="py-2 px-2 text-muted-foreground">{e.justificativa || '—'}</td>
                  <td className="py-2 px-2 text-center font-semibold">{e.pontuacaoAntes}</td>
                  <td className="py-2 px-2 text-center font-semibold">{e.pontuacaoDepois}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Página {page} de {totalPages} · {excecoesData.length} registros
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
