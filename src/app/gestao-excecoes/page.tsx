/**
 * Gestão de Exceções — Página
 *
 * Exibe o histórico de exceções ao ranking com tabela paginada.
 * Cada exceção mostra tipo de evento, condutor, data/hora,
 * justificativa, decisão e pontuações antes/depois.
 *
 * Rota: /gestao-excecoes
 *
 * TODO(backend): Substituir dados mock por chamadas à API.
 * TODO(security): Implementar autenticação/autorização quando integrar.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { excecoesData } from "@/data/mock-excecoes";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Itens por página */
const ITENS_POR_PAGINA = 15;

/** Cores do badge de decisão */
const COR_DECISAO: Record<string, string> = {
  Pendente: "bg-yellow-100 text-yellow-800",
  Aprovada: "bg-green-100 text-green-800",
  Reprovada: "bg-red-100 text-red-800",
};

export default function GestaoExcecoesPage() {
  const router = useRouter();
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.ceil(excecoesData.length / ITENS_POR_PAGINA);
  const paginaAtual = Math.min(pagina, totalPaginas);
  const itens = excecoesData.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Gestão de Exceções
        </h1>
        <p className="text-sm text-muted-foreground">
          Análise de exceções ao ranking
        </p>
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Histórico
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">Tipo</th>
                <th className="text-left py-2 px-2">Condutor</th>
                <th className="text-left py-2 px-2">Data/Hora</th>
                <th className="text-left py-2 px-2">Justificativa</th>
                <th className="text-center py-2 px-2">Decisão</th>
                <th className="text-center py-2 px-2">Pontuação Antes</th>
                <th className="text-center py-2 px-2">Pontuação Depois</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((e) => (
                <tr
                  key={e.id}
                  className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() =>
                    router.push(
                      `/performance-condutores/${encodeURIComponent(e.condutor)}`
                    )
                  }
                >
                  <td className="py-2 px-2">
                    {e.tipoEvento.length > 30
                      ? e.tipoEvento.substring(0, 30) + "..."
                      : e.tipoEvento}
                  </td>
                  <td className="py-2 px-2 font-medium">{e.condutor}</td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {e.dataHora}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {e.justificativa || "—"}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${COR_DECISAO[e.decisao] || ""}`}
                    >
                      {e.decisao}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center font-semibold">
                    {e.pontuacaoAntes}
                  </td>
                  <td className="py-2 px-2 text-center font-semibold">
                    {e.pontuacaoDepois}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Página {paginaAtual} de {totalPaginas} ·{" "}
              {excecoesData.length} registros
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="px-2.5 py-1 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from(
                { length: Math.min(totalPaginas, 5) },
                (_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      onClick={() => setPagina(n)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${paginaAtual === n
                        ? "bg-primary text-primary-foreground"
                        : "border border-border hover:bg-muted"
                        }`}
                    >
                      {n}
                    </button>
                  );
                }
              )}
              <button
                onClick={() =>
                  setPagina((p) => Math.min(totalPaginas, p + 1))
                }
                disabled={paginaAtual === totalPaginas}
                className="px-2.5 py-1 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
