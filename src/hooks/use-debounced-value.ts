/**
 * useDebouncedValue — Atrasa a propagação de um valor que muda rápido.
 *
 * Útil para campos de busca: o input atualiza na hora, mas a requisição só
 * é disparada depois que o usuário para de digitar (respeita o rate limit do backend).
 *
 * @example
 * const nomeDebounced = useDebouncedValue(filtros.driverName, 400);
 */

"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
