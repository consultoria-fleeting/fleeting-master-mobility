import {
  parameterDetailsSearchParamsSchema,
  type ParameterDetailsSearchParams,
} from "@/schemas/ranking-search-params";
import type { DashboardHierarchyFilters, ExposureLevelBucket } from "@/types/driver-scoring";
import { sanitizeParams } from "@/utils/sanitize-params";

/**
 * Lê e valida os query params da tela de detalhe de um parâmetro.
 * Ids que não forem UUID válido são descartados.
 */
export function parseParameterDetailsSearchParams(
  searchParams: URLSearchParams,
): ParameterDetailsSearchParams {
  return parameterDetailsSearchParamsSchema.parse(Object.fromEntries(searchParams.entries()));
}

/** Monta a query string para navegar do card de um parâmetro até o seu detalhe, preservando o contexto. */
export function buildParameterDetailsQuery(
  year: number,
  month: number,
  filters: DashboardHierarchyFilters,
  level?: ExposureLevelBucket,
): string {
  const params = sanitizeParams({ year, month, level, ...filters });
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    query.set(key, String(value));
  }
  return query.toString();
}

/** Rota de detalhe de um evento (`eventType` pode ser `all-events`). */
export function getParameterDetailsPath(eventType: string): string {
  return `/ranking-condutores/dashboard-parametros/${encodeURIComponent(eventType)}/`;
}
