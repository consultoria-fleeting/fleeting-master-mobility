/**
 * AnnualEvolutionChart — Evolução anual da classificação (seção 4.4 da spec).
 *
 * `GET /dashboard/annual-classification-evolution`: envia `year` e os filtros
 * hierárquicos (nunca `month`). O backend só retorna meses FECHADOS; em janeiro do ano
 * corrente (ou ano futuro) a resposta é `[]`, tratada aqui com uma mensagem explicativa.
 *
 * @example
 * <AnnualEvolutionChart ano={2026} filtros={filtros} />
 */

"use client";

import { useMemo } from "react";
import { BarChartVertical } from "@/components/charts";
import { InfoTooltip } from "@/components/info-tooltip";
import { ChartSkeleton, QueryState } from "@/components/query-state";
import { useApiQuery } from "@/hooks/use-api-query";
import { getAnnualClassificationEvolution } from "@/services/driver-scoring.service";
import type { DashboardHierarchyFilters } from "@/types/driver-scoring";
import { buildClassificationChartData } from "@/utils/classification-chart-data";

const CHART_HEIGHT = 420;

interface AnnualEvolutionChartProps {
  ano: number;
  filtros: DashboardHierarchyFilters;
}

export function AnnualEvolutionChart({ ano, filtros }: AnnualEvolutionChartProps) {
  const { data, isLoading, error, refetch } = useApiQuery(getAnnualClassificationEvolution, {
    year: ano,
    ...filtros,
  });

  const chart = useMemo(
    () =>
      buildClassificationChartData(
        (data ?? []).map((item) => ({ name: item.month, classifications: item.classifications })),
      ),
    [data],
  );

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
        Evolução do Comportamento — Ano
        <InfoTooltip texto="Grau de exposição ao risco por mês: evolução anual da distribuição dos condutores por classificação. Considera apenas meses já encerrados." />
      </h4>

      <QueryState
        isLoading={isLoading}
        hasData={data !== undefined}
        error={error}
        isEmpty={data?.length === 0}
        emptyMessage={`Ainda não há meses encerrados em ${ano}.`}
        emptyHint="A evolução anual considera somente meses já fechados, por isso fica disponível a partir de fevereiro do ano corrente."
        onRetry={refetch}
        skeleton={<ChartSkeleton altura={CHART_HEIGHT} />}
      >
        <BarChartVertical
          dados={chart.rows}
          categoriaKey="name"
          series={chart.series}
          altura={CHART_HEIGHT}
          scrollHorizontal
          larguraPorItem={80}
        />
      </QueryState>
    </div>
  );
}
