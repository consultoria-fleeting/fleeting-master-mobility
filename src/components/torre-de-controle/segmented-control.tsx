/**
 * SegmentedControl — Alternador em "pílula" com opções exclusivas (identidade Índigo).
 *
 * Valida o valor escolhido com Zod (só aceita valores da lista) antes de avisar o pai.
 * Usado no drawer do TCO (período e tipo de visualização do gráfico).
 *
 * @example
 * <SegmentedControl
 *   rotulo="Período"
 *   opcoes={[{ valor: "6", label: "6 meses" }, { valor: "12", label: "12 meses" }]}
 *   valor={periodo}
 *   onChange={setPeriodo}
 * />
 */

"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";

export interface OpcaoSegmento<T extends string> {
  valor: T;
  label: string;
  /** Ícone opcional exibido antes do texto */
  icone?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  /** Nome acessível do grupo (lido por leitores de tela) */
  rotulo: string;
  opcoes: OpcaoSegmento<T>[];
  valor: T;
  onChange: (valor: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  rotulo,
  opcoes,
  valor,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  function selecionar(novoValor: string) {
    const valoresPermitidos = opcoes.map((opcao) => opcao.valor);
    const resultado = z.enum(valoresPermitidos as [T, ...T[]]).safeParse(novoValor);
    if (resultado.success) onChange(resultado.data);
  }

  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      className={cn("inline-flex items-center gap-0.5 rounded-[10px] border border-[#E7E7F0] bg-[#F8F8FC] p-0.5", className)}
    >
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => selecionar(opcao.valor)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-[8px] px-2.5 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]",
              ativo
                ? "bg-white text-[#4F46E5] shadow-[0_1px_3px_rgba(30,27,75,0.12)]"
                : "text-[#94A3B8] hover:text-[#1E1B4B]"
            )}
          >
            {opcao.icone}
            {opcao.label}
          </button>
        );
      })}
    </div>
  );
}

