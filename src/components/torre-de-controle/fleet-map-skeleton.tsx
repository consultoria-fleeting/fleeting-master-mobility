/**
 * FleetMapSkeleton — Placeholder do mapa enquanto o chunk do Leaflet carrega.
 *
 * Usado como `loading` do `next/dynamic` (o mapa roda com `ssr: false`).
 * Tem a mesma altura e estrutura do card do mapa para evitar layout shift.
 */

import { Skeleton } from "@/components/ui/skeleton";

export function FleetMapSkeleton() {
  return (
    <div
      className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[#E7E7F0] bg-white"
      role="status"
      aria-label="Carregando mapa da frota"
    >
      <div className="flex items-center gap-2 px-4 pb-2 pt-3.5">
        <span className="text-[13px] font-semibold text-[#1E1B4B]">Distribuição da Frota</span>
        <Skeleton className="h-4 w-24 rounded-full bg-[#EEF2FF]" />
      </div>
      <div className="flex flex-col gap-2 px-4 pb-2.5">
        <Skeleton className="h-8 w-full rounded-[9px] bg-[#F4F4F8]" />
        <div className="flex gap-1.5">
          {[64, 80, 52, 76].map((largura) => (
            <Skeleton key={largura} className="h-5 rounded-full bg-[#F4F4F8]" style={{ width: largura }} />
          ))}
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center border-t border-[#E7E7F0] bg-gradient-to-br from-[#EEF2FF] via-[#F8F8FC] to-[#E0E7FF]">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_60%_45%,rgba(79,70,229,0.18),transparent_55%)]" />
        <div className="relative flex flex-col items-center gap-2 text-[11px] font-medium text-[#64748B]">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#C7D2FE] border-t-[#4F46E5]" />
          Carregando mapa da frota…
        </div>
      </div>
    </div>
  );
}
