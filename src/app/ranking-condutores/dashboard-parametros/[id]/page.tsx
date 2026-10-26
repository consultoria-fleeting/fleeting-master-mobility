/**
 * Detalhamento de Parâmetro — Página
 *
 * Drill-down de um evento do ranking (seção 4.9 da spec):
 * - Header com título do parâmetro, selo do nível de exposição e botão de voltar
 * - Indicador de período (mês/ano) e filtros recebidos via query string
 * - Tabela paginada de eventos (`ParameterDetailsTable`)
 *
 * A URL é tratada como entrada não confiável: o `[id]` e os query params são validados com Zod
 * (ids que não forem UUID válido são descartados antes de chegar à API).
 *
 * Rota: /ranking-condutores/dashboard-parametros/[id]?year=...&month=...&level=...
 * `[id]` é o código do evento (ex.: HARSH_BRAKING) ou `all-events`.
 */

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ParameterDetailsTable } from "@/components/parameter-details-table";
import { ALL_EVENTS_IDENTIFIER, type DashboardHierarchyFilters } from "@/types/driver-scoring";
import { EXPOSURE_LEVELS } from "@/utils/driver-scoring-display";
import { getEventTypeLabel } from "@/utils/driver-scoring-helpers";
import { parseParameterDetailsSearchParams } from "@/utils/ranking-search-params";
import { NOMES_MESES } from "@/hooks/use-ranking-page-filters";

const ROTA_PARAMETROS = "/ranking-condutores/dashboard-parametros";

/** Decodifica o segmento da rota; se vier malformado, usa o valor original (a validação Zod barra depois). */
function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export default function DetalhamentoParametroPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const eventType = decodeSegment(params.id);

  // Query params validados; `filtros` só contém UUIDs válidos (os inválidos viram `undefined` e são omitidos).
  const { year, month, level, filtros } = useMemo(() => {
    const { year, month, level, ...hierarquia } = parseParameterDetailsSearchParams(searchParams);
    const filtros: DashboardHierarchyFilters = Object.fromEntries(
      Object.entries(hierarquia).filter(([, valor]) => valor !== undefined),
    );
    return { year, month, level, filtros };
  }, [searchParams]);

  const titulo =
    eventType === ALL_EVENTS_IDENTIFIER ? "Todos os eventos" : getEventTypeLabel(eventType);
  const nivel = EXPOSURE_LEVELS.find((item) => item.level === level);

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header: Voltar + Título + Selo do nível */}
      <div className="flex items-center gap-3">
        <Link
          href={ROTA_PARAMETROS}
          className="p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Voltar para Parâmetros do Ranking"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-foreground">{titulo}</h1>
          {nivel && (
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-medium ${nivel.bgClassName} ${nivel.textClassName}`}
            >
              {nivel.label}
            </span>
          )}
        </div>
      </div>

      {/* Indicador de período */}
      <div className="text-xs text-muted-foreground bg-card border border-border rounded-md px-4 py-2">
        Período:{" "}
        <span className="font-semibold text-foreground">
          {NOMES_MESES[month - 1]} / {year}
        </span>
      </div>

      <ParameterDetailsTable eventType={eventType} ano={year} mes={month} filtros={filtros} />
    </div>
  );
}
