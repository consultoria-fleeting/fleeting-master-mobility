/**
 * MapControls — Controles flutuantes do mapa.
 *
 * Botão "Brasil" (volta ao enquadramento nacional), zoom +/- (usa
 * `map.zoomIn()/zoomOut()` diretamente — resolve a limitação 6 da spec)
 * e seletor de camada base (Claro / Padrão / Escuro).
 */

"use client";

import { useState } from "react";
import { Layers, Minus, Plus, Earth } from "lucide-react";
import { cn } from "@/lib/utils";
import { TILE_CONFIGS, type EstiloTile } from "./config";

interface MapControlsProps {
  estiloTile: EstiloTile;
  onEstiloTileChange: (estilo: EstiloTile) => void;
  onVoltarBrasil: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const CLASSE_BOTAO =
  "flex h-8 w-8 items-center justify-center text-[#1E1B4B] transition-colors hover:bg-[#EEF2FF] hover:text-[#4F46E5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]";

export function MapControls({
  estiloTile,
  onEstiloTileChange,
  onVoltarBrasil,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  const [menuCamadasAberto, setMenuCamadasAberto] = useState(false);

  return (
    <div className="absolute right-3 top-3 z-[500] flex flex-col items-end gap-2">
      <div className="flex flex-col overflow-hidden rounded-[10px] border border-[#E7E7F0] bg-white/95 shadow-md backdrop-blur">
        <button id="mapa-btn-brasil" type="button" onClick={onVoltarBrasil} className={CLASSE_BOTAO} title="Ver Brasil inteiro" aria-label="Ver Brasil inteiro">
          <Earth className="h-4 w-4" />
        </button>
        <span className="h-px bg-[#E7E7F0]" />
        <button id="mapa-btn-zoom-in" type="button" onClick={onZoomIn} className={CLASSE_BOTAO} title="Aproximar" aria-label="Aproximar">
          <Plus className="h-4 w-4" />
        </button>
        <span className="h-px bg-[#E7E7F0]" />
        <button id="mapa-btn-zoom-out" type="button" onClick={onZoomOut} className={CLASSE_BOTAO} title="Afastar" aria-label="Afastar">
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        <button
          id="mapa-btn-camadas"
          type="button"
          onClick={() => setMenuCamadasAberto((aberto) => !aberto)}
          className={cn(CLASSE_BOTAO, "rounded-[10px] border border-[#E7E7F0] bg-white/95 shadow-md backdrop-blur")}
          title="Camada base"
          aria-label="Selecionar camada base"
          aria-expanded={menuCamadasAberto}
        >
          <Layers className="h-4 w-4" />
        </button>

        {menuCamadasAberto && (
          <div className="absolute right-10 top-0 w-32 overflow-hidden rounded-[10px] border border-[#E7E7F0] bg-white p-1 shadow-lg animate-fade-in">
            {(Object.keys(TILE_CONFIGS) as EstiloTile[]).map((estilo) => (
              <button
                key={estilo}
                type="button"
                onClick={() => {
                  onEstiloTileChange(estilo);
                  setMenuCamadasAberto(false);
                }}
                className={cn(
                  "w-full rounded-md px-2.5 py-1.5 text-left text-[11.5px] font-medium transition-colors",
                  estilo === estiloTile
                    ? "bg-[#EEF2FF] text-[#4F46E5]"
                    : "text-[#334155] hover:bg-[#F4F4F8]"
                )}
              >
                {TILE_CONFIGS[estilo].label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
