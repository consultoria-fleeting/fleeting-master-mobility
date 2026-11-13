/**
 * FiltroSelect — Select compacto em formato de pílula (cabeçalho da Torre de Controle).
 *
 * Exibe opcionalmente o `prefixoVisivel` antes do valor (ex.: "Filiais:", "Regionais:",
 * "Departamentos:"), permitindo visualizar claramente o nível hierárquico do usuário.
 *
 * Valida o valor escolhido com Zod apenas contra as opções habilitadas antes de chamar `onChange`.
 */

"use client";

import { ChevronDown } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import type { OpcaoFiltro } from "@/types/torre-de-controle";

interface FiltroSelectProps {
  id: string;
  /** Rótulo acessível (`aria-label`) e `title` descritivo */
  rotulo: string;
  /** Rótulo curto opcional exibido dentro da pílula */
  prefixoVisivel?: string;
  /** Classes adicionais para limitar largura/truncamento do `<select>` */
  selectClassName?: string;
  opcoes: OpcaoFiltro[];
  valor: string;
  onChange: (valor: string) => void;
}

export function FiltroSelect({
  id,
  rotulo,
  prefixoVisivel,
  selectClassName,
  opcoes,
  valor,
  onChange,
}: FiltroSelectProps) {
  function aoAlterar(novoValor: string) {
    const habilitadas = opcoes.filter((o) => !o.desabilitado).map((o) => o.valor);
    if (habilitadas.length === 0) return;
    const resultado = z.enum(habilitadas as [string, ...string[]]).safeParse(novoValor);
    if (resultado.success) onChange(resultado.data);
  }

  return (
    <label
      title={rotulo}
      className="relative inline-flex h-8.5 shrink-0 items-center rounded-[10px] border border-[#E7E7F0] bg-white transition-colors hover:border-[#C7D2FE] focus-within:border-[#C7D2FE] focus-within:ring-2 focus-within:ring-[#4F46E5]/20"
    >
      {prefixoVisivel && (
        <span className="pointer-events-none select-none whitespace-nowrap pl-2.5 text-[11px] font-semibold text-[#64748B]">
          {prefixoVisivel}:
        </span>
      )}
      <select
        id={id}
        value={valor}
        onChange={(e) => aoAlterar(e.target.value)}
        aria-label={rotulo}
        className={cn(
          "h-full cursor-pointer appearance-none truncate bg-transparent pr-6.5 text-[11.5px] font-semibold text-[#1E1B4B] focus:outline-none",
          prefixoVisivel ? "pl-1.5" : "pl-2.5",
          selectClassName
        )}
      >
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor} disabled={opcao.desabilitado}>
            {opcao.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-[#94A3B8]" />
    </label>
  );
}
