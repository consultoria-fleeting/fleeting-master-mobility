/**
 * DriversDistributionChart — Condutores por classificação, agrupados (seção 4.3 da spec).
 *
 * `GET /dashboard/drivers-distribution` com troca de agrupamento por Unidade, Departamento
 * ou Filial (`groupBy`). A chave do grupo no retorno é dinâmica: `item.unit`,
 * `item.department` ou `item.company`, conforme o `groupBy` enviado.
 *
 * @example
 * <DriversDistributionChart ano={2026} mes={3} filtros={filtros} />
 */

"use client";

import { useMemo, useState } from "react";
import { BarChartHorizontal } from "@/components/charts";
import { getGroupByLabel, GroupBySelector } from "@/components/group-by-selector";
import { InfoTooltip } from "@/components/info-tooltip";
import { ChartSkeleton, QueryState } from "@/components/query-state";
import { useApiQuery } from "@/hooks/use-api-query";
import { getDriversDistribution } from "@/services/driver-scoring.service";
import type { DashboardHierarchyFilters, DistributionGroupBy } from "@/types/driver-scoring";
import { buildClassificationChartData } from "@/utils/classification-chart-data";
import { getDynamicGroupName } from "@/utils/driver-scoring-display";

/** Altura base + altura extra por grupo, para o gráfico crescer conforme a quantidade de barras. */
const MIN_CHART_HEIGHT = 250;
const HEIGHT_PER_GROUP = 36;

interface DriversDistributionChartProps {
  ano: number;
  /** Mês de 1 a 12. */
  mes: number;
  filtros: DashboardHierarchyFilters;
}

export function DriversDistributionChart({ ano, mes, filtros }: DriversDistributionChartProps) {
  const [groupBy, setGroupBy] = useState<DistributionGroupBy>("department");

  const { data, isLoading, error, refetch } = useApiQuery(getDriversDistribution, {
    year: ano,
    month: mes,
    groupBy,
    ...filtros,
  });

  const chart = useMemo(
    () =>
      buildClassificationChartData(
        (data ?? []).map((item) => ({
          name: getDynamicGroupName(item),
          classifications: item.classifications,
        })),
        "s",
      ),
    [data],
  );

  const altura = Math.max(MIN_CHART_HEIGHT, chart.rows.length * HEIGHT_PER_GROUP);

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          Condutores por {getGroupByLabel(groupBy)} x Comportamento
          <InfoTooltip texto="Distribuição dos condutores por agrupamento, segmentados pela classificação de risco." />
        </h4>

        <GroupBySelector valor={groupBy} onChange={setGroupBy} />
      </div>

      <QueryState
        isLoading={isLoading}
        hasData={data !== undefined}
        error={error}
        isEmpty={data?.length === 0}
        emptyMessage="Nenhum condutor encontrado para os filtros selecionados."
        onRetry={refetch}
        skeleton={<ChartSkeleton altura={MIN_CHART_HEIGHT} />}
      >
        <BarChartHorizontal
          dados={chart.rows}
          categoriaKey="name"
          series={chart.series}
          altura={altura}
          larguraLabel={140}
        />
      </QueryState>
    </div>
  );
}
