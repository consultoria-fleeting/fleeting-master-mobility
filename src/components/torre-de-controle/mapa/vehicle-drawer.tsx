/**
 * VehicleDrawer — Painel lateral com o detalhe de um veículo.
 *
 * Ordem (spec, seção 7): placa Mercosul + modelo/categoria/id → status e
 * horário da transmissão → posição no último GET (endereço, lat/lng, copiar,
 * centralizar, link OSM) → telemetria (velocidade, odômetro, combustível,
 * bateria) → alocação → condutor.
 *
 * Usa o Sheet do shadcn/ui. O telefone do condutor é exibido mascarado (PII).
 */

"use client";

import { useState } from "react";
import {
  BatteryMedium,
  Check,
  Copy,
  Crosshair,
  ExternalLink,
  Fuel,
  Gauge,
  MapPin,
  Navigation,
  Phone,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { VeiculoFrota } from "@/types/frota-mapa";
import { PlacaMercosul } from "../placa-mercosul";
import { CATEGORIA_CONFIG, STATUS_CONFIG } from "./config";

interface VehicleDrawerProps {
  veiculo: VeiculoFrota | null;
  onFechar: () => void;
  onCentralizar: (veiculo: VeiculoFrota) => void;
}

/** "(11) 98765-4321" → "(11) 9••••-4321" */
function mascararTelefone(telefone: string): string {
  return telefone.replace(/(\(\d{2}\) \d)\d{4}(-\d{4})/, "$1••••$2");
}

function iniciais(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

const formatoNumero = new Intl.NumberFormat("pt-BR");

/* ---------- Subcomponentes internos ---------- */

function TituloSecao({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
      {children}
    </h3>
  );
}

interface MetricaTelemetriaProps {
  icone: LucideIcon;
  label: string;
  valor: string;
  /** 0–100: exibe barra de progresso */
  percentual?: number;
}

function MetricaTelemetria({ icone: Icone, label, valor, percentual }: MetricaTelemetriaProps) {
  const corBarra =
    percentual === undefined ? "" : percentual < 25 ? "#E11D48" : percentual < 50 ? "#D97706" : "#4F46E5";

  return (
    <div className="rounded-xl border border-[#E7E7F0] bg-[#FAFAFD] p-3">
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#64748B]">
        <Icone className="h-3.5 w-3.5 text-[#818CF8]" />
        {label}
      </div>
      <div className="mt-1 text-[17px] font-semibold tabular-nums text-[#1E1B4B]">{valor}</div>
      {percentual !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E0E7FF]">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${percentual}%`, background: corBarra }}
          />
        </div>
      )}
    </div>
  );
}

/* ---------- Componente principal ---------- */

