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

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginacaoNumeradaProps {
  pagina: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
  /** Texto após o total. Ex.: "condutores". Padrão: "registros". */
  rotuloItens?: string;
  /** Desabilita os botões enquanto a página está carregando. */
  desabilitado?: boolean;
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
  onPaginaChange,
}: PaginacaoNumeradaProps) {
  if (totalPaginas <= 1) return null;

  const inicio = (pagina - 1) * itensPorPagina + 1;
  const fim = Math.min(pagina * itensPorPagina, totalItens);
  const estiloSeta =
    "p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Exibindo {inicio}–{fim} de {totalItens} {rotuloItens}
      </p>

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
  );
}
