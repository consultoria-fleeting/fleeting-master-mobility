/**
 * useRankingPageFilters — Estado de período + filtros hierárquicos das telas do Ranking.
 *
 * Centraliza o que as telas Visão Geral, Parâmetros e Performance têm em comum:
 * - mês/ano selecionados (padrão: mês e ano atuais);
 * - filtros em cascata (filial -> unidade, departamento, centro de custo, gestor) + nome;
 * - opções dos combos carregadas da API;
 * - filtros prontos para a API, com o nome já em debounce.
 *
 * @example
 * const { anoSelecionado, mesNumero, filtros, setFiltros, opcoesFiltro, filtrosApi } = useRankingPageFilters();
 */

"use client";

import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useRankingFilterOptions } from "@/hooks/use-ranking-filter-options";
import type { DashboardHierarchyFilters } from "@/types/driver-scoring";
import { RANKING_FILTERS_INITIAL, type RankingFiltersState } from "@/types/ranking-filtros";
import { toHierarchyFilters } from "@/utils/ranking-filtros";

/** Tempo de espera após o usuário parar de digitar o nome (protege o rate limit do backend). */
const DEBOUNCE_NOME_MS = 400;

export const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function useRankingPageFilters() {
  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(NOMES_MESES[hoje.getMonth()]);
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  const [filtros, setFiltros] = useState<RankingFiltersState>(RANKING_FILTERS_INITIAL);
  const opcoesFiltro = useRankingFilterOptions(filtros.companyId);

  // O nome só é enviado à API depois do debounce; o input continua responsivo.
  const nomeComDebounce = useDebouncedValue(filtros.driverName, DEBOUNCE_NOME_MS);
  const filtrosApi: DashboardHierarchyFilters = useMemo(
    () => toHierarchyFilters(filtros, nomeComDebounce),
    [filtros, nomeComDebounce],
  );

  return {
    mesSelecionado,
    setMesSelecionado,
    anoSelecionado,
    setAnoSelecionado,
    /** Mês de 1 a 12, como a API espera. */
    mesNumero: NOMES_MESES.indexOf(mesSelecionado) + 1,
    filtros,
    setFiltros,
    opcoesFiltro,
    filtrosApi,
  };
}
