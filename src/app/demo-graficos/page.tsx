/**
 * Demonstração dos Componentes de Gráficos
 *
 * Página exclusiva para apresentação dos componentes de gráficos
 * criados no projeto. Utiliza dados fictícios para demonstrar
 * a flexibilidade e reutilização de cada componente.
 *
 * Rota: /demo-graficos
 */

"use client";

import {
  BarChartVertical,
  BarChartHorizontal,
  GaugeChart,
  HeatmapGrid,
} from "@/components/charts";

/* ========================================================= */
/*  DADOS DE DEMONSTRAÇÃO                                    */
/* ========================================================= */

/** Evolução do Comportamento — Barras verticais empilhadas */
const EVOLUCAO_COMPORTAMENTO = [
  { mes: "Jan", referencia: 42, baixa: 28, media: 15, alta: 5 },
  { mes: "Fev", referencia: 44, baixa: 26, media: 14, alta: 6 },
  { mes: "Mar", referencia: 40, baixa: 30, media: 16, alta: 4 },
  { mes: "Abr", referencia: 46, baixa: 25, media: 13, alta: 6 },
  { mes: "Mai", referencia: 48, baixa: 24, media: 12, alta: 6 },
  { mes: "Jun", referencia: 50, baixa: 22, media: 14, alta: 4 },
  { mes: "Jul", referencia: 47, baixa: 27, media: 11, alta: 5 },
  { mes: "Ago", referencia: 52, baixa: 23, media: 13, alta: 2 },
  { mes: "Set", referencia: 55, baixa: 20, media: 10, alta: 5 },
  { mes: "Out", referencia: 53, baixa: 22, media: 12, alta: 3 },
  { mes: "Nov", referencia: 56, baixa: 21, media: 9, alta: 4 },
];

const CORES_CLASSIFICACAO = {
  referencia: "#92D050",
  baixa: "#EEDA2B",
  media: "#FF0000",
  alta: "#9B23AB",
};

/** Registros de Fadiga — Barras verticais agrupadas */
const FADIGA_POR_FILIAL = [
  { filial: "São Paulo", aguda: 32, acumulada: 18 },
  { filial: "Campinas", aguda: 24, acumulada: 12 },
  { filial: "Ribeirão", aguda: 18, acumulada: 22 },
  { filial: "Curitiba", aguda: 15, acumulada: 9 },
  { filial: "Londrina", aguda: 11, acumulada: 14 },
];

/** Evolução do IRC — Barras verticais com linha de referência */
const EVOLUCAO_IRC = [
  { mes: "Jan", irc: 58 },
  { mes: "Fev", irc: 61 },
  { mes: "Mar", irc: 67 },
  { mes: "Abr", irc: 63 },
  { mes: "Mai", irc: 70 },
  { mes: "Jun", irc: 65 },
];

/** Condutores por Unidade — Barras horizontais empilhadas */
const POR_UNIDADE = [
  { unidade: "Crop Protection", referencia: 15, baixa: 8, media: 4, alta: 1 },
  { unidade: "Seeds", referencia: 12, baixa: 10, media: 3, alta: 2 },
  { unidade: "Digital", referencia: 8, baixa: 5, media: 6, alta: 3 },
  { unidade: "Flores", referencia: 6, baixa: 7, media: 5, alta: 2 },
];

/** Eventos por Parâmetro — Barras horizontais simples */
const EVENTOS_PARAMETRO = [
  { parametro: "Excesso de velocidade", total: 312 },
  { parametro: "Frenagem brusca", total: 287 },
  { parametro: "Aceleração brusca", total: 201 },
  { parametro: "Uso de celular", total: 178 },
  { parametro: "Curva acentuada", total: 143 },
  { parametro: "Não uso de cinto", total: 112 },
  { parametro: "Direção em chuva", total: 89 },
  { parametro: "Madrugada sem pausa", total: 64 },
];

/** Faixas de cor do IRC para o GaugeChart */
const FAIXAS_IRC = [
  { ate: 30, cor: "#16a34a", label: "Baixo" },
  { ate: 60, cor: "#ca8a04", label: "Moderado" },
  { ate: 80, cor: "#dc2626", label: "Alto" },
  { ate: 100, cor: "#7c3aed", label: "Crítico" },
];

