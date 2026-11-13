/**
 * Torre de Controle V1 — Página principal (protótipo de validação com Produto/CEO).
 *
 * Mantém a dinâmica de tela única sem scroll vertical em monitores Full HD (1920×1080):
 * - Cabeçalho com filtros na ordem Ano > Mês (fechado) > Agrupamento dinâmico > Locadora
 *   + botão "Relatório Gerencial" (modal espaçado + exportação em PDF);
 * - Assistente de IA sincronizado com os 5 status exclusivos do mapa e os 3 quadros 2×2;
 * - 5 KPIs compactos com drawers amplos e botão de fechar em destaque;
 * - Grade 5 colunas × 2 linhas no desktop (xl):
 *   · Coluna 1 (linhas 1 e 2): Veículos que Exigem Atenção + Condutores que Exigem Atenção
 *   · Colunas 2–4 (linha 1): Mapa da Frota (5 status exclusivos)
 *   · Coluna 5 (linha 1): Atividade Recente
 *   · Colunas 2–3 (linha 2): KM Rodado nos Últimos 12 Meses
 *   · Colunas 4–5 (linha 2): Painel 2×2 alternável (Manutenções → Sinistros → Multas & CNH)
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
import {
  QuadroResumo,
  type SecaoQuadroResumo,
} from "@/components/torre-de-controle/quadro-resumo";
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

  const secoesQuadrosResumo = useMemo<SecaoQuadroResumo[]>(
    () => [
      {
        id: "manutencoes",
        titulo: "Manutenções",
        rotuloCurto: "Manutenções",
        corIndicador: "#4F46E5",
        caminhoModulo: "/manutencao/",
        itens: dados.quadroManutencoes,
      },
      {
        id: "sinistros",
        titulo: "Sinistros",
        rotuloCurto: "Sinistros",
        corIndicador: "#E11D48",
        caminhoModulo: "/sinistro/",
        itens: dados.quadroSinistros,
      },
      {
        id: "multas",
        titulo: "Multas & CNH",
        rotuloCurto: "Multas",
        corIndicador: "#D97706",
        caminhoModulo: "/multas-e-documentacao/",
        itens: dados.quadroMultasCnh,
      },
    ],
    [dados.quadroManutencoes, dados.quadroSinistros, dados.quadroMultasCnh]
  );

  /** Centraliza um veículo no mapa (usado pela IA e pelas tabelas de atenção) */
  function focarVeiculoNoMapa(placa: string) {
    setComandoFoco({ placa, token: Date.now() });
    areaMapaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="font-poppins flex min-h-full flex-col gap-2.5 bg-[#F4F4F8] px-4 pb-3.5 pt-3 text-[#334155] lg:px-6 xl:h-full">
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

      {/* Grade principal: 5 colunas × 2 linhas no desktop (cabe 100% em 1920×1080 sem scroll) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:min-h-[520px] xl:flex-1 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.5fr)_minmax(0,0.5fr)_minmax(184px,0.46fr)_minmax(184px,0.52fr)] xl:grid-rows-[minmax(0,1fr)_168px]">
        {/* Coluna 1 (linhas 1 e 2): tabelas de atenção */}
        <div className="flex min-h-0 flex-col gap-3 md:col-span-2 xl:col-span-1 xl:row-span-2">
          <VeiculosAtencaoTabela
            veiculos={dados.veiculosAtencao}
            onFocarVeiculo={focarVeiculoNoMapa}
            className="max-h-[360px] xl:max-h-none xl:flex-[1.2]"
          />
          <CondutoresAtencaoTabela
            condutores={dados.condutoresAtencao}
            onFocarVeiculo={focarVeiculoNoMapa}
            className="max-h-[300px] xl:max-h-none xl:flex-1"
          />
        </div>

        {/* Colunas 2–4 (linha 1): mapa da frota */}
        <div
          ref={areaMapaRef}
          className="h-[460px] scroll-mt-4 md:col-span-2 xl:col-span-3 xl:h-auto xl:min-h-0"
        >
          <FleetMap comandoFoco={comandoFoco} escopo={dados.escopoMapa} />
        </div>

        {/* Coluna 5 (linha 1): atividade recente */}
        <RecentActivity
          atividades={dados.atividades}
          className="h-[360px] md:col-span-2 xl:col-span-1 xl:h-auto"
        />

        {/* Colunas 2–3 (linha 2): KM rodado nos últimos 12 meses */}
        <KmChart
          barras={dados.barrasKm12Meses}
          totalKm={dados.totalKm12Meses}
          className="h-[168px] xl:col-span-2 xl:h-auto"
        />

        {/* Colunas 4–5 (linha 2): carrossel 2×2 (Manutenções → Sinistros → Multas & CNH) */}
        <QuadroResumo
          secoes={secoesQuadrosResumo}
          className="h-[168px] xl:col-span-2 xl:h-auto"
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
