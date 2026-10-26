/**
 * Tipos dos filtros hierárquicos do Ranking de Condutores (integrados à API).
 * Valores vazios (`""`) significam "sem filtro".
 */

/** Estado dos filtros exibidos no topo da Visão Geral. */
export interface RankingFiltersState {
  /** Texto digitado (ainda sem debounce). */
  driverName: string;
  /** UUID da filial. Ao mudar, os filtros dependentes são zerados. */
  companyId: string;
  unitId: string;
  departmentId: string;
  costCenterId: string;
  managerId: string;
}

/** Estado inicial: nenhum filtro aplicado. */
export const RANKING_FILTERS_INITIAL: RankingFiltersState = {
  driverName: "",
  companyId: "",
  unitId: "",
  departmentId: "",
  costCenterId: "",
  managerId: "",
};
