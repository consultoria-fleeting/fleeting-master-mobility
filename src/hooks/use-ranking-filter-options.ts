/**
 * useRankingFilterOptions — Opções dos combos de filtro (seções 5.1 a 5.5 da spec).
 *
 * Fluxo em cascata:
 * 1. Filiais (`/company/select`) e Unidades (`/unit/select`) carregam ao abrir a tela.
 * 2. Ao escolher uma filial (`companyId`), carregam Unidades daquela filial, Departamentos,
 *    Centros de Custo e Gestores, todos enviando `company_id`.
 *    Sem filial escolhida, Departamentos/Centros de Custo/Gestores nem são buscados
 *    (o backend retornaria `[]`).
 *
 * @example
 * const options = useRankingFilterOptions(filtros.companyId);
 * options.managers.data // SelectOption[] | undefined
 */

"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import {
  getCompanyOptions,
  getCostCenterOptions,
  getDepartmentOptions,
  getManagerOptions,
  getUnitOptions,
} from "@/services/driver-scoring.service";

export function useRankingFilterOptions(companyId: string) {
  const hasCompany = companyId !== "";
  const companyParams = { company_id: companyId };

  return {
    companies: useApiQuery(getCompanyOptions, {}),
    // Sem filial: todas as unidades da organização. Com filial: a unidade dela.
    units: useApiQuery(getUnitOptions, companyParams),
    departments: useApiQuery(getDepartmentOptions, companyParams, { enabled: hasCompany }),
    costCenters: useApiQuery(getCostCenterOptions, companyParams, { enabled: hasCompany }),
    managers: useApiQuery(getManagerOptions, companyParams, { enabled: hasCompany }),
  };
}

/** Retorno do hook, para tipar props de componentes. */
export type RankingFilterOptions = ReturnType<typeof useRankingFilterOptions>;
