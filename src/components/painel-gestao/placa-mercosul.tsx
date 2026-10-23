/**
 * PlacaMercosul — Placa de veículo no padrão Mercosul.
 *
 * Faixa azul superior com "BRASIL" e a placa em fonte mono.
 * Reutilizável em tabelas, drawers e listas.
 *
 * @example
 * <PlacaMercosul placa="SVR2C84" tamanho="md" />
 */

import { cn } from "@/lib/utils";

interface PlacaMercosulProps {
  placa: string;
  tamanho?: "sm" | "md";
  className?: string;
}

const ESTILOS_TAMANHO = {
  sm: { caixa: "w-[74px]", faixa: "text-[5px] py-px", texto: "text-[11px] py-0.5" },
  md: { caixa: "w-[118px]", faixa: "text-[7px] py-0.5", texto: "text-lg py-1" },
} as const;

/** Formata a placa no padrão visual "ABC1D23" → "ABC1D23" (Mercosul não usa hífen) */
function formatarPlaca(placa: string): string {
  return placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function PlacaMercosul({ placa, tamanho = "sm", className }: PlacaMercosulProps) {
  const estilo = ESTILOS_TAMANHO[tamanho];

  return (
    <div
      className={cn(
        "inline-flex flex-col overflow-hidden rounded-[5px] border-[1.5px] border-[#1E1B4B] bg-white shadow-sm",
        estilo.caixa,
        className
      )}
      aria-label={`Placa ${placa}`}
    >
      <span
        className={cn(
          "flex items-center justify-between bg-[#1D3E9E] px-1.5 font-bold uppercase tracking-[0.2em] text-white leading-none",
          estilo.faixa
        )}
      >
        <span>BR</span>
        <span>Brasil</span>
        <span className="inline-block h-[0.9em] w-[1.3em] rounded-[1px] bg-[#16A34A]" aria-hidden />
      </span>
      <span
        className={cn(
          "text-center font-mono font-bold tracking-[0.12em] text-[#0F172A] leading-none",
          estilo.texto
        )}
      >
        {formatarPlaca(placa)}
      </span>
    </div>
  );
}
