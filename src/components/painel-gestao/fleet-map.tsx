/**
 * FleetMap — Mapa interativo da frota (Leaflet imperativo, sem react-leaflet).
 *
 * Implementa `MAPA_REFERENCIA_VISUAL.md`:
 * - Modo Macro (zoom < 6): coroplético por região (GeoJSON das UFs do IBGE) +
 *   uma bolha pulsante por UF com a contagem de veículos.
 * - Modo Micro (zoom >= 6): clusters em grade (6–14) e pinos com seta de
 *   direção e placa (>= 15).
 * - Carregamento por viewport em `zoomend`/`moveend` (sem precisar clicar),
 *   com cache por UF na camada de dados.
 * - Drawer de detalhe, filtros, legenda, controles e modo expandido com lista.
 *
 * IMPORTANTE (SSR): o Leaflet depende de `window`. Este componente DEVE ser
 * importado com `next/dynamic` e `{ ssr: false }` (ver `src/app/painel-de-gestao/page.tsx`).
 */

"use client";

import "leaflet/dist/leaflet.css";
import "./mapa/fleet-map.css";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { Crosshair, LoaderCircle, Maximize2, Minimize2, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ComandoFocoMapa,
  ContagemStatus,
  EstadoBrasil,
  FiltrosMapa,
  RegiaoBrasil,
  VeiculoFrota,
} from "@/types/frota-mapa";
import { clusterVehicles } from "./mapa/cluster";
import {
  ATRIBUICAO_OSM,
  ESCALA_REGIAO,
  LIMITES_BRASIL,
  LISTA_REGIOES,
  TILE_CONFIGS,
  ZOOM_FOCO_VEICULO,
  ZOOM_MAX_CLIQUE_CLUSTER,
  ZOOM_MICRO,
  type EstiloTile,
} from "./mapa/config";
import {
  fetchMacro,
  fetchVehicleByPlate,
  fetchVehiclesByMultipleStates,
} from "./mapa/dados-frota";
import {
  criarIconeCluster,
  criarIconeEstado,
  criarIconeVeiculo,
  criarTooltipCluster,
  criarTooltipEstado,
  criarTooltipVeiculo,
} from "./mapa/marcadores";
import { FleetListSidebar } from "./mapa/fleet-list-sidebar";
import { MapControls } from "./mapa/map-controls";
import { MapFilterBar } from "./mapa/map-filter-bar";
import { MapLegend } from "./mapa/map-legend";
import { VehicleDrawer } from "./mapa/vehicle-drawer";

/* ========================================================= */
/*  HELPERS PUROS                                            */
/* ========================================================= */

const FILTROS_INICIAIS: FiltrosMapa = { busca: "", uf: "", status: "todos", categoria: "todas" };

type PropriedadesUf = { uf: string };

/** Remove acentos e caixa para comparar textos na busca */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function filtrarVeiculos(veiculos: VeiculoFrota[], filtros: FiltrosMapa): VeiculoFrota[] {
  const termo = normalizar(filtros.busca.trim());
  return veiculos.filter((v) => {
    if (filtros.uf && v.state !== filtros.uf) return false;
    if (filtros.status !== "todos" && v.status !== filtros.status) return false;
    if (filtros.categoria !== "todas" && v.category !== filtros.categoria) return false;
    if (termo && !normalizar(`${v.plate} ${v.driver} ${v.model}`).includes(termo)) return false;
    return true;
  });
}

/** Total do estado respeitando os filtros que existem no contrato macro (UF e status) */
function totalFiltradoDoEstado(estado: EstadoBrasil, filtros: FiltrosMapa): number {
  if (filtros.uf && estado.uf !== filtros.uf) return 0;
  return filtros.status === "todos" ? estado.vehicleCount : estado.statusCounts[filtros.status];
}

function contarPorStatus(veiculos: VeiculoFrota[]): ContagemStatus {
  const contagem: ContagemStatus = { in_transit: 0, parked: 0, depot: 0, maintenance: 0 };
  veiculos.forEach((v) => contagem[v.status]++);
  return contagem;
}

/* ========================================================= */
/*  COMPONENTE                                               */
/* ========================================================= */

interface FleetMapProps {
  /** Comando externo para focar um veículo (ex.: Assistente de IA, tabela de atenção) */
  comandoFoco?: ComandoFocoMapa | null;
}

