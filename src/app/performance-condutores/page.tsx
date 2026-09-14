/**
 * Performance dos Condutores — Página
 *
 * Lista todos os condutores da frota com ranking, pontuação
 * e classificação. Permite filtros e navegação para detalhe individual.
 *
 * Rota: /performance-condutores
 *
 * TODO(backend): Substituir dados mock por chamadas à API.
 * TODO(security): Implementar autenticação/autorização quando integrar.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { condutores, opcoesFiltro } from "@/data/mock-condutores";
import type { FiltrosState } from "@/types/condutor";
import { PeriodoSelector } from "@/components/periodo-selector";
import { FiltroBarra } from "@/components/filtro-barra";
import { ClassificationBadge } from "@/components/classification-badge";
import { ChevronLeft, ChevronRight, FileDown } from "lucide-react";

/** Itens por página */
const ITENS_POR_PAGINA = 10;

/** Estado inicial dos filtros */
const FILTROS_INICIAIS: FiltrosState = {
  nome: "",
  gestor: "",
  departamento: "",
  funcao: "",
  negocio: "",
  centroCusto: "",
};

export default function PerformanceCondutoresPage() {
  const router = useRouter();

  /* ---------- Período ---------- */
  const NOMES_MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(NOMES_MESES[hoje.getMonth()]);
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  /* ---------- Filtros ---------- */
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAIS);
  const handleFiltroChange = useCallback(
    <K extends keyof FiltrosState>(campo: K, valor: FiltrosState[K]) => {
      setFiltros((prev) => ({ ...prev, [campo]: valor }));
    },
    []
  );

  /* ---------- Paginação ---------- */
  const [pagina, setPagina] = useState(1);

  /* ---------- Dados filtrados ---------- */
  const condutoresFiltrados = useMemo(() => {
    return condutores
      .filter((c) => {
        if (filtros.nome && !c.nome.toLowerCase().includes(filtros.nome.toLowerCase())) return false;
        if (filtros.gestor && c.gestor !== filtros.gestor) return false;
        if (filtros.centroCusto && c.centroCusto !== filtros.centroCusto) return false;
        if (filtros.departamento && c.departamento !== filtros.departamento) return false;
        if (filtros.funcao && c.funcao !== filtros.funcao) return false;
        if (filtros.negocio && c.negocio !== filtros.negocio) return false;
        return true;
      })
      .sort((a, b) => b.pontuacao - a.pontuacao);
  }, [filtros]);

  const totalPaginas = Math.max(1, Math.ceil(condutoresFiltrados.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const condutoresPaginados = condutoresFiltrados.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  /**
   * Exporta os dados filtrados (sem paginação) como CSV.
   *
   * Futuramente: substituir pelo endpoint da API que retorna
   * todos os registros de uma vez em JSON. O botão já está
   * preparado para esse fluxo.
   *
   * TODO(backend): Fazer requisição GET /api/condutores/exportar
   * passando os filtros como query params.
   */
  function handleExportarExcel() {
    const SEPARADOR = ";";
    const CABECALHO = ["Ranking", "Condutor", "Gestor", "Centro de Custo", "Filial", "Departamento", "Unidade", "Pontuação", "Classificação"];

    const linhas = condutoresFiltrados.map((c, i) => [
      i + 1,
      c.nome,
      c.gestor,
      c.centroCusto,
      c.departamento,
      c.funcao,
      c.negocio,
      c.pontuacao,
      c.classificacao,
    ].join(SEPARADOR));

    const csv = [CABECALHO.join(SEPARADOR), ...linhas].join("\n");

    // BOM UTF-8 para Excel reconhecer acentos
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `performance-condutores-${mesSelecionado}-${anoSelecionado}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Performance dos Condutores
          </h1>
          <p className="text-sm text-muted-foreground">
            Relatórios analíticos para gestão de frota
          </p>
        </div>
      </div>

      {/* Período + Filtros */}
      <PeriodoSelector
        mesSelecionado={mesSelecionado}
        anoSelecionado={anoSelecionado}
        onMesChange={setMesSelecionado}
        onAnoChange={setAnoSelecionado}
      />
      <FiltroBarra
        filtros={filtros}
        opcoes={opcoesFiltro}
        onFiltroChange={handleFiltroChange}
      />

      {/* Tabela */}
      <div className="bg-card rounded-lg border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">
            Relatório de Performance dos Condutores
          </h3>
          <button
            onClick={handleExportarExcel}
            className="flex items-center gap-1.5 text-xs font-medium bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] px-3 py-1.5 rounded-md hover:opacity-90 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" /> Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">Ranking</th>
                <th className="text-left py-2 px-2">Condutor</th>
                <th className="text-left py-2 px-2">Gestor</th>
                <th className="text-left py-2 px-2">Filial</th>
                <th className="text-left py-2 px-2">Departamento</th>
                <th className="text-left py-2 px-2">Unidade</th>
                <th className="text-right py-2 px-2">Pontuação</th>
                <th className="text-right py-2 px-2">Classificação</th>
              </tr>
            </thead>
            <tbody>
              {condutoresPaginados.map((c, i) => (
                <tr
                  key={c.nome}
                  className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() =>
                    router.push(
                      `/performance-condutores/${encodeURIComponent(c.nome)}`
                    )
                  }
                >
                  <td className="py-2 px-2 font-semibold">
                    {(paginaAtual - 1) * ITENS_POR_PAGINA + i + 1}º
                  </td>
                  <td className="py-2 px-2 font-medium">{c.nome}</td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {c.gestor}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {c.departamento}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {c.funcao}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {c.negocio}
                  </td>
                  <td className="py-2 px-2 text-right font-bold">
                    {c.pontuacao}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <ClassificationBadge classificacao={c.classificacao} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-muted-foreground">
            Mostrando{" "}
            {condutoresFiltrados.length === 0
              ? 0
              : (paginaAtual - 1) * ITENS_POR_PAGINA + 1}
            –{Math.min(paginaAtual * ITENS_POR_PAGINA, condutoresFiltrados.length)}{" "}
            de {condutoresFiltrados.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              className="px-2.5 py-1 border border-border rounded-md disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPaginas }).map((_, idx) => {
              const n = idx + 1;
              if (totalPaginas > 7 && Math.abs(n - paginaAtual) > 2 && n !== 1 && n !== totalPaginas) {
                if (n === 2 || n === totalPaginas - 1) {
                  return (
                    <span key={n} className="px-1 text-muted-foreground">
                      …
                    </span>
                  );
                }
                return null;
              }
              return (
                <button
                  key={n}
                  onClick={() => setPagina(n)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${n === paginaAtual
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-muted"
                    }`}
                >
                  {n}
                </button>
              );
            })}
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              className="px-2.5 py-1 border border-border rounded-md disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
