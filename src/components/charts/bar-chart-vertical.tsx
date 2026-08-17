/**
 * BarChartVertical — Gráfico de barras verticais genérico
 *
 * Suporta múltiplas séries (barras agrupadas ou empilhadas) e linha de referência.
 * Usado para: Evolução do Comportamento (Ano), Registros de Fadiga por Filial,
 * Evolução do IRC no Ano, ou qualquer gráfico de barras verticais.
 *
 * @example
 * // Barras agrupadas com 4 séries
 * <BarChartVertical
 *   dados={evolucaoAnual}
 *   categoriaKey="mes"
 *   series={[
 *     { dataKey: "referencia", nome: "Referência", cor: "#92D050" },
 *     { dataKey: "baixa", nome: "Baixa", cor: "#EEDA2B" },
 *   ]}
 *   altura={420}
 * />
 *
 * @example
 * // Barras simples com linha de referência (meta)
 * <BarChartVertical
 *   dados={evolucaoMes}
 *   categoriaKey="mes"
 *   series={[{ dataKey: "irc", nome: "IRC", cor: "#2563eb" }]}
 *   linhaReferencia={{ valor: 55, label: "Meta 55", cor: "#dc2626" }}
 *   dominioY={[0, 100]}
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
  ReferenceLine,
} from "recharts";

/** Configuração de uma série de dados (uma barra no gráfico) */
export interface SerieConfig {
  /** Chave no objeto de dados que contém o valor */
  dataKey: string;
  /** Nome exibido na legenda e tooltip */
  nome: string;
  /** Cor da barra (hex ou hsl) */
  cor: string;
  /** ID para empilhamento. Séries com mesmo stackId ficam empilhadas */
  stackId?: string;
}

/** Configuração da linha de referência horizontal */
export interface LinhaReferenciaConfig {
  valor: number;
  label: string;
  cor: string;
}

interface BarChartVerticalProps {
  /** Array de objetos com os dados. Cada objeto representa uma categoria no eixo X */
  dados: Record<string, unknown>[];
  /** Chave do objeto que identifica a categoria (eixo X) */
  categoriaKey: string;
  /** Configuração das séries (barras) */
  series: SerieConfig[];
  /** Altura do gráfico em pixels */
  altura?: number;
  /** Domínio do eixo Y. Ex: [0, 100] */
  dominioY?: [number, number];
  /** Linha de referência horizontal (ex: meta) */
  linhaReferencia?: LinhaReferenciaConfig;
  /** Se true, habilita scroll horizontal e calcula largura mínima */
  scrollHorizontal?: boolean;
  /** Largura por item quando scroll horizontal está ativo */
  larguraPorItem?: number;
  /** Se true, exibe a legenda */
  mostrarLegenda?: boolean;
}

export function BarChartVertical({
  dados,
  categoriaKey,
  series,
  altura = 300,
  dominioY,
  linhaReferencia,
  scrollHorizontal = false,
  larguraPorItem = 80,
  mostrarLegenda = true,
}: BarChartVerticalProps) {
  const larguraMinima = scrollHorizontal
    ? Math.max(dados.length * larguraPorItem, 600)
    : undefined;

  const conteudo = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
        <XAxis dataKey={categoriaKey} tick={{ fontSize: 11 }} interval={0} />
        <YAxis tick={{ fontSize: 11 }} domain={dominioY} />
        <Tooltip />
        {mostrarLegenda && (
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        )}
        {series.map((serie) => (
          <Bar
            key={serie.dataKey}
            dataKey={serie.dataKey}
            name={serie.nome}
            fill={serie.cor}
            stackId={serie.stackId}
            radius={[2, 2, 0, 0]}
          />
        ))}
        {linhaReferencia && (
          <ReferenceLine
            y={linhaReferencia.valor}
            stroke={linhaReferencia.cor}
            strokeDasharray="4 4"
            label={{
              value: linhaReferencia.label,
              position: "right",
              fontSize: 10,
              fill: linhaReferencia.cor,
            }}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );

  if (scrollHorizontal) {
    return (
      <div className="overflow-x-auto">
        <div style={{ width: `${larguraMinima}px`, height: altura }}>
          {conteudo}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Arraste horizontalmente para visualizar todos os dados
        </p>
      </div>
    );
  }

  return <div style={{ height: altura }}>{conteudo}</div>;
}
