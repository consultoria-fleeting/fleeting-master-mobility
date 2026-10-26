/**
 * StatusBadge — Badge de status em caixa alta (identidade Índigo).
 *
 * Tons: "perigo" (vermelho), "alerta" (âmbar), "indigo" (azul-índigo),
 * "sucesso" (verde) e "neutro" (cinza).
 *
 * @example
 * <StatusBadge tom="perigo">Crítico</StatusBadge>
 */

import { cn } from "@/lib/utils";

export type TomStatus = "perigo" | "alerta" | "indigo" | "sucesso" | "neutro";

const ESTILOS_TOM: Record<TomStatus, string> = {
  perigo: "bg-[#E11D48]/10 text-[#E11D48]",
  alerta: "bg-[#D97706]/12 text-[#B45309]",
  indigo: "bg-[#EEF2FF] text-[#4F46E5]",
  sucesso: "bg-[#059669]/10 text-[#059669]",
  neutro: "bg-[#F1F5F9] text-[#64748B]",
};

interface StatusBadgeProps {
  tom: TomStatus;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ tom, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.05em]",
        ESTILOS_TOM[tom],
        className
      )}
    >
      {children}
    </span>
  );
}
