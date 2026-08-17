/**
 * Charts — Barrel export dos componentes de gráficos genéricos
 *
 * Todos os componentes de gráfico ficam centralizados aqui para
 * facilitar importação em qualquer página ou componente.
 *
 * @example
 * import { BarChartVertical, BarChartHorizontal, GaugeChart, HeatmapGrid } from "@/components/charts";
 */

export { BarChartVertical } from "./bar-chart-vertical";
export type { SerieConfig, LinhaReferenciaConfig } from "./bar-chart-vertical";

export { BarChartHorizontal } from "./bar-chart-horizontal";

export { GaugeChart } from "./gauge-chart";
export type { FaixaConfig } from "./gauge-chart";

export { HeatmapGrid } from "./heatmap-grid";
export type { FaixaCorHeatmap } from "./heatmap-grid";
