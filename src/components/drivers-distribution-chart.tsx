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

const TOOLTIPS_POR_AGRUPAMENTO: Record<DistributionGroupBy, string> = {
  unit: "Distribuição dos condutores por unidade, segmentados pela classificação de risco.",
  department: "Distribuição dos condutores por departamento, segmentados pela classificação de risco.",
  company: "Distribuição dos condutores por filial, segmentados pela classificação de risco.",
};

interface DriversDistributionChartProps {
  ano: number;
  /** Mês de 1 a 12. */
  mes: number;
  filtros: DashboardHierarchyFilters;
  /** Agrupamento inicial (ou fixo, quando `ocultarSeletorAgrupamento` = true). Padrão: `department`. */
  groupByInicial?: DistributionGroupBy;
  /** Oculta o seletor de agrupamento (usado quando os 3 gráficos são exibidos lado a lado). */
  ocultarSeletorAgrupamento?: boolean;
}

export function DriversDistributionChart({
  ano,
  mes,
  filtros,
  groupByInicial = "department",
  ocultarSeletorAgrupamento = false,
}: DriversDistributionChartProps) {
  const [groupByInterno, setGroupByInterno] = useState<DistributionGroupBy>(groupByInicial);
  const groupBy = ocultarSeletorAgrupamento ? groupByInicial : groupByInterno;

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
        <h4 className="text-sm font-bold flex items-center gap-2">
          Condutores por {getGroupByLabel(groupBy)} x Comportamento
          <InfoTooltip texto={TOOLTIPS_POR_AGRUPAMENTO[groupBy]} />
        </h4>

        {!ocultarSeletorAgrupamento && (
          <GroupBySelector valor={groupBy} onChange={setGroupByInterno} />
        )}
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
