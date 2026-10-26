/**
 * Condutores por Categoria — Página (Tela 2 do guia de integração)
 *
 * Aberta ao clicar em um dos cards de classificação da Visão Geral.
 * Lista os condutores da categoria com `GET /dashboard/driver-performance?classification=...`
 * (tabela paginada + exportação para Excel, via `DriverPerformanceReport`).
 *
 * A URL é tratada como entrada não confiável: o `[categoria]` e os query params
 * (período e filtros herdados da Visão Geral) são validados com Zod antes de chegar à API.
 *
 * Rota: /ranking-condutores/condutores-categoria/[categoria]?year=...&month=...&company_id=...
 * `[categoria]`: todos | referencia | baixa | media | alta
 */

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DriverPerformanceReport } from "@/components/driver-performance-report";
import { NOMES_MESES } from "@/hooks/use-ranking-page-filters";
import { categoryPathSchema } from "@/schemas/ranking-search-params";
import type { DashboardHierarchyFilters, DriverClassificationFilter } from "@/types/driver-scoring";
import { parseParameterDetailsSearchParams } from "@/utils/ranking-search-params";

const ROTA_VISAO_GERAL = "/ranking-condutores";

/** Títulos das categorias (o backend não retorna título nesta listagem). */
const TITULOS_CATEGORIA: Record<DriverClassificationFilter, string> = {
  todos: "Todos os condutores",
  referencia: "Condutores Referência",
  baixa: "Condutores com Baixa Exposição ao Risco",
  media: "Condutores com Média Exposição ao Risco",
  alta: "Condutores com Alta Exposição ao Risco",
};

export default function CondutoresCategoriaPage() {
  const params = useParams<{ categoria: string }>();
  const searchParams = useSearchParams();

  const categoria = categoryPathSchema.safeParse(params.categoria);

  // Query params validados; `filtros` só contém UUIDs válidos (os inválidos viram `undefined` e são omitidos).
  const { year, month, filtros } = useMemo(() => {
    const { year, month, ...resto } = parseParameterDetailsSearchParams(searchParams);
    const filtros: DashboardHierarchyFilters = Object.fromEntries(
      Object.entries(resto).filter(([chave, valor]) => chave !== "level" && valor !== undefined),
    );
    return { year, month, filtros };
  }, [searchParams]);

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header: Voltar + Título + Período */}
      <div className="flex items-center gap-3">
        <Link
          href={ROTA_VISAO_GERAL}
          className="p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Voltar para a Visão Geral"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div>
          <h1 className="text-xl font-bold text-foreground">
            {categoria.success ? TITULOS_CATEGORIA[categoria.data] : "Categoria não encontrada"}
          </h1>
          {categoria.success && (
            <p className="text-sm text-muted-foreground">
              {NOMES_MESES[month - 1]} de {year}
            </p>
          )}
        </div>
      </div>

      {categoria.success ? (
        <DriverPerformanceReport ano={year} mes={month} filtros={filtros} classificacao={categoria.data} />
      ) : (
        <p role="alert" className="text-sm text-muted-foreground">
          A categoria informada não existe. Volte à Visão Geral e escolha uma das categorias disponíveis.
        </p>
      )}
    </div>
  );
}
