/**
 * Dashboard Geral do Ranking — Página Principal
 *
 * Exibe a visão consolidada de performance dos condutores:
 * - Seletor de período (mês/ano) na parte superior
 * - Barra de filtros (nome, gestor, filial, departamento, unidade)
 * - Cards de KPI (Total, Referência, Baixa, Média, Alta Exposição)
 * - Listas Top 10 (Condutores Referência e Condutores Críticos)
 *
 * Dados mockados, prontos para futura integração com backend.
 * TODO(backend): Substituir dados mock por chamadas à API.
 * TODO(security): Implementar autenticação/autorização quando integrar com backend.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { Users, Trophy, TrendingDown } from "lucide-react";
import { condutores, opcoesFiltro } from "@/data/mock-condutores";
import {
  evolucaoAnual,
  condutoresPorUnidade,
  condutoresPorDepartamento,
  condutoresPorFilial,
  fadigaPorFilial,
  eventosPorParametro,
} from "@/data/mock-graficos-dashboard";
import type { FiltrosState } from "@/types/condutor";
import { StatCard } from "@/components/stat-card";
import { PeriodoSelector } from "@/components/periodo-selector";
import { FiltroBarra } from "@/components/filtro-barra";
import { TopRankingList } from "@/components/top-ranking-list";
import { RankingCondutores } from "@/components/ranking-condutores";
import { BarChartVertical, BarChartHorizontal } from "@/components/charts";
import { InfoTooltip } from "@/components/info-tooltip";

/** Estado inicial dos filtros — nenhum filtro aplicado */
const FILTROS_INICIAIS: FiltrosState = {
  nome: "",
  gestor: "",
  departamento: "",
  funcao: "",
  negocio: "",
  centroCusto: "",
};

