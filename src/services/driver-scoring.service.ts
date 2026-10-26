import type { z } from "zod";
import {
  annualEvolutionQuerySchema,
  distributionQuerySchema,
  driverIdentifierPathSchema,
  driverPerformanceDetailQuerySchema,
  driverPerformanceListQuerySchema,
  eventTypePathSchema,
  rankingParameterDetailsQuerySchema,
  rankingParametersQuerySchema,
  rankingQuerySchema,
  selectQuerySchema,
} from "@/schemas/driver-scoring";
import { driverScoringApi } from "@/services/api";
import type {
  AnnualEvolutionQueryParams,
  AnnualEvolutionResponse,
  BottomScoringDriversResponse,
  DistributionQueryParams,
  DriverCategoriesResponse,
  DriverPerformanceDetailQueryParams,
  DriverPerformanceDetailResponse,
  DriverPerformanceListQueryParams,
  DriverPerformanceListResponse,
  DriversDistributionResponse,
  EventsVolumeResponse,
  FatigueDistributionResponse,
  RankingAnnualResponse,
  RankingMonthlyResponse,
  RankingParameterDetailsQueryParams,
  RankingParameterDetailsResponse,
  RankingParametersQueryParams,
  RankingParametersResponse,
  RankingQueryParams,
  SelectOption,
  SelectQueryParams,
  TopReferenceDriversResponse,
} from "@/types/driver-scoring";
import { sanitizeParams } from "@/utils/sanitize-params";

/**
 * Serviço do backend `api-driver-scoring` (Ranking de Condutores).
 *
 * Todo método:
 * 1. Remove params `undefined`/`null`/`""` (o backend retorna 400 para UUID vazio);
 * 2. Valida com Zod (que também descarta chaves não permitidas na rota);
 * 3. Envia a requisição via `driverScoringApi` (token + refresh automáticos).
 */

// ---------------------------------------------------------------------------
// Utilitários internos
// ---------------------------------------------------------------------------

/** Sanitiza -> valida/whitelist com Zod -> sanitiza de novo (o schema pode gerar `undefined`). */
function buildQuery<S extends z.ZodType<object>>(schema: S, params: object): z.output<S> {
  return sanitizeParams(schema.parse(sanitizeParams(params))) as z.output<S>;
}

/** GET genérico que devolve apenas o `data` da resposta. */
async function get<T>(url: string, params?: object): Promise<T> {
  const response = await driverScoringApi.get<T>(url, { params });
  return response.data;
}

// ---------------------------------------------------------------------------
// 4.1 — GET /dashboard/ranking
// ---------------------------------------------------------------------------

/** Aceita `manager_id` (snake_case) por conveniência; é convertido para `managerId`. */
export type GetRankingInput = RankingQueryParams & { manager_id?: string };

/**
 * Ranking de condutores (mensal ou anual).
 * Envia estritamente `period, year, month, page, limit, managerId, export`.
 * - `monthly`: `month` (1-12) obrigatório.
 * - `annual`: `month` nunca é enviado.
 */
export async function getRanking(
  params: GetRankingInput & { period: "monthly" },
): Promise<RankingMonthlyResponse>;
export async function getRanking(
  params: GetRankingInput & { period: "annual" },
): Promise<RankingAnnualResponse>;
export async function getRanking(
  params: GetRankingInput,
): Promise<RankingMonthlyResponse | RankingAnnualResponse>;
export async function getRanking(params: GetRankingInput) {
  const { manager_id, ...rest } = params;
  const query = buildQuery(rankingQuerySchema, {
    ...rest,
    managerId: rest.managerId || manager_id,
  });
  return get<RankingMonthlyResponse | RankingAnnualResponse>("/dashboard/ranking", query);
}

// ---------------------------------------------------------------------------
// 4.2 a 4.8 e 4.10 — Dashboards por ano/mês
// ---------------------------------------------------------------------------

/** 4.2 — Cards de classificação (Visão Geral). */
export function getDriverCategories(
  params: RankingParametersQueryParams,
): Promise<DriverCategoriesResponse> {
  return get("/dashboard/driver-categories", buildQuery(rankingParametersQuerySchema, params));
}

/** 4.3 — Distribuição de condutores por classificação, agrupada por unidade/filial/departamento. */
export function getDriversDistribution(
  params: DistributionQueryParams,
): Promise<DriversDistributionResponse> {
  return get("/dashboard/drivers-distribution", buildQuery(distributionQuerySchema, params));
}

/** 4.4 — Evolução anual da classificação (apenas meses fechados). Não aceita `month`. */
export function getAnnualClassificationEvolution(
  params: AnnualEvolutionQueryParams,
): Promise<AnnualEvolutionResponse> {
  return get(
    "/dashboard/annual-classification-evolution",
    buildQuery(annualEvolutionQuerySchema, params),
  );
}

/** 4.5 — Top 10 condutores Referência (`export: true` traz todos). */
export function getTopReferenceDrivers(
  params: RankingParametersQueryParams,
): Promise<TopReferenceDriversResponse> {
  return get("/dashboard/top-reference-drivers", buildQuery(rankingParametersQuerySchema, params));
}

