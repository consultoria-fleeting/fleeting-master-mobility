/**
 * Performance do Condutor — Página de Detalhe
 *
 * Exibe o perfil individual de um condutor com duas abas:
 * - Ranking: cards de informação, pontuações mensais e tabela de eventos
 * - Análise Preditiva: Índice de Risco Composto (IRC) — demais seções desabilitadas (V1)
 *
 * Rota: /performance-condutores/[id]
 * O [id] é o nome do condutor (URL-encoded).
 *
 * TODO(backend): Substituir dados mock por chamadas à API.
 * TODO(security): Implementar autenticação/autorização quando integrar com backend.
 */

"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Expand, ChevronsLeftRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassificationBadge } from "@/components/classification-badge";
import { GaugeChart } from "@/components/charts";
import { ScrollCarousel } from "@/components/scroll-carousel";
import { condutores } from "@/data/mock-condutores";
import { gerarEventosCondutor } from "@/data/mock-eventos-condutor";

/* ========================================================= */
/*  HELPERS                                                  */
/* ========================================================= */

/** Faixas de cores do IRC para o GaugeChart */
const FAIXAS_IRC = [
  { ate: 30, cor: "#16a34a", label: "Baixo Risco" },
  { ate: 60, cor: "#ca8a04", label: "Risco Moderado" },
  { ate: 80, cor: "#dc2626", label: "Alto Risco" },
  { ate: 100, cor: "#7c3aed", label: "Risco Crítico" },
];

/** Cores de gravidade para a tabela de eventos */
const COR_GRAVIDADE: Record<string, string> = {
  Leve: "text-muted-foreground",
  Média: "text-[hsl(var(--warning))]",
  Grave: "text-[hsl(var(--danger))]",
  Gravíssima: "text-[hsl(var(--danger))] font-bold",
  Crítica: "text-[hsl(var(--alta-exposicao))] font-bold",
};

/** Badges de status */
const ESTILO_STATUS: Record<string, string> = {
  Confirmado: "bg-green-100 text-green-800",
  "Em análise": "bg-yellow-100 text-yellow-800",
  Contestado: "bg-red-100 text-red-800",
};

/* ========================================================= */
/*  COMPONENTE                                               */
/* ========================================================= */

