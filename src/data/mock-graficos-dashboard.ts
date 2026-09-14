/**
 * Dados mock para os gráficos da seção de Análises Gráficas
 * do Dashboard Geral do Ranking.
 *
 * Todos os valores são determinísticos (sem Math.random)
 * para evitar mismatch de hydration no SSR.
 *
 * TODO(backend): Substituir por dados reais da API.
 */

import { parametrosRanking } from "@/data/mock-parametros-ranking";

/* ========================================================= */
/*  EVOLUÇÃO DO COMPORTAMENTO — ANO                          */
/* ========================================================= */

/** Distribuição de condutores por classificação ao longo do ano */
export const evolucaoAnual = [
  { mes: "Jan", referencia: 40, baixa: 32, media: 18, alta: 10 },
  { mes: "Fev", referencia: 42, baixa: 30, media: 17, alta: 11 },
  { mes: "Mar", referencia: 45, baixa: 28, media: 16, alta: 11 },
  { mes: "Abr", referencia: 48, baixa: 27, media: 15, alta: 10 },
  { mes: "Mai", referencia: 46, baixa: 29, media: 15, alta: 10 },
  { mes: "Jun", referencia: 49, baixa: 26, media: 15, alta: 10 },
  { mes: "Jul", referencia: 51, baixa: 25, media: 14, alta: 10 },
  { mes: "Ago", referencia: 50, baixa: 26, media: 14, alta: 10 },
  { mes: "Set", referencia: 52, baixa: 24, media: 14, alta: 10 },
  { mes: "Out", referencia: 53, baixa: 24, media: 13, alta: 10 },
  { mes: "Nov", referencia: 55, baixa: 22, media: 13, alta: 10 },
  { mes: "Dez", referencia: 57, baixa: 21, media: 12, alta: 10 },
];

/* ========================================================= */
/*  CONDUTORES POR UNIDADE x COMPORTAMENTO                   */
/* ========================================================= */

export const condutoresPorUnidade = [
  { negocio: "Crop Protection", referencia: 15, baixa: 8, media: 5, alta: 3 },
  { negocio: "Seeds", referencia: 12, baixa: 10, media: 6, alta: 2 },
  { negocio: "Digital", referencia: 18, baixa: 7, media: 3, alta: 1 },
  { negocio: "Flores", referencia: 10, baixa: 9, media: 7, alta: 4 },
];

/* ========================================================= */
/*  CONDUTORES POR DEPARTAMENTO x COMPORTAMENTO              */
/* ========================================================= */

export const condutoresPorDepartamento = [
  { funcao: "Representante", referencia: 11, baixa: 7, media: 5, alta: 2 },
  { funcao: "Supervisor", referencia: 9, baixa: 6, media: 4, alta: 3 },
  { funcao: "Analista", referencia: 14, baixa: 8, media: 3, alta: 1 },
  { funcao: "Coordenador", referencia: 8, baixa: 5, media: 6, alta: 2 },
  { funcao: "Gerente", referencia: 13, baixa: 9, media: 4, alta: 2 },
];

/* ========================================================= */
/*  CONDUTORES POR FILIAL x COMPORTAMENTO                    */
/* ========================================================= */

export const condutoresPorFilial = [
  { departamento: "Comercial", referencia: 14, baixa: 9, media: 4, alta: 2 },
  { departamento: "Operações", referencia: 10, baixa: 7, media: 6, alta: 3 },
  { departamento: "Logística", referencia: 12, baixa: 8, media: 5, alta: 1 },
  { departamento: "Técnico", referencia: 16, baixa: 6, media: 3, alta: 2 },
  { departamento: "Administrativo", referencia: 8, baixa: 5, media: 7, alta: 4 },
];

/* ========================================================= */
/*  REGISTROS DE FADIGA POR FILIAL                           */
/* ========================================================= */

export const fadigaPorFilial = [
  { departamento: "Comercial", aguda: 8, acumulada: 5 },
  { departamento: "Operações", aguda: 12, acumulada: 7 },
  { departamento: "Logística", aguda: 6, acumulada: 4 },
  { departamento: "Técnico", aguda: 4, acumulada: 3 },
  { departamento: "Administrativo", aguda: 9, acumulada: 6 },
];

/* ========================================================= */
/*  QUANTIDADE DE EVENTOS POR PARÂMETRO DO RANKING           */
/* ========================================================= */

export const eventosPorParametro = parametrosRanking.map((p) => ({
  parametro: p.label.length > 25 ? p.label.substring(0, 25) + "..." : p.label,
  total: p.total,
}));
