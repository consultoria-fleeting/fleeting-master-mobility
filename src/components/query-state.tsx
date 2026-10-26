/**
 * QueryState — Trata os estados de uma busca (loading, erro, vazio) de forma padronizada.
 *
 * - Primeira carga: mostra o `skeleton`.
 * - Recarga (filtros mudaram): mantém o conteúdo anterior levemente esmaecido.
 * - Erro: mensagem amigável + botão "Tentar novamente".
 * - Vazio: mensagem clara explicando que não há dados para os filtros.
 * - Sucesso: renderiza `children`.
 *
 * @example
 * <QueryState
 *   isLoading={isLoading}
 *   hasData={data !== undefined}
 *   error={error}
 *   isEmpty={data?.length === 0}
 *   emptyMessage="Nenhum condutor encontrado."
 *   onRetry={refetch}
 *   skeleton={<ListSkeleton linhas={5} />}
 * >
 *   <MinhaTabela dados={data} />
 * </QueryState>
 */

"use client";

import type { ReactNode } from "react";
import { AlertCircle, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/utils/api-error";

interface QueryStateProps {
  isLoading: boolean;
  /** `true` se já existe algum dado carregado (mesmo que antigo). */
  hasData: boolean;
  error?: unknown;
  /** `true` quando a busca terminou e não há itens. */
  isEmpty?: boolean;
  emptyMessage?: string;
  /** Texto auxiliar abaixo da mensagem de vazio (opcional). */
  emptyHint?: string;
  onRetry?: () => void;
  /** Placeholder exibido na primeira carga. */
  skeleton: ReactNode;
  children: ReactNode;
}

export function QueryState({
  isLoading,
  hasData,
  error,
  isEmpty = false,
  emptyMessage = "Nenhum dado encontrado para os filtros selecionados.",
  emptyHint,
  onRetry,
  skeleton,
  children,
}: QueryStateProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-3 py-10 text-center"
      >
        <AlertCircle className="w-6 h-6 text-destructive" aria-hidden="true" />
        <p className="text-sm text-muted-foreground max-w-md">{getApiErrorMessage(error)}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (isLoading && !hasData) {
    return <>{skeleton}</>;
  }

  if (!isLoading && isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Inbox className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        {emptyHint && <p className="text-xs text-muted-foreground max-w-md">{emptyHint}</p>}
      </div>
    );
  }

  return (
    <div
      aria-busy={isLoading}
      className={`transition-opacity duration-200 ${isLoading ? "opacity-50" : "opacity-100"}`}
    >
      {children}
    </div>
  );
}

/** Skeleton de lista/tabela: `linhas` barras empilhadas. */
export function ListSkeleton({ linhas = 5 }: { linhas?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: linhas }, (_, indice) => (
        <Skeleton key={indice} className="h-8 w-full" />
      ))}
    </div>
  );
}

/** Skeleton de gráfico: um bloco com a altura do gráfico. */
export function ChartSkeleton({ altura = 250 }: { altura?: number }) {
  return <Skeleton className="w-full" style={{ height: altura }} aria-hidden="true" />;
}
