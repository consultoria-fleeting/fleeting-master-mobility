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

interface InfoTooltipProps {
  texto: string;
}

export function InfoTooltip({ texto }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="p-0.5 rounded-full hover:bg-muted/50 inline-flex cursor-help"
        aria-label="Mais informações"
      >
        <Info className="w-4 h-4 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {texto}
      </TooltipContent>
    </Tooltip>
  );
}
