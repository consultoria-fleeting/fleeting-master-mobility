/**
 * PaginacaoSimples — Paginação para APIs que NÃO informam o total de registros.
 *
 * Como o endpoint não retorna `total`, só sabemos se existe próxima página
 * quando a página atual veio "cheia" (`itens === limite`).
 *
 * @example
 * <PaginacaoSimples
 *   pagina={pagina}
 *   temProximaPagina={items.length === limite}
 *   onPaginaChange={setPagina}
 * />
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginacaoSimplesProps {
  pagina: number;
  temProximaPagina: boolean;
  /** Desabilita os botões enquanto a página está carregando. */
  desabilitado?: boolean;
  onPaginaChange: (pagina: number) => void;
}

export function PaginacaoSimples({
  pagina,
  temProximaPagina,
  desabilitado = false,
  onPaginaChange,
}: PaginacaoSimplesProps) {
  // Nada a paginar: só existe a primeira página.
  if (pagina === 1 && !temProximaPagina) return null;

  const estiloBotao =
    "p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground">Página {pagina}</p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPaginaChange(pagina - 1)}
          disabled={pagina === 1 || desabilitado}
          className={estiloBotao}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPaginaChange(pagina + 1)}
          disabled={!temProximaPagina || desabilitado}
          className={estiloBotao}
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
