/**
 * GroupBySelector — Alternador de agrupamento (Departamento / Unidade / Filial).
 *
 * Usado pelos gráficos que aceitam `groupBy` (distribuição de condutores e fadiga).
 *
 * @example
 * <GroupBySelector valor={groupBy} onChange={setGroupBy} />
 */

"use client";

import type { DistributionGroupBy } from "@/types/driver-scoring";

export const GROUP_BY_OPTIONS: { value: DistributionGroupBy; label: string }[] = [
  { value: "department", label: "Departamento" },
  { value: "unit", label: "Unidade" },
  { value: "company", label: "Filial" },
];

/** Rótulo em português de um agrupamento. */
export function getGroupByLabel(groupBy: DistributionGroupBy): string {
  return GROUP_BY_OPTIONS.find((option) => option.value === groupBy)?.label ?? "";
}

interface GroupBySelectorProps {
  valor: DistributionGroupBy;
  onChange: (valor: DistributionGroupBy) => void;
}

export function GroupBySelector({ valor, onChange }: GroupBySelectorProps) {
  return (
    <div
      role="group"
      aria-label="Agrupar por"
      className="inline-flex rounded-md border border-border p-0.5 bg-muted/40"
    >
      {GROUP_BY_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={valor === option.value}
          className={`px-3 py-1 text-xs rounded-[5px] transition-colors ${
            valor === option.value
              ? "bg-background shadow-sm font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
