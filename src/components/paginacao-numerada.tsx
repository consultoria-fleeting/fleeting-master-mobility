/**
 * PaginacaoNumerada — Paginação com números de página para APIs que informam o total.
 *
 * Exibe "Exibindo X–Y de Z" e botões Anterior / números (com reticências quando há muitas páginas) / Próxima.
 * Para APIs sem total, use `PaginacaoSimples`.
 *
 * @example
 * <PaginacaoNumerada
 *   pagina={pagina}
 *   totalPaginas={data.pagination.lastPage}
 *   totalItens={data.pagination.total}
 *   itensPorPagina={data.pagination.limit}
 *   onPaginaChange={setPagina}
 *   rotuloItens="eventos"
 * />
 */

"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { z } from "zod";

export const OPCOES_ITENS_POR_PAGINA_PADRAO = [10, 25, 50, 100] as const;

const limitePaginaSchema = z.coerce.number().int().min(1).max(100);

interface PaginacaoNumeradaProps {
  pagina: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
  /** Texto após o total. Ex.: "condutores". Padrão: "registros". */
  rotuloItens?: string;
  /** Desabilita os botões enquanto a página está carregando. */
  desabilitado?: boolean;
  /** Mantém a barra visível mesmo quando houver apenas 1 página. */
  mostrarSempre?: boolean;
  /** Opções de quantidade de itens por página (ex.: `[10, 25, 50, 100]`). */
  opcoesItensPorPagina?: readonly number[];
  /** Quando informado, exibe o seletor para alterar a quantidade de itens por página. */
  onItensPorPaginaChange?: (itensPorPagina: number) => void;
  onPaginaChange: (pagina: number) => void;
}

/** Números de página a exibir; usa "..." quando há muitas páginas. */
function gerarNumerosPagina(paginaAtual: number, totalPaginas: number): (number | "...")[] {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }

  const paginas: (number | "...")[] = [1];
  if (paginaAtual > 3) paginas.push("...");

  const inicio = Math.max(2, paginaAtual - 1);
  const fim = Math.min(totalPaginas - 1, paginaAtual + 1);
  for (let i = inicio; i <= fim; i++) paginas.push(i);

  if (paginaAtual < totalPaginas - 2) paginas.push("...");
  paginas.push(totalPaginas);

  return paginas;
}

export function PaginacaoNumerada({
  pagina,
  totalPaginas,
  totalItens,
  itensPorPagina,
  rotuloItens = "registros",
  desabilitado = false,
  mostrarSempre = false,
  opcoesItensPorPagina = OPCOES_ITENS_POR_PAGINA_PADRAO,
  onItensPorPaginaChange,
  onPaginaChange,
}: PaginacaoNumeradaProps) {
  const exibirSeletorLimite = Boolean(onItensPorPaginaChange && opcoesItensPorPagina.length > 0);
  if (totalItens === 0 || (totalPaginas <= 1 && !mostrarSempre && !exibirSeletorLimite)) return null;

  const inicio = (pagina - 1) * itensPorPagina + 1;
  const fim = Math.min(pagina * itensPorPagina, totalItens);
  const estiloSeta =
    "p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  function handleLimiteChange(valor: string) {
    if (!onItensPorPaginaChange) return;
    const resultado = limitePaginaSchema.safeParse(valor);
    if (resultado.success && opcoesItensPorPagina.includes(resultado.data)) {
      onItensPorPaginaChange(resultado.data);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Exibindo {inicio}–{fim} de {totalItens} {rotuloItens}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {exibirSeletorLimite && (
          <>
            <div className="relative inline-flex items-center">
              <select
                id="select-itens-por-pagina"
                value={itensPorPagina}
                onChange={(e) => handleLimiteChange(e.target.value)}
                disabled={desabilitado}
                aria-label="Itens por página"
                className="appearance-none h-8 text-xs font-medium border border-border rounded-md pl-2.5 pr-7 bg-background text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {opcoesItensPorPagina.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao} por página
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
          </>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPaginaChange(Math.max(1, pagina - 1))}
            disabled={pagina === 1 || desabilitado}
            className={estiloSeta}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {gerarNumerosPagina(pagina, totalPaginas).map((item, indice) =>
            item === "..." ? (
              <span key={`reticencias-${indice}`} className="px-1 text-muted-foreground text-xs">
                …
              </span>
            ) : (
              <button
                type="button"
                key={item}
                onClick={() => onPaginaChange(item)}
                disabled={desabilitado}
                className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                  item === pagina ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                aria-label={`Página ${item}`}
                aria-current={item === pagina ? "page" : undefined}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPaginaChange(Math.min(totalPaginas, pagina + 1))}
            disabled={pagina === totalPaginas || desabilitado}
            className={estiloSeta}
            aria-label="Próxima página"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
