/**
 * DriverPredictiveTab — Aba "Análise Preditiva" do detalhe do condutor.
 *
 * Só o Índice de Risco Composto (IRC) está ativo e é DERIVADO da pontuação real do ranking
 * (heurística provisória: inverso da pontuação, limitado a 5–95). A composição do IRC e as demais
 * seções ainda são placeholders (V1) — não há endpoints no backend para elas.
 *
 * TODO(backend): trocar o IRC derivado e a composição por endpoints preditivos reais.
 *
 * @example
 * <DriverPredictiveTab pontuacao={data.indicators.current_month_score} />
 */

import { Lock } from "lucide-react";
import { GaugeChart } from "@/components/charts";

/** Faixas de cores do IRC para o GaugeChart */
const FAIXAS_IRC = [
  { ate: 30, cor: "#16a34a", label: "Baixo Risco" },
  { ate: 60, cor: "#ca8a04", label: "Risco Moderado" },
  { ate: 80, cor: "#dc2626", label: "Alto Risco" },
  { ate: 100, cor: "#7c3aed", label: "Risco Crítico" },
];

const COMPOSICAO_IRC = [
  { label: "Telemetria", valor: 45, cor: "#2563eb" },
  { label: "Multas", valor: 35, cor: "#ca8a04" },
  { label: "Sinistros", valor: 20, cor: "#dc2626" },
];

const SECOES_EM_DESENVOLVIMENTO = [
  { titulo: "Evolução Temporal do IRC", descricao: "Linha histórica do IRC ao longo do tempo" },
  { titulo: "Probabilidade de Infração", descricao: "Estimativa de probabilidade nos próximos 30 dias" },
  { titulo: "Taxa de Reincidência", descricao: "Análise de reincidência por tipo de evento" },
  { titulo: "Contexto Operacional", descricao: "Zonas de risco, heatmap e fatores de risco" },
];

interface DriverPredictiveTabProps {
  /** Pontuação atual do condutor (0–100). `null` assume 50. */
  pontuacao: number | null;
}

export function DriverPredictiveTab({ pontuacao }: DriverPredictiveTabProps) {
  const irc = Math.max(5, Math.min(95, 100 - (pontuacao ?? 50)));

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="mb-4">
            <h3 className="font-bold text-foreground">Índice de Risco Composto</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Score preditivo 0–100</p>
          </div>

          <GaugeChart valor={irc} maximo={100} faixas={FAIXAS_IRC} sufixo="/ 100" />

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
            <h3 className="font-bold text-foreground">Composição do IRC</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Contribuição por fonte de dados</p>
          </div>

          <div className="space-y-3 mt-6">
            {COMPOSICAO_IRC.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ background: item.cor }} />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-semibold">{item.valor}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.valor}%`, background: item.cor }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seções desabilitadas */}
      {SECOES_EM_DESENVOLVIMENTO.map((secao) => (
        <div key={secao.titulo} className="bg-card rounded-lg border border-border p-5 opacity-60">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="font-bold text-foreground">{secao.titulo}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{secao.descricao}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Em desenvolvimento — disponível em breve.
          </p>
        </div>
      ))}
    </>
  );
}
