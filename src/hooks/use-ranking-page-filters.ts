/**
 * useRankingPageFilters — Estado de período + filtros hierárquicos das telas do Ranking.
 *
 * Centraliza o que as telas Visão Geral, Parâmetros e Performance têm em comum:
 * - mês/ano selecionados sincronizados com a URL (`?month=...&year=...` ou `?mes=...&ano=...`,
 *   padrão: mês e ano atuais);
 * - filtros em cascata (filial -> unidade, departamento, centro de custo, gestor) + nome;
 * - opções dos combos carregadas da API;
 * - filtros prontos para a API, com o nome já em debounce.
 *
 * @example
 * const { anoSelecionado, mesNumero, filtros, setFiltros, opcoesFiltro, filtrosApi } = useRankingPageFilters();
 */

"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useRankingFilterOptions } from "@/hooks/use-ranking-filter-options";
import type { DashboardHierarchyFilters } from "@/types/driver-scoring";
import { RANKING_FILTERS_INITIAL, type RankingFiltersState } from "@/types/ranking-filtros";
import {
  getCurrentPeriod,
  NOMES_MESES,
  parsePeriodSearchParams,
  toHierarchyFilters,
} from "@/utils/ranking-filtros";

/** Tempo de espera após o usuário parar de digitar o nome (protege o rate limit do backend). */
const DEBOUNCE_NOME_MS = 400;

const EVENTO_PERIODO_URL = "url-periodo-change";

function assinarMudancaUrl(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(EVENTO_PERIODO_URL, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(EVENTO_PERIODO_URL, callback);
  };
}

function obterSearchCliente(): string {
  return window.location.search;
}

function obterSearchServidor(): string {
  return "";
}

function atualizarQueryPeriodoNaUrl(novosParams: {
  month?: string | number | null;
  year?: number;
}) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  params.delete("mes");
  params.delete("ano");

  if (novosParams.month === null) {
    params.delete("month");
  } else if (novosParams.month !== undefined) {
    params.set("month", String(novosParams.month));
  }
  if (novosParams.year !== undefined) {
    params.set("year", String(novosParams.year));
  }

  const query = params.toString();
  const novaUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", novaUrl);
  window.dispatchEvent(new Event(EVENTO_PERIODO_URL));
}

export { NOMES_MESES, getCurrentPeriod };

/**
 * Hook que lê e sincroniza o filtro de mês e ano com os query params da URL
 * (`?month=10&year=2026` ou `?mes=outubro&ano=2026`).
 * Com `apenasAno: true`, sincroniza apenas `year` e remove `month`/`mes` da URL.
 */
export function usePeriodoUrl(opcoes?: { permitirTodosMeses?: boolean; apenasAno?: boolean }) {
  const permitirTodosMeses = opcoes?.permitirTodosMeses ?? false;
  const apenasAno = opcoes?.apenasAno ?? false;
  const search = useSyncExternalStore(assinarMudancaUrl, obterSearchCliente, obterSearchServidor);

  const periodo = useMemo(
    () => parsePeriodSearchParams(search, { permitirTodosMeses, apenasAno }),
    [search, permitirTodosMeses, apenasAno],
  );

  useEffect(() => {
    if (!apenasAno) return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("month") || params.has("mes")) {
      atualizarQueryPeriodoNaUrl({ month: null, year: periodo.ano });
    }
  }, [apenasAno, periodo.ano, search]);

  const setMesSelecionado = useCallback(
    (novoMes: string) => {
      if (apenasAno) return;
      if (permitirTodosMeses && novoMes === "") {
        atualizarQueryPeriodoNaUrl({ month: "todos", year: periodo.ano });
        return;
      }
      const indice = NOMES_MESES.indexOf(novoMes);
      if (indice >= 0) {
        atualizarQueryPeriodoNaUrl({ month: indice + 1, year: periodo.ano });
      }
    },
    [apenasAno, permitirTodosMeses, periodo.ano],
  );

  const setAnoSelecionado = useCallback(
    (novoAno: number) => {
      if (apenasAno) {
        atualizarQueryPeriodoNaUrl({ month: null, year: novoAno });
        return;
      }
      const atual = getCurrentPeriod();
      let mesAlvo: string | number = periodo.mesNumero ?? "todos";
      if (typeof mesAlvo === "number" && novoAno >= atual.ano && mesAlvo > atual.mesNumero) {
        mesAlvo = atual.mesNumero;
      }
      atualizarQueryPeriodoNaUrl({ month: mesAlvo, year: novoAno });
    },
    [apenasAno, periodo.mesNumero],
  );

  return {
    mesSelecionado: periodo.mesNome,
    setMesSelecionado,
    anoSelecionado: periodo.ano,
    setAnoSelecionado,
    mesNumero: periodo.mesNumero,
  };
}

export function useRankingPageFilters(opcoes?: { apenasAno?: boolean }) {
  const {
    mesSelecionado,
    setMesSelecionado,
    anoSelecionado,
    setAnoSelecionado,
    mesNumero,
  } = usePeriodoUrl({ apenasAno: opcoes?.apenasAno });

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
    mesNumero: mesNumero ?? getCurrentPeriod().mesNumero,
    filtros,
    setFiltros,
    opcoesFiltro,
    filtrosApi,
  };
}
