/**
 * Funções puras do drawer "TCO do Mês" (cálculos e formatação).
 *
 * Ficam separadas dos componentes para serem fáceis de testar e reaproveitar
 * quando os dados vierem da API.
 */

import type { CategoriaTcoId, MesTco } from "@/types/torre-de-controle";

const formatoMoedaInteira = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const formatoDecimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** 87400 → "R$ 87,4 mil" | 950 → "R$ 950" */
export function formatarMoedaCompacta(valor: number): string {
  if (Math.abs(valor) < 1000) return formatoMoedaInteira.format(valor);
  return `R$ ${formatoDecimal.format(valor / 1000)} mil`;
}

/** 1680.77 → "R$ 1.681" */
export function formatarMoeda(valor: number): string {
  return formatoMoedaInteira.format(valor);
}

/** 80000 → "80k" (rótulos curtos do eixo Y) */
export function formatarEixoMil(valor: number): string {
  return valor === 0 ? "0" : `${Math.round(valor / 1000)}k`;
}

/** 2.94 → "2,9%" (sempre sem sinal; o sinal é indicado pela seta) */
export function formatarPercentual(valor: number): string {
  return `${formatoDecimal.format(Math.abs(valor))}%`;
}

/** Soma os custos do mês considerando apenas as categorias informadas */
export function totalDoMes(mes: MesTco, categorias: CategoriaTcoId[]): number {
  return categorias.reduce((soma, id) => soma + mes.custos[id], 0);
}

/** Variação percentual entre dois valores. Retorna `null` quando não há base de comparação. */
export function variacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return ((atual - anterior) / anterior) * 100;
}

