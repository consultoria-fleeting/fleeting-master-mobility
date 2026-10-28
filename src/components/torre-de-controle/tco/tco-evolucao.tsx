/**
 * TcoEvolucao — Seção "Evolução do TCO" do drawer "TCO do Mês".
 *
 * Mostra o custo da frota mês a mês com filtros:
 * - Período: últimos 6 ou 12 meses;
 * - Visão: Composição (barras empilhadas) ou Tendência (área do total);
 * - Categorias: chips para incluir/excluir cada custo (ao menos uma fica ativa).
 * Abaixo do gráfico, um resumo do período: média, maior mês, menor mês e variação.
 */

"use client";

import { useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoriaTco, CategoriaTcoId, MesTco } from "@/types/torre-de-controle";
import { DeltaBadge, variacaoDeCusto } from "../delta-badge";
import { SegmentedControl, type OpcaoSegmento } from "../segmented-control";
import { TcoEvolucaoChart, type VisaoTco } from "./tco-evolucao-chart";
import { formatarMoedaCompacta, totalDoMes, variacaoPercentual } from "./tco-utils";

type PeriodoTco = "6" | "12";

const OPCOES_PERIODO: OpcaoSegmento<PeriodoTco>[] = [
  { valor: "6", label: "6 meses" },
  { valor: "12", label: "12 meses" },
];

const OPCOES_VISAO: OpcaoSegmento<VisaoTco>[] = [
  { valor: "composicao", label: "Composição", icone: <BarChart3 className="h-3.5 w-3.5" /> },
  { valor: "tendencia", label: "Tendência", icone: <TrendingUp className="h-3.5 w-3.5" /> },
];

interface TcoEvolucaoProps {
  /** Histórico completo (o último item é o mês atual) */
  historico: MesTco[];
  categorias: CategoriaTco[];
  chaveSelecionada: string;
  onSelecionarMes: (chave: string) => void;
}

export function TcoEvolucao({ historico, categorias, chaveSelecionada, onSelecionarMes }: TcoEvolucaoProps) {
  const [periodo, setPeriodo] = useState<PeriodoTco>("12");
  const [visao, setVisao] = useState<VisaoTco>("composicao");
  const [idsAtivos, setIdsAtivos] = useState<CategoriaTcoId[]>(categorias.map((categoria) => categoria.id));

  const meses = historico.slice(-Number(periodo));
  const totais = meses.map((mes) => ({ mes, total: totalDoMes(mes, idsAtivos) }));

  // Resumo do período
  const media = totais.reduce((soma, item) => soma + item.total, 0) / Math.max(totais.length, 1);
  const maior = totais.reduce((a, b) => (b.total > a.total ? b : a), totais[0]);
  const menor = totais.reduce((a, b) => (b.total < a.total ? b : a), totais[0]);
  const variacao = variacaoPercentual(totais[totais.length - 1]?.total ?? 0, totais[0]?.total ?? 0);

  function alterarPeriodo(novoPeriodo: PeriodoTco) {
    setPeriodo(novoPeriodo);
    // Se o mês selecionado sair do gráfico, volta para o mês atual
    const mesesVisiveis = historico.slice(-Number(novoPeriodo));
    if (!mesesVisiveis.some((mes) => mes.chave === chaveSelecionada)) {
      onSelecionarMes(historico[historico.length - 1].chave);
    }
  }

  function alternarCategoria(id: CategoriaTcoId) {
    const estaAtiva = idsAtivos.includes(id);
    if (estaAtiva && idsAtivos.length === 1) return; // mantém ao menos uma categoria
    setIdsAtivos(estaAtiva ? idsAtivos.filter((item) => item !== id) : [...idsAtivos, id]);
  }

  return (
    <section className="rounded-2xl border border-[#E7E7F0] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[13.5px] font-semibold text-[#1E1B4B]">Evolução do TCO</h3>
          <p className="text-[11px] text-[#94A3B8]">Custo da frota mês a mês · clique em um mês para ver a composição</p>
        </div>
        <SegmentedControl rotulo="Período do gráfico" opcoes={OPCOES_PERIODO} valor={periodo} onChange={alterarPeriodo} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl rotulo="Tipo de visualização" opcoes={OPCOES_VISAO} valor={visao} onChange={setVisao} />

        {/* Chips de categoria (funcionam como legenda e filtro) */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Categorias de custo">
          {categorias.map((categoria) => {
            const ativa = idsAtivos.includes(categoria.id);
            return (
              <button
                key={categoria.id}
                type="button"
                aria-pressed={ativa}
                onClick={() => alternarCategoria(categoria.id)}
                className={cn(
                  "inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-[10.5px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]",
                  ativa
                    ? "border-[#E0E7FF] bg-[#EEF2FF]/70 text-[#1E1B4B]"
                    : "border-dashed border-[#E2E8F0] bg-white text-[#94A3B8] line-through decoration-[#CBD5E1]"
                )}
              >
                <span
                  className="h-2 w-2 rounded-[3px] transition-opacity"
                  style={{ background: categoria.cor, opacity: ativa ? 1 : 0.3 }}
                />
                {categoria.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        {/* Legenda da linha de média (fora do gráfico para não sobrepor as barras) */}
        <p className="mb-1 flex items-center justify-end gap-1.5 text-[10.5px] text-[#94A3B8]">
          <span className="w-4 border-t-2 border-dashed border-[#D4AB00]" aria-hidden />
          Média do período <strong className="font-semibold text-[#B45309]">{formatarMoedaCompacta(media)}</strong>
        </p>
        <TcoEvolucaoChart
          meses={meses}
          categorias={categorias}
          idsAtivos={idsAtivos}
          visao={visao}
          media={media}
          chaveSelecionada={chaveSelecionada}
          onSelecionarMes={onSelecionarMes}
        />
      </div>

      {/* Resumo do período */}
      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ResumoItem rotulo="Média mensal" valor={formatarMoedaCompacta(media)} />
        <ResumoItem rotulo="Maior custo" valor={formatarMoedaCompacta(maior.total)} detalhe={maior.mes.mesCompleto} tom="perigo" />
        <ResumoItem rotulo="Menor custo" valor={formatarMoedaCompacta(menor.total)} detalhe={menor.mes.mesCompleto} tom="sucesso" />
        <ResumoItem
          rotulo="Variação no período"
          valor={<DeltaBadge {...variacaoDeCusto(variacao)} className="text-[11px]" />}
          detalhe={`${meses[0].mes}/${meses[0].ano.slice(2)} → ${meses[meses.length - 1].mes}/${meses[meses.length - 1].ano.slice(2)}`}
        />
      </dl>
    </section>
  );
}

/* ---------- Item do resumo ---------- */

interface ResumoItemProps {
  rotulo: string;
  valor: React.ReactNode;
  detalhe?: string;
  tom?: "perigo" | "sucesso";
}

function ResumoItem({ rotulo, valor, detalhe, tom }: ResumoItemProps) {
  return (
    <div className="rounded-xl border border-[#EEF0F6] bg-[#F8F8FC] px-3 py-2">
      <dt className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
        {tom && (
          <span className={cn("h-1.5 w-1.5 rounded-full", tom === "perigo" ? "bg-[#E11D48]" : "bg-[#059669]")} />
        )}
        {rotulo}
      </dt>
      <dd className="mt-0.5 text-[14px] font-bold leading-tight text-[#1E1B4B]">{valor}</dd>
      {detalhe && <dd className="truncate text-[10px] text-[#94A3B8]">{detalhe}</dd>}
    </div>
  );
}