/** 4.6 — 10 condutores com menor pontuação (`export: true` traz todos os não-Referência). */
export function getBottomScoringDrivers(
  params: RankingParametersQueryParams,
): Promise<BottomScoringDriversResponse> {
  return get(
    "/dashboard/bottom-scoring-drivers",
    buildQuery(rankingParametersQuerySchema, params),
  );
}

/** 4.7 — Eventos por nível de exposição (CRITICAL / HIGH / MEDIUM / LOW). */
export function getRankingParameters(
  params: RankingParametersQueryParams,
): Promise<RankingParametersResponse> {
  return get("/dashboard/ranking-parameters", buildQuery(rankingParametersQuerySchema, params));
}

/** 4.8 — Volume de eventos por tipo. */
export function getEventsVolume(params: RankingParametersQueryParams): Promise<EventsVolumeResponse> {
  return get("/dashboard/events-volume", buildQuery(rankingParametersQuerySchema, params));
}

/** 4.10 — Fadiga aguda × acumulada, agrupada por unidade/filial/departamento. */
export function getFatigueDistribution(
  params: DistributionQueryParams,
): Promise<FatigueDistributionResponse> {
  return get("/dashboard/fatigue-distribution", buildQuery(distributionQuerySchema, params));
}

// ---------------------------------------------------------------------------
// 4.9 — GET /dashboard/ranking-parameters/:eventType/details
// ---------------------------------------------------------------------------

/**
 * Drill-down de um evento (paginado).
 * @param eventType Código do evento (ex.: `HARSH_BRAKING`) ou `ALL_EVENTS_IDENTIFIER` (`all-events`).
 */
export function getRankingParameterDetails(
  eventType: string,
  params: RankingParameterDetailsQueryParams,
): Promise<RankingParameterDetailsResponse> {
  const safeEventType = eventTypePathSchema.parse(eventType);
  return get(
    `/dashboard/ranking-parameters/${encodeURIComponent(safeEventType)}/details`,
    buildQuery(rankingParameterDetailsQuerySchema, params),
  );
}

// ---------------------------------------------------------------------------
// 4.11 e 4.12 — Performance de condutores
// ---------------------------------------------------------------------------

/** 4.11 — Listagem analítica de performance (`export: true` ignora a paginação). */
export function getDriverPerformanceList(
  params: DriverPerformanceListQueryParams = {},
): Promise<DriverPerformanceListResponse> {
  return get("/dashboard/driver-performance", buildQuery(driverPerformanceListQuerySchema, params));
}

/**
 * 4.12 — Detalhe individual do condutor.
 * @param identifier Use sempre o UUID do condutor (nome/documento é frágil no backend).
 */
export function getDriverPerformanceDetail(
  identifier: string,
  params: DriverPerformanceDetailQueryParams = {},
): Promise<DriverPerformanceDetailResponse> {
  const safeIdentifier = driverIdentifierPathSchema.parse(identifier);
  return get(
    `/dashboard/driver-performance/${encodeURIComponent(safeIdentifier)}`,
    buildQuery(driverPerformanceDetailQuerySchema, params),
  );
}

// ---------------------------------------------------------------------------
// 5.1 a 5.5 — Endpoints de filtros (combos)
// ---------------------------------------------------------------------------

/** 5.1 — Filiais/Empresas da organização do token. */
export function getCompanyOptions(): Promise<SelectOption[]> {
  return get("/company/select");
}

/** 5.2 — Unidades. Com `company_id` filtra pela filial; sem ele traz todas da organização. */
export function getUnitOptions(params: SelectQueryParams = {}): Promise<SelectOption[]> {
  return get("/unit/select", buildQuery(selectQuerySchema, params));
}

/**
 * Busca um select que depende de `company_id`. Sem ele o backend retorna `[]`,
 * então evitamos a requisição desnecessária (rate limit de 20 req/s).
 */
async function getCompanyScopedOptions(url: string, params: SelectQueryParams) {
  const query = buildQuery(selectQuerySchema, params);
  if (!query.company_id) return [] as SelectOption[];
  return get<SelectOption[]>(url, query);
}

/** 5.3 — Departamentos da filial (`company_id` obrigatório na prática). */
export function getDepartmentOptions(params: SelectQueryParams = {}): Promise<SelectOption[]> {
  return getCompanyScopedOptions("/department/select", params);
}

/** 5.4 — Centros de custo da filial (`company_id` obrigatório na prática). */
export function getCostCenterOptions(params: SelectQueryParams = {}): Promise<SelectOption[]> {
  return getCompanyScopedOptions("/costcenter/select", params);
}

/** 5.5 — Gestores ativos da filial (`company_id` obrigatório na prática). */
export function getManagerOptions(params: SelectQueryParams = {}): Promise<SelectOption[]> {
  return getCompanyScopedOptions("/manager/select", params);
}
