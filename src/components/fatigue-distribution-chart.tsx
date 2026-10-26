/**
 * FatigueDistributionChart — Fadiga aguda × acumulada (seção 4.10 da spec).
 *
 * `GET /dashboard/fatigue-distribution` com troca de agrupamento (`groupBy`).
 * A chave do grupo no retorno é dinâmica (`unit`, `company` ou `department`).
 * O backend só retorna grupos com pelo menos 1 evento de fadiga e usa "Sem Definição" para grupos sem nome.
 *
 * @example
 * <FatigueDistributionChart ano={2026} mes={3} filtros={filtros} groupByInicial="company" />
 */

"use client";

import { useMemo, useState } from "react";
import { BarChartVertical } from "@/components/charts";
import { getGroupByLabel, GroupBySelector } from "@/components/group-by-selector";
import { InfoTooltip } from "@/components/info-tooltip";
import { ChartSkeleton, QueryState } from "@/components/query-state";
import { useApiQuery } from "@/hooks/use-api-query";
import { getFatigueDistribution } from "@/services/driver-scoring.service";
import type { DashboardHierarchyFilters, DistributionGroupBy } from "@/types/driver-scoring";
import { getDynamicGroupName } from "@/utils/driver-scoring-display";

const CHART_HEIGHT = 250;

const SERIES = [
  { dataKey: "aguda", nome: "Fadiga Aguda (> 650 km/dia)", cor: "#dc2626" },
  { dataKey: "acumulada", nome: "Fadiga Acumulada (> 5.000 km/mês)", cor: "#7c3aed" },
];

interface FatigueDistributionChartProps {
  ano: number;
  /** Mês de 1 a 12. */
  mes: number;
  filtros: DashboardHierarchyFilters;
  /** Agrupamento exibido ao abrir. Padrão: `department` (padrão do backend). */
  groupByInicial?: DistributionGroupBy;
}

export function FatigueDistributionChart({
  ano,
  mes,
  filtros,
  groupByInicial = "department",
}: FatigueDistributionChartProps) {
  const [groupBy, setGroupBy] = useState<DistributionGroupBy>(groupByInicial);

  const { data, isLoading, error, refetch } = useApiQuery(getFatigueDistribution, {
    year: ano,
    month: mes,
    groupBy,
    ...filtros,
  });

  const rows = useMemo(
    () =>
      (data ?? []).map((item) => ({
        name: getDynamicGroupName(item),
        aguda: item.acute_fatigue,
        acumulada: item.accumulated_fatigue,
      })),
    [data],
  );

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          Registros de Fadiga por {getGroupByLabel(groupBy)}
          <InfoTooltip texto="Quantidade de registros de fadiga aguda e acumulada no período selecionado. Exibe apenas agrupamentos com ao menos um registro." />
        </h4>

        <GroupBySelector valor={groupBy} onChange={setGroupBy} />
      </div>

      <QueryState
        isLoading={isLoading}
        hasData={data !== undefined}
        error={error}
        isEmpty={data?.length === 0}
        emptyMessage="Nenhum registro de fadiga no período selecionado."
        onRetry={refetch}
        skeleton={<ChartSkeleton altura={CHART_HEIGHT} />}
      >
        <BarChartVertical dados={rows} categoriaKey="name" series={SERIES} altura={CHART_HEIGHT} />
      </QueryState>
    </div>
  );
}
