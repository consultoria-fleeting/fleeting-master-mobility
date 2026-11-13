/**
 * Fábricas de marcadores e tooltips do Leaflet (`L.divIcon`) — V1.
 *
 * Segurança: placa, condutor e endereço virão de integrações externas.
 * NADA aqui usa template string com HTML ou `innerHTML`: todo o DOM é
 * construído com `document.createElement` + `textContent`, escapando valores
 * automaticamente contra XSS.
 */

import L from "leaflet";
import type { EstadoBrasil, ItemCluster, VeiculoFrota } from "@/types/frota-mapa";
import { LISTA_STATUS, STATUS_CONFIG, ZOOM_SEM_CLUSTER } from "./config";

/* ---------- Helpers de DOM seguro ---------- */

function criarElemento<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classe?: string,
  texto?: string
): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function formatarContagem(total: number): string {
  return total >= 1000 ? `${(total / 1000).toFixed(1)}k` : String(total);
}

/* ---------- Estado (modo Macro) ---------- */

export function criarIconeEstado(estado: EstadoBrasil, total: number): L.DivIcon {
  const raiz = criarElemento("div", "fm-estado");
  raiz.appendChild(criarElemento("span", "fm-estado-pulso"));
  const bolha = criarElemento("div", "fm-estado-bolha");
  bolha.appendChild(criarElemento("strong", "fm-estado-uf", estado.uf));
  bolha.appendChild(criarElemento("span", "fm-estado-total", formatarContagem(total)));
  raiz.appendChild(bolha);

  return L.divIcon({ html: raiz, className: "fm-icone", iconSize: [54, 54], iconAnchor: [27, 27] });
}

export function criarTooltipEstado(estado: EstadoBrasil, total: number): HTMLElement {
  const raiz = criarElemento("div");
  raiz.appendChild(criarElemento("div", "fm-tooltip-titulo", estado.name));
  raiz.appendChild(
    criarElemento("div", "fm-tooltip-linha", `${total} ${total === 1 ? "veículo" : "veículos"} · ${estado.regiao}`)
  );
  raiz.appendChild(criarElemento("div", "fm-tooltip-dica", "Clique para aproximar"));
  return raiz;
}

/* ---------- Cluster (modo Micro) ---------- */

type Cluster = Extract<ItemCluster, { isCluster: true }>;

function tamanhoCluster(total: number): number {
  if (total <= 30) return 40;
  if (total <= 100) return 48;
  return 56;
}

/** Anel em conic-gradient mostrando a proporção dos 5 status no cluster */
function gradienteStatus(cluster: Cluster): string {
  let acumulado = 0;
  const fatias = LISTA_STATUS.filter((s) => cluster.statusCounts[s] > 0).map((status) => {
    const inicio = (acumulado / cluster.count) * 360;
    acumulado += cluster.statusCounts[status];
    const fim = (acumulado / cluster.count) * 360;
    return `${STATUS_CONFIG[status].cor} ${inicio}deg ${fim}deg`;
  });
  return `conic-gradient(${fatias.join(", ")})`;
}

export function criarIconeCluster(cluster: Cluster): L.DivIcon {
  const tamanho = tamanhoCluster(cluster.count);
  const raiz = criarElemento("div", "fm-cluster");
  raiz.style.width = `${tamanho}px`;
  raiz.style.height = `${tamanho}px`;
  raiz.style.background = gradienteStatus(cluster);
  raiz.style.setProperty("--fm-cor", STATUS_CONFIG[cluster.dominantStatus].cor);
  raiz.appendChild(criarElemento("span", "fm-cluster-total", formatarContagem(cluster.count)));

  return L.divIcon({
    html: raiz,
    className: "fm-icone",
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho / 2],
  });
}

export function criarTooltipCluster(cluster: Cluster): HTMLElement {
  const raiz = criarElemento("div");
  raiz.appendChild(criarElemento("div", "fm-tooltip-titulo", `${cluster.count} veículos`));
  raiz.appendChild(
    criarElemento(
      "div",
      "fm-tooltip-linha",
      `${cluster.statusCounts.in_transit} em rota · ${cluster.statusCounts.stopped} parados`
    )
  );
  const secundarios: string[] = [];
  if (cluster.statusCounts.maintenance > 0) {
    secundarios.push(`${cluster.statusCounts.maintenance} em oficina`);
  }
  if (cluster.statusCounts.no_position > 0) {
    secundarios.push(`${cluster.statusCounts.no_position} sem posição`);
  }
  if (cluster.statusCounts.no_telemetry > 0) {
    secundarios.push(`${cluster.statusCounts.no_telemetry} sem telemetria`);
  }
  if (secundarios.length > 0) {
    raiz.appendChild(criarElemento("div", "fm-tooltip-linha", secundarios.join(" · ")));
  }
  raiz.appendChild(criarElemento("div", "fm-tooltip-dica", "Clique para expandir"));
  return raiz;
}

