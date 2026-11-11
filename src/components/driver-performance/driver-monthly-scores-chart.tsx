/**
 * DriverMonthlyScoresChart — Evolução mensal da pontuação do condutor (seção 4.12, `monthly_scores`).
 *
 * Sempre 12 meses (janeiro a dezembro). Meses abertos/futuros ou anteriores à admissão vêm com
 * `score = null` e aparecem sem barra.
 *
 * Para facilitar a leitura visual (inclusive quando há pontuações negativas):
 * - Todas as barras partem da base do gráfico para cima (usando o valor absoluto na altura),
 *   evitando barras penduradas ou cortadas no meio do gráfico.
 * - Pontuações positivas (>= 0) são exibidas em azul (`#2563eb`).
 * - Pontuações negativas (< 0) são exibidas em vermelho (`#dc2626`), com o valor real negativo
 *   destacado no topo da barra e no tooltip.
 *
 * @example
 * <DriverMonthlyScoresChart scores={data.monthly_scores} />
 */

"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DriverMonthlyScore } from "@/types/driver-scoring";
import { formatScore } from "@/utils/driver-scoring-helpers";

const CHART_HEIGHT = 260;
const COR_POSITIVA = "#2563eb";
const COR_NEGATIVA = "#dc2626";

interface LinhaPontuacaoMensal {
  mes: string;
  mesCompleto: string;
  scoreReal: number | null;
  alturaBarra: number | null;
  rotuloTopo: string;
  ehNegativo: boolean;
}

interface DriverMonthlyScoresChartProps {
  scores: DriverMonthlyScore[];
}

interface TooltipPayloadItem {
  payload?: LinhaPontuacaoMensal;
}

function TooltipPontuacaoMensal({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const dados = payload[0]?.payload;
  if (!dados || dados.scoreReal === null) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground mb-1">{dados.mesCompleto}</p>
      <p
        className="font-medium flex items-center gap-1.5"
        style={{ color: dados.ehNegativo ? COR_NEGATIVA : COR_POSITIVA }}
      >
        <span
          className="inline-block w-2.5 h-2.5 rounded-xs shrink-0"
          style={{ backgroundColor: dados.ehNegativo ? COR_NEGATIVA : COR_POSITIVA }}
        />
        Pontuação: <span className="font-bold">{formatScore(dados.scoreReal)}</span>
      </p>
    </div>
  );
}

export function DriverMonthlyScoresChart({ scores }: DriverMonthlyScoresChartProps) {
  const { rows, tetoY } = useMemo(() => {
    const linhas: LinhaPontuacaoMensal[] = scores.map((item) => {
      const scoreReal = item.score;
      const ehNegativo = scoreReal !== null && scoreReal < 0;
      const alturaBarra = scoreReal !== null ? Math.abs(scoreReal) : null;

      return {
        mes: item.label.slice(0, 3),
        mesCompleto: item.label,
        scoreReal,
        alturaBarra,
        rotuloTopo: scoreReal !== null ? formatScore(scoreReal) : "",
        ehNegativo,
      };
    });

    const maiorMagnitude = Math.max(
      100,
      ...linhas.map((linha) => linha.alturaBarra ?? 0),
    );

    return {
      rows: linhas,
      tetoY: Math.ceil(maiorMagnitude * 1.15),
    };
  }, [scores]);

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="text-base font-bold text-foreground">Pontuações Mensais</h3>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-xs shrink-0"
              style={{ backgroundColor: COR_POSITIVA }}
              aria-hidden="true"
            />
            Pontuação positiva
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-xs shrink-0"
              style={{ backgroundColor: COR_NEGATIVA }}
              aria-hidden="true"
            />
            Pontuação negativa
          </span>
        </div>
      </div>

      <div style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} interval={0} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, tetoY]} />
            <Tooltip content={<TooltipPontuacaoMensal />} />
            <Bar dataKey="alturaBarra" name="Pontuação" radius={[3, 3, 0, 0]} maxBarSize={56}>
              {rows.map((linha) => (
                <Cell
                  key={linha.mes}
                  fill={linha.ehNegativo ? COR_NEGATIVA : COR_POSITIVA}
                />
              ))}
              <LabelList
                dataKey="rotuloTopo"
                position="top"
                style={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
