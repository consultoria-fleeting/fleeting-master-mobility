/**
 * DriverPerformanceKpis — Cards de indicadores do condutor (seção 4.12 da spec, `indicators`).
 *
 * Exibe: acumulado do ano, pontuação/classificação do último mês fechado e pontuação do mês atual.
 * Valores `null` (sem dado) aparecem como "-".
 *
 * @example
 * <DriverPerformanceKpis indicators={data.indicators} />
 */

import { ClassificationLabelBadge } from "@/components/classification-label-badge";
import type { DriverPerformanceIndicators } from "@/types/driver-scoring";
import { formatScore } from "@/utils/driver-scoring-helpers";

interface DriverPerformanceKpisProps {
  indicators: DriverPerformanceIndicators;
}

/** Pontuação formatada ou "-" quando não houver. */
function scoreOrDash(score: number | null): string {
  return score === null ? "-" : formatScore(score);
}

function KpiCard({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <p className="text-[10px] text-muted-foreground uppercase">{titulo}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function DriverPerformanceKpis({ indicators }: DriverPerformanceKpisProps) {
  const { accum_year, last_closed_month_score, last_closed_month_classification, current_month_score } =
    indicators;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KpiCard titulo="Acumulado do ano">
        <p className="text-2xl font-bold">{formatScore(accum_year)}</p>
      </KpiCard>

      <KpiCard titulo="Último mês fechado">
        <p className="text-2xl font-bold">{scoreOrDash(last_closed_month_score)}</p>
      </KpiCard>

      <KpiCard titulo="Classificação (mês fechado)">
        <div className="mt-2">
          {last_closed_month_classification ? (
            <ClassificationLabelBadge label={last_closed_month_classification.label} />
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      </KpiCard>

      <KpiCard titulo="Pontuação do mês">
        <p className="text-2xl font-bold">{scoreOrDash(current_month_score)}</p>
      </KpiCard>
    </div>
  );
}
