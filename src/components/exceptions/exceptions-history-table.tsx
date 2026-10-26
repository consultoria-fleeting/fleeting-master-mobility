/**
 * ExceptionsHistoryTable — Histórico de exceções da organização (FLEET-2301, `GET /exceptions`).
 *
 * - Busca por nome do condutor com debounce de 400 ms (respeita o rate limit do backend).
 * - Paginação numerada vinda do backend (`total`, `totalPages`, `pageSize`).
 * - O nome do condutor navega pelo UUID (`driverId`).
 * - Ação "Revogar" (gestores) abre `RevokeExceptionDialog`.
 * - Perfis sem permissão recebem 403, tratado pelo `QueryState` com mensagem amigável.
 *
 * @example
 * <ExceptionsHistoryTable />
 */

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { DriverLink } from "@/components/driver-link";
import { RevokeExceptionDialog } from "@/components/exceptions/revoke-exception-dialog";
import { PaginacaoNumerada } from "@/components/paginacao-numerada";
import { ListSkeleton, QueryState } from "@/components/query-state";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useResettablePage } from "@/hooks/use-resettable-page";
import { getExceptions } from "@/services/driver-scoring.service";
import type { ExceptionItem } from "@/types/driver-scoring";
import { formatDateTime } from "@/utils/driver-scoring-display";
import { displayValue } from "@/utils/driver-scoring-helpers";
import { canManageExceptions } from "@/utils/permissions";

const ITENS_POR_PAGINA = 15;

/** Função estável (fora do componente), exigida pelo `useApiQuery`. */
const fetchExceptions = getExceptions;

export function ExceptionsHistoryTable() {
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebouncedValue(busca.trim(), 400);
  const [pagina, setPagina] = useResettablePage(buscaDebounced);
  const [excecaoParaRevogar, setExcecaoParaRevogar] = useState<ExceptionItem | null>(null);
  const podeGerenciar = canManageExceptions();

  const { data, isLoading, error, refetch } = useApiQuery(fetchExceptions, {
    driverName: buscaDebounced,
    page: pagina,
    pageSize: ITENS_POR_PAGINA,
  });

  /** Após revogar a última exceção de uma página, volta uma página (senão recarrega a atual). */
  function handleRevogada() {
    if (data && data.items.length === 1 && pagina > 1) {
      setPagina(pagina - 1);
      return;
    }
    refetch();
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-foreground">Histórico</h3>

        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            maxLength={100}
            placeholder="Buscar por condutor"
            aria-label="Buscar exceções por nome do condutor"
            className="w-full h-8 pl-8 pr-2.5 text-xs rounded-lg border border-input bg-transparent outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <QueryState
        isLoading={isLoading}
        hasData={data !== undefined}
        error={error}
        isEmpty={data?.items.length === 0}
        emptyMessage="Nenhuma exceção encontrada."
        emptyHint={buscaDebounced ? "Tente buscar por outro nome de condutor." : undefined}
        onRetry={refetch}
        skeleton={<ListSkeleton linhas={8} />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">Tipo</th>
                <th className="text-left py-2 px-2">Condutor</th>
                <th className="text-left py-2 px-2">Data do evento</th>
                <th className="text-left py-2 px-2">Aplicada em</th>
                <th className="text-left py-2 px-2">Justificativa</th>
                <th className="text-left py-2 px-2">Aplicada por</th>
                <th className="text-center py-2 px-2">Pontuação Antes</th>
                <th className="text-center py-2 px-2">Pontuação Depois</th>
                {podeGerenciar && <th className="text-right py-2 px-2">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {data?.items.map((excecao) => (
                <tr
                  key={excecao.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors align-top"
                >
                  <td className="py-2 px-2">{excecao.eventLabel}</td>
                  <td className="py-2 px-2 whitespace-nowrap">
                    <DriverLink driverId={excecao.driverId} nome={excecao.driverName} />
                  </td>
                  <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">
                    {formatDateTime(excecao.eventDate)}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">
                    {formatDateTime(excecao.appliedAt)}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground max-w-64">
                    <span className="line-clamp-2" title={excecao.justification}>
                      {displayValue(excecao.justification)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">
                    {displayValue(excecao.createdBy)}
                  </td>
                  <td className="py-2 px-2 text-center font-semibold">{excecao.scoreBefore}</td>
                  <td className="py-2 px-2 text-center font-semibold">{excecao.scoreAfter}</td>
                  {podeGerenciar && (
                    <td className="py-2 px-2 text-right">
                      <Button variant="outline" size="xs" onClick={() => setExcecaoParaRevogar(excecao)}>
                        Revogar
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && (
          <PaginacaoNumerada
            pagina={data.page}
            totalPaginas={data.totalPages}
            totalItens={data.total}
            itensPorPagina={data.pageSize}
            rotuloItens="exceções"
            desabilitado={isLoading}
            onPaginaChange={setPagina}
          />
        )}
      </QueryState>

      {excecaoParaRevogar && (
        <RevokeExceptionDialog
          key={excecaoParaRevogar.id}
          excecao={excecaoParaRevogar}
          onClose={() => setExcecaoParaRevogar(null)}
          onRevoked={handleRevogada}
        />
      )}
    </div>
  );
}
