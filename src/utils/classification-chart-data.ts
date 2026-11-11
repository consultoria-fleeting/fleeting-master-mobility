import type { ClassificationCount } from "@/types/driver-scoring";
import { getClassificationStyle, type ClassificationLevel } from "@/utils/driver-scoring-helpers";

/**
 * Transformação dos dados de classificação da API em dados para os gráficos de barras.
 *
 * Padroniza as 4 séries na ordem e nomenclatura do Lovable (`Ref.`, `Baixa`, `Média`, `Alta`),
 * mapeando os labels dinâmicos retornados pela API pelo seu nível semântico.
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
  /** Uma linha por grupo: `{ name, referencia, baixa, media, alta }`. */
  rows: Record<string, string | number>[];
  series: ClassificationSeries[];
}

const LEVELS_PADRAO: { level: Exclude<ClassificationLevel, "desconhecida">; nome: string }[] = [
  { level: "referencia", nome: "Ref." },
  { level: "baixa", nome: "Baixa" },
  { level: "media", nome: "Média" },
  { level: "alta", nome: "Alta" },
];

/**
 * Monta linhas e séries do gráfico sempre na ordem: Ref., Baixa, Média e Alta.
 * @param groups Grupos retornados pela API.
 * @param stackId Se informado, as séries ficam empilhadas.
 */
export function buildClassificationChartData(
  groups: ClassificationGroup[],
  stackId?: string,
): ClassificationChartData {
  const rows = groups.map((group) => {
    const row: Record<string, string | number> = {
      name: group.name,
      referencia: 0,
      baixa: 0,
      media: 0,
      alta: 0,
    };

    for (const item of group.classifications) {
      const { level } = getClassificationStyle(item.label);
      if (level !== "desconhecida") {
        row[level] = (Number(row[level]) || 0) + item.count;
      }
    }

    return row;
  });

  const series: ClassificationSeries[] = LEVELS_PADRAO.map(({ level, nome }) => ({
    dataKey: level,
    nome,
    cor: getClassificationStyle(level).color,
    stackId,
  }));

  return { rows, series };
}
