/**
 * useApiQuery — Busca de dados de uma API com estados de loading e erro.
 *
 * Comportamento:
 * - Refaz a busca sempre que os `params` mudam (comparados pelo conteúdo, via JSON).
 * - Ignora respostas "atrasadas" (se os params mudaram antes da resposta chegar).
 * - Mantém o último dado válido enquanto busca o próximo (`isLoading` = true),
 *   permitindo uma transição suave na tela em vez de "piscar" um skeleton.
 * - Deduplica chamadas idênticas em andamento (ex.: React StrictMode em dev, ou dois
 *   componentes pedindo o mesmo dado), protegendo o rate limit do backend (20 req/s).
 * - `enabled: false` não faz requisição (ex.: select que depende de uma filial).
 *
 * IMPORTANTE: `fetcher` deve ser uma função estável (declarada fora do componente,
 * como as funções de `driver-scoring.service.ts`).
 *
 * @example
 * const { data, isLoading, error, refetch } = useApiQuery(getDriverCategories, { year: 2026, month: 3 });
 */

"use client";

import { useCallback, useEffect, useState } from "react";

interface UseApiQueryOptions {
  /** Se `false`, não faz a requisição. Padrão: `true`. */
  enabled?: boolean;
}

interface UseApiQueryResult<T> {
  /** Último dado carregado com sucesso (pode ser de uma busca anterior enquanto `isLoading`). */
  data: T | undefined;
  /** Erro da busca atual (ou `undefined`). */
  error: unknown;
  /** `true` enquanto a busca atual não terminou. */
  isLoading: boolean;
  /** Refaz a busca atual (ex.: botão "Tentar novamente"). */
  refetch: () => void;
}

interface QueryState<T> {
  key: string;
  data?: T;
  error?: unknown;
  hasError: boolean;
}

/** Requisições em andamento, agrupadas por função e por chave de params. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inFlightRequests = new WeakMap<(...args: any[]) => Promise<any>, Map<string, Promise<unknown>>>();

/** Executa a busca reaproveitando uma requisição idêntica que ainda esteja em andamento. */
function fetchWithoutDuplicates<P, T>(fetcher: (params: P) => Promise<T>, key: string, params: P): Promise<T> {
  let requestsByKey = inFlightRequests.get(fetcher);
  if (!requestsByKey) {
    requestsByKey = new Map();
    inFlightRequests.set(fetcher, requestsByKey);
  }

  const existing = requestsByKey.get(key);
  if (existing) return existing as Promise<T>;

  // `Promise.resolve().then` converte erros síncronos (ex.: ZodError) em rejeição.
  const request = Promise.resolve()
    .then(() => fetcher(params))
    .finally(() => requestsByKey.delete(key));

  requestsByKey.set(key, request);
  return request;
}

export function useApiQuery<P extends object, T>(
  fetcher: (params: P) => Promise<T>,
  params: P,
  { enabled = true }: UseApiQueryOptions = {},
): UseApiQueryResult<T> {
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<QueryState<T>>();

  // A chave identifica a busca: mesmos params + mesmo "reload" = mesma busca.
  const key = JSON.stringify({ params, reloadCount });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const currentParams = (JSON.parse(key) as { params: P }).params;

    fetchWithoutDuplicates(fetcher, key, currentParams)
      .then((data) => {
        if (!cancelled) setState({ key, data, hasError: false });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState((previous) => ({ key, data: previous?.data, error, hasError: true }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, key, enabled]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  if (!enabled) {
    return { data: undefined, error: undefined, isLoading: false, refetch };
  }

  const isCurrent = state?.key === key;
  return {
    data: state?.data,
    error: isCurrent && state.hasError ? state.error : undefined,
    isLoading: !isCurrent,
    refetch,
  };
}
