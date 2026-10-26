import { z } from "zod";

/**
 * Schemas Zod (validação de entrada) dos endpoints do `api-driver-scoring`.
 *
 * Regras importantes do backend (`forbidNonWhitelisted: true`):
 * - Query param fora da matriz da seção 3 da spec => HTTP 400.
 *   Como `z.object` descarta chaves desconhecidas, o parse também funciona como whitelist.
 * - String vazia em campo UUID => HTTP 400/500. Por isso os params passam por
 *   `sanitizeParams` ANTES destes schemas.
 */

// ---------------------------------------------------------------------------
// Blocos reutilizáveis
// ---------------------------------------------------------------------------

/** UUID (formato 8-4-4-4-12; `guid` não exige as versões RFC, aceitando os IDs do Postgres). */
const uuidSchema = z.guid("Informe um UUID válido");

const yearSchema = z.coerce.number().int().min(2000).max(2100);
const monthSchema = z.coerce.number().int().min(1).max(12);
const pageSchema = z.coerce.number().int().min(1);
const limitMax100Schema = z.coerce.number().int().min(1).max(100);
const limitNoMaxSchema = z.coerce.number().int().min(1);

/** O backend só considera `export` verdadeiro se for exatamente `"true"`; `false` nem é enviado. */
const exportSchema = z
  .boolean()
  .optional()
  .transform((value) => (value ? true : undefined));

/** Filtros hierárquicos em snake_case (endpoints 4.2 a 4.11). */
const hierarchyFiltersShape = {
  company_id: uuidSchema.optional(),
  department_id: uuidSchema.optional(),
  unit_id: uuidSchema.optional(),
  cost_center_id: uuidSchema.optional(),
  manager_id: uuidSchema.optional(),
  driver_name: z.string().optional(),
};

// ---------------------------------------------------------------------------
// 4.1 — /dashboard/ranking
// ---------------------------------------------------------------------------

/**
 * Aceita SOMENTE `period, year, month, page, limit, managerId, export`.
 * - `month` é obrigatório no modo mensal (sem ele o backend retorna 500).
 * - `month` é removido no modo anual.
 */
export const rankingQuerySchema = z
  .object({
    period: z.enum(["monthly", "annual"]),
    year: yearSchema,
    month: monthSchema.optional(),
    page: pageSchema.optional(),
    limit: limitMax100Schema.optional(),
    managerId: uuidSchema.optional(),
    export: exportSchema,
  })
  .superRefine((params, ctx) => {
    if (params.period === "monthly" && params.month === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["month"],
        message: "O mês (1-12) é obrigatório no ranking mensal",
      });
    }
  })
  .transform((params) => (params.period === "annual" ? { ...params, month: undefined } : params));

// ---------------------------------------------------------------------------
// 4.2, 4.5, 4.6, 4.7 e 4.8 — GetRankingParametersDto
// ---------------------------------------------------------------------------

export const rankingParametersQuerySchema = z.object({
  year: yearSchema,
  month: monthSchema,
  ...hierarchyFiltersShape,
  export: exportSchema,
});

// ---------------------------------------------------------------------------
// 4.3 e 4.10 — GetDistributionDto
// ---------------------------------------------------------------------------

export const distributionQuerySchema = rankingParametersQuerySchema.extend({
  groupBy: z.enum(["unit", "company", "department"]).optional(),
});

// ---------------------------------------------------------------------------
// 4.4 — GetAnnualEvolutionDto (não aceita month, page, limit nem export)
// ---------------------------------------------------------------------------

export const annualEvolutionQuerySchema = z.object({
  year: yearSchema,
  ...hierarchyFiltersShape,
});

// ---------------------------------------------------------------------------
// 4.9 — GetRankingParameterDetailsDto
// ---------------------------------------------------------------------------

export const rankingParameterDetailsQuerySchema = z.object({
  year: yearSchema,
  month: monthSchema,
  ...hierarchyFiltersShape,
  page: pageSchema.optional(),
  limit: limitNoMaxSchema.optional(),
});

/** Path params de 4.9: código do evento ou `all-events`. */
export const eventTypePathSchema = z.string().trim().min(1, "Informe o tipo do evento");

// ---------------------------------------------------------------------------
// 4.11 — GetDriverPerformanceListDto
// ---------------------------------------------------------------------------

export const driverPerformanceListQuerySchema = z.object({
  /** `todos` equivale a não filtrar, então nem é enviado ao backend. */
  classification: z
    .enum(["todos", "referencia", "baixa", "media", "alta"])
    .optional()
    .transform((value) => (value === "todos" ? undefined : value)),
  year: yearSchema.optional(),
  month: monthSchema.optional(),
  ...hierarchyFiltersShape,
  page: pageSchema.optional(),
  limit: limitMax100Schema.optional(),
  export: exportSchema,
});

// ---------------------------------------------------------------------------
// 4.12 — GetDriverPerformanceDto
// ---------------------------------------------------------------------------

export const driverPerformanceDetailQuerySchema = z.object({
  year: yearSchema.optional(),
  month: monthSchema.optional(),
  page: pageSchema.optional(),
  limit: limitNoMaxSchema.optional(),
});

/** Path param de 4.12: prefira sempre o UUID do condutor. */
export const driverIdentifierPathSchema = z.string().trim().min(1, "Informe o identificador do condutor");

// ---------------------------------------------------------------------------
// 5.1 a 5.5 — Endpoints de select
// ---------------------------------------------------------------------------

export const selectQuerySchema = z.object({
  company_id: uuidSchema.optional(),
});

// ---------------------------------------------------------------------------
// Gestão de Exceções (FLEET-2301)
// ---------------------------------------------------------------------------

export const JUSTIFICATION_MIN_LENGTH = 10;
export const JUSTIFICATION_MAX_LENGTH = 500;

/** `GET /exceptions` — o backend aceita `pageSize` (ou `limit`, máx. 100). */
export const exceptionsListQuerySchema = z.object({
  driverName: z.string().trim().max(100).optional(),
  page: pageSchema.optional(),
  pageSize: limitMax100Schema.optional(),
});

/** Path params de exceções: sempre UUID (o backend usa `ParseUUIDPipe`). */
export const exceptionIdPathSchema = uuidSchema;
export const driverUuidPathSchema = uuidSchema;
export const eventUuidPathSchema = uuidSchema;

/**
 * Body de `POST /drivers/:driverId/events/:eventId/exceptions`.
 * `strictObject` rejeita campos extras (o backend responde 400 se `driverId`/`eventId` forem enviados).
 */
export const createExceptionBodySchema = z.strictObject({
  justification: z
    .string()
    .trim()
    .min(JUSTIFICATION_MIN_LENGTH, `A justificativa deve ter ao menos ${JUSTIFICATION_MIN_LENGTH} caracteres`)
    .max(JUSTIFICATION_MAX_LENGTH, `A justificativa deve ter no máximo ${JUSTIFICATION_MAX_LENGTH} caracteres`),
});
