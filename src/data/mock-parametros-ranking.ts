/**
 * Dados mock dos Parâmetros do Ranking.
 *
 * Contém os 19 indicadores agrupados por nível de impacto
 * e a configuração dos grupos de impacto.
 * Valores fixos para consistência no SSR.
 *
 * TODO(backend): Substituir por dados da configuração ativa do cliente via API.
 */

import type {
  ParametroRanking,
  GrupoImpactoConfig,
} from "@/types/parametro-ranking";

/* ========================================================= */
/*  CONFIGURAÇÃO DOS GRUPOS DE IMPACTO                       */
/* ========================================================= */

/** Grupos de impacto ordenados por severidade (maior → menor) */
export const gruposImpacto: GrupoImpactoConfig[] = [
  {
    label: "Alta Exposição ao Risco",
    bgClasse: "bg-[hsl(var(--alta-exposicao))]",
    textoClasse: "text-white",
    grupo: "alta",
  },
  {
    label: "Média Exposição ao Risco",
    bgClasse: "bg-[hsl(var(--media-exposicao))]",
    textoClasse: "text-white",
    grupo: "media",
  },
  {
    label: "Baixa Exposição / Referência",
    bgClasse: "bg-[hsl(var(--baixa-exposicao))]",
    textoClasse: "text-black",
    grupo: "baixa",
  },
];

/* ========================================================= */
/*  PARÂMETROS DO RANKING (19 indicadores)                   */
/* ========================================================= */

/**
 * Lista dos 19 indicadores do ranking, agrupados por nível de impacto.
 * Pontuações fixas para evitar hydration mismatch.
 */
export const parametrosRanking: ParametroRanking[] = [
  // --- Alta Exposição ao Risco (Roxo) ---
  {
    id: "ultrapassagem",
    label: "Multa por ultrapassar em local não permitido",
    total: 8,
    icone: "Ban",
    grupo: "alta",
  },
  {
    id: "celular",
    label: "Multa por usar telefone celular ao dirigir",
    total: 12,
    icone: "Smartphone",
    grupo: "alta",
  },
  {
    id: "cinto-multa",
    label: "Multa por dirigir sem cinto de segurança",
    total: 15,
    icone: "ShieldAlert",
    grupo: "alta",
  },
  {
    id: "alcool",
    label: "Multa por dirigir sob influência de álcool",
    total: 3,
    icone: "Wine",
    grupo: "alta",
  },
  {
    id: "velocidade-140",
    label: "Excesso de velocidade > 140 km/h por mais de 30s",
    total: 5,
    icone: "Skull",
    grupo: "alta",
  },
  {
    id: "cinto-telemetria",
    label: "Não usar cinto de segurança ≥ 1 km",
    total: 18,
    icone: "ShieldAlert",
    grupo: "alta",
  },

  // --- Média Exposição ao Risco (Vermelho) ---
  {
    id: "multa-grave",
    label: "Grave - CTB",
    total: 22,
    icone: "AlertTriangle",
    grupo: "media",
  },
  {
    id: "incidentes",
    label: "Incidentes evitáveis com alto potencial",
    total: 9,
    icone: "CarFront",
    grupo: "media",
  },
  {
    id: "multa-gravissima",
    label: "Gravíssima - CTB",
    total: 14,
    icone: "AlertTriangle",
    grupo: "media",
  },

  // --- Baixa Exposição / Referência (Amarelo/Verde) ---
  {
    id: "aceleracao",
    label: "Aceleração brusca",
    total: 67,
    icone: "TrendingUp",
    grupo: "baixa",
  },
  {
    id: "frenagem",
    label: "Frenagem brusca",
    total: 89,
    icone: "AlertTriangle",
    grupo: "baixa",
  },
  {
    id: "curva",
    label: "Curva acentuada",
    total: 45,
    icone: "Gauge",
    grupo: "baixa",
  },
  {
    id: "km-dia",
    label: "Dirigir mais de 650 km no dia",
    total: 28,
    icone: "Gauge",
    grupo: "baixa",
  },
  {
    id: "km-mes",
    label: "Dirigir mais de 5.000 km no mês",
    total: 11,
    icone: "Gauge",
    grupo: "baixa",
  },
  {
    id: "velocidade-medio",
    label: "Excesso de Velocidade – Médio (até 20% acima do limite da via)",
    total: 52,
    icone: "Gauge",
    grupo: "baixa",
  },
  {
    id: "velocidade-grave",
    label: "Excesso de Velocidade – Grave (entre 20% e 50% acima do limite da via)",
    total: 34,
    icone: "Gauge",
    grupo: "baixa",
  },
  {
    id: "velocidade-gravissimo",
    label: "Excesso de Velocidade – Gravíssimo (acima de 50% acima do limite da via)",
    total: 19,
    icone: "Gauge",
    grupo: "baixa",
  },
  {
    id: "multa-leve",
    label: "Multa Leve - CTB",
    total: 38,
    icone: "AlertTriangle",
    grupo: "baixa",
  },
  {
    id: "multa-media",
    label: "Multa Média - CTB",
    total: 27,
    icone: "AlertTriangle",
    grupo: "baixa",
  },
];
