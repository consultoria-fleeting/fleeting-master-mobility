/**
 * BarChartHorizontal — Gráfico de barras horizontais genérico
 *
 * Suporta múltiplas séries (empilhadas ou agrupadas) e barra única.
 * Usado para: Condutores por Unidade x Comportamento, por Departamento,
 * por Filial, Eventos por Parâmetro do Ranking, ou qualquer gráfico
 * de barras horizontais.
 *
 * @example
 * // Barras empilhadas (distribuição por classificação)
 * <BarChartHorizontal
 *   dados={condutoresPorUnidade}
 *   categoriaKey="negocio"
 *   series={[
 *     { dataKey: "referencia", nome: "Ref.", cor: "#92D050", stackId: "s" },
 *     { dataKey: "baixa", nome: "Baixa", cor: "#EEDA2B", stackId: "s" },
 *   ]}
 * />
 *
 * @example
 * // Barra única (quantidade por categoria)
 * <BarChartHorizontal
 *   dados={eventosPorParametro}
 *   categoriaKey="parametro"
 *   series={[{ dataKey: "total", nome: "Total", cor: "#2563eb" }]}
 *   larguraLabel={160}
 * />
 */

"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { SerieConfig } from "@/components/charts/bar-chart-vertical";

interface BarChartHorizontalProps {
  /** Array de objetos com os dados. Cada objeto representa uma categoria no eixo Y */
  dados: Record<string, unknown>[];
  /** Chave do objeto que identifica a categoria (eixo Y) */
  categoriaKey: string;
  /** Configuração das séries (barras) */
  series: SerieConfig[];
  /** Altura do gráfico em pixels */
  altura?: number;
  /** Largura da coluna de labels (eixo Y) */
  larguraLabel?: number;
  /** Se true, exibe a legenda */
  mostrarLegenda?: boolean;
}

export function BarChartHorizontal({
  dados,
  categoriaKey,
  series,
  altura = 250,
  larguraLabel = 100,
  mostrarLegenda = true,
}: BarChartHorizontalProps) {
  return (
    <div style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            dataKey={categoriaKey}
            type="category"
            width={larguraLabel}
            tick={{ fontSize: 10 }}
          />
          <Tooltip />
          {mostrarLegenda && (
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          )}
          {series.map((serie) => (
            <Bar
              key={serie.dataKey}
              dataKey={serie.dataKey}
              name={serie.nome}
              fill={serie.cor}
              stackId={serie.stackId}
              radius={serie.stackId ? undefined : [0, 4, 4, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
