/**
 * InfoTooltip — Ícone de informação com tooltip
 *
 * Exibe um ícone "i" (Info) que, ao passar o mouse, mostra
 * um texto explicativo. Usa Tooltip do shadcn/ui.
 *
 * @example
 * <InfoTooltip texto="Os 10 condutores com maior pontuação no período." />
 */

"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  texto: string;
  /** Classes extras do ícone (ex.: tamanho/cor em outros temas) */
  iconeClassName?: string;
  /** Classes extras do balão do tooltip */
  conteudoClassName?: string;
}

export function InfoTooltip({ texto, iconeClassName, conteudoClassName }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="p-0.5 rounded-full hover:bg-muted/50 inline-flex cursor-help"
        aria-label="Mais informações"
        onClick={(evento) => evento.stopPropagation()}
      >
        <Info className={cn("w-4 h-4 text-muted-foreground", iconeClassName)} />
      </TooltipTrigger>
      <TooltipContent side="top" className={cn("max-w-xs text-xs", conteudoClassName)}>
        {texto}
      </TooltipContent>
    </Tooltip>
  );
}
