/**
 * Detalhamento de Parâmetro — Página
 *
 * Exibe a lista paginada de eventos registrados para um parâmetro
 * específico do ranking, com:
 * - Header com título do parâmetro, badge de grupo e botão de voltar
 * - Indicador de período (mês/ano) recebido via URL params
 * - Tabela com: Data, Condutor, Gestor, Filial, Departamento, Unidade, Classificação
 * - Paginação
 *
 * Rota: /dashboard-parametros/[id]?mes=...&ano=...
 *
 * TODO(backend): Substituir dados mock por chamadas à API filtradas por parâmetro e período.
 * TODO(security): Implementar autenticação/autorização quando integrar com backend.
 */

"use client";

import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { parametrosRanking } from "@/data/mock-parametros-ranking";
import { gerarEventosPorParametro } from "@/data/mock-eventos-parametro";
import { ClassificationBadge } from "@/components/classification-badge";
import type { GrupoImpacto } from "@/types/parametro-ranking";

/** Itens por página */
const ITENS_POR_PAGINA = 15;

/** Cores e labels por grupo de impacto */
const CORES_GRUPO: Record<
  GrupoImpacto,
  { bg: string; texto: string; label: string }
> = {
  alta: {
    bg: "bg-[hsl(var(--alta-exposicao))]",
    texto: "text-white",
    label: "Alta Exposição",
  },
  media: {
    bg: "bg-[hsl(var(--media-exposicao))]",
    texto: "text-white",
    label: "Média Exposição",
  },
  baixa: {
    bg: "bg-[hsl(var(--baixa-exposicao))]",
    texto: "text-black",
    label: "Baixa / Referência",
  },
};

export default function DetalhamentoParametroPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const parametroId = params.id as string;
  const mes = searchParams.get("mes") || "Julho";
  const ano = Number(searchParams.get("ano")) || 2026;

  const [pagina, setPagina] = useState(1);

  /* ---------- Dados do parâmetro ---------- */
  const parametro = parametrosRanking.find((p) => p.id === parametroId);

  /* ---------- Eventos ---------- */
  const todosEventos = useMemo(() => {
    if (!parametro) return [];
    return gerarEventosPorParametro(parametro.id, mes, ano);
  }, [parametro, mes, ano]);

  /* ---------- Paginação ---------- */
  const totalPaginas = Math.max(
    1,
    Math.ceil(todosEventos.length / ITENS_POR_PAGINA)
  );
  const paginaAtual = Math.min(pagina, totalPaginas);

  const eventosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return todosEventos.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [todosEventos, paginaAtual]);

  /* ---------- Estado de parâmetro não encontrado ---------- */
  if (!parametro) {
    return (
      <div className="animate-fade-in min-h-screen p-4 lg:p-6">
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">Parâmetro não encontrado</p>
          <Link
            href="/dashboard-parametros"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            ← Voltar para Parâmetros do Ranking
          </Link>
        </div>
      </div>
    );
  }

  const grupoInfo = CORES_GRUPO[parametro.grupo];

  /** Gera números de página com reticências para paginação inteligente */
  function gerarNumerosPagina(): (number | "...")[] {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    const paginas: (number | "...")[] = [1];

    if (paginaAtual > 3) paginas.push("...");

    const rangeInicio = Math.max(2, paginaAtual - 1);
    const rangeFim = Math.min(totalPaginas - 1, paginaAtual + 1);

    for (let i = rangeInicio; i <= rangeFim; i++) {
      paginas.push(i);
    }

    if (paginaAtual < totalPaginas - 2) paginas.push("...");

    paginas.push(totalPaginas);
    return paginas;
  }

  return (
    <div className="animate-fade-in min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header: Voltar + Título + Badge */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard-parametros"
          className="p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Voltar para Parâmetros do Ranking"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">
              {parametro.label}
            </h1>
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-medium ${grupoInfo.bg} ${grupoInfo.texto}`}
            >
              {grupoInfo.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {parametro.total} eventos registrados
          </p>
        </div>
      </div>

      {/* Indicador de período */}
      <div className="text-xs text-muted-foreground bg-card border border-border rounded-md px-4 py-2">
        📅 Período:{" "}
        <span className="font-semibold text-foreground">
          {mes} / {ano}
        </span>
      </div>

      {/* Tabela de eventos */}
      <div className="bg-card rounded-lg border border-border p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">Data</th>
                <th className="text-left py-2 px-2">Condutor</th>
                <th className="text-left py-2 px-2">Gestor</th>
                <th className="text-left py-2 px-2">Filial</th>
                <th className="text-left py-2 px-2">Departamento</th>
                <th className="text-left py-2 px-2">Unidade</th>
                <th className="text-left py-2 px-2">Classificação</th>
              </tr>
            </thead>
            <tbody>
              {eventosPaginados.map((evento) => (
                <tr
                  key={evento.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-2 px-2 text-muted-foreground">
                    {evento.data}
                  </td>
                  <td className="py-2 px-2 font-medium">{evento.condutor}</td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {evento.gestor}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {evento.departamento}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {evento.funcao}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {evento.negocio}
                  </td>
                  <td className="py-2 px-2">
                    <ClassificationBadge classificacao={evento.classificacao} />
                  </td>
                </tr>
              ))}

              {eventosPaginados.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum evento encontrado para este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Página {paginaAtual} de {totalPaginas} ·{" "}
              {todosEventos.length} registros
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {gerarNumerosPagina().map((item, indice) =>
                item === "..." ? (
                  <span
                    key={`reticencias-${indice}`}
                    className="px-1 text-muted-foreground text-xs"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPagina(item)}
                    className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                      item === paginaAtual
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    aria-label={`Página ${item}`}
                    aria-current={item === paginaAtual ? "page" : undefined}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setPagina((p) => Math.min(totalPaginas, p + 1))
                }
                disabled={paginaAtual === totalPaginas}
                className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
