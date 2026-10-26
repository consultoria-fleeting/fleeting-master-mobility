/**
 * Torre de Controle — Página principal (protótipo de validação).
 *
 * Visão consolidada da frota seguindo `PAINEL_GESTAO_REF.md` e `MAPA_LEAFLET_SPEC.md`:
 * - Cabeçalho com filtros e ações
 * - Assistente de IA da frota (perguntas sugeridas + respostas demonstrativas)
 * - 5 KPIs com tooltip e drawer de detalhamento
 * - Grade principal: tabelas de atenção | mapa Leaflet | atividade | TCO
 *   e, na segunda linha, KMs rodados | manutenção
 *
 * Todos os dados são mockados e a página NÃO exige token (demo pública na Vercel).
 * TODO(backend): substituir os mocks por chamadas à API.
 * TODO(security): proteger a rota com autenticação quando os dados forem reais.
 */

"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ComandoFocoMapa } from "@/types/frota-mapa";
import { AiFleetAssistant } from "@/components/torre-de-controle/ai-fleet-assistant";
import {
  CondutoresAtencaoTabela,
  VeiculosAtencaoTabela,
} from "@/components/torre-de-controle/attention-tables";
import {
  DashboardHeader,
  type FiltrosTorre,
} from "@/components/torre-de-controle/dashboard-header";
import { FleetMapSkeleton } from "@/components/torre-de-controle/fleet-map-skeleton";
import { KmChart } from "@/components/torre-de-controle/km-chart";
import { KpiCards } from "@/components/torre-de-controle/kpi-cards";
import { MaintenanceSummary } from "@/components/torre-de-controle/maintenance-summary";
import { RecentActivity } from "@/components/torre-de-controle/recent-activity";
import { TcoSummary } from "@/components/torre-de-controle/tco-summary";
import {
  ATIVIDADES,
  BARRAS_KM,
  CONDUTORES_ATENCAO,
  KPIS,
  MANUTENCAO,
  TCO_RESUMO,
  TOTAL_KM_ANO,
  VEICULOS_ATENCAO,
} from "@/components/torre-de-controle/mock-data";

/**
 * O Leaflet acessa `window` ao ser importado, então o mapa é carregado
 * somente no navegador (`ssr: false`), com um skeleton do mesmo tamanho.
 */
const FleetMap = dynamic(
  () => import("@/components/torre-de-controle/fleet-map").then((modulo) => modulo.FleetMap),
  { ssr: false, loading: () => <FleetMapSkeleton /> }
);

const FILTROS_INICIAIS: FiltrosTorre = {
  mes: "atual",
  ano: "2026",
  grupo: "todos",
  locadora: "todas",
};

export default function TorreDeControlePage() {
  const [filtros, setFiltros] = useState<FiltrosTorre>(FILTROS_INICIAIS);
  const [comandoFoco, setComandoFoco] = useState<ComandoFocoMapa | null>(null);
  const areaMapaRef = useRef<HTMLDivElement>(null);

  /** Centraliza um veículo no mapa (usado pela IA e pelas tabelas de atenção) */
  function focarVeiculoNoMapa(placa: string) {
    setComandoFoco({ placa, token: Date.now() });
    areaMapaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="font-poppins flex min-h-full flex-col gap-3 bg-[#F4F4F8] px-4 pb-5 pt-4 text-[#334155] lg:px-6">
      <DashboardHeader filtros={filtros} onFiltrosChange={setFiltros} />

      <AiFleetAssistant onFocarVeiculo={focarVeiculoNoMapa} />

      <KpiCards kpis={KPIS} />

      {/* Grade principal: 5 colunas × 2 linhas no desktop (xl) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:min-h-[620px] xl:flex-1 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.5fr)_minmax(0,0.5fr)_minmax(184px,0.52fr)_minmax(184px,0.46fr)] xl:grid-rows-[minmax(0,1fr)_156px]">
        {/* Coluna 1 (linhas 1 e 2): tabelas de atenção */}
        <div className="flex min-h-0 flex-col gap-3 md:col-span-2 xl:col-span-1 xl:row-span-2">
          <VeiculosAtencaoTabela
            veiculos={VEICULOS_ATENCAO}
            onFocarVeiculo={focarVeiculoNoMapa}
            className="max-h-[360px] xl:max-h-none xl:flex-[1.2]"
          />
          <CondutoresAtencaoTabela
            condutores={CONDUTORES_ATENCAO}
            onFocarVeiculo={focarVeiculoNoMapa}
            className="max-h-[300px] xl:max-h-none xl:flex-1"
          />
        </div>

        {/* Colunas 2–3 (linha 1): mapa da frota */}
        <div ref={areaMapaRef} className="h-[480px] scroll-mt-4 md:col-span-2 xl:col-span-2 xl:h-auto xl:min-h-0">
          <FleetMap comandoFoco={comandoFoco} />
        </div>

        {/* Coluna 4 (linha 1): atividade recente */}
        <RecentActivity atividades={ATIVIDADES} className="h-[360px] xl:h-auto" />

        {/* Coluna 5 (linha 1): resumo do TCO */}
        <TcoSummary
          total={TCO_RESUMO.total}
          mediaPorVeiculo={TCO_RESUMO.mediaPorVeiculo}
          itens={TCO_RESUMO.itens}
          className="h-[360px] xl:h-auto"
        />

        {/* Colunas 2–3 (linha 2): KMs rodados */}
        <KmChart barras={BARRAS_KM} ano={filtros.ano} totalKm={TOTAL_KM_ANO} className="h-[156px] xl:col-span-2 xl:h-auto" />

        {/* Colunas 4–5 (linha 2): manutenção */}
        <MaintenanceSummary itens={MANUTENCAO} className="xl:col-span-2" />
      </div>
    </div>
  );
}
