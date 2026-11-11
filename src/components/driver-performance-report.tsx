/**
 * DriverPerformanceReport — Relatório de Performance dos Condutores (seção 4.11 da spec).
 *
 * `GET /dashboard/driver-performance`: tabela paginada (`items`, `total`, `limit`, `totalPages`)
 * com botão de exportação para Excel (CSV, `export: true`, sem paginação).
 *
 * O nome do condutor sempre navega pelo UUID (`item.id`) — nunca pelo nome.
 * O backend considera até o último mês fechado: se o mês pedido for posterior, ele é substituído.
 *
 * @example
 * <DriverPerformanceReport ano={2026} mes={3} filtros={filtrosApi} />
 */

"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { ClassificationLabelBadge } from "@/components/classification-label-badge";
import { DriverLink } from "@/components/driver-link";
import { InfoTooltip } from "@/components/info-tooltip";
import {
  OPCOES_ITENS_POR_PAGINA_PADRAO,
  PaginacaoNumerada,
} from "@/components/paginacao-numerada";
import { ListSkeleton, QueryState } from "@/components/query-state";
import { useApiQuery } from "@/hooks/use-api-query";
import { useResettablePage } from "@/hooks/use-resettable-page";
import { getDriverPerformanceList } from "@/services/driver-scoring.service";
import type { DashboardHierarchyFilters, DriverClassificationFilter } from "@/types/driver-scoring";
import { getApiErrorMessage } from "@/utils/api-error";
import { downloadCsv } from "@/utils/csv";
import { displayValue, formatScore } from "@/utils/driver-scoring-helpers";

const ITENS_POR_PAGINA_INICIAL = 10;

const CABECALHO_CSV = [
  "Ranking",
  "Condutor",
  "Gestor",
  "Centro de Custo",
  "Filial",
  "Departamento",
  "Unidade",
  "Acumulado do Ano",
  "Pontuação",
  "Classificação",
];

interface DriverPerformanceReportProps {
  ano: number;
  /** Mês de 1 a 12 (opcional; quando omitido, exibe a visão anual com pontuação e classificação do mês corrente). */
  mes?: number;
  filtros: DashboardHierarchyFilters;
  /** Filtra pela classificação do mês (Tela 2 — Condutores por Categoria). Vazio/`todos` = sem filtro. */
  classificacao?: DriverClassificationFilter;
}

/** Função estável (fora do componente), exigida pelo `useApiQuery`. */
const fetchPerformanceList = getDriverPerformanceList;

export function DriverPerformanceReport({ ano, mes, filtros, classificacao }: DriverPerformanceReportProps) {
  const [itensPorPagina, setItensPorPagina] = useState<number>(ITENS_POR_PAGINA_INICIAL);
  const [pagina, setPagina] = useResettablePage(
    JSON.stringify({ ano, mes, filtros, classificacao, itensPorPagina }),
  );
  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useApiQuery(fetchPerformanceList, {
    year: ano,
    month: mes,
    page: pagina,
    limit: itensPorPagina,
    ...filtros,
    classification: classificacao,
  });

  /** Busca todos os registros (sem paginação) e baixa como CSV. */
  async function handleExportarExcel() {
    setExportando(true);
    setErroExportacao(null);
    try {
      const resposta = await getDriverPerformanceList({
        year: ano,
        month: mes,
        ...filtros,
        classification: classificacao,
        export: true,
      });
      const linhas = resposta.items.map((item, indice) => [
        indice + 1,
        item.driver,
        item.manager,
        item.costCenter,
        item.branch,
        item.department,
        item.unit,
        item.accumYear,
        item.score,
        item.classification,
      ]);
      const sufixoPeriodo = mes !== undefined ? `${ano}-${String(mes).padStart(2, "0")}` : `${ano}`;
      downloadCsv(`performance-condutores-${sufixoPeriodo}.csv`, CABECALHO_CSV, linhas);
    } catch (erro) {
      setErroExportacao(getApiErrorMessage(erro));
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            Relatório de Performance dos Condutores
            <InfoTooltip texto="A pontuação e a classificação exibidas referem-se ao mês corrente, enquanto o Acum. Ano considera todos os meses fechados do ano selecionado." />
          </h3>
        </div>
        <button
          type="button"
          onClick={handleExportarExcel}
          disabled={exportando || !data?.total}
          className="flex items-center gap-1.5 text-xs font-medium bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] px-3 py-1.5 rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
          {exportando ? "Exportando..." : "Excel"}
        </button>
      </div>

      {erroExportacao && (
        <p role="alert" className="text-xs text-destructive mb-3">
          {erroExportacao}
        </p>
      )}

      <QueryState
        isLoading={isLoading}
        hasData={data !== undefined}
        error={error}
        isEmpty={data?.items.length === 0}
        emptyMessage="Nenhum condutor encontrado para os filtros selecionados."
        emptyHint="A listagem considera apenas meses já encerrados."
        onRetry={refetch}
        skeleton={<ListSkeleton linhas={8} />}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2.5 px-3 whitespace-nowrap">#</th>
                <th className="text-left py-2.5 px-3 whitespace-nowrap">Condutor</th>
                <th className="text-left py-2.5 px-3 whitespace-nowrap">Gestor</th>
                <th className="text-left py-2.5 px-3 whitespace-nowrap">C. Custo</th>
                <th className="text-left py-2.5 px-3 whitespace-nowrap">Filial</th>
                <th className="text-left py-2.5 px-3 whitespace-nowrap">Departamento</th>
                <th className="text-left py-2.5 px-3 whitespace-nowrap">Unidade</th>
                <th className="text-right py-2.5 px-3 whitespace-nowrap">Acum. Ano</th>
                <th className="text-right py-2.5 px-3 whitespace-nowrap">
                  <span className="inline-flex items-center justify-end gap-1">
                    Pontuação
                    <InfoTooltip
                      texto="Pontuação referente ao mês corrente."
                      iconeClassName="w-3.5 h-3.5"
                    />
                  </span>
                </th>
                <th className="text-right py-2.5 px-3 whitespace-nowrap">
                  <span className="inline-flex items-center justify-end gap-1">
                    Classificação
                    <InfoTooltip
                      texto="Classificação referente ao mês corrente."
                      iconeClassName="w-3.5 h-3.5"
                    />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item, indice) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                    {(data.page - 1) * data.limit + indice + 1}º
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <DriverLink driverId={item.id} nome={item.driver} />
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                    {displayValue(item.manager)}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                    {displayValue(item.costCenter)}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                    {displayValue(item.branch)}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                    {displayValue(item.department)}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                    {displayValue(item.unit)}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {formatScore(item.accumYear)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                    {formatScore(item.score)}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <ClassificationLabelBadge label={item.classification} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && (
          <PaginacaoNumerada
            pagina={data.page}
            totalPaginas={data.totalPages}
            totalItens={data.total}
            itensPorPagina={data.limit}
            rotuloItens="condutores"
            desabilitado={isLoading}
            opcoesItensPorPagina={OPCOES_ITENS_POR_PAGINA_PADRAO}
            onItensPorPaginaChange={setItensPorPagina}
            onPaginaChange={setPagina}
          />
        )}
      </QueryState>
    </div>
  );
}
