/**
 * KmChart — Mini gráfico de barras "KMs Rodados" (12 meses).
 *
 * Feito com CSS puro (sem Recharts) para reproduzir fielmente o protótipo:
 * barras #C7D2FE, mês de destaque em ouro (#D4AB00), letra do mês embaixo
 * e tooltip com o valor no hover. As barras "crescem" ao montar.
 */

import type { BarraKm } from "@/types/torre-de-controle";
import { TorreCard } from "./torre-card";

interface KmChartProps {
  barras: BarraKm[];
  ano: string;
  totalKm: number;
  className?: string;
}

const formatoNumero = new Intl.NumberFormat("pt-BR");

export function KmChart({ barras, ano, totalKm, className }: KmChartProps) {
  const maximo = Math.max(...barras.map((b) => b.km));

  return (
    <TorreCard
      titulo="KMs Rodados"
      className={className}
      corpoClassName="flex flex-col px-4 pb-2.5"
      extraCabecalho={
        <span className="text-[11px] text-[#94A3B8]">
          {ano} · <strong className="font-semibold text-[#1E1B4B]">{formatoNumero.format(totalKm)} km</strong>
        </span>
      }
    >
      <div className="flex min-h-0 flex-1 items-end gap-1.5">
        {barras.map((barra, indice) => (
          <div key={barra.mesCompleto} className="group relative flex h-full flex-1 flex-col items-center justify-end">
            {/* Tooltip */}
            <span className="pointer-events-none absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-md bg-[#1E1B4B] px-1.5 py-0.5 text-[9.5px] font-semibold text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
              {barra.mesCompleto}: {formatoNumero.format(barra.km)} km
            </span>
            <span
              className="w-full origin-bottom rounded-t-[4px] transition-[filter] duration-200 group-hover:brightness-90 animate-[barra-crescer_0.6s_ease-out_backwards]"
              style={{
                height: `${(barra.km / maximo) * 100}%`,
                background: barra.destaque ? "#D4AB00" : "#C7D2FE",
                animationDelay: `${indice * 35}ms`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5">
        {barras.map((barra) => (
          <span
            key={barra.mesCompleto}
            className={`flex-1 text-center text-[9px] font-medium ${barra.destaque ? "text-[#D4AB00]" : "text-[#94A3B8]"}`}
          >
            {barra.mes}
          </span>
        ))}
      </div>
    </TorreCard>
  );
}
