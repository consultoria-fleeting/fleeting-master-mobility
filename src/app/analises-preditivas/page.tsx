/**
 * Análises Preditivas — Página
 *
 * Visão geral preditiva da frota com:
 * - IRC da Frota (gauge chart)
 * - Evolução do IRC no Ano (bar chart com meta)
 * - Top 10 Condutores com maior IRC
 * - Zonas de maior risco
 * - Probabilidade de eventos de risco
 * - Heatmap dia × hora
 *
 * Dados mockados, prontos para futura integração com backend.
 * TODO(backend): Substituir dados mock por chamadas à API.
 * TODO(security): Implementar autenticação/autorização quando integrar com backend.
 *
 * Rota: /analises-preditivas
 */

"use client";

import { useState, useMemo, useCallback, Fragment } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, MapPin } from "lucide-react";
import { GaugeChart, BarChartVertical, HeatmapGrid } from "@/components/charts";
import { InfoTooltip } from "@/components/info-tooltip";
import { FiltroBarra } from "@/components/filtro-barra";
import { opcoesFiltro } from "@/data/mock-condutores";
import type { FiltrosState } from "@/types/condutor";

/* ========================================================= */
/*  HELPERS DE COR                                           */
/* ========================================================= */

const CORES = {
  verde: "#16a34a",
  amarelo: "#ca8a04",
  vermelho: "#dc2626",
  azul: "#2563eb",
  roxo: "#7c3aed",
};

function corIrc(valor: number): string {
  if (valor <= 30) return CORES.verde;
  if (valor <= 60) return CORES.amarelo;
  if (valor <= 80) return CORES.vermelho;
  return CORES.roxo;
}

function nivelIrc(valor: number): string {
  if (valor <= 30) return "Baixo";
  if (valor <= 60) return "Moderado";
  if (valor <= 80) return "Alto";
  return "Crítico";
}

/** Faixas do GaugeChart */
const FAIXAS_IRC = [
  { ate: 30, cor: CORES.verde, label: "Baixo" },
  { ate: 60, cor: CORES.amarelo, label: "Moderado" },
  { ate: 80, cor: CORES.vermelho, label: "Alto" },
  { ate: 100, cor: CORES.roxo, label: "Crítico" },
];

/* ========================================================= */
/*  DADOS MOCK (determinísticos)                             */
/* ========================================================= */

const IRC_FROTA = 62;

const EVOLUCAO_MES = [
  { mes: "Jan", irc: 58 },
  { mes: "Fev", irc: 61 },
  { mes: "Mar", irc: 67 },
  { mes: "Abr", irc: 63 },
  { mes: "Mai", irc: 70 },
  { mes: "Jun", irc: 65 },
];

const TOP_CONDUTORES = [
  { nome: "Mariana Costa", irc: 91 },
  { nome: "Carlos Mendes", irc: 88 },
  { nome: "Roberto Lima", irc: 85 },
  { nome: "Felipe Souza", irc: 83 },
  { nome: "Patrícia Nunes", irc: 81 },
  { nome: "Luiza Ribeiro", irc: 79 },
  { nome: "André Silveira", irc: 77 },
  { nome: "Beatriz Tavares", irc: 75 },
  { nome: "Thiago Borges", irc: 73 },
  { nome: "Camila Duarte", irc: 72 },
];

const ZONAS = [
  { zona: "Rodovias", risco: 85 },
  { zona: "Centro Urbano", risco: 62 },
  { zona: "Zona Rural", risco: 38 },
];

const LOCAIS = [
  { local: "BR-101 noturno", risco: 85 },
  { local: "Centro Urbano - Pico", risco: 62 },
  { local: "Zona Industrial", risco: 45 },
  { local: "Periferia Sul", risco: 38 },
];

/* ========================================================= */
/*  COMPONENTE CARD DE SEÇÃO                                 */
/* ========================================================= */

