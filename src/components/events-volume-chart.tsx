/**
 * EventsVolumeChart — Volume de eventos por tipo (seção 4.8 da spec).
 *
 * `GET /dashboard/events-volume`: os códigos `event_type` são traduzidos com `getEventTypeLabel`.
 * O backend já ordena por total decrescente.
 *
 * @example
 * <EventsVolumeChart ano={2026} mes={3} filtros={filtros} />
 */

"use client";

import { useMemo } from "react";
import { BarChartHorizontal } from "@/components/charts";
import { InfoTooltip } from "@/components/info-tooltip";
import { ChartSkeleton, QueryState } from "@/components/query-state";
import { useApiQuery } from "@/hooks/use-api-query";
import { getEventsVolume } from "@/services/driver-scoring.service";
import type { DashboardHierarchyFilters } from "@/types/driver-scoring";
import { getEventTypeLabel } from "@/utils/driver-scoring-helpers";

const MIN_CHART_HEIGHT = 300;
const HEIGHT_PER_BAR = 30;

interface EventsVolumeChartProps {
  ano: number;
  /** Mês de 1 a 12. */
  mes: number;
  filtros: DashboardHierarchyFilters;
}

export function EventsVolumeChart({ ano, mes, filtros }: EventsVolumeChartProps) {
  const { data, isLoading, error, refetch } = useApiQuery(getEventsVolume, {
    year: ano,
    month: mes,
    ...filtros,
  });

  const rows = useMemo(
    () => (data ?? []).map((item) => ({ name: getEventTypeLabel(item.event_type), total: item.total })),
    [data],
  );

  const altura = Math.max(MIN_CHART_HEIGHT, rows.length * HEIGHT_PER_BAR);

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
        Quantidade de Eventos por Parâmetro do Ranking
        <InfoTooltip texto="Total de eventos registrados para cada parâmetro do ranking no período selecionado." />
      </h4>

      <QueryState
        isLoading={isLoading}
        hasData={data !== undefined}
        error={error}
        isEmpty={data?.length === 0}
        emptyMessage="Nenhum evento registrado no período selecionado."
        onRetry={refetch}
        skeleton={<ChartSkeleton altura={MIN_CHART_HEIGHT} />}
      >
        <BarChartHorizontal
          dados={rows}
          categoriaKey="name"
          series={[{ dataKey: "total", nome: "Total", cor: "#2563eb" }]}
          altura={altura}
          larguraLabel={200}
          mostrarLegenda={false}
        />
      </QueryState>
    </div>
  );
}