export default function DashboardRankingPage() {
  /* ---------- Estado do período (relativo à data atual) ---------- */
  const NOMES_MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(NOMES_MESES[hoje.getMonth()]);
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  /* ---------- Estado dos filtros ---------- */
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAIS);

  /** Atualiza um campo específico do filtro */
  const handleFiltroChange = useCallback(
    <K extends keyof FiltrosState>(campo: K, valor: FiltrosState[K]) => {
      setFiltros((prev) => ({ ...prev, [campo]: valor }));
    },
    []
  );

  /* ---------- Dados filtrados ---------- */
  const condutoresFiltrados = useMemo(() => {
    return condutores.filter((condutor) => {
      if (
        filtros.nome &&
        !condutor.nome.toLowerCase().includes(filtros.nome.toLowerCase())
      ) {
        return false;
      }
      if (filtros.gestor && condutor.gestor !== filtros.gestor) return false;
      if (filtros.centroCusto && condutor.centroCusto !== filtros.centroCusto) return false;
      if (
        filtros.departamento &&
        condutor.departamento !== filtros.departamento
      ) {
        return false;
      }
      if (filtros.funcao && condutor.funcao !== filtros.funcao) return false;
      if (filtros.negocio && condutor.negocio !== filtros.negocio) return false;
      return true;
    });
  }, [filtros]);

  /* ---------- Contagens para os cards de KPI ---------- */
  const contagens = useMemo(() => {
    const total = condutoresFiltrados.length;
    const referencia = condutoresFiltrados.filter(
      (c) => c.classificacao === "referencia"
    ).length;
    const baixa = condutoresFiltrados.filter(
      (c) => c.classificacao === "baixa"
    ).length;
    const media = condutoresFiltrados.filter(
      (c) => c.classificacao === "media"
    ).length;
    const alta = condutoresFiltrados.filter(
      (c) => c.classificacao === "alta"
    ).length;

    return { total, referencia, baixa, media, alta };
  }, [condutoresFiltrados]);

  /* ---------- Listas Top 10 ---------- */
  const top10Referencia = useMemo(() => {
    return condutoresFiltrados
      .filter((c) => c.classificacao === "referencia")
      .sort((a, b) => b.pontuacao - a.pontuacao)
      .slice(0, 10);
  }, [condutoresFiltrados]);

  const top10Criticos = useMemo(() => {
    return [...condutoresFiltrados]
      .sort((a, b) => a.pontuacao - b.pontuacao)
      .slice(0, 10);
  }, [condutoresFiltrados]);

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header com título e seletor de período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard Geral do Ranking
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão consolidada de performance dos condutores
          </p>
        </div>

        <PeriodoSelector
          mesSelecionado={mesSelecionado}
          anoSelecionado={anoSelecionado}
          onMesChange={setMesSelecionado}
          onAnoChange={setAnoSelecionado}
        />
      </div>

      {/* Barra de filtros */}
      <FiltroBarra
        filtros={filtros}
        opcoes={opcoesFiltro}
        onFiltroChange={handleFiltroChange}
      />

      {/* Cards de KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          titulo="Total Condutores"
          valor={contagens.total}
          icone={Users}
          variante="primary"
        />
        <StatCard
          titulo="Referência"
          valor={contagens.referencia}
          icone={Trophy}
          variante="success"
          subtitulo="> 85 pontos no mês"
        />
        <StatCard
          titulo="Baixa Exposição"
          valor={contagens.baixa}
          variante="baixa"
          subtitulo="Entre 40-85 no mês"
        />
        <StatCard
          titulo="Média Exposição"
          valor={contagens.media}
          variante="warning"
          subtitulo="< 40 pontos"
        />
        <StatCard
          titulo="Alta Exposição ao Risco"
          valor={contagens.alta}
          variante="danger"
          subtitulo="Condutor sem pontos"
        />
      </div>

      {/* Listas Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopRankingList
          titulo="Top 10 Condutores Referência"
          icone={Trophy}
          corIcone="text-[hsl(var(--referencia))]"
          descricao="Os 10 condutores com maior pontuação no período selecionado, classificados como Referência (> 85 pts)."
          condutores={top10Referencia}
          mostrarClassificacao={false}
        />

        <TopRankingList
          titulo="Top 10 Condutores Críticos"
          icone={TrendingDown}
          corIcone="text-[hsl(var(--media-exposicao))]"
          descricao="Os 10 condutores com menor pontuação no período, que necessitam de atenção imediata."
          condutores={top10Criticos}
          mostrarClassificacao={true}
        />
      </div>

      {/* Ranking dos Condutores — Tabela completa com abas Mensal/Anual */}
      <RankingCondutores condutores={condutoresFiltrados} />

      {/* ==================== ANÁLISES GRÁFICAS ==================== */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Análises Gráficas
        </h2>
      </div>

      {/* Evolução do Comportamento — Ano */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
          Evolução do Comportamento — Ano
          <InfoTooltip texto="Grau de exposição ao risco por mês: evolução anual da distribuição dos condutores por classificação." />
        </h4>
        <BarChartVertical
          dados={evolucaoAnual}
          categoriaKey="mes"
          series={[
            { dataKey: "referencia", nome: "Referência", cor: "#92D050" },
            { dataKey: "baixa", nome: "Baixa", cor: "#EEDA2B" },
            { dataKey: "media", nome: "Média", cor: "#FF0000" },
            { dataKey: "alta", nome: "Alta", cor: "#9B23AB" },
          ]}
          altura={420}
          scrollHorizontal
          larguraPorItem={80}
        />
      </div>

      {/* Grid 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Condutores por Unidade x Comportamento */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            Condutores por Unidade x Comportamento
            <InfoTooltip texto="Distribuição dos condutores por unidade, segmentados pela classificação de risco." />
          </h4>
          <BarChartHorizontal
            dados={condutoresPorUnidade}
            categoriaKey="negocio"
            series={[
              { dataKey: "referencia", nome: "Ref.", cor: "#92D050", stackId: "s" },
              { dataKey: "baixa", nome: "Baixa", cor: "#EEDA2B", stackId: "s" },
              { dataKey: "media", nome: "Média", cor: "#FF0000", stackId: "s" },
              { dataKey: "alta", nome: "Alta", cor: "#9B23AB", stackId: "s" },
            ]}
            altura={250}
          />
        </div>

        {/* Condutores por Departamento x Comportamento */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            Condutores por Departamento x Comportamento
            <InfoTooltip texto="Distribuição dos condutores por departamento, segmentados pela classificação de risco." />
          </h4>
          <BarChartHorizontal
            dados={condutoresPorDepartamento}
            categoriaKey="funcao"
            series={[
              { dataKey: "referencia", nome: "Ref.", cor: "#92D050", stackId: "s" },
              { dataKey: "baixa", nome: "Baixa", cor: "#EEDA2B", stackId: "s" },
              { dataKey: "media", nome: "Média", cor: "#FF0000", stackId: "s" },
              { dataKey: "alta", nome: "Alta", cor: "#9B23AB", stackId: "s" },
            ]}
            altura={250}
          />
        </div>

        {/* Condutores por Filial x Comportamento */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            Condutores por Filial x Comportamento
            <InfoTooltip texto="Distribuição dos condutores por filial, segmentados pela classificação de risco." />
          </h4>
          <BarChartHorizontal
            dados={condutoresPorFilial}
            categoriaKey="departamento"
            series={[
              { dataKey: "referencia", nome: "Ref.", cor: "#92D050", stackId: "s" },
              { dataKey: "baixa", nome: "Baixa", cor: "#EEDA2B", stackId: "s" },
              { dataKey: "media", nome: "Média", cor: "#FF0000", stackId: "s" },
              { dataKey: "alta", nome: "Alta", cor: "#9B23AB", stackId: "s" },
            ]}
            altura={250}
          />
        </div>

        {/* Registros de Fadiga por Filial */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            Registros de Fadiga por Filial
            <InfoTooltip texto="Quantidade de registros de fadiga aguda e acumulada por filial no período selecionado." />
          </h4>
          <BarChartVertical
            dados={fadigaPorFilial}
            categoriaKey="departamento"
            series={[
              { dataKey: "aguda", nome: "Fadiga Aguda", cor: "#FF0000" },
              { dataKey: "acumulada", nome: "Fadiga Acumulada", cor: "#9B23AB" },
            ]}
            altura={250}
          />
        </div>
      </div>

      {/* Quantidade de Eventos por Parâmetro do Ranking */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
          Quantidade de Eventos por Parâmetro do Ranking
          <InfoTooltip texto="Total de eventos registrados para cada parâmetro do ranking no período selecionado." />
        </h4>
        <BarChartHorizontal
          dados={eventosPorParametro}
          categoriaKey="parametro"
          series={[{ dataKey: "total", nome: "Total", cor: "hsl(220 72% 49%)" }]}
          altura={400}
          larguraLabel={180}
        />
      </div>
    </div>
  );
}
