/**
 * Utilitários de tradução e cores do Ranking de Condutores (`api-driver-scoring`).
 *
 * - `getEventTypeLabel`: traduz os códigos de evento (inglês) para PT-BR.
 * - `getClassificationStyle`: devolve a cor semântica de uma classificação.
 *   O backend NÃO retorna cores e os nomes das classificações são dinâmicos
 *   por organização, por isso o mapeamento é feito por texto normalizado.
 */

import type { DriverClassificationFilter, RankingAnnualMonthKey } from "@/types/driver-scoring";


// ---------------------------------------------------------------------------
// Tradução de tipos de evento
// ---------------------------------------------------------------------------

/**
 * Códigos de evento -> rótulo em PT-BR.
 * Cobre os códigos do backend (`DashboardService.formatEventType`) e os da
 * `scoring_matrix` (seed), conforme a seção 8.2 (item 10) da spec.
 */
export const EVENT_TYPE_LABELS: Record<string, string> = {
  // Telemetria — dinâmica de condução
  HARSH_BRAKING: "Frenagem Brusca",
  HARSH_ACCELERATION: "Aceleração Brusca",
  SHARP_TURN: "Curva Acentuada",
  HARSH_CORNERING: "Curva Brusca",

  // Excesso de velocidade
  SPEEDING_LOW: "Excesso de Velocidade Leve",
  EXCESS_SPEED_LOW: "Excesso de Velocidade Leve",
  SPEEDING_MEDIUM: "Excesso de Velocidade Médio",
  EXCESS_SPEED_MEDIUM: "Excesso de Velocidade Médio",
  SPEEDING_HIGH: "Excesso de Velocidade Grave",
  EXCESS_SPEED_HIGH: "Excesso de Velocidade Grave",
  SPEEDING_VERY_HIGH: "Excesso de Velocidade Gravíssimo",
  EXCESS_SPEED_VERY_HIGH: "Excesso de Velocidade Gravíssimo",
  SPEEDING_OVER_140: "Velocidade Acima de 140 km/h",
  EXCESS_SPEED_EXTREME: "Velocidade Acima de 140 km/h",

  // Fadiga
  DISTANCE_OVER_650_DAY: "Fadiga Aguda (> 650 km/dia)",
  DISTANCE_OVER_5000_MONTH: "Fadiga Acumulada (> 5.000 km/mês)",

  // Comportamento de risco
  SEATBELT_UNBUCKLED: "Condução sem Cinto de Segurança",
  SEATBELT_TELEMETRY: "Condução sem Cinto de Segurança",
  UNBELTED_DRIVING_1KM: "Condução sem Cinto de Segurança",
  CELLPHONE_USAGE: "Uso de Celular ao Volante",
  DRIVING_UNDER_INFLUENCE: "Condução sob Efeito de Álcool/Substâncias",
  DUI: "Condução sob Efeito de Álcool/Substâncias",
  FORBIDDEN_OVERTAKING: "Ultrapassagem Proibida",

  // Incidentes
  HIGH_POTENTIAL_INCIDENT: "Incidente de Alto Potencial",
  PREVENTABLE_HIGH_POTENTIAL: "Incidente de Alto Potencial",

  // Multas
  TRAFFIC_FINE_LIGHT: "Multa Leve",
  FINE_LIGHT: "Multa Leve",
  TRAFFIC_FINE_MEDIUM: "Multa Média",
  FINE_MEDIUM: "Multa Média",
  TRAFFIC_FINE_HEAVY: "Multa Grave",
  FINE_HIGH: "Multa Grave",
  TRAFFIC_FINE_VERY_HEAVY: "Multa Gravíssima",
  FINE_CRITICAL: "Multa Gravíssima",
};