export function VehicleDrawer({ veiculo, onFechar, onCentralizar }: VehicleDrawerProps) {
  const [copiado, setCopiado] = useState(false);

  async function copiarCoordenadas(v: VeiculoFrota) {
    try {
      await navigator.clipboard.writeText(`${v.lat}, ${v.lng}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // Clipboard indisponível (ex.: contexto não seguro) — falha silenciosa na demo.
    }
  }

  return (
    <Sheet open={veiculo !== null} onOpenChange={(aberto) => !aberto && onFechar()}>
      <SheetContent side="right" className="font-poppins rolagem-suave w-full gap-0 overflow-y-auto border-[#E7E7F0] bg-white p-0 sm:max-w-[400px]">
        {veiculo && (
          <>
            {/* Cabeçalho */}
            <SheetHeader className="gap-3 border-b border-[#E7E7F0] bg-gradient-to-br from-[#EEF2FF] to-white p-5 pr-12">
              <PlacaMercosul placa={veiculo.plate} tamanho="md" />
              <div>
                <SheetTitle className="text-[17px] font-semibold text-[#1E1B4B]">{veiculo.model}</SheetTitle>
                <SheetDescription className="text-[11.5px] text-[#64748B]">
                  {CATEGORIA_CONFIG[veiculo.category].label} · {veiculo.fuelType} · {veiculo.id}
                </SheetDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                  style={{ background: STATUS_CONFIG[veiculo.status].cor }}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  {STATUS_CONFIG[veiculo.status].label}
                </span>
                <span className="text-[10.5px] text-[#64748B]">{veiculo.lastTransmission}</span>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-5">
              {/* Alerta ativo */}
              {veiculo.alerta && (
                <div
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-3 text-[12px]",
                    veiculo.alerta.nivel === "critico"
                      ? "border-[#E11D48]/25 bg-[#E11D48]/[0.07] text-[#9F1239]"
                      : "border-[#D97706]/25 bg-[#D97706]/[0.08] text-[#92400E]"
                  )}
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">
                      {veiculo.alerta.nivel === "critico" ? "Alerta crítico" : "Requer atenção"}
                    </p>
                    <p className="opacity-90">{veiculo.alerta.descricao}</p>
                  </div>
                </div>
              )}

              {/* Posição */}
              <section>
                <TituloSecao>Posição no último GET</TituloSecao>
                <div className="rounded-xl border border-[#E7E7F0] p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#4F46E5]" />
                    <p className="text-[12px] leading-snug text-[#334155]">{veiculo.address}</p>
                  </div>
                  <p className="mt-2 font-mono text-[11px] text-[#64748B]">
                    {veiculo.lat.toFixed(5)}, {veiculo.lng.toFixed(5)}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => copiarCoordenadas(veiculo)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E7E7F0] px-2 py-1.5 text-[11px] font-medium text-[#334155] transition-colors hover:border-[#C7D2FE] hover:text-[#4F46E5]"
                    >
                      {copiado ? <Check className="h-3.5 w-3.5 text-[#059669]" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiado ? "Copiado" : "Copiar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCentralizar(veiculo)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#4F46E5] px-2 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#4338CA]"
                    >
                      <Crosshair className="h-3.5 w-3.5" />
                      Centralizar
                    </button>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${veiculo.lat}&mlon=${veiculo.lng}#map=17/${veiculo.lat}/${veiculo.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E7E7F0] px-2 py-1.5 text-[11px] font-medium text-[#334155] transition-colors hover:border-[#C7D2FE] hover:text-[#4F46E5]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      OSM
                    </a>
                  </div>
                </div>
              </section>

              {/* Telemetria */}
              <section>
                <TituloSecao>Telemetria</TituloSecao>
                <div className="grid grid-cols-2 gap-2">
                  <MetricaTelemetria icone={Navigation} label="Velocidade" valor={`${veiculo.speed} km/h`} />
                  <MetricaTelemetria icone={Gauge} label="Odômetro" valor={`${formatoNumero.format(veiculo.odometer)} km`} />
                  <MetricaTelemetria icone={Fuel} label="Combustível" valor={`${veiculo.fuelLevel}%`} percentual={veiculo.fuelLevel} />
                  <MetricaTelemetria icone={BatteryMedium} label="Bateria" valor={`${veiculo.batteryLevel}%`} percentual={veiculo.batteryLevel} />
                </div>
              </section>

              {/* Alocação */}
              <section>
                <TituloSecao>Alocação</TituloSecao>
                <dl className="grid grid-cols-3 gap-2 text-[11.5px]">
                  {[
                    { label: "Grupo", valor: veiculo.grupo },
                    { label: "Filial", valor: veiculo.filial },
                    { label: "Locadora", valor: veiculo.locadora },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-[#F4F4F8] px-2.5 py-2">
                      <dt className="text-[10px] text-[#94A3B8]">{item.label}</dt>
                      <dd className="truncate font-semibold text-[#1E1B4B]" title={item.valor}>{item.valor}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Condutor */}
              <section>
                <TituloSecao>Condutor</TituloSecao>
                <div className="flex items-center gap-3 rounded-xl bg-[#1E1B4B] p-3 text-white">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[13px] font-bold">
                    {iniciais(veiculo.driver)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold">{veiculo.driver}</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-[#A5B4FC]">
                      <Phone className="h-3 w-3" />
                      {mascararTelefone(veiculo.driverPhone)}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
