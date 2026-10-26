/**
 * Clustering em grade de pixels (sem biblioteca externa).
 *
 * Implementação fiel à seção 5 de `MAPA_REFERENCIA_VISUAL.md`:
 * projeta cada veículo em Mercator, agrupa por célula de `raio` px no zoom atual
 * e devolve clusters (com contagem por status) ou veículos isolados.
 * Roda em milissegundos para milhares de pontos.
 */

import type {
  ContagemStatus,
  ItemCluster,
  StatusVeiculo,
  VeiculoFrota,
} from "@/types/frota-mapa";
import { ZOOM_SEM_CLUSTER } from "./config";

/** Projeção Mercator normalizada (0..1) */
function latLngParaPonto(lat: number, lng: number) {
  const seno = Math.sin((lat * Math.PI) / 180);
  return {
    x: (lng + 180) / 360,
    y: 0.5 - (0.25 * Math.log((1 + seno) / (1 - seno))) / Math.PI,
  };
}

interface CelulaGrade {
  veiculos: VeiculoFrota[];
  somaLat: number;
  somaLng: number;
  statusCounts: ContagemStatus;
}

export function clusterVehicles(
  veiculos: VeiculoFrota[],
  zoom: number,
  raio = 60
): ItemCluster[] {
  if (zoom >= ZOOM_SEM_CLUSTER) {
    return veiculos.map((v) => ({ isCluster: false, data: v, lat: v.lat, lng: v.lng }));
  }

  const tamanhoMundo = 256 * Math.pow(2, zoom); // tamanho do mundo em px neste zoom
  const grade = new Map<string, CelulaGrade>();

  for (const v of veiculos) {
    const { x, y } = latLngParaPonto(v.lat, v.lng);
    const chave = `${Math.floor((x * tamanhoMundo) / raio)}_${Math.floor((y * tamanhoMundo) / raio)}`;
    let celula = grade.get(chave);
    if (!celula) {
      celula = {
        veiculos: [],
        somaLat: 0,
        somaLng: 0,
        statusCounts: { in_transit: 0, parked: 0, depot: 0, maintenance: 0 },
      };
      grade.set(chave, celula);
    }
    celula.veiculos.push(v);
    celula.somaLat += v.lat;
    celula.somaLng += v.lng;
    celula.statusCounts[v.status]++;
  }

  return [...grade.values()].map((c): ItemCluster => {
    if (c.veiculos.length === 1) {
      const v = c.veiculos[0];
      return { isCluster: false, data: v, lat: v.lat, lng: v.lng };
    }
    const lats = c.veiculos.map((v) => v.lat);
    const lngs = c.veiculos.map((v) => v.lng);
    const statusDominante = (Object.entries(c.statusCounts) as [StatusVeiculo, number][])
      .sort((a, b) => b[1] - a[1])[0][0];

    return {
      isCluster: true,
      count: c.veiculos.length,
      lat: c.somaLat / c.veiculos.length,
      lng: c.somaLng / c.veiculos.length,
      bounds: [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      statusCounts: c.statusCounts,
      dominantStatus: statusDominante,
    };
  });
}