function SecaoCard({
  titulo,
  subtitulo,
  info,
  children,
  className = "",
}: {
  titulo: string;
  subtitulo?: string;
  info?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border bg-card shadow-sm p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-foreground">{titulo}</h3>
          {subtitulo && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {subtitulo}
            </p>
          )}
        </div>
        {info && <InfoTooltip texto={info} />}
      </div>
      {children}
    </div>
  );
}

/* ========================================================= */
/*  PÁGINA                                                   */
/* ========================================================= */

export default function AnalisesPreditivasPage() {
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  /* ---------- Estado dos filtros ---------- */
  const FILTROS_INICIAIS: FiltrosState = {
    nome: "",
    gestor: "",
    departamento: "",
    funcao: "",
    negocio: "",
    centroCusto: "",
  };
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAIS);
  const handleFiltroChange = useCallback(
    <K extends keyof FiltrosState>(campo: K, valor: FiltrosState[K]) => {
      setFiltros((prev) => ({ ...prev, [campo]: valor }));
    },
    []
  );

  /** Heatmap determinístico (sem Math.random) */
  const heatmap = useMemo(() => {
    return Array.from({ length: 7 }, (_, d) =>
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
  }, []);

  const corCel = (v: number): string => {
    if (v < 0.2) return "#dcfce7";
    if (v < 0.4) return "#fef9c3";
    if (v < 0.6) return "#fed7aa";
    if (v < 0.8) return "#fecaca";
    return "#dc2626";
  };

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-5">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Análises Preditivas
          </h1>
          <p className="text-sm text-muted-foreground">Visão geral da frota</p>
        </div>
        <Link
          href="/performance-condutores"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Ver performance dos condutores <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Filtros */}
      <FiltroBarra
        filtros={filtros}
        opcoes={opcoesFiltro}
        onFiltroChange={handleFiltroChange}
      />

      {/* Linha 1: IRC + Evolução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SecaoCard
          titulo="IRC da Frota"
          subtitulo="Média do IRC dos condutores da frota"
          info="Score médio do Índice de Risco Composto considerando todos os condutores ativos da frota."
        >
          <GaugeChart
            valor={IRC_FROTA}
            maximo={100}
            faixas={FAIXAS_IRC}
            sufixo="/ 100"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-3 px-2">
            <span>0-30 Baixo</span>
            <span>31-60 Mod</span>
            <span>61-80 Alto</span>
            <span>81-100 Crítico</span>
          </div>
        </SecaoCard>

        <SecaoCard
          titulo="Evolução do IRC no Ano"
          subtitulo="IRC médio mensal vs meta"
          info="Evolução do IRC médio da frota ao longo dos últimos meses, comparado à meta institucional."
        >
          <div className="h-64">
            <BarChartVertical
              dados={EVOLUCAO_MES}
              categoriaKey="mes"
              series={[{ dataKey: "irc", nome: "IRC", cor: CORES.azul }]}
              linhaReferencia={{ valor: 55, cor: CORES.vermelho, label: "Meta 55" }}
            />
          </div>
        </SecaoCard>
      </div>

      {/* Linha 2: Top 10 IRC */}
      <SecaoCard
        titulo="Top 10 Condutores com Maior IRC"
        subtitulo="Ordenado do maior para o menor"
        info="Lista dos 10 condutores com maior Índice de Risco Composto na frota."
      >
        <div className="space-y-2">
          {TOP_CONDUTORES.map((c, i) => {
            const cor = corIrc(c.irc);
            return (
              <div
                key={c.nome}
                className="flex items-center gap-3 text-sm"
              >
                <span className="w-6 text-xs text-muted-foreground font-semibold">
                  {i + 1}º
                </span>
                <span className="flex-1 truncate font-medium">{c.nome}</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.irc}%`, background: cor }}
                  />
                </div>
                <span
                  className="w-8 text-right font-bold"
                  style={{ color: cor }}
                >
                  {c.irc}
                </span>
                <span
                  className="px-2 py-0.5 text-[10px] font-semibold rounded-full text-white"
                  style={{ background: cor }}
                >
                  {nivelIrc(c.irc)}
                </span>
                <Link
                  href={`/performance-condutores/${encodeURIComponent(c.nome)}`}
                  className="text-[11px] text-primary hover:underline"
                >
                  Ver condutor
                </Link>
              </div>
            );
          })}
        </div>
      </SecaoCard>

      {/* Linha 3: Zonas + Probabilidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SecaoCard
          titulo="Zonas de Maior Risco da Frota"
          subtitulo="Locais com maiores riscos por contexto"
          info="Concentração de risco por contexto operacional e locais específicos."
        >
          <div className="space-y-3">
            {ZONAS.map((z) => (
              <div key={z.zona}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {z.zona}
                  </span>
                  <span className="font-bold">{z.risco}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${z.risco}%`,
                      background:
                        z.risco > 60
                          ? CORES.vermelho
                          : z.risco > 40
                            ? CORES.amarelo
                            : CORES.verde,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Locais específicos
            </p>
            <div className="space-y-2">
              {LOCAIS.map((l) => (
                <div key={l.local}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{l.local}</span>
                    <span className="font-semibold">{l.risco}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${l.risco}%`,
                        background:
                          l.risco > 60
                            ? CORES.vermelho
                            : l.risco > 40
                              ? CORES.amarelo
                              : CORES.verde,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SecaoCard>

        <SecaoCard
          titulo="Probabilidade de eventos de risco"
          subtitulo="Baseado no histórico agregado de todos os condutores da frota"
          info="Estimativa de janelas de maior probabilidade de eventos de risco na frota."
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 bg-red-50/40">
              <p className="text-[11px] text-muted-foreground uppercase">
                Maior probabilidade por horário
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold">
                  Sextas entre 18h–21h
                </span>
                <span
                  className="text-3xl font-bold"
                  style={{ color: CORES.vermelho }}
                >
                  74%
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold">
                <AlertTriangle className="w-3 h-3" /> Alerta — acima de 60%
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 bg-red-50/40">
              <p className="text-[11px] text-muted-foreground uppercase">
                Maior probabilidade por local
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold">Rodovias noturnas</span>
                <span
                  className="text-3xl font-bold"
                  style={{ color: CORES.vermelho }}
                >
                  68%
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold">
                <AlertTriangle className="w-3 h-3" /> Alerta — acima de 60%
              </div>
            </div>
          </div>
        </SecaoCard>
      </div>

      {/* Linha 4: Heatmap */}
      <SecaoCard
        titulo="Heatmap de risco por dia × hora"
        subtitulo="Concentração média de eventos de risco de toda a frota"
        info="Concentração média de eventos de risco da frota cruzando dia da semana e hora."
      >
        <div className="overflow-x-auto">
          <div
            className="inline-grid gap-[2px]"
            style={{
              gridTemplateColumns: "40px repeat(24, 1fr)",
              minWidth: 800,
            }}
          >
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="text-[9px] text-center text-muted-foreground"
              >
                {h}h
              </div>
            ))}
            {heatmap.map((row, d) => (
              <Fragment key={`row-${d}`}>
                <div className="text-[10px] text-muted-foreground font-medium flex items-center">
                  {dias[d]}
                </div>
                {row.map((v, h) => (
                  <div
                    key={`${d}-${h}`}
                    className="aspect-square rounded-sm"
                    style={{ background: corCel(v) }}
                    title={`${dias[d]} ${h}h — ${(v * 100).toFixed(0)}%`}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Baixa</span>
          {["#dcfce7", "#fef9c3", "#fed7aa", "#fecaca", "#dc2626"].map(
            (c) => (
              <div
                key={c}
                className="w-6 h-3 rounded-sm"
                style={{ background: c }}
              />
            )
          )}
          <span>Alta</span>
        </div>
      </SecaoCard>
    </div>
  );
}
