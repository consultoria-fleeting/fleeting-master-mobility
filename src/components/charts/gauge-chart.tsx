/**
 * GaugeChart — Gráfico gauge/medidor radial genérico
 *
 * Exibe um valor em formato de medidor semicircular, com cor dinâmica
 * baseada em faixas configuráveis e badge de nível.
 *
 * Usado para: IRC da Frota, ou qualquer indicador de valor único
 * com ranges de cores (ex: indicador de saúde da frota, score geral, etc.)
 *
 * @example
 * <GaugeChart
 *   valor={62}
 *   maximo={100}
 *   faixas={[
 *     { ate: 30, cor: "#16a34a", label: "Baixo" },
 *     { ate: 60, cor: "#ca8a04", label: "Moderado" },
 *     { ate: 80, cor: "#dc2626", label: "Alto" },
 *     { ate: 100, cor: "#7c3aed", label: "Crítico" },
 *   ]}
 * />
 */

"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";

/** Faixa de valores com cor e label correspondente */
export interface FaixaConfig {
  /** Valor máximo da faixa (exclusivo para a próxima) */
  ate: number;
  /** Cor da faixa (hex) */
  cor: string;
  /** Label textual da faixa (ex: "Baixo", "Moderado") */
  label: string;
}

interface GaugeChartProps {
  /** Valor atual do indicador */
  valor: number;
  /** Valor máximo da escala */
  maximo?: number;
  /** Faixas de cores do gauge. Deve estar ordenado pelo campo 'ate' */
  faixas: FaixaConfig[];
  /** Altura do gráfico em pixels */
  altura?: number;
  /** Sufixo exibido abaixo do valor (ex: "/ 100", "pts") */
  sufixo?: string;
}

export function GaugeChart({
  valor,
  maximo = 100,
  faixas,
  altura = 224,
  sufixo,
}: GaugeChartProps) {
  /** Determina a cor e o label com base no valor e nas faixas configuradas */
  const { cor, label } = useMemo(() => {
    for (const faixa of faixas) {
      if (valor <= faixa.ate) {
        return { cor: faixa.cor, label: faixa.label };
      }
    }
    // Fallback: usa a última faixa
    const ultima = faixas[faixas.length - 1];
    return { cor: ultima.cor, label: ultima.label };
  }, [valor, faixas]);

  const dados = [{ name: "valor", value: valor, fill: cor }];

  return (
    <div>
      <div className="relative" style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={dados}
          >
            <RadialBar
              background={{ fill: "#f1f5f9" }}
              dataKey="value"
              cornerRadius={8}
              max={maximo}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Valor central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className="text-5xl font-bold" style={{ color: cor }}>
            {valor}
          </span>
          {sufixo && (
            <span className="text-xs text-muted-foreground">{sufixo}</span>
          )}
        </div>
      </div>

      {/* Badge de nível */}
      <div className="flex justify-center">
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ background: cor }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