export function FleetMap({ comandoFoco = null }: FleetMapProps) {
  /* ---------- Refs do Leaflet ---------- */
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const geoRef = useRef<L.GeoJSON<PropriedadesUf> | null>(null);
  const camadaMacroRef = useRef<L.LayerGroup | null>(null);
  const camadaMicroRef = useRef<L.LayerGroup | null>(null);
  const ufsCarregandoRef = useRef<Set<string>>(new Set());
  const modoMacroRef = useRef(true);
  const estiloGeoRef = useRef<(feature?: Feature<Geometry, PropriedadesUf>) => L.PathOptions>(() => ({}));
  const ultimoTokenFocoRef = useRef<number | null>(null);

  /* ---------- Estado ---------- */
  const [mapaPronto, setMapaPronto] = useState(false);
  const [geoPronto, setGeoPronto] = useState(false);
  const [zoom, setZoom] = useState(4);
  const [versaoViewport, setVersaoViewport] = useState(0);
  const [estados, setEstados] = useState<EstadoBrasil[]>([]);
  const [veiculosPorUf, setVeiculosPorUf] = useState<Record<string, VeiculoFrota[]>>({});
  const [ufsCarregando, setUfsCarregando] = useState<string[]>([]);
  const [filtros, setFiltros] = useState<FiltrosMapa>(FILTROS_INICIAIS);
  const [estiloTile, setEstiloTile] = useState<EstiloTile>("claro");
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<VeiculoFrota | null>(null);
  const [veiculoDestacadoId, setVeiculoDestacadoId] = useState<string | null>(null);
  const [mensagemFoco, setMensagemFoco] = useState<string | null>(null);
  const [expandido, setExpandido] = useState(false);

  const modoMacro = zoom < ZOOM_MICRO;

  /* ---------- Dados derivados ---------- */

  const veiculosCarregados = useMemo(() => Object.values(veiculosPorUf).flat(), [veiculosPorUf]);

  const veiculosFiltrados = useMemo(
    () => filtrarVeiculos(veiculosCarregados, filtros),
    [veiculosCarregados, filtros]
  );

  /** Cor de cada região pelo ranking de quantidade de veículos (mais = mais escuro) */
  const regioes = useMemo(() => {
    const totais = LISTA_REGIOES.map((regiao) => ({
      regiao,
      total: estados.filter((e) => e.regiao === regiao).reduce((soma, e) => soma + e.vehicleCount, 0),
    })).sort((a, b) => b.total - a.total);
    return totais.map((item, i) => ({ ...item, cor: ESCALA_REGIAO[Math.min(i, ESCALA_REGIAO.length - 1)] }));
  }, [estados]);

  const corPorRegiao = useMemo(
    () => Object.fromEntries(regioes.map((r) => [r.regiao, r.cor])) as Record<RegiaoBrasil, string>,
    [regioes]
  );

  const totalFrota = useMemo(() => estados.reduce((soma, e) => soma + e.vehicleCount, 0), [estados]);

  /** Contagem dos chips de status (ignora o próprio filtro de status) */
  const contagemStatus = useMemo<ContagemStatus>(() => {
    if (modoMacro) {
      const contagem: ContagemStatus = { in_transit: 0, parked: 0, depot: 0, maintenance: 0 };
      estados
        .filter((e) => !filtros.uf || e.uf === filtros.uf)
        .forEach((e) => {
          contagem.in_transit += e.statusCounts.in_transit;
          contagem.parked += e.statusCounts.parked;
          contagem.depot += e.statusCounts.depot;
          contagem.maintenance += e.statusCounts.maintenance;
        });
      return contagem;
    }
    return contarPorStatus(filtrarVeiculos(veiculosCarregados, { ...filtros, status: "todos" }));
  }, [modoMacro, estados, veiculosCarregados, filtros]);

  const visiveis = modoMacro
    ? estados.reduce((soma, e) => soma + totalFiltradoDoEstado(e, filtros), 0)
    : veiculosFiltrados.length;

  /* ---------- Ações de navegação ---------- */

  function voltarBrasil() {
    mapaRef.current?.flyToBounds(LIMITES_BRASIL, { padding: [8, 8], duration: 0.9 });
  }

  function focarVeiculo(veiculo: VeiculoFrota, abrirDetalhe = false) {
    const mapa = mapaRef.current;
    if (!mapa) return;
    setVeiculoDestacadoId(veiculo.id);
    mapa.flyTo([veiculo.lat, veiculo.lng], ZOOM_FOCO_VEICULO, { duration: 1.4 });
    if (abrirDetalhe) mapa.once("moveend", () => setVeiculoSelecionado(veiculo));
  }

  function alterarUf(uf: string) {
    setFiltros((atual) => ({ ...atual, uf }));
    const estado = estados.find((e) => e.uf === uf);
    if (estado) mapaRef.current?.flyToBounds(estado.bounds, { padding: [24, 24], duration: 0.9 });
    else voltarBrasil();
  }

  /* ========================================================= */
  /*  EFEITO 1 — Criação do mapa (uma única vez)               */
  /* ========================================================= */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mapa = L.map(container, { zoomControl: false, minZoom: 3, maxZoom: 18 });
    mapa.attributionControl.setPrefix(false);
    mapa.fitBounds(LIMITES_BRASIL, { padding: [8, 8] });

    camadaMacroRef.current = L.layerGroup().addTo(mapa);
    camadaMicroRef.current = L.layerGroup().addTo(mapa);

    mapa.on("zoomend", () => setZoom(mapa.getZoom()));
    mapa.on("moveend", () => setVersaoViewport((versao) => versao + 1));

    mapaRef.current = mapa;
    setZoom(mapa.getZoom());
    setMapaPronto(true);

    // Container muda de tamanho (sidebar recolhe, modo expandido) → recalcula o mapa
    const observador = new ResizeObserver(() => mapa.invalidateSize());
    observador.observe(container);

    let cancelado = false;

    fetchMacro().then(({ estados: lista }) => {
      if (!cancelado) setEstados(lista);
    });

    // GeoJSON das UFs carregado sob demanda (fica no chunk do mapa, não no bundle principal)
    import("./mapa/brasil-ufs.geo.json").then((modulo) => {
      if (cancelado) return;
      const dados = modulo.default as unknown as FeatureCollection<Geometry, PropriedadesUf>;
      const geo = L.geoJSON<PropriedadesUf>(dados, {
        style: (feature) => estiloGeoRef.current(feature),
        onEachFeature: (feature, camada) => {
          const caminho = camada as L.Path;
          camada.on({
            mouseover: () => {
              if (!modoMacroRef.current) return;
              caminho.setStyle({ weight: 2.2, fillOpacity: 1 });
            },
            mouseout: () => caminho.setStyle(estiloGeoRef.current(feature)),
            click: () => {
              if (!modoMacroRef.current) return;
              mapa.flyToBounds((camada as L.Polygon).getBounds(), { padding: [24, 24], duration: 0.9 });
            },
          });
        },
      }).addTo(mapa);
      geoRef.current = geo;
      setGeoPronto(true);
    });

    return () => {
      cancelado = true;
      observador.disconnect();
      mapa.remove();
      mapaRef.current = null;
      geoRef.current = null;
      camadaMacroRef.current = null;
      camadaMicroRef.current = null;
    };
  }, []);

  /* ========================================================= */
  /*  EFEITO 2 — Camada base (tiles)                           */
  /* ========================================================= */
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !mapaPronto) return;
    const config = TILE_CONFIGS[estiloTile];
    const tiles = L.tileLayer(config.url, {
      className: config.className,
      attribution: ATRIBUICAO_OSM,
      maxZoom: 19,
    }).addTo(mapa);
    tiles.bringToBack();
    return () => {
      tiles.remove();
    };
  }, [estiloTile, mapaPronto]);

  /* ========================================================= */
  /*  EFEITO 3 — Estilo do coroplético conforme o modo         */
  /* ========================================================= */
  useEffect(() => {
    modoMacroRef.current = modoMacro;
    const ufParaRegiao = Object.fromEntries(estados.map((e) => [e.uf, e.regiao])) as Record<string, RegiaoBrasil>;

    estiloGeoRef.current = (feature) => {
      const regiao = feature ? ufParaRegiao[feature.properties.uf] : undefined;
      const cor = (regiao && corPorRegiao[regiao]) || "#E0E7FF";
      return modoMacro
        ? { className: "fm-uf-poligono", color: "#FFFFFF", weight: 1.2, opacity: 1, fillColor: cor, fillOpacity: 0.88 }
        : { className: "fm-uf-poligono", color: "#6366F1", weight: 1, opacity: 0.45, fillColor: cor, fillOpacity: 0.04 };
    };

    geoRef.current?.setStyle((feature) => estiloGeoRef.current(feature as Feature<Geometry, PropriedadesUf>));
  }, [modoMacro, corPorRegiao, estados, geoPronto]);

  /* ========================================================= */
  /*  EFEITO 4 — Carregamento por viewport (modo Micro)        */
  /* ========================================================= */
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !mapaPronto || zoom < ZOOM_MICRO || estados.length === 0) return;

    const limitesTela = mapa.getBounds();
    const pendentes = estados
      .filter((e) => e.vehicleCount > 0 && limitesTela.intersects(L.latLngBounds(e.bounds)))
      .map((e) => e.uf)
      .filter((uf) => !(uf in veiculosPorUf) && !ufsCarregandoRef.current.has(uf));

    if (pendentes.length === 0) return;

    pendentes.forEach((uf) => ufsCarregandoRef.current.add(uf));
    setUfsCarregando((atual) => [...atual, ...pendentes]);

    fetchVehiclesByMultipleStates(pendentes)
      .then((veiculos) => {
        setVeiculosPorUf((atual) => {
          const proximo = { ...atual };
          pendentes.forEach((uf) => {
            proximo[uf] = veiculos.filter((v) => v.state === uf);
          });
          return proximo;
        });
      })
      .finally(() => {
        pendentes.forEach((uf) => ufsCarregandoRef.current.delete(uf));
        setUfsCarregando((atual) => atual.filter((uf) => !pendentes.includes(uf)));
      });
  }, [zoom, versaoViewport, estados, veiculosPorUf, mapaPronto]);

  /* ========================================================= */
  /*  EFEITO 5 — Desenho dos marcadores                        */
  /* ========================================================= */
  const idSelecionado = veiculoSelecionado?.id ?? veiculoDestacadoId;

  useEffect(() => {
    const mapa = mapaRef.current;
    const camadaMacro = camadaMacroRef.current;
    const camadaMicro = camadaMicroRef.current;
    if (!mapa || !camadaMacro || !camadaMicro) return;

    camadaMacro.clearLayers();
    camadaMicro.clearLayers();

    if (modoMacro) {
      estados.forEach((estado) => {
        const total = totalFiltradoDoEstado(estado, filtros);
        if (total === 0) return;
        L.marker([estado.lat, estado.lng], { icon: criarIconeEstado(estado, total), riseOnHover: true })
          .bindTooltip(criarTooltipEstado(estado, total), { className: "fm-tooltip", direction: "top", offset: [0, -26] })
          .on("click", () => mapa.flyToBounds(estado.bounds, { padding: [24, 24], duration: 0.9 }))
          .addTo(camadaMacro);
      });
      return;
    }

    clusterVehicles(veiculosFiltrados, zoom).forEach((item) => {
      if (item.isCluster) {
        L.marker([item.lat, item.lng], { icon: criarIconeCluster(item), riseOnHover: true })
          .bindTooltip(criarTooltipCluster(item), { className: "fm-tooltip", direction: "top", offset: [0, -22] })
          .on("click", () =>
            mapa.flyToBounds(item.bounds, {
              maxZoom: Math.min(zoom + 3, ZOOM_MAX_CLIQUE_CLUSTER),
              padding: [40, 40],
              duration: 0.8,
            })
          )
          .addTo(camadaMicro);
        return;
      }

      const veiculo = item.data;
      const selecionado = veiculo.id === idSelecionado;
      L.marker([item.lat, item.lng], {
        icon: criarIconeVeiculo(veiculo, zoom, selecionado),
        zIndexOffset: selecionado ? 1000 : veiculo.alerta ? 500 : 0,
        riseOnHover: true,
      })
        .bindTooltip(criarTooltipVeiculo(veiculo), { className: "fm-tooltip", direction: "top", offset: [0, -20] })
        .on("click", () => {
          setVeiculoDestacadoId(veiculo.id);
          setVeiculoSelecionado(veiculo);
        })
        .addTo(camadaMicro);
    });
  }, [modoMacro, zoom, estados, filtros, veiculosFiltrados, idSelecionado, mapaPronto]);

  /* ========================================================= */
  /*  EFEITO 6 — Comando externo de foco (IA / tabelas)        */
  /* ========================================================= */
  useEffect(() => {
    if (!comandoFoco || !mapaPronto || ultimoTokenFocoRef.current === comandoFoco.token) return;
    ultimoTokenFocoRef.current = comandoFoco.token;

    let cancelado = false;
    fetchVehicleByPlate(comandoFoco.placa).then((veiculo) => {
      if (cancelado || !veiculo || !mapaRef.current) return;
      setFiltros(FILTROS_INICIAIS); // garante que o veículo não fique escondido por filtros
      setMensagemFoco(`${veiculo.plate} · ${veiculo.model} em foco`);
      const mapa = mapaRef.current;
      setVeiculoDestacadoId(veiculo.id);
      mapa.flyTo([veiculo.lat, veiculo.lng], ZOOM_FOCO_VEICULO, { duration: 1.6 });
    });
    return () => {
      cancelado = true;
    };
  }, [comandoFoco, mapaPronto]);

  // Esconde a mensagem de foco após alguns segundos
  useEffect(() => {
    if (!mensagemFoco) return;
    const timer = setTimeout(() => setMensagemFoco(null), 3200);
    return () => clearTimeout(timer);
  }, [mensagemFoco]);

  // Esc fecha o modo expandido (quando o drawer não está aberto)
  useEffect(() => {
    if (!expandido) return;
    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !veiculoSelecionado) setExpandido(false);
    }
    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
  }, [expandido, veiculoSelecionado]);

  /* ========================================================= */
  /*  RENDER                                                   */
  /* ========================================================= */

  const textoToast =
    ufsCarregando.length > 0 ? `Carregando veículos · ${ufsCarregando.join(", ")}` : mensagemFoco;

  return (
    <div className="relative h-full min-h-[420px]">
      {expandido && (
        <div
          className="fixed inset-0 z-40 bg-[#1E1B4B]/45 backdrop-blur-sm animate-fade-in"
          onClick={() => setExpandido(false)}
          aria-hidden
        />
      )}

      <section
        aria-label="Mapa de distribuição da frota"
        className={cn(
          "fm-mapa flex flex-col overflow-hidden rounded-2xl border border-[#E7E7F0] bg-white",
          modoMacro ? "fm-modo-macro" : "fm-modo-micro",
          expandido ? "fixed inset-3 z-50 shadow-2xl lg:inset-6" : "absolute inset-0"
        )}
      >
        {/* Cabeçalho */}
        <header className="flex items-center gap-2 px-4 pb-2 pt-3.5">
          <h2 className="text-[13px] font-semibold text-[#1E1B4B]">Distribuição da Frota</h2>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] transition-colors",
              modoMacro ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-[#10b981]/10 text-[#059669]"
            )}
            title={`Nível de zoom: ${zoom}`}
          >
            {modoMacro ? "Macro · Estados" : "Micro · Veículos"}
          </span>
          <div className="flex-1" />
          <button
            id="mapa-btn-expandir"
            type="button"
            onClick={() => setExpandido((atual) => !atual)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#EEF2FF] hover:text-[#4F46E5]"
            aria-label={expandido ? "Recolher mapa" : "Expandir mapa"}
            title={expandido ? "Recolher (Esc)" : "Expandir mapa"}
          >
            {expandido ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </header>

        <div className="px-4 pb-2.5">
          <MapFilterBar
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onUfChange={alterarUf}
            estados={estados}
            contagemStatus={contagemStatus}
            visiveis={visiveis}
            total={totalFrota}
            expandido={expandido}
          />
        </div>

        <div className="flex min-h-0 flex-1 border-t border-[#E7E7F0]">
          {/* `isolate` cria um stacking context: as camadas do Leaflet (z-index 400+) não sobrepõem drawers e menus */}
          <div className="relative isolate min-h-0 flex-1">
            <div ref={containerRef} className="absolute inset-0" />

            <MapControls
              estiloTile={estiloTile}
              onEstiloTileChange={setEstiloTile}
              onVoltarBrasil={voltarBrasil}
              onZoomIn={() => mapaRef.current?.zoomIn()}
              onZoomOut={() => mapaRef.current?.zoomOut()}
            />

            <MapLegend modoMacro={modoMacro} regioes={regioes} contagemStatus={contagemStatus} />

            {modoMacro && (
              <div className="pointer-events-none absolute left-2 top-2 z-[500] inline-flex max-w-[calc(100%-4rem)] items-center gap-1.5 rounded-full bg-[#1E1B4B]/90 px-2.5 py-1 text-[10px] font-medium text-[#E0E7FF] shadow-md">
                <MousePointerClick className="h-3 w-3 shrink-0 text-[#A5B4FC]" />
                <span className="truncate">Clique em um estado ou aproxime o zoom para ver os veículos</span>
              </div>
            )}

            {textoToast && (
              <div
                role="status"
                className="absolute left-1/2 top-11 z-[500] inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#C7D2FE] bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#1E1B4B] shadow-lg backdrop-blur animate-fade-in"
              >
                {ufsCarregando.length > 0 ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#4F46E5]" />
                ) : (
                  <Crosshair className="h-3.5 w-3.5 text-[#4F46E5]" />
                )}
                {textoToast}
              </div>
            )}
          </div>

          {expandido && (
            <FleetListSidebar
              veiculos={veiculosFiltrados}
              selecionadoId={idSelecionado}
              onSelecionar={(veiculo) => focarVeiculo(veiculo, true)}
              modoMacro={modoMacro}
            />
          )}
        </div>
      </section>

      <VehicleDrawer
        veiculo={veiculoSelecionado}
        onFechar={() => setVeiculoSelecionado(null)}
        onCentralizar={(veiculo) => {
          setVeiculoSelecionado(null);
          focarVeiculo(veiculo);
        }}
      />
    </div>
  );
}