/** Heatmap: matriz 7 dias x 24 horas (valores entre 0 e 1) */
const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const HORAS = Array.from({ length: 24 }, (_, h) => `${h}h`);

const HEATMAP_DADOS = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    const fimSemana = d === 4 || d === 5;
    const segManha = d === 0 && h >= 6 && h <= 8;
    const noite = h >= 18 && h <= 23;
    let v = 0.15 + Math.abs(Math.sin((d + 1) * (h + 1) * 0.3)) * 0.25;
    if (fimSemana && noite) v += 0.55;
    if (segManha) v += 0.5;
    return Math.min(1, v);
  })
);

const FAIXAS_COR_HEATMAP = [
  { ate: 0.2, cor: "#dcfce7" },
  { ate: 0.4, cor: "#fef9c3" },
  { ate: 0.6, cor: "#fed7aa" },
  { ate: 0.8, cor: "#fecaca" },
  { ate: 1.0, cor: "#dc2626" },
];

/* ========================================================= */
/*  COMPONENTE DA PÁGINA                                     */
/* ========================================================= */

export default function DemoGraficosPage() {
  return (
    <div className="animate-fade-in min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Sprint Review
        </span>
        <h1 className="text-2xl font-bold text-foreground mt-1">
          Demonstração — Componentes de Gráficos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Componentes genéricos e reutilizáveis criados para o Master Mobility
        </p>
      </div>

      {/* ==================== 1. BarChartVertical ==================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            1. BarChartVertical
          </h2>
          <p className="text-xs text-muted-foreground">
            Componente:{" "}
            <code className="bg-muted px-1 rounded text-[11px]">
              src/components/charts/bar-chart-vertical.tsx
            </code>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Exemplo 1: Empilhado com scroll */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold mb-1">
              Evolução do Comportamento — Ano
            </h3>
            <p className="text-[10px] text-muted-foreground mb-4">
              Barras empilhadas com scroll horizontal · 4 séries · 11 meses
            </p>
            <BarChartVertical
              dados={EVOLUCAO_COMPORTAMENTO}
              categoriaKey="mes"
              series={[
                {
                  dataKey: "referencia",
                  nome: "Referência",
                  cor: CORES_CLASSIFICACAO.referencia,
                  stackId: "s",
                },
                {
                  dataKey: "baixa",
                  nome: "Baixa",
                  cor: CORES_CLASSIFICACAO.baixa,
                  stackId: "s",
                },
                {
                  dataKey: "media",
                  nome: "Média",
                  cor: CORES_CLASSIFICACAO.media,
                  stackId: "s",
                },
                {
                  dataKey: "alta",
                  nome: "Alta",
                  cor: CORES_CLASSIFICACAO.alta,
                  stackId: "s",
                },
              ]}
              altura={320}
              scrollHorizontal
            />
          </div>

          {/* Exemplo 2: Agrupado */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold mb-1">
              Registros de Fadiga por Filial
            </h3>
            <p className="text-[10px] text-muted-foreground mb-4">
              Barras agrupadas · 2 séries (Aguda e Acumulada)
            </p>
            <BarChartVertical
              dados={FADIGA_POR_FILIAL}
              categoriaKey="filial"
              series={[
                { dataKey: "aguda", nome: "Fadiga Aguda", cor: "#FF0000" },
                {
                  dataKey: "acumulada",
                  nome: "Fadiga Acumulada",
                  cor: "#9B23AB",
                },
              ]}
              altura={280}
            />
          </div>
        </div>

        {/* Exemplo 3: Com linha de referência */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold mb-1">
            Evolução do IRC no Ano
          </h3>
          <p className="text-[10px] text-muted-foreground mb-4">
            Barra única com linha de referência (meta) · Domínio Y fixo [0,
            100]
          </p>
          <BarChartVertical
            dados={EVOLUCAO_IRC}
            categoriaKey="mes"
            series={[{ dataKey: "irc", nome: "IRC", cor: "#2563eb" }]}
            altura={280}
            dominioY={[0, 100]}
            linhaReferencia={{ valor: 55, label: "Meta 55", cor: "#dc2626" }}
          />
        </div>
      </section>

      {/* ==================== 2. BarChartHorizontal ==================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            2. BarChartHorizontal
          </h2>
          <p className="text-xs text-muted-foreground">
            Componente:{" "}
            <code className="bg-muted px-1 rounded text-[11px]">
              src/components/charts/bar-chart-horizontal.tsx
            </code>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Exemplo 1: Empilhado */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold mb-1">
              Condutores por Unidade x Comportamento
            </h3>
            <p className="text-[10px] text-muted-foreground mb-4">
              Barras horizontais empilhadas · 4 séries de classificação
            </p>
            <BarChartHorizontal
              dados={POR_UNIDADE}
              categoriaKey="unidade"
              series={[
                {
                  dataKey: "referencia",
                  nome: "Ref.",
                  cor: CORES_CLASSIFICACAO.referencia,
                  stackId: "s",
                },
                {
                  dataKey: "baixa",
                  nome: "Baixa",
                  cor: CORES_CLASSIFICACAO.baixa,
                  stackId: "s",
                },
                {
                  dataKey: "media",
                  nome: "Média",
                  cor: CORES_CLASSIFICACAO.media,
                  stackId: "s",
                },
                {
                  dataKey: "alta",
                  nome: "Alta",
                  cor: CORES_CLASSIFICACAO.alta,
                  stackId: "s",
                },
              ]}
            />
          </div>

          {/* Exemplo 2: Barra única */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold mb-1">
              Quantidade de Eventos por Parâmetro
            </h3>
            <p className="text-[10px] text-muted-foreground mb-4">
              Barra única horizontal · Labels à esquerda com 160px
            </p>
            <BarChartHorizontal
              dados={EVENTOS_PARAMETRO}
              categoriaKey="parametro"
              series={[
                { dataKey: "total", nome: "Total", cor: "hsl(220 72% 49%)" },
              ]}
              altura={300}
              larguraLabel={160}
              mostrarLegenda={false}
            />
          </div>
        </div>
      </section>

      {/* ==================== 3. GaugeChart ==================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            3. GaugeChart
          </h2>
          <p className="text-xs text-muted-foreground">
            Componente:{" "}
            <code className="bg-muted px-1 rounded text-[11px]">
              src/components/charts/gauge-chart.tsx
            </code>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Diferentes valores para mostrar cores */}
          {[
            { titulo: "IRC Baixo", valor: 25 },
            { titulo: "IRC Moderado", valor: 52 },
            { titulo: "IRC Alto", valor: 72 },
          ].map((exemplo) => (
            <div
              key={exemplo.titulo}
              className="bg-card rounded-lg border border-border p-5"
            >
              <h3 className="text-sm font-semibold mb-1">{exemplo.titulo}</h3>
              <p className="text-[10px] text-muted-foreground mb-2">
                Valor: {exemplo.valor} · Faixas: Baixo / Moderado / Alto /
                Crítico
              </p>
              <GaugeChart
                valor={exemplo.valor}
                maximo={100}
                faixas={FAIXAS_IRC}
                sufixo="/ 100"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 4. HeatmapGrid ==================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            4. HeatmapGrid
          </h2>
          <p className="text-xs text-muted-foreground">
            Componente:{" "}
            <code className="bg-muted px-1 rounded text-[11px]">
              src/components/charts/heatmap-grid.tsx
            </code>
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold mb-1">
            Heatmap de Risco por Dia × Hora
          </h3>
          <p className="text-[10px] text-muted-foreground mb-4">
            Grid 7×24 · 5 faixas de cor · Tooltip com percentual · Scroll
            horizontal
          </p>
          <HeatmapGrid
            dados={HEATMAP_DADOS}
            labelsLinha={DIAS_SEMANA}
            labelsColuna={HORAS}
            faixasCor={FAIXAS_COR_HEATMAP}
            formatarTooltip={(linhaIndex, colunaIndex, valor) =>
              `${DIAS_SEMANA[linhaIndex]} ${HORAS[colunaIndex]} — ${(valor * 100).toFixed(0)}%`
            }
          />
        </div>
      </section>

      {/* Footer */}
      <div className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Fleeting Master Mobility — Sprint Review · Todos os componentes são
          genéricos e reutilizáveis
        </p>
      </div>
    </div>
  );
}