/* ---------- Veículo (modo Micro) ---------- */

export function criarIconeVeiculo(
  veiculo: VeiculoFrota,
  zoom: number,
  selecionado: boolean
): L.DivIcon {
  const grande = zoom >= ZOOM_SEM_CLUSTER;
  const tamanho = grande ? 44 : 32;
  const ehSemPosicao = veiculo.status === "no_position";
  const ehPosicaoCadastro = veiculo.origemPosicao === "cadastro";

  const classes = ["fm-pin", `fm-status-${veiculo.status}`];
  if (grande) classes.push("fm-pin-grande");
  if (selecionado) classes.push("fm-pin-selecionado");
  if (ehSemPosicao) classes.push("fm-pin-esmaecido");
  if (ehPosicaoCadastro) classes.push("fm-pin-cadastro");
  if (veiculo.alerta) classes.push(`fm-pin-alerta-${veiculo.alerta.nivel}`);

  const raiz = criarElemento("div", classes.join(" "));

  if (ehPosicaoCadastro) {
    // Marcador visualmente distinto (losango/quadrado de alocação cadastral, sem seta de GPS)
    const corpoCadastro = criarElemento("div", "fm-pin-corpo fm-pin-corpo-cadastro");
    raiz.appendChild(corpoCadastro);
    raiz.appendChild(criarElemento("span", "fm-pin-sigla-cadastro", "CAD"));
  } else {
    const corpo = criarElemento("div", "fm-pin-corpo");
    if (veiculo.status === "in_transit") {
      corpo.style.transform = `rotate(${veiculo.heading}deg)`;
      corpo.appendChild(criarElemento("div", "fm-pin-seta"));
    }
    raiz.appendChild(corpo);
    raiz.appendChild(criarElemento("div", "fm-pin-ponto"));
  }

  if (veiculo.alerta) raiz.appendChild(criarElemento("span", "fm-pin-badge", "!"));
  if (grande) raiz.appendChild(criarElemento("div", "fm-pin-placa", veiculo.plate));

  return L.divIcon({
    html: raiz,
    className: "fm-icone",
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho / 2],
  });
}

export function criarTooltipVeiculo(veiculo: VeiculoFrota): HTMLElement {
  const raiz = criarElemento("div", "fm-tooltip-veiculo");

  const cabecalho = criarElemento("div", "fm-tooltip-cabecalho");
  cabecalho.appendChild(criarElemento("span", "fm-tooltip-placa", veiculo.plate));
  const textoDireita =
    veiculo.status === "in_transit"
      ? `${veiculo.speed} km/h`
      : STATUS_CONFIG[veiculo.status].labelCurto;
  const badgeStatus = criarElemento("span", "fm-tooltip-velocidade", textoDireita);
  badgeStatus.style.color = STATUS_CONFIG[veiculo.status].cor;
  cabecalho.appendChild(badgeStatus);
  raiz.appendChild(cabecalho);

  raiz.appendChild(criarElemento("div", "fm-tooltip-titulo", veiculo.model));
  raiz.appendChild(criarElemento("div", "fm-tooltip-linha", veiculo.address));
  raiz.appendChild(criarElemento("div", "fm-tooltip-linha", `Condutor: ${veiculo.driver}`));

  const rotuloOrigem =
    veiculo.origemPosicao === "telemetria"
      ? "Origem: Telemetria"
      : `Origem: Cadastro (${veiculo.cidadeAlocacao})`;
  raiz.appendChild(criarElemento("div", "fm-tooltip-meta", rotuloOrigem));

  if (veiculo.dataHoraUltimaPosicao) {
    raiz.appendChild(
      criarElemento("div", "fm-tooltip-meta", `Última posição: ${veiculo.dataHoraUltimaPosicao}`)
    );
  }

  if (veiculo.alerta) {
    raiz.appendChild(
      criarElemento(
        "div",
        `fm-tooltip-alerta fm-tooltip-alerta-${veiculo.alerta.nivel}`,
        veiculo.alerta.descricao
      )
    );
  }
  return raiz;
}
