/**
 * DriverMonthlyScoresChart — Evolução mensal da pontuação do condutor (seção 4.12, `monthly_scores`).
 *
 * Sempre 12 meses (janeiro a dezembro). Meses abertos/futuros ou anteriores à admissão vêm com
 * `score = null` e aparecem sem barra.
 *
 * @example
 * <DriverMonthlyScoresChart scores={data.monthly_scores} />
 */

import { useMemo } from "react";
import { BarChartVertical } from "@/components/charts";
import type { DriverMonthlyScore } from "@/types/driver-scoring";

const CHART_HEIGHT = 240;
const SERIES = [{ dataKey: "score", nome: "Pontuação", cor: "#2563eb" }];

interface DriverMonthlyScoresChartProps {
  scores: DriverMonthlyScore[];
}

export function DriverMonthlyScoresChart({ scores }: DriverMonthlyScoresChartProps) {
  const rows = useMemo(
    () => scores.map((item) => ({ mes: item.label.slice(0, 3), score: item.score })),
    [scores],
  );

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">Pontuações Mensais</h3>
      <BarChartVertical
        dados={rows}
        categoriaKey="mes"
        series={SERIES}
        altura={CHART_HEIGHT}
        dominioY={[0, 100]}
        mostrarLegenda={false}
      />
    </div>
  );
}
