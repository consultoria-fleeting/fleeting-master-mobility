import {
  parameterDetailsSearchParamsSchema,
  type ParameterDetailsSearchParams,
} from "@/schemas/ranking-search-params";
import type {
  DashboardHierarchyFilters,
  DriverClassificationFilter,
  ExposureLevelBucket,
} from "@/types/driver-scoring";
import { getCurrentPeriod, parsePeriodSearchParams } from "@/utils/ranking-filtros";
import { sanitizeParams } from "@/utils/sanitize-params";

/**
 * Lê e valida os query params da tela de detalhe de um parâmetro.
 * Aceita `month`/`mes` (número ou nome do mês) e `year`/`ano`, além dos filtros hierárquicos.
 * Ids que não forem UUID válido são descartados.
 */
export function parseParameterDetailsSearchParams(
  searchParams: URLSearchParams,
): ParameterDetailsSearchParams {
  const base = parameterDetailsSearchParamsSchema.parse(Object.fromEntries(searchParams.entries()));
  const periodo = parsePeriodSearchParams(searchParams);
  return {
    ...base,
    year: periodo.ano,
    month: periodo.mesNumero ?? getCurrentPeriod().mesNumero,
  };
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

/** Rota da lista de condutores de uma categoria (Tela 2); o contexto (período e filtros) vai na query string. */
export function getCategoryPath(
  classification: DriverClassificationFilter,
  year: number,
  month: number,
  filters: DashboardHierarchyFilters,
): string {
  return `/ranking-condutores/condutores-categoria/${classification}/?${buildParameterDetailsQuery(year, month, filters)}`;
}
