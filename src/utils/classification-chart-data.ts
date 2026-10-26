import type { ClassificationCount } from "@/types/driver-scoring";
import { getClassificationStyle } from "@/utils/driver-scoring-helpers";

/**
 * Transformação dos dados de classificação da API em dados para os gráficos de barras.
 *
 * As classificações são dinâmicas por organização (ex.: "Referência", "Baixa Exposição ao Risco"),
 * então as séries do gráfico são montadas a partir dos próprios dados retornados.
 * Usamos chaves seguras (`c0`, `c1`...) no `dataKey`, pois o Recharts interpreta "." como caminho.
 */

/** Item de entrada: um grupo (unidade, mês etc.) com suas contagens por classificação. */
export interface ClassificationGroup {
  name: string;
  classifications: ClassificationCount[];
}

/** Série pronta para os componentes `BarChartVertical`/`BarChartHorizontal`. */
export interface ClassificationSeries {
  dataKey: string;
  nome: string;
  cor: string;
  stackId?: string;
}

export interface ClassificationChartData {
  /** Uma linha por grupo: `{ name, c0, c1, ... }`. */
  rows: Record<string, string | number>[];
  series: ClassificationSeries[];
}

/**
 * Monta linhas e séries do gráfico.
 * @param groups Grupos retornados pela API.
 * @param stackId Se informado, as séries ficam empilhadas.
 */
export function buildClassificationChartData(
  groups: ClassificationGroup[],
  stackId?: string,
): ClassificationChartData {
  // Ordem das séries = ordem das classificações da API (melhor -> pior).
  const labels: string[] = [];
  for (const group of groups) {
    for (const { label } of group.classifications) {
      if (!labels.includes(label)) labels.push(label);
    }
  }

  const rows = groups.map((group) => {
    const row: Record<string, string | number> = { name: group.name };
    labels.forEach((label, index) => {
      const found = group.classifications.find((item) => item.label === label);
      row[`c${index}`] = found?.count ?? 0;
    });
    return row;
  });

  const series = labels.map((label, index) => ({
    dataKey: `c${index}`,
    nome: label,
    cor: getClassificationStyle(label).color,
    stackId,
  }));

  return { rows, series };
}
