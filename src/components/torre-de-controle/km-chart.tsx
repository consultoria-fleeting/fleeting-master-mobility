/**
 * KmChart — Gráfico de barras "KM rodado nos últimos 12 meses" (Torre de Controle V1).
 *
 * Janela móvel com os 12 meses fechados mais recentes em relação ao período
 * filtrado no cabeçalho (ex.: Nov/25 – Out/26), dimensionado para caber
 * perfeitamente na segunda linha do grid Full HD (1920×1080) sem gerar scroll.
 */

"use client";

import type { BarraKm } from "@/types/torre-de-controle";
import { TorreCard } from "./torre-card";

interface KmChartProps {
  barras: BarraKm[];
  totalKm: number;
  className?: string;
}

const formatoNumero = new Intl.NumberFormat("pt-BR");

export function KmChart({ barras, totalKm, className }: KmChartProps) {
  const maximo = Math.max(1, ...barras.map((b) => b.km));

  return (
    <TorreCard
      titulo="KM Rodado nos Últimos 12 Meses"
      className={className}
      corpoClassName="flex flex-col px-4 pb-2.5"
      extraCabecalho={
        <strong className="text-[11.5px] font-semibold tabular-nums text-[#1E1B4B]">
          {formatoNumero.format(totalKm)} km
        </strong>
      }
    >
      <div className="flex min-h-0 flex-1 items-end gap-1.5 pt-1.5">
        {barras.map((barra, indice) => (
          <div
            key={barra.chave}
            className="group relative flex h-full flex-1 flex-col items-center justify-end"
          >
            {/* Tooltip */}
            <span className="pointer-events-none absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-md bg-[#1E1B4B] px-1.5 py-0.5 text-[9.5px] font-semibold text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
              {barra.mesCompleto}: {formatoNumero.format(barra.km)} km
            </span>
            <span
              className="w-full origin-bottom rounded-t-[4px] transition-[filter] duration-200 group-hover:brightness-90 animate-[barra-crescer_0.6s_ease-out_backwards]"
              style={{
                height: `${Math.max(8, (barra.km / maximo) * 100)}%`,
                background: barra.destaque ? "#4F46E5" : "#C7D2FE",
                animationDelay: `${indice * 30}ms`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        {barras.map((barra) => (
          <span
            key={barra.chave}
            className={`flex-1 truncate text-center text-[9px] font-medium ${
              barra.destaque ? "font-bold text-[#4F46E5]" : "text-[#94A3B8]"
            }`}
          >
            {barra.mes}
          </span>
        ))}
      </div>
    </TorreCard>
  );
}
