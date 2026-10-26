/**
 * FiltroSelect — Select compacto em formato de pílula (cabeçalho da Torre de Controle).
 *
 * O valor escolhido é validado com Zod contra a lista de opções permitidas
 * antes de chamar `onChange` (evita valores manipulados no DOM).
 *
 * @example
 * <FiltroSelect id="filtro-ano" rotulo="Ano" opcoes={OPCOES_ANO} valor={ano} onChange={setAno} />
 */

"use client";

import { ChevronDown } from "lucide-react";
import { z } from "zod";
import type { OpcaoFiltro } from "@/types/torre-de-controle";

interface FiltroSelectProps {
  id: string;
  /** Rótulo acessível (aria-label) */
  rotulo: string;
  opcoes: OpcaoFiltro[];
  valor: string;
  onChange: (valor: string) => void;
}

export function FiltroSelect({ id, rotulo, opcoes, valor, onChange }: FiltroSelectProps) {
  function aoAlterar(novoValor: string) {
    const valoresPermitidos = opcoes.map((o) => o.valor) as [string, ...string[]];
    const resultado = z.enum(valoresPermitidos).safeParse(novoValor);
    if (resultado.success) onChange(resultado.data);
  }

  return (
    <label className="relative inline-flex items-center">
      <select
        id={id}
        value={valor}
        onChange={(e) => aoAlterar(e.target.value)}
        aria-label={rotulo}
        className="h-9 cursor-pointer appearance-none rounded-[10px] border border-[#E7E7F0] bg-white pl-3 pr-8 text-[12px] font-medium text-[#1E1B4B] transition-colors hover:border-[#C7D2FE] focus:border-[#C7D2FE] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
      >
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
    </label>
  );
}
