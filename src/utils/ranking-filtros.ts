import { z } from "zod";
import type { DashboardHierarchyFilters } from "@/types/driver-scoring";
import type { RankingFiltersState } from "@/types/ranking-filtros";

export const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Remove acentos e converte para minúsculas para comparação tolerante de nomes de mês na URL. */
function normalizarTextoMes(valor: string): string {
  return valor
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const MESES_NORMALIZADOS = NOMES_MESES.map(normalizarTextoMes);

const rawPeriodParamsSchema = z.object({
  year: z.string().max(20).optional().catch(undefined),
  ano: z.string().max(20).optional().catch(undefined),
  month: z.string().max(30).optional().catch(undefined),
  mes: z.string().max(30).optional().catch(undefined),
});

/**
 * Retorna o período atual (mês e ano correntes).
 */
export function getCurrentPeriod(referencia: Date = new Date()): {
  mesNome: string;
  mesNumero: number;
  ano: number;
} {
  const mesAtualIndice = referencia.getMonth();
  const anoAtual = referencia.getFullYear();

  return {
    mesNome: NOMES_MESES[mesAtualIndice],
    mesNumero: mesAtualIndice + 1,
    ano: anoAtual,
  };
}

/** Converte um parâmetro de mês da URL (número "1".."12" ou nome "Outubro"/"outubro") em número 1..12. */
function parseMonthValue(rawMonth: string | undefined): number | undefined {
  if (!rawMonth) return undefined;
  const limpo = rawMonth.trim();
  if (!limpo) return undefined;

  const comoNumero = z.coerce.number().int().min(1).max(12).safeParse(limpo);
  if (comoNumero.success) return comoNumero.data;

  const indiceNome = MESES_NORMALIZADOS.indexOf(normalizarTextoMes(limpo));
  return indiceNome >= 0 ? indiceNome + 1 : undefined;
}

/**
 * Lê e valida os parâmetros de período (`month`/`mes` e `year`/`ano`) vindos da URL.
 * - Aceita número do mês (`1` a `12`) ou nome do mês (`Outubro`, `outubro`, `marco`).
 * - Não permite meses futuros no ano corrente (limita ao mês atual).
 * - Com `apenasAno: true`, ignora o mês e retorna `mesNome: ""` e `mesNumero: undefined`.
 * - Se não houver parâmetros válidos na URL, retorna o mês e ano atuais.
 */
export function parsePeriodSearchParams(
  search: string | URLSearchParams,
  opcoes?: { permitirTodosMeses?: boolean; apenasAno?: boolean; referencia?: Date },
): {
  mesNome: string;
  mesNumero: number | undefined;
  ano: number;
} {
  const atual = getCurrentPeriod(opcoes?.referencia);
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const parsed = rawPeriodParamsSchema.safeParse(Object.fromEntries(params.entries()));

  if (!parsed.success) {
    return opcoes?.apenasAno
      ? { mesNome: "", mesNumero: undefined, ano: atual.ano }
      : atual;
  }

  const rawYear = parsed.data.year ?? parsed.data.ano;
  const yearCheck = z.coerce.number().int().min(2020).max(atual.ano).safeParse(rawYear);
  const ano = yearCheck.success ? yearCheck.data : atual.ano;

  if (opcoes?.apenasAno) {
    return { mesNome: "", mesNumero: undefined, ano };
  }

  const rawMonth = parsed.data.month ?? parsed.data.mes;
  if (opcoes?.permitirTodosMeses && rawMonth) {
    const normalizado = normalizarTextoMes(rawMonth);
    if (normalizado === "todos" || normalizado === "all") {
      return { mesNome: "", mesNumero: undefined, ano };
    }
  }

  const mesDaUrl = parseMonthValue(rawMonth) ?? atual.mesNumero;
  const mesNumero = ano >= atual.ano ? Math.min(mesDaUrl, atual.mesNumero) : mesDaUrl;

  return {
    mesNome: NOMES_MESES[mesNumero - 1],
    mesNumero,
    ano,
  };
}

/**
 * Converte o estado dos filtros da tela (camelCase, "" = vazio) para os query params
 * snake_case aceitos pelos endpoints 4.2 a 4.6.
 * Valores vazios são removidos depois pelo `sanitizeParams` do service.
 *
 * @param driverName Nome já com debounce (não use o valor cru do input).
 */
export function toHierarchyFilters(
  filters: RankingFiltersState,
  driverName: string,
): DashboardHierarchyFilters {
  return {
    company_id: filters.companyId,
    unit_id: filters.unitId,
    department_id: filters.departmentId,
    cost_center_id: filters.costCenterId,
    manager_id: filters.managerId,
    driver_name: driverName.trim(),
  };
}
