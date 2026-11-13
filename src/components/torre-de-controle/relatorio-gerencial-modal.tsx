/**
 * RelatorioGerencialModal — Modal do "Relatório Gerencial" (Torre de Controle V1).
 *
 * Design executivo minimalista alinhado à identidade Índigo da Torre de Controle:
 * - Faixa sutil de escopo de permissão e recorte ativo;
 * - Indicadores no mesmo padrão visual dos KPIs principais (rótulo em caixa alta,
 *   valor + badge de variação na mesma linha e legenda comparativa abaixo);
 * - Posição nos 5 status com rótulo truncado elegante (tooltip completo), percentual e barra proporcional;
 * - Resumo operacional em 3 colunas limpas + botão "Exportar em PDF".
 *
 * TODO(security): em produção, os dados consolidados e o PDF devem ser gerados/filtrados
 * no backend a partir do escopo de permissão extraído do JWT do usuário autenticado.
 */

"use client";

import { Download, FileText, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ItemQuadroResumo, TomQuadroResumo } from "@/types/torre-de-controle";
import { DeltaBadge } from "./delta-badge";
import { LISTA_STATUS, STATUS_CONFIG } from "./mapa/config";
import type { DadosTorreConsolidados } from "./mock-data";

const COR_VALOR_TOM: Record<TomQuadroResumo, string> = {
  perigo: "text-[#E11D48]",
  alerta: "text-[#D97706]",
  indigo: "text-[#4F46E5]",
  neutro: "text-[#1E1B4B]",
};

interface RelatorioGerencialModalProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  dados: DadosTorreConsolidados;
  /** Descrição legível do escopo máximo permitido pelo perfil atual */
  perfilDescricao: string;
}

interface ColunaResumoModalProps {
  titulo: string;
  cor: string;
  itens: ItemQuadroResumo[];
}

