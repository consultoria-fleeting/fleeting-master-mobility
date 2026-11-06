/**
 * Estimativa da pontuação do mês após aplicar uma exceção (Gestão de exceções).
 *
 * O backend não expõe uma prévia do recálculo, então o modal mostra uma ESTIMATIVA:
 * pontuação atual do mês do evento + impacto do evento, limitada a 100.
 *
 * Pode divergir do valor real porque o motor de pontuação:
 * - aplica o fator de KM aos eventos de telemetria;
 * - limita a pontuação entre 0 e 100 (descontos "abaixo de zero" não aparecem na pontuação atual);
 * - zera o mês enquanto houver evento crítico ativo.
 *
 * O valor real é o `scoreAfter` devolvido pelo `POST .../exceptions`.
 */

import type { DriverEvent, DriverMonthlyScore } from "@/types/driver-scoring";

const MAX_SCORE = 100;
const DISPLAY_TIME_ZONE = "America/Sao_Paulo";

/** Mês (1..12) do evento no fuso de exibição, o mesmo usado na tela. */
function getEventMonth(isoDate: string): number | null {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  const month = new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TIME_ZONE,
    month: "numeric",
  }).format(date);
  return Number(month);
}

/** Pontuação do mês do evento (é essa a pontuação recalculada pela exceção). */
export function getEventMonthScore(
  evento: Pick<DriverEvent, "date">,
  monthlyScores: DriverMonthlyScore[],
): number | null {
  const month = getEventMonth(evento.date);
  if (month === null) return null;
  return monthlyScores.find((item) => item.month === month)?.score ?? null;
}

export type ScoreEstimate =
  | { kind: "estimated"; value: number }
  | { kind: "unavailable"; reason: string };

/** Pontuação prevista após desconsiderar o evento. */
export function estimateScoreAfterException(
  evento: Pick<DriverEvent, "impact" | "severity">,
  currentScore: number | null,
): ScoreEstimate {
  if (currentScore === null) {
    return { kind: "unavailable", reason: "Pontuação do mês indisponível." };
  }

  if (evento.severity === "Crítica") {
    return {
      kind: "unavailable",
      reason:
        "Evento crítico: a nova pontuação depende dos demais eventos do mês e será exibida após a confirmação.",
    };
  }

  const value = Math.min(MAX_SCORE, currentScore + Math.abs(evento.impact));
  return { kind: "estimated", value: Math.round(value * 100) / 100 };
}

