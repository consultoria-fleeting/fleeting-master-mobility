/**
 * HeatmapGrid — Grid de calor genérico
 *
 * Exibe uma matriz de cores (heatmap) com labels configuráveis
 * nos eixos Y (linhas) e X (colunas). Suporta tooltip e legenda de cores.
 *
 * Usado para: Heatmap de risco por dia × hora, ou qualquer visualização
 * de matriz de intensidade (ex: ocupação por dia/hora, erros por módulo/sprint).
 *
 * @example
 * <HeatmapGrid
 *   dados={matrizDeValores}
 *   labelsLinha={["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]}
 *   labelsColuna={Array.from({ length: 24 }, (_, h) => `${h}h`)}
 *   faixasCor={[
 *     { ate: 0.2, cor: "#dcfce7" },
 *     { ate: 0.4, cor: "#fef9c3" },
 *     { ate: 0.6, cor: "#fed7aa" },
 *     { ate: 0.8, cor: "#fecaca" },
 *     { ate: 1.0, cor: "#dc2626" },
 *   ]}
 *   formatarTooltip={(linha, coluna, valor) =>
 *     `${labelsLinha[linha]} ${labelsColuna[coluna]} — ${(valor * 100).toFixed(0)}%`
 *   }
 * />
 */

"use client";

import { Fragment } from "react";

/** Faixa de cor para o heatmap */
export interface FaixaCorHeatmap {
  /** Valor limite superior da faixa (0-1 normalizado, ou valor absoluto) */
  ate: number;
  /** Cor da faixa (hex) */
  cor: string;
}

interface HeatmapGridProps {
  /** Matriz de valores. dados[linha][coluna] = valor numérico */
  dados: number[][];
  /** Labels para as linhas (eixo Y à esquerda) */
  labelsLinha: string[];
  /** Labels para as colunas (eixo X no topo) */
  labelsColuna: string[];
  /** Faixas de cores ordenadas por 'ate'. O valor é comparado para determinar a cor */
  faixasCor: FaixaCorHeatmap[];
  /** Função para formatar o texto do tooltip de cada célula */
  formatarTooltip?: (linhaIndex: number, colunaIndex: number, valor: number) => string;
  /** Label de intensidade baixa (legenda) */
  labelBaixa?: string;
  /** Label de intensidade alta (legenda) */
  labelAlta?: string;
  /** Largura mínima do grid em pixels (para scroll horizontal) */
  larguraMinima?: number;
}

export function HeatmapGrid({
  dados,
  labelsLinha,
  labelsColuna,
  faixasCor,
  formatarTooltip,
  labelBaixa = "Baixa",
  labelAlta = "Alta",
  larguraMinima = 800,
}: HeatmapGridProps) {
  /** Determina a cor de uma célula com base no valor e nas faixas */
  function getCorCelula(valor: number): string {
    for (const faixa of faixasCor) {
      if (valor < faixa.ate) {
        return faixa.cor;
      }
    }
    // Retorna a última cor se ultrapassar todas as faixas
    return faixasCor[faixasCor.length - 1].cor;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-[2px]"
          style={{
            gridTemplateColumns: `40px repeat(${labelsColuna.length}, 1fr)`,
            minWidth: larguraMinima,
          }}
        >
          {/* Header: célula vazia + labels das colunas */}
          <div />
          {labelsColuna.map((label, index) => (
            <div
              key={index}
              className="text-[9px] text-center text-muted-foreground"
            >
              {label}
            </div>
          ))}

          {/* Corpo: label da linha + células de calor */}
          {dados.map((linha, linhaIndex) => (
            <Fragment key={`row-${linhaIndex}`}>
              <div className="text-[10px] text-muted-foreground font-medium flex items-center">
                {labelsLinha[linhaIndex]}
              </div>
              {linha.map((valor, colunaIndex) => (
                <div
                  key={`${linhaIndex}-${colunaIndex}`}
                  className="aspect-square rounded-sm"
                  style={{ background: getCorCelula(valor) }}
                  title={
                    formatarTooltip
                      ? formatarTooltip(linhaIndex, colunaIndex, valor)
                      : `${valor}`
                  }
                />
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>{labelBaixa}</span>
        {faixasCor.map((faixa) => (
          <div
            key={faixa.cor}
            className="w-6 h-3 rounded-sm"
            style={{ background: faixa.cor }}
          />
        ))}
        <span>{labelAlta}</span>
      </div>
    </div>
  );
}
