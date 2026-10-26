/**
 * Helpers de exibição das telas de Parâmetros e Performance de Condutores.
 *
 * Complementa `driver-scoring-helpers.ts` com datas, dados sensíveis (PII),
 * agrupamentos dinâmicos, níveis de exposição, ícones por evento e severidade.
 */

import type { EventSeverity, ExposureLevelBucket } from "@/types/driver-scoring";

// ---------------------------------------------------------------------------
// Datas e dados sensíveis
// ---------------------------------------------------------------------------

/** Fuso usado para exibir datas do backend (ISO 8601 em UTC), garantindo a mesma saída para todos. */
const DISPLAY_TIME_ZONE = "America/Sao_Paulo";

/** Converte data ISO 8601 em `dd/mm/aaaa`. Retorna "-" se vazia ou inválida. */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR", { timeZone: DISPLAY_TIME_ZONE });
}

/** Converte data ISO 8601 em `dd/mm/aaaa HH:mm`. Retorna "-" se vazia ou inválida. */
export function formatDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR", {
    timeZone: DISPLAY_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Mascara CNH/CPF (PII), exibindo apenas os 4 últimos caracteres. Ex.: `***1234`.
 * Nunca exiba o documento completo em tela.
 */
export function maskDocument(document: string | null | undefined): string {
  if (!document) return "-";
  const visible = document.length > 4 ? document.slice(-4) : "";
  return `***${visible}`;
}

// ---------------------------------------------------------------------------
// Agrupamentos dinâmicos
// ---------------------------------------------------------------------------

/**
 * Lê o nome do grupo na chave dinâmica de um item (`unit`, `company` ou `department`).
 * Usado nas respostas de `drivers-distribution` (4.3) e `fatigue-distribution` (4.10).
 * Usa a chave presente no próprio item, então funciona mesmo com dados do agrupamento anterior na tela.
 */
export function getDynamicGroupName(
  item: { unit: string } | { company: string } | { department: string },
): string {
  if ("unit" in item) return item.unit;
  if ("company" in item) return item.company;
  return item.department;
}

// ---------------------------------------------------------------------------
// Níveis de exposição, ícones e severidade
// ---------------------------------------------------------------------------

/** Níveis de exposição do endpoint 4.7, do mais grave ao mais leve, com título e cores (Tailwind). */
export const EXPOSURE_LEVELS: {
  level: ExposureLevelBucket;
  label: string;
  bgClassName: string;
  textClassName: string;
}[] = [
  { level: "CRITICAL", label: "Exposição Crítica", bgClassName: "bg-red-600", textClassName: "text-white" },
  { level: "HIGH", label: "Alta Exposição", bgClassName: "bg-orange-500", textClassName: "text-white" },
  { level: "MEDIUM", label: "Média Exposição", bgClassName: "bg-yellow-400", textClassName: "text-black" },
  { level: "LOW", label: "Baixa Exposição", bgClassName: "bg-blue-500", textClassName: "text-white" },
];

/** Regras (a primeira que casar vence) para escolher o ícone do card de um evento. */
const EVENT_ICON_RULES: [RegExp, string][] = [
  [/OVER_140|EXTREME/, "Skull"],
  [/SPEED/, "Gauge"],
  [/DISTANCE/, "Gauge"],
  [/ACCELERATION/, "TrendingUp"],
  [/SEATBELT|UNBELTED/, "ShieldAlert"],
  [/CELLPHONE/, "Smartphone"],
  [/INFLUENCE|DUI/, "Wine"],
  [/OVERTAKING/, "Ban"],
  [/HIGH_POTENTIAL/, "CarFront"],
  [/TURN|CORNERING/, "Gauge"],
];

/** Nome do ícone (chave do `ParametroCard`) para um código de evento. Padrão: `AlertTriangle`. */
export function getEventTypeIcon(eventType: string): string {
  const code = eventType.toUpperCase();
  return EVENT_ICON_RULES.find(([rule]) => rule.test(code))?.[1] ?? "AlertTriangle";
}

const SEVERITY_CLASS_NAMES: Record<EventSeverity, string> = {
  Leve: "text-muted-foreground",
  Média: "text-yellow-600",
  Grave: "text-orange-600",
  Gravíssima: "text-red-600 font-bold",
  Crítica: "text-red-700 font-bold",
};

/** Classes de cor do texto para a severidade de um evento (4.12). */
export function getSeverityClassName(severity: EventSeverity): string {
  return SEVERITY_CLASS_NAMES[severity] ?? "";
}
