/**
 * ParameterDetailsTable — Drill-down de um evento do ranking (seção 4.9 da spec).
 *
 * `GET /dashboard/ranking-parameters/:eventType/details`, paginado com `pagination.lastPage`.
 * `eventType` pode ser um código (ex.: `HARSH_BRAKING`) ou `all-events`.
 *
 * Atenção: a API não devolve o id do condutor nesta rota, portanto as linhas NÃO são clicáveis
 * (navegar por nome é frágil — veja a seção 8.2 da spec).
 *
 * @example
 * <ParameterDetailsTable eventType="HARSH_BRAKING" ano={2026} mes={3} filtros={filtros} />
 */

"use client";

import { ClassificationLabelBadge } from "@/components/classification-label-badge";
import { PaginacaoNumerada } from "@/components/paginacao-numerada";
import { ListSkeleton, QueryState } from "@/components/query-state";
import { useApiQuery } from "@/hooks/use-api-query";
import { useResettablePage } from "@/hooks/use-resettable-page";
import { getRankingParameterDetails } from "@/services/driver-scoring.service";
import type { DashboardHierarchyFilters } from "@/types/driver-scoring";
import { formatDate } from "@/utils/driver-scoring-display";
import { displayValue } from "@/utils/driver-scoring-helpers";

const ITENS_POR_PAGINA = 15;

interface ParameterDetailsTableProps {
  /** Código do evento ou `all-events`. */
  eventType: string;
  ano: number;
  /** Mês de 1 a 12. */
  mes: number;
  filtros: DashboardHierarchyFilters;
}

/** Função estável (fora do componente), exigida pelo `useApiQuery`. */
const fetchDetails = (params: {
  eventType: string;
  year: number;
  month: number;
  page: number;
  limit: number;
  filters: DashboardHierarchyFilters;
}) => {
  const { eventType, filters, ...query } = params;
  return getRankingParameterDetails(eventType, { ...query, ...filters });
};

export function ParameterDetailsTable({ eventType, ano, mes, filtros }: ParameterDetailsTableProps) {
  const [pagina, setPagina] = useResettablePage(JSON.stringify({ eventType, ano, mes, filtros }));

  const { data, isLoading, error, refetch } = useApiQuery(fetchDetails, {
    eventType,
    year: ano,
    month: mes,
    page: pagina,
    limit: ITENS_POR_PAGINA,
    filters: filtros,
  });

  return (
    <div className="bg-card rounded-lg border border-border p-5 overflow-hidden">
      <QueryState
        isLoading={isLoading}
        hasData={data !== undefined}
        error={error}
        isEmpty={data?.data.length === 0}
        emptyMessage="Nenhum evento encontrado para os filtros selecionados."
        onRetry={refetch}
        skeleton={<ListSkeleton linhas={8} />}
      >
        <p className="text-sm text-muted-foreground mb-3">
          <span className="font-semibold text-foreground">{data?.total_events_period}</span> eventos no período
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">Data</th>
                <th className="text-left py-2">Condutor</th>
                <th className="text-left py-2">Gestor</th>
                <th className="text-left py-2">Regional</th>
                <th className="text-left py-2">C. Custo</th>
                <th className="text-left py-2">Departamento</th>
                <th className="text-left py-2">Unidade</th>
                <th className="text-right py-2 px-2">Classificação</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((linha, indice) => (
                <tr
                  key={`${linha.date}-${linha.driver_name}-${indice}`}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-2 px-2 whitespace-nowrap">{formatDate(linha.date)}</td>
                  <td className="py-2 font-medium whitespace-nowrap">{linha.driver_name}</td>
                  <td className="py-2 text-muted-foreground whitespace-nowrap">
                    {displayValue(linha.manager_name)}
                  </td>
                  <td className="py-2 text-muted-foreground">{displayValue(linha.regional)}</td>
                  <td className="py-2 text-muted-foreground">{displayValue(linha.cost_center)}</td>
                  <td className="py-2 text-muted-foreground">{displayValue(linha.department)}</td>
                  <td className="py-2 text-muted-foreground">{displayValue(linha.unit)}</td>
                  <td className="py-2 px-2 text-right">
                    <ClassificationLabelBadge label={linha.classification} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && (
          <PaginacaoNumerada
            pagina={data.pagination.page}
            totalPaginas={data.pagination.lastPage}
            totalItens={data.pagination.total}
            itensPorPagina={data.pagination.limit}
            rotuloItens="eventos"
            desabilitado={isLoading}
            onPaginaChange={setPagina}
          />
        )}
      </QueryState>
    </div>
  );
}