/** Converte `SNAKE_CASE` em Title Case. Ex.: `UNKNOWN_EVENT_X` -> `Unknown Event X`. */
function snakeCaseToTitleCase(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Retorna o rótulo em PT-BR de um código de evento.
 * Códigos desconhecidos recebem fallback em Title Case.
 */
export function getEventTypeLabel(eventType: string): string {
  const code = eventType.trim();
  return EVENT_TYPE_LABELS[code.toUpperCase()] ?? snakeCaseToTitleCase(code);
}

// ---------------------------------------------------------------------------
// Cores de classificação
// ---------------------------------------------------------------------------

/** Nível semântico de risco de uma classificação. */
export type ClassificationLevel = "referencia" | "baixa" | "media" | "alta" | "desconhecida";

export interface ClassificationStyle {
  level: ClassificationLevel;
  /** Cor principal em hexadecimal (ex.: gráficos). */
  color: string;
  /** Classes Tailwind para um badge (fundo + texto). */
  badgeClassName: string;
  /** Classe Tailwind apenas de texto colorido. */
  textClassName: string;
}

const CLASSIFICATION_STYLES: Record<ClassificationLevel, ClassificationStyle> = {
  // Verde — sucesso
  referencia: {
    level: "referencia",
    color: "#22c55e",
    badgeClassName: "bg-green-500 text-white",
    textClassName: "text-green-600",
  },
  // Azul — baixo risco
  baixa: {
    level: "baixa",
    color: "#3b82f6",
    badgeClassName: "bg-blue-500 text-white",
    textClassName: "text-blue-600",
  },
  // Amarelo — alerta
  media: {
    level: "media",
    color: "#eab308",
    badgeClassName: "bg-yellow-400 text-black",
    textClassName: "text-yellow-600",
  },
  // Vermelho — perigo
  alta: {
    level: "alta",
    color: "#ef4444",
    badgeClassName: "bg-red-500 text-white",
    textClassName: "text-red-600",
  },
  // Cinza — texto fora do padrão esperado
  desconhecida: {
    level: "desconhecida",
    color: "#9ca3af",
    badgeClassName: "bg-gray-400 text-white",
    textClassName: "text-gray-500",
  },
};

/** Minúsculo e sem acentos. Ex.: `"Média Exposição"` -> `"media exposicao"`. */
function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Descobre o nível semântico a partir do texto (label ou slug de categoria). */
function resolveClassificationLevel(labelOrCategory: string): ClassificationLevel {
  const text = normalizeText(labelOrCategory);

  // A ordem importa: "referencia" primeiro; \b evita casar parte de outra palavra.
  if (/\breferencia\b/.test(text)) return "referencia";
  if (/\bbaixa\b/.test(text)) return "baixa";
  if (/\b(media|moderada)\b/.test(text)) return "media";
  if (/\b(alta|critica)\b/.test(text)) return "alta";

  return "desconhecida";
}

/**
 * Retorna a cor semântica de uma classificação a partir do texto dinâmico do backend.
 * Aceita tanto o `label` ("Baixa Exposição ao Risco") quanto o slug
 * de `category` ("baixa-exposicao-ao-risco").
 */
export function getClassificationStyle(labelOrCategory: string): ClassificationStyle {
  return CLASSIFICATION_STYLES[resolveClassificationLevel(labelOrCategory)];
}

/**
 * Converte um card de `GET /dashboard/driver-categories` no filtro `classification` de
 * `GET /dashboard/driver-performance` (Tela 2 do guia).
 * - `category === "total"` -> `todos`;
 * - demais: nível semântico do título (os nomes das classificações são dinâmicos por organização);
 * - texto fora do padrão -> `undefined` (o card não fica clicável).
 */
export function getCategoryFilter(category: string, title: string): DriverClassificationFilter | undefined {
  if (category === "total") return "todos";

  const { level } = getClassificationStyle(title);
  return level === "desconhecida" ? undefined : level;
}

// ---------------------------------------------------------------------------
// Exibição de dados
// ---------------------------------------------------------------------------

/** Colunas da visão anual do ranking: chave do backend (inglês) + rótulo PT-BR. */
export const RANKING_ANNUAL_MONTHS: { key: RankingAnnualMonthKey; label: string }[] = [
  { key: "jan", label: "Jan" },
  { key: "feb", label: "Fev" },
  { key: "mar", label: "Mar" },
  { key: "apr", label: "Abr" },
  { key: "may", label: "Mai" },
  { key: "jun", label: "Jun" },
  { key: "jul", label: "Jul" },
  { key: "aug", label: "Ago" },
  { key: "sep", label: "Set" },
  { key: "oct", label: "Out" },
  { key: "nov", label: "Nov" },
  { key: "dec", label: "Dez" },
];

/** Exibe pontuação sem casas decimais inúteis (`85` ou `85,5`), no padrão pt-BR. */
export function formatScore(score: number): string {
  return score.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

/** Retorna o texto, ou `"-"` quando o backend enviar `null`/vazio. */
export function displayValue(value: string | null | undefined): string {
  return value && value.trim() !== "" ? value : "-";
}

/** Rota da tela de performance individual. Sempre use o UUID do condutor. */
export function getDriverPerformancePath(driverId: string): string {
  return `/ranking-condutores/performance-condutores/${encodeURIComponent(driverId)}/`;
}

