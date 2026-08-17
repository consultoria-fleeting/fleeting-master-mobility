/**
 * RankingCondutores — Tabela de Ranking com abas Mensal/Anual
 *
 * Exibe o ranking completo de condutores em formato de tabela com:
 * - Aba Mensal: tabela com colunas de informação do condutor + pontuação + classificação
 * - Aba Anual: tabela com colunas fixas (info) + colunas de meses com scroll lateral
 *   + coluna de acumulado do ano
 * - Paginação compartilhada entre as abas
 * - Responde aos filtros externos (gestor, filial, departamento, unidade, nome)
 *
 * @example
 * <RankingCondutores condutores={condutoresFiltrados} />
 */

"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClassificationBadge } from "@/components/classification-badge";
import { InfoTooltip } from "@/components/info-tooltip";
import { ScoreCircle } from "@/components/score-circle";
import { MESES } from "@/data/mock-condutores";
import type { Condutor } from "@/types/condutor";

/** Quantidade de itens por página */
const ITENS_POR_PAGINA = 15;

interface RankingCondutoresProps {
  condutores: Condutor[];
}

export function RankingCondutores({ condutores }: RankingCondutoresProps) {
  const [abaAtiva, setAbaAtiva] = useState("mensal");
  const [pagina, setPagina] = useState(1);

  /* ---------- Paginação ---------- */

  const totalPaginas = Math.max(1, Math.ceil(condutores.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);

  const dadosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return condutores.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [condutores, paginaAtual]);

  /** Reseta a página para 1 ao trocar de aba */
  function handleTrocarAba(novaAba: string) {
    setAbaAtiva(novaAba);
    setPagina(1);
  }

  /**
   * Meses disponíveis na aba anual.
   * Obtém os meses que existem nos dados dos condutores.
   * Ordena na ordem correta do calendário usando a constante MESES.
   */
  const mesesDisponiveis = useMemo(() => {
    const mesesComDados = new Set<string>();

    for (const condutor of condutores) {
      if (condutor.pontuacoesMensais) {
        for (const mes of Object.keys(condutor.pontuacoesMensais)) {
          mesesComDados.add(mes);
        }
      }
    }

    return MESES.filter((mes) => mesesComDados.has(mes));
  }, [condutores]);

  /** Abreviação do mês (3 primeiras letras) para header compacto */
  function abreviarMes(mes: string): string {
    return mes.substring(0, 3);
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5 overflow-hidden">
      <Tabs value={abaAtiva} onValueChange={handleTrocarAba} className="flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Ranking dos Condutores
            <InfoTooltip texto="Classificação geral de todos os condutores com base na pontuação do período selecionado." />
          </h3>
          <TabsList>
            <TabsTrigger value="mensal">Mensal</TabsTrigger>
            <TabsTrigger value="anual">Anual</TabsTrigger>
          </TabsList>
        </div>

        {/* ==================== ABA MENSAL ==================== */}
        <TabsContent value="mensal">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">#</th>
                  <th className="text-left py-2">Condutor</th>
                  <th className="text-left py-2">Gestor</th>
                  <th className="text-left py-2">C. Custo</th>
                  <th className="text-left py-2">Filial</th>
                  <th className="text-left py-2">Departamento</th>
                  <th className="text-left py-2">Unidade</th>
                  <th className="text-right py-2 px-2">Pontuação</th>
                  <th className="text-right py-2 px-2">Classificação</th>
                </tr>
              </thead>
              <tbody>
                {dadosPaginados.map((condutor, indice) => (
                  <tr
                    key={condutor.nome}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-2 px-2 font-medium">
                      {(paginaAtual - 1) * ITENS_POR_PAGINA + indice + 1}
                    </td>
                    <td className="py-2 font-medium">{condutor.nome}</td>
                    <td className="py-2 text-muted-foreground">{condutor.gestor}</td>
                    <td className="py-2 text-muted-foreground">{condutor.centroCusto}</td>
                    <td className="py-2 text-muted-foreground">{condutor.departamento}</td>
                    <td className="py-2 text-muted-foreground">{condutor.funcao}</td>
                    <td className="py-2 text-muted-foreground">{condutor.negocio}</td>
                    <td className="py-2 px-2 text-right font-bold">{condutor.pontuacao}</td>
                    <td className="py-2 px-2 text-right">
                      <ClassificationBadge classificacao={condutor.classificacao} />
                    </td>
                  </tr>
                ))}

                {dadosPaginados.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      Nenhum condutor encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Paginacao
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalItens={condutores.length}
            itensPorPagina={ITENS_POR_PAGINA}
            onPaginaChange={setPagina}
          />
        </TabsContent>

        {/* ==================== ABA ANUAL ==================== */}
        <TabsContent value="anual">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="text-xs w-max min-w-full">
              <thead>
                <tr className="border-b text-muted-foreground">
                  {/* Colunas fixas de informação */}
                  <th className="text-left py-2 px-2 sticky left-0 bg-card z-10">Pos.</th>
                  <th className="text-left py-2 min-w-[120px]">Condutor</th>
                  <th className="text-left py-2">Gestor</th>
                  <th className="text-left py-2">C. Custo</th>
                  <th className="text-left py-2">Filial</th>
                  <th className="text-left py-2">Departamento</th>
                  <th className="text-left py-2">Unidade</th>
                  {/* Coluna de acumulado */}
                  <th className="text-center py-2 font-bold border-l border-border">
                    Acum. Ano
                  </th>
                  {/* Colunas dos meses */}
                  {mesesDisponiveis.map((mes) => (
                    <th key={mes} className="text-center py-2 min-w-[50px]" title={mes}>
                      {abreviarMes(mes)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dadosPaginados.map((condutor, indice) => {
                  const acumulado = condutor.pontuacoesMensais
                    ? Object.values(condutor.pontuacoesMensais).reduce(
                        (soma, valor) => soma + valor,
                        0
                      )
                    : 0;

                  return (
                    <tr
                      key={condutor.nome}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-2 px-2 font-medium sticky left-0 bg-card z-10">
                        {(paginaAtual - 1) * ITENS_POR_PAGINA + indice + 1}
                      </td>
                      <td className="py-2 font-medium whitespace-nowrap">{condutor.nome}</td>
                      <td className="py-2 text-muted-foreground whitespace-nowrap">
                        {condutor.gestor}
                      </td>
                      <td className="py-2 text-muted-foreground">{condutor.centroCusto}</td>
                      <td className="py-2 text-muted-foreground">{condutor.departamento}</td>
                      <td className="py-2 text-muted-foreground">{condutor.funcao}</td>
                      <td className="py-2 text-muted-foreground">{condutor.negocio}</td>
                      <td className="py-2 text-center font-bold border-l border-border">
                        {acumulado}
                      </td>
                      {mesesDisponiveis.map((mes) => (
                        <td key={mes} className="py-2 text-center">
                          {condutor.pontuacoesMensais?.[mes] !== undefined ? (
                            <ScoreCircle pontuacao={condutor.pontuacoesMensais[mes]} />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {dadosPaginados.length === 0 && (
                  <tr>
                    <td
                      colSpan={8 + mesesDisponiveis.length}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhum condutor encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-muted-foreground mt-2">
            Arraste horizontalmente para visualizar todos os meses
          </p>

          <Paginacao
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalItens={condutores.length}
            itensPorPagina={ITENS_POR_PAGINA}
            onPaginaChange={setPagina}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ==================== COMPONENTE DE PAGINAÇÃO ==================== */

/**
 * Paginacao — Controle de paginação reutilizável (interno)
 *
 * Exibe o contador "Exibindo X–Y de Z" e botões de navegação.
 * Extraído para evitar duplicação entre as abas mensal e anual.
 */

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
  onPaginaChange: (pagina: number) => void;
}

function Paginacao({
  paginaAtual,
  totalPaginas,
  totalItens,
  itensPorPagina,
  onPaginaChange,
}: PaginacaoProps) {
  if (totalPaginas <= 1) return null;

  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens);

  /**
   * Gera os números de página a serem exibidos.
   * Se houver muitas páginas, usa reticências para não poluir a UI.
   */
  function gerarNumerosPagina(): (number | "...")[] {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    const paginas: (number | "...")[] = [1];

    if (paginaAtual > 3) {
      paginas.push("...");
    }

    const rangeInicio = Math.max(2, paginaAtual - 1);
    const rangeFim = Math.min(totalPaginas - 1, paginaAtual + 1);

    for (let i = rangeInicio; i <= rangeFim; i++) {
      paginas.push(i);
    }

    if (paginaAtual < totalPaginas - 2) {
      paginas.push("...");
    }

    paginas.push(totalPaginas);

    return paginas;
  }

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Exibindo {inicio}–{fim} de {totalItens} condutores
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPaginaChange(Math.max(1, paginaAtual - 1))}
          disabled={paginaAtual === 1}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {gerarNumerosPagina().map((item, indice) =>
          item === "..." ? (
            <span key={`reticencias-${indice}`} className="px-1 text-muted-foreground text-xs">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPaginaChange(item)}
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
          onClick={() => onPaginaChange(Math.min(totalPaginas, paginaAtual + 1))}
          disabled={paginaAtual === totalPaginas}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
