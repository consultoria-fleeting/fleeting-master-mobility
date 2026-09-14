/**
 * Dados mock de eventos do condutor para a página de Performance.
 *
 * Gera eventos determinísticos associados a um condutor específico,
 * simulando infrações registradas com tipo, gravidade, impacto e status.
 * Valores fixos para evitar hydration mismatch.
 *
 * TODO(backend): Substituir por dados reais da API.
 */

import { parametrosRanking } from "@/data/mock-parametros-ranking";

/** Evento registrado para um condutor */
export interface EventoCondutor {
  id: string;
  data: string;
  tipo: string;
  gravidade: "Leve" | "Média" | "Grave" | "Gravíssima" | "Crítica";
  impactoPontuacao: number;
  status: "Confirmado" | "Em análise" | "Contestado";
}

/** Datas fixas para os eventos (dia do mês) */
const DATAS_FIXAS = [
  "03", "07", "10", "14", "18", "22", "25", "02",
  "05", "09", "13", "17", "20", "24", "28", "01",
];

/** Gravidades pré-definidas por índice */
const GRAVIDADES: EventoCondutor["gravidade"][] = [
  "Leve", "Média", "Grave", "Gravíssima", "Crítica",
];

/** Impactos de pontuação por gravidade */
const IMPACTOS = [-5, -10, -15, -30, -100];

/** Status pré-definidos por índice */
const STATUS_LISTA: EventoCondutor["status"][] = [
  "Confirmado", "Em análise", "Contestado",
];

/**
 * Gera uma lista determinística de eventos para um condutor.
 * Usa o índice do nome do condutor como seed para gerar dados consistentes.
 */
export function gerarEventosCondutor(
  nomeCondutor: string
): EventoCondutor[] {
  /** Seed baseado no nome para determinismo */
  const seed = nomeCondutor
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  /** Quantidade de eventos baseada no seed (entre 3 e 8) */
  const qtdEventos = 3 + (seed % 6);

  return Array.from({ length: qtdEventos }, (_, i) => {
    const paramIndex = (seed + i) % parametrosRanking.length;
    const gravIndex = (seed + i * 3) % GRAVIDADES.length;
    const statusIndex = (seed + i * 2) % STATUS_LISTA.length;
    const diaIndex = (seed + i * 7) % DATAS_FIXAS.length;

    return {
      id: `EVT-${seed}-${i}`,
      data: `${DATAS_FIXAS[diaIndex]}/08/2026`,
      tipo: parametrosRanking[paramIndex].label,
      gravidade: GRAVIDADES[gravIndex],
      impactoPontuacao: IMPACTOS[gravIndex],
      status: STATUS_LISTA[statusIndex],
    };
  });
}
