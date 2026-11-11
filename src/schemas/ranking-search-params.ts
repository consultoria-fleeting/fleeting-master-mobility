import { z } from "zod";
import { getCurrentPeriod } from "@/utils/ranking-filtros";

/**
 * Schema dos query params da URL de detalhe de um parâmetro
 * (`/ranking-condutores/dashboard-parametros/[id]?...`).
 *
 * A URL é uma entrada não confiável: qualquer valor inválido é descartado (ids que não são UUID)
 * ou substituído por um padrão seguro (ano/mês atuais), em vez de quebrar a tela ou chegar à API.
 */

const optionalUuid = z.guid().optional().catch(undefined);

export const parameterDetailsSearchParamsSchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2000)
    .max(2100)
    .catch(() => getCurrentPeriod().ano),
  month: z.coerce
    .number()
    .int()
    .min(1)
    .max(12)
    .catch(() => getCurrentPeriod().mesNumero),
  company_id: optionalUuid,
  unit_id: optionalUuid,
  department_id: optionalUuid,
  cost_center_id: optionalUuid,
  manager_id: optionalUuid,
  driver_name: z.string().max(100).optional().catch(undefined),
  /** Nível de exposição de origem (só para exibir o selo no cabeçalho). */
  level: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional().catch(undefined),
});

export type ParameterDetailsSearchParams = z.infer<typeof parameterDetailsSearchParamsSchema>;

/**
 * Segmento `[categoria]` da rota `/ranking-condutores/condutores-categoria/[categoria]`.
 * Entrada não confiável: qualquer valor fora da lista é tratado como "categoria não encontrada".
 */
export const categoryPathSchema = z.enum(["todos", "referencia", "baixa", "media", "alta"]);
