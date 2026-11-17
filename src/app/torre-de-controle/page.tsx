/**
 * Torre de Controle — Página principal (protótipo alinhado ao Parecer de 15/11/2026).
 *
 * Estrutura aprovada (Linha superior + Grid A/B):
 * - Cabeçalho: filtros na ordem Ano > Mês (fechado) > Agrupamento dinâmico > Locadora
 *   + botão "Relatório Gerencial" (modal amplo + exportação em PDF pela impressão);
 * - Barra "Pergunte à IA" sincronizada com os filtros, os 5 status do mapa e os 3 quadros;
 * - 5 KPIs do período fechado com drawers detalhados;
 * - Linha superior: Veículos que Exigem Atenção + Mapa da Frota (5 status exclusivos,
 *   abrindo em 52/52) + Atividade Recente;
 * - Linha A (3 cartões de 1/3): Condutores que Exigem Atenção + Manutenções + Multas & CNH;
 * - Linha B (2/3 + 1/3): KM Rodado nos Últimos 12 Meses + Sinistros.
 *
 * Todos os dados são mockados e a página NÃO exige token (demo pública na Vercel).
 * TODO(backend): substituir os mocks por chamadas aos endpoints BFF da Torre de Controle.
 * TODO(security): proteger a rota com autenticação e extrair escopo do JWT no servidor.
 */

"use client";

import { useMemo, useRef, useState } from "react";
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
import {
  CATEGORIAS_TCO,
  ULTIMO_MES_FECHADO_2026,
  obterConfigPerfilAgrupamento,
  obterDadosTorre,
} from "@/components/torre-de-controle/mock-data";
import { QuadroResumo } from "@/components/torre-de-controle/quadro-resumo";
import { RecentActivity } from "@/components/torre-de-controle/recent-activity";
import { RelatorioGerencialModal } from "@/components/torre-de-controle/relatorio-gerencial-modal";
import { TcoDetalhe } from "@/components/torre-de-controle/tco/tco-detalhe";

/**
 * O Leaflet acessa `window` ao ser importado, então o mapa é carregado
 * somente no navegador (`ssr: false`), com um skeleton do mesmo tamanho.
 */
const FleetMap = dynamic(
  () => import("@/components/torre-de-controle/fleet-map").then((modulo) => modulo.FleetMap),
  { ssr: false, loading: () => <FleetMapSkeleton /> }
);

const FILTROS_INICIAIS: FiltrosTorre = {
  mes: String(ULTIMO_MES_FECHADO_2026),
  ano: "2026",
  agrupamento: "todos",
  locadora: "todas",
  perfilDemo: "filiais",
};

export default function TorreDeControlePage() {
  const [filtros, setFiltros] = useState<FiltrosTorre>(FILTROS_INICIAIS);
  const [comandoFoco, setComandoFoco] = useState<ComandoFocoMapa | null>(null);
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  const areaMapaRef = useRef<HTMLDivElement>(null);

  const dados = useMemo(() => obterDadosTorre(filtros), [filtros]);
  const configPerfil = obterConfigPerfilAgrupamento(filtros.perfilDemo);

  /** Centraliza um veículo no mapa (usado pela IA e pelas tabelas de atenção) */
  function focarVeiculoNoMapa(placa: string) {
    setComandoFoco({ placa, token: Date.now() });
    areaMapaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="font-poppins flex min-h-full flex-col gap-3 bg-[#F4F4F8] px-4 pb-6 pt-3 text-[#334155] lg:px-6">
      <DashboardHeader
        filtros={filtros}
        periodoRotulo={dados.periodoRotulo}
        onFiltrosChange={setFiltros}
        onAbrirRelatorio={() => setRelatorioAberto(true)}
      />

      <AiFleetAssistant filtros={filtros} onFocarVeiculo={focarVeiculoNoMapa} />

      <KpiCards
        kpis={dados.kpis}
        conteudosPersonalizados={{
          tco: (
            <TcoDetalhe
              key={`${filtros.ano}-${filtros.mes}-${filtros.perfilDemo}-${filtros.agrupamento}-${filtros.locadora}`}
              historico={dados.historicoTco}
              categorias={CATEGORIAS_TCO}
            />
          ),
        }}
      />

      {/* Linha superior — sem mudança: Veículos que Exigem Atenção + Mapa da Frota + Atividade Recente */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:h-[500px] xl:grid-cols-[minmax(0,1.06fr)_minmax(0,1.94fr)_minmax(220px,0.68fr)] 2xl:h-[530px]">
        <VeiculosAtencaoTabela
          veiculos={dados.veiculosAtencao}
          onFocarVeiculo={focarVeiculoNoMapa}
          className="max-h-[380px] md:col-span-2 xl:col-span-1 xl:h-full xl:max-h-none"
        />

        <div
          ref={areaMapaRef}
          className="h-[460px] scroll-mt-4 md:col-span-2 xl:col-span-1 xl:h-full xl:min-h-0"
        >
          <FleetMap comandoFoco={comandoFoco} escopo={dados.escopoMapa} />
        </div>

        <RecentActivity
          atividades={dados.atividades}
          className="h-[360px] md:col-span-2 xl:col-span-1 xl:h-full"
        />
      </div>

      {/* Linha A — três cartões independentes de 1/3: Condutores + Manutenções + Multas & CNH */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <CondutoresAtencaoTabela
          condutores={dados.condutoresAtencao}
          onFocarVeiculo={focarVeiculoNoMapa}
          className="max-h-[290px] md:col-span-2 xl:col-span-1 xl:h-full xl:max-h-[280px]"
        />

        <QuadroResumo
          titulo="Manutenções"
          corIndicador="#4F46E5"
          caminhoModulo="/manutencao/"
          itens={dados.quadroManutencoes}
        />

        <QuadroResumo
          titulo="Multas & CNH"
          corIndicador="#D97706"
          caminhoModulo="/multas-e-documentacao/"
          itens={dados.quadroMultasCnh}
        />
      </div>

      {/* Linha B — KM Rodado nos Últimos 12 Meses (2/3) + Sinistros (1/3) */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <KmChart
          barras={dados.barrasKm12Meses}
          totalKm={dados.totalKm12Meses}
          className="min-h-[244px] xl:col-span-2 xl:h-full"
        />

        <QuadroResumo
          titulo="Sinistros"
          corIndicador="#E11D48"
          caminhoModulo="/sinistro/"
          itens={dados.quadroSinistros}
        />
      </div>

      <RelatorioGerencialModal
        aberto={relatorioAberto}
        onOpenChange={setRelatorioAberto}
        dados={dados}
        perfilDescricao={configPerfil.descricaoEscopo}
      />
    </div>
  );
}