function ColunaResumoModal({ titulo, cor, itens }: ColunaResumoModalProps) {
  return (
    <div className="rounded-[14px] border border-[#E7E7F0] bg-white p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: cor }} />
        <h4 className="text-[12.5px] font-semibold text-[#1E1B4B]">{titulo}</h4>
      </div>
      <dl className="flex flex-col divide-y divide-[#F1F1F6]">
        {itens.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
          >
            <dt className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-[#334155]" title={item.label}>
                {item.label}
              </span>
              {item.detalhe && (
                <span className="block text-[10px] text-[#94A3B8]">{item.detalhe}</span>
              )}
            </dt>
            <dd
              className={cn(
                "shrink-0 whitespace-nowrap text-[14.5px] font-bold tabular-nums",
                COR_VALOR_TOM[item.tom]
              )}
            >
              {item.valor}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function RelatorioGerencialModal({
  aberto,
  onOpenChange,
  dados,
  perfilDescricao,
}: RelatorioGerencialModalProps) {
  const totalFrota = dados.veiculosEscopo.length;

  function exportarEmPdf() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="font-poppins max-h-[90vh] w-[calc(100%-2rem)] max-w-[1440px] sm:max-w-[95vw] lg:max-w-[1240px] xl:max-w-[1360px] 2xl:max-w-[1440px] gap-0 overflow-hidden rounded-2xl border border-[#E7E7F0] bg-[#FAFAFD] p-0 text-[#334155] shadow-2xl"
      >
        <div id="relatorio-gerencial-print" className="flex max-h-[90vh] flex-col overflow-hidden">
          {/* Cabeçalho minimalista */}
          <DialogHeader className="relative shrink-0 border-b border-[#312E81] bg-gradient-to-r from-[#1E1B4B] via-[#272362] to-[#312E81] px-7 py-4.5 pr-16 text-white">
            <DialogClose
              aria-label="Fechar relatório gerencial"
              title="Fechar (Esc)"
              className="no-print absolute right-4 top-4 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#C7D2FE] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <X className="h-4 w-4" />
            </DialogClose>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#E0E7FF]">
                <FileText className="h-3 w-3 text-[#A5B4FC]" />
                Relatório Gerencial · V1
              </span>
              <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-[10.5px] font-medium text-[#C7D2FE]">
                Mês fechado: {dados.periodoRotulo}
              </span>
            </div>
            <DialogTitle className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-white">
              Consolidado Executivo da Frota
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#A5B4FC]">
              Dados consolidados para os veículos visíveis no seu escopo de permissão.
            </DialogDescription>
          </DialogHeader>

          {/* Corpo */}
          <div className="rolagem-suave flex flex-1 flex-col gap-5 overflow-y-auto px-7 py-5">
            {/* Faixa sutil de escopo e recorte */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-[#E7E7F0] bg-white px-4 py-2.5 text-[11.5px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#475569]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#4F46E5]" />
                <span className="text-[#94A3B8]">Escopo:</span>
                <strong className="font-semibold text-[#1E1B4B]">{perfilDescricao}</strong>
              </span>
              <span className="hidden h-3.5 w-px bg-[#E7E7F0] md:inline-block" aria-hidden />
              <span className="text-[#64748B]">
                <span className="text-[#94A3B8]">Filtro:</span>{" "}
                <strong className="font-medium text-[#334155]">{dados.escopoRotulo}</strong>
              </span>
              <span className="ml-auto inline-flex items-center rounded-full border border-[#E0E7FF] bg-[#EEF2FF] px-2.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-[#4F46E5]">
                {totalFrota} veículos ativos
              </span>
            </div>

            {/* 1. Indicadores do Mês Fechado — mesmo padrão visual dos cards de KPI da Torre */}
            <section className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                  Indicadores do Período Fechado ({dados.periodoRotulo})
                </h3>
                <span className="text-[11px] text-[#94A3B8]">
                  Comparativo vs. {dados.mesAnteriorRotulo}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
                {dados.kpis.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="flex flex-col justify-between rounded-[14px] border border-[#E7E7F0] bg-white px-4 py-3"
                  >
                    <div>
                      <p
                        className="truncate text-[9.5px] font-semibold uppercase leading-none tracking-[0.08em] text-[#94A3B8]"
                        title={kpi.label}
                      >
                        {kpi.label}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="whitespace-nowrap text-[18.5px] font-bold leading-[1.15] tracking-tight tabular-nums text-[#1E1B4B] 2xl:text-[20px]">
                          {kpi.valor}
                        </span>
                        {kpi.sub && (
                          <span className="whitespace-nowrap text-[11.5px] font-medium leading-none tabular-nums text-[#64748B]">
                            · {kpi.sub}
                          </span>
                        )}
                        <DeltaBadge delta={kpi.delta} bom={kpi.bom} />
                      </div>
                    </div>
                    <p
                      className="mt-1.5 truncate text-[10.5px] leading-tight text-[#94A3B8]"
                      title={kpi.legenda}
                    >
                      {kpi.legenda}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Posição Atual da Frota nos 5 Status Exclusivos */}
            <section className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                  Posição Atual da Frota nos 5 Status
                </h3>
                <span className="text-[11px] text-[#94A3B8]">
                  Categorias exclusivas · soma = {totalFrota} veículos
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {LISTA_STATUS.map((status) => {
                  const cfg = STATUS_CONFIG[status];
                  const qtd = dados.contagemStatusMapa[status];
                  const pct = totalFrota > 0 ? Math.round((qtd / totalFrota) * 100) : 0;
                  return (
                    <div
                      key={status}
                      title={`${cfg.label}: ${qtd} veículos (${pct}%)`}
                      className="flex flex-col justify-between rounded-[14px] border border-[#E7E7F0] bg-white px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: cfg.cor }}
                        />
                        <span className="truncate text-[10.5px] font-semibold text-[#64748B]">
                          {cfg.label}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between gap-2">
                        <strong className="text-[20px] font-bold leading-none tabular-nums text-[#1E1B4B]">
                          {qtd}
                        </strong>
                        <span className="text-[11px] font-semibold tabular-nums text-[#94A3B8]">
                          {pct}%
                        </span>
                      </div>

                      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[#F1F1F6]">
                        <div
                          className="h-full rounded-full transition-[width] duration-500"
                          style={{ width: `${pct}%`, background: cfg.cor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Resumo Operacional */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                Resumo Operacional (Manutenções · Multas & CNH · Sinistros)
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ColunaResumoModal
                  titulo="Manutenções"
                  cor="#4F46E5"
                  itens={dados.quadroManutencoes}
                />
                <ColunaResumoModal
                  titulo="Multas & CNH"
                  cor="#D97706"
                  itens={dados.quadroMultasCnh}
                />
                <ColunaResumoModal
                  titulo="Sinistros"
                  cor="#E11D48"
                  itens={dados.quadroSinistros}
                />
              </div>
            </section>
          </div>

          {/* Rodapé discreto */}
          <DialogFooter className="no-print shrink-0 items-center border-t border-[#E7E7F0] bg-white px-7 py-3.5 sm:justify-between">
            <span className="hidden text-[11px] text-[#94A3B8] sm:inline">
              Estrutura V1 (conteúdo final em Discovery de Produto) · Na impressão, escolha “Salvar como PDF”.
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 rounded-[10px] border-[#E7E7F0] bg-white px-4 text-[12.5px] font-semibold text-[#334155] hover:bg-[#F8F8FC]"
              >
                Fechar
              </Button>
              <Button
                id="btn-exportar-relatorio-pdf"
                type="button"
                onClick={exportarEmPdf}
                className="h-9 gap-1.5 rounded-[10px] border border-[#4F46E5] bg-[#4F46E5] px-4 text-[12.5px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(79,70,229,0.9)] hover:bg-[#4338CA]"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar em PDF
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
