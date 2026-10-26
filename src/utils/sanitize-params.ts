/**
 * Remove de um objeto de query params as chaves com valor `undefined`, `null` ou `""`
 * (inclusive strings só com espaços).
 *
 * Necessário porque o `ValidationPipe` do `api-driver-scoring` rejeita (HTTP 400)
 * strings vazias em campos UUID.
 */
export function sanitizeParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    }),
  ) as Partial<T>;
}
