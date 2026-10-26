import type { DashboardHierarchyFilters } from "@/types/driver-scoring";
import type { RankingFiltersState } from "@/types/ranking-filtros";

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