export default function PerformanceCondutorPage() {
  const params = useParams();
  const nomeDecodificado = decodeURIComponent(params.id as string);

  const [expandirMeses, setExpandirMeses] = useState(false);

  /* ---------- Busca do condutor ---------- */
  const condutor = condutores.find((c) => c.nome === nomeDecodificado);

  /* ---------- Eventos do condutor ---------- */
  const eventos = useMemo(() => {
    if (!condutor) return [];
    return gerarEventosCondutor(condutor.nome);
  }, [condutor]);

  /* ---------- IRC (inversão da pontuação do ranking) ---------- */
  const irc = useMemo(() => {
    if (!condutor) return 50;
    return Math.max(5, Math.min(95, 100 - (condutor.pontuacao ?? 50)));
  }, [condutor]);

  /* ---------- Estado de não encontrado ---------- */
  if (!condutor) {
    return (
      <div className="animate-fade-in p-4 lg:p-6">
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">Condutor não encontrado</p>
          <Link
            href="/"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            ← Voltar para o Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-foreground">
            {condutor.nome}
          </h1>
          <p className="text-sm text-muted-foreground">
            {condutor.funcao} — {condutor.departamento} — {condutor.negocio}
          </p>
        </div>
      </div>

      {/* Tabs: Ranking | Análise Preditiva */}
      <Tabs defaultValue="ranking" className="w-full flex-col">
        <TabsList>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="preditiva">Análise Preditiva</TabsTrigger>
        </TabsList>

        {/* ==================== ABA RANKING ==================== */}
        <TabsContent value="ranking" className="space-y-6 mt-4">
          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-[10px] text-muted-foreground uppercase">
                Pontuação
              </p>
              <p className="text-2xl font-bold mt-1">{condutor.pontuacao}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-[10px] text-muted-foreground uppercase">
                Classificação
              </p>
              <div className="mt-2">
                <ClassificationBadge
                  classificacao={condutor.classificacao}
                  tamanho="md"
                />
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-[10px] text-muted-foreground uppercase">
                Gestor
              </p>
              <p className="text-sm font-medium mt-1">{condutor.gestor}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-[10px] text-muted-foreground uppercase">
                Centro de Custo
              </p>
              <p className="text-sm font-medium mt-1">
                {condutor.centroCusto}
              </p>
            </div>
          </div>

          {/* Pontuações Mensais */}
          {condutor.pontuacoesMensais && (
            <div className="bg-card rounded-lg border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-foreground">
                  Pontuações Mensais
                </h3>
                <button
                  onClick={() => setExpandirMeses((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                  aria-label={
                    expandirMeses ? "Colapsar meses" : "Expandir meses"
                  }
                >
                  {expandirMeses ? (
                    <>
                      <ChevronsLeftRight className="w-3.5 h-3.5" />
                      Colapsar
                    </>
                  ) : (
                    <>
                      <Expand className="w-3.5 h-3.5" />
                      Expandir todos
                    </>
                  )}
                </button>
              </div>

              {expandirMeses ? (
                /* Modo expandido: grid completo */
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Object.entries(condutor.pontuacoesMensais).map(
                    ([mes, pts]) => (
                      <div
                        key={mes}
                        className="text-center p-3 rounded-lg bg-muted/50"
                      >
                        <p className="text-[10px] text-muted-foreground">
                          {mes}
                        </p>
                        <p className="text-lg font-bold mt-1">{pts}</p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                /* Modo compacto: carrossel com drag */
                <ScrollCarousel gap="gap-3">
                  {Object.entries(condutor.pontuacoesMensais).map(
                    ([mes, pts]) => (
                      <div
                        key={mes}
                        className="text-center p-3 rounded-lg bg-muted/50 min-w-[180px] shrink-0"
                      >
                        <p className="text-[10px] text-muted-foreground">
                          {mes}
                        </p>
                        <p className="text-lg font-bold mt-1">{pts}</p>
                      </div>
                    )
                  )}
                </ScrollCarousel>
              )}
            </div>
          )}

          {/* Tabela de Eventos */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Eventos Registrados
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-2">Data</th>
                    <th className="text-left py-2 px-2">Tipo</th>
                    <th className="text-left py-2 px-2">Gravidade</th>
                    <th className="text-right py-2 px-2">Impacto</th>
                    <th className="text-right py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.length > 0 ? (
                    eventos.map((evento) => (
                      <tr
                        key={evento.id}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-2 px-2 text-muted-foreground">
                          {evento.data}
                        </td>
                        <td className="py-2 px-2">{evento.tipo}</td>
                        <td
                          className={`py-2 px-2 ${COR_GRAVIDADE[evento.gravidade] || ""}`}
                        >
                          {evento.gravidade}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-[hsl(var(--danger))]">
                          {evento.impactoPontuacao}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${ESTILO_STATUS[evento.status] || ""}`}
                          >
                            {evento.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum evento registrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ==================== ABA ANÁLISE PREDITIVA ==================== */}
        <TabsContent value="preditiva" className="space-y-6 mt-4">
          {/* Seção 1: IRC — Ativa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card rounded-lg border border-border p-5">
              <div className="mb-4">
                <h3 className="font-bold text-foreground">
                  Índice de Risco Composto
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Score preditivo 0–100
                </p>
              </div>

              <GaugeChart
                valor={irc}
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
            </div>

            {/* Composição do IRC — Placeholder */}
            <div className="bg-card rounded-lg border border-border p-5 relative">
              <div className="mb-4">
                <h3 className="font-bold text-foreground">
                  Composição do IRC
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Contribuição por fonte de dados
                </p>
              </div>

              {/* Conteúdo simplificado */}
              <div className="space-y-3 mt-6">
                {[
                  { label: "Telemetria", valor: 45, cor: "#2563eb" },
                  { label: "Multas", valor: 35, cor: "#ca8a04" },
                  { label: "Sinistros", valor: 20, cor: "#dc2626" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm"
                          style={{ background: item.cor }}
                        />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-semibold">{item.valor}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.valor}%`,
                          background: item.cor,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Seções desabilitadas */}
          {[
            {
              titulo: "Evolução Temporal do IRC",
              descricao: "Linha histórica do IRC ao longo do tempo",
            },
            {
              titulo: "Probabilidade de Infração",
              descricao:
                "Estimativa de probabilidade nos próximos 30 dias",
            },
            {
              titulo: "Taxa de Reincidência",
              descricao: "Análise de reincidência por tipo de evento",
            },
            {
              titulo: "Contexto Operacional",
              descricao:
                "Zonas de risco, heatmap e fatores de risco",
            },
          ].map((secao) => (
            <div
              key={secao.titulo}
              className="bg-card rounded-lg border border-border p-5 opacity-60"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h3 className="font-bold text-foreground">
                    {secao.titulo}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {secao.descricao}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Em desenvolvimento — disponível em breve.
              </p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
