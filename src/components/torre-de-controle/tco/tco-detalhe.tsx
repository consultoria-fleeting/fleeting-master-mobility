/**
 * TcoDetalhe — Conteúdo do drawer "TCO do Mês".
 *
 * Junta o gráfico de evolução mensal (`TcoEvolucao`) e a composição do mês
 * (`TcoComposicao`). Clicar em um mês no gráfico troca o mês da composição.
 *
 * @example
 * <TcoDetalhe historico={HISTORICO_TCO} categorias={CATEGORIAS_TCO} />
 */

"use client";

import { useState } from "react";
import type { CategoriaTco, MesTco } from "@/types/torre-de-controle";
import { TcoComposicao } from "./tco-composicao";
import { TcoEvolucao } from "./tco-evolucao";

interface TcoDetalheProps {
  /** Histórico mensal em ordem cronológica (o último item é o mês atual) */
  historico: MesTco[];
  categorias: CategoriaTco[];
}

export function TcoDetalhe({ historico, categorias }: TcoDetalheProps) {
  const chaveMesAtual = historico[historico.length - 1]?.chave ?? "";
  const [chaveSelecionada, setChaveSelecionada] = useState(chaveMesAtual);

  if (historico.length === 0) {
    return <p className="text-[12px] text-[#94A3B8]">Ainda não há custos registrados para a frota.</p>;
  }

  const indiceSelecionado = Math.max(
    historico.findIndex((mes) => mes.chave === chaveSelecionada),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <TcoEvolucao
        historico={historico}
        categorias={categorias}
        chaveSelecionada={historico[indiceSelecionado].chave}
        onSelecionarMes={setChaveSelecionada}
      />
      <TcoComposicao
        mes={historico[indiceSelecionado]}
        mesAnterior={historico[indiceSelecionado - 1]}
        categorias={categorias}
        ehMesAtual={historico[indiceSelecionado].chave === chaveMesAtual}
        onVoltarMesAtual={() => setChaveSelecionada(chaveMesAtual)}
      />
    </div>
  );
}

