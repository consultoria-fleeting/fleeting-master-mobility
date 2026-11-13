/**
 * Motor de respostas do Assistente de IA da Frota (mock para demonstração — Torre V1).
 *
 * Identifica a intenção da pergunta por palavras-chave (ou placa) e monta uma
 * resposta rica a partir do MESMO motor consolidado (`obterDadosTorre`) usado
 * na Torre de Controle e no mapa, respeitando:
 * - Os 5 status exclusivos do mapa (`Em Rota`, `Parado`, `Em Oficina`,
 *   `Sem posição >7d` e `Sem telemetria`);
 * - Os 3 novos quadros 2×2 (`Manutenções`, `Multas & CNH` e `Sinistros`);
 * - O escopo de permissão e período fechado selecionados no cabeçalho.
 *
 * TODO(backend): substituir `gerarRespostaIA` por uma chamada ao endpoint de IA
 * (via BFF, sem expor chaves no cliente). O contrato `RespostaIA` pode ser mantido.
 */

import type { FiltrosTorre } from "@/types/torre-de-controle";
import { STATUS_CONFIG } from "./mapa/config";
import { obterResumoFrota, obterVeiculoPorPlaca } from "./mapa/dados-frota";
import {
  CATEGORIAS_TCO,
  ULTIMO_MES_FECHADO_2026,
  obterDadosTorre,
  type DadosTorreConsolidados,
} from "./mock-data";
import { formatarMoeda, formatarMoedaCompacta, totalDoMes } from "./tco/tco-utils";

const FILTROS_PADRAO: FiltrosTorre = {
  mes: String(ULTIMO_MES_FECHADO_2026),
  ano: "2026",
  agrupamento: "todos",
  locadora: "todas",
  perfilDemo: "filiais",
};

/* ========================================================= */
/*  CONTRATO                                                 */
/* ========================================================= */

export type TomIA = "perigo" | "alerta" | "sucesso" | "indigo" | "neutro";

export interface MetricaIA {
  label: string;
  valor: string;
  tom: TomIA;
}

export interface ItemIA {
  titulo: string;
  descricao: string;
  tom: TomIA;
}

export interface AcaoIA {
  tipo: "focar-veiculo";
  placa: string;
  label: string;
}

export interface RespostaIA {
  texto: string;
  metricas: MetricaIA[];
  itens: ItemIA[];
  acoes: AcaoIA[];
}

/* ========================================================= */
/*  SUGESTÕES                                                */
/* ========================================================= */

export const PERGUNTAS_SUGERIDAS = [
  "Panorama dos 5 status da frota",
  "Quais veículos têm alerta crítico agora?",
  "Resumo de multas e CNHs",
  "Como está o TCO deste mês?",
  "Resumo de manutenções e sinistros",
  "Onde está o veículo SVR2C84?",
];

/** Etapas exibidas no estado "Analisando dados da frota..." */
export const ETAPAS_ANALISE = [
  "Consultando frota dentro do seu escopo de permissão",
  "Cruzando status do mapa, manutenções, multas e sinistros",
  "Gerando resposta consolidada",
];

/* ========================================================= */
/*  DADOS AUXILIARES (mock)                                  */
/* ========================================================= */

const CONSUMO_FILIAIS = [
  { filial: "São Paulo — Matriz", valor: 1142, litros: 196, placaDestaque: "GHJ7E89" },
  { filial: "Campinas", valor: 486, litros: 84, placaDestaque: "MNB2M34" },
  { filial: "Rio de Janeiro", valor: 438, litros: 76, placaDestaque: "RIO3Q12" },
  { filial: "Belo Horizonte", valor: 401, litros: 69, placaDestaque: "PAM7V56" },
  { filial: "Curitiba", valor: 297, litros: 52, placaDestaque: "PRN8Y34" },
];

const formatoMoedaInteiro = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function contemAlguma(texto: string, palavras: string[]): boolean {
  return palavras.some((palavra) => texto.includes(palavra));
}

/** Procura uma placa Mercosul (ABC1D23) ou antiga (ABC1234) no texto */
function extrairPlaca(pergunta: string): string | null {
  const encontrada = pergunta.toUpperCase().replace(/[-\s]/g, "").match(/[A-Z]{3}\d[A-Z0-9]\d{2}/);
  return encontrada ? encontrada[0] : null;
}

/* ========================================================= */
/*  RESPOSTAS POR INTENÇÃO                                   */
/* ========================================================= */

function respostaVeiculo(placa: string, dados: DadosTorreConsolidados): RespostaIA | null {
  const veiculo = obterVeiculoPorPlaca(placa, dados.escopoMapa);
  if (!veiculo) return null;

  const statusLabel = STATUS_CONFIG[veiculo.status].label;
  const origemTexto =
    veiculo.origemPosicao === "telemetria"
      ? `origem Telemetria (última posição em ${veiculo.dataHoraUltimaPosicao ?? veiculo.lastTransmission})`
      : `origem Cadastro do veículo (alocado em ${veiculo.cidadeAlocacao})`;

  const alerta = veiculo.alerta
    ? ` Atenção: ${veiculo.alerta.nivel === "critico" ? "alerta crítico" : "pendência"} — ${veiculo.alerta.descricao.toLowerCase()}.`
    : " Nenhuma pendência ativa para este veículo.";

  return {
    texto: `O ${veiculo.model} ${veiculo.plate} está com status "${statusLabel}" em ${veiculo.address}, condutor ${veiculo.driver}, com ${origemTexto}.${alerta}`,
    metricas: [
      {
        label: "Status no mapa",
        valor: STATUS_CONFIG[veiculo.status].labelCurto,
        tom:
          veiculo.status === "in_transit"
            ? "sucesso"
            : veiculo.status === "maintenance"
              ? "alerta"
              : "indigo",
      },
      {
        label: "Origem posição",
        valor: veiculo.origemPosicao === "telemetria" ? "Telemetria" : "Cadastro",
        tom: veiculo.origemPosicao === "telemetria" ? "indigo" : "neutro",
      },
      {
        label: "Odômetro",
        valor: `${veiculo.odometer.toLocaleString("pt-BR")} km`,
        tom: "neutro",
      },
    ],
    itens: [],
    acoes: [{ tipo: "focar-veiculo", placa: veiculo.plate, label: `Focar ${veiculo.plate} no mapa` }],
  };
}

function respostaAlertas(dados: DadosTorreConsolidados): RespostaIA {
  const criticos = dados.veiculosAtencao.filter((v) => v.status === "Crítico");
  const atencao = dados.veiculosAtencao.filter((v) => v.status === "Atenção");
  const cnhIrregular = dados.condutoresAtencao.filter((c) => c.status !== "CNH à Vencer").length;

  if (criticos.length === 0 && atencao.length === 0) {
    return {
      texto: `No recorte atual (${dados.escopoRotulo}) não há veículos com alerta crítico ou em atenção.`,
      metricas: [
        { label: "Críticos", valor: "0", tom: "sucesso" },
        { label: "Em atenção", valor: "0", tom: "neutro" },
      ],
      itens: [],
      acoes: [],
    };
  }

  const destaque = criticos[0] ?? atencao[0];
  return {
    texto: `No escopo atual há ${criticos.length} veículo(s) com alerta crítico e ${atencao.length} em atenção. A principal prioridade é o ${destaque.placa} (${destaque.modelo}), com "${destaque.pendencia}" em ${destaque.filial}.`,
    metricas: [
      { label: "Críticos", valor: String(criticos.length), tom: "perigo" },
      { label: "Em atenção", valor: String(atencao.length), tom: "alerta" },
      { label: "CNH irregular", valor: String(cnhIrregular), tom: "indigo" },
    ],
    itens: [...criticos, ...atencao].slice(0, 4).map((v) => ({
      titulo: `${v.placa} · ${v.modelo}`,
      descricao: `${v.pendencia} — ${v.filial}`,
      tom: v.status === "Crítico" ? ("perigo" as const) : ("alerta" as const),
    })),
    acoes: [...criticos, ...atencao]
      .slice(0, 2)
      .map((v) => ({ tipo: "focar-veiculo" as const, placa: v.placa, label: `Focar ${v.placa} no mapa` })),
  };
}

function respostaManutencaoESinistros(dados: DadosTorreConsolidados): RespostaIA {
  const { emManutencao } = obterResumoFrota(dados.escopoMapa);
  const porIdManut = Object.fromEntries(dados.quadroManutencoes.map((i) => [i.id, i.valor]));
  const porIdSin = Object.fromEntries(dados.quadroSinistros.map((i) => [i.id, i.valor]));

  return {
    texto: `Em ${dados.periodoRotulo}, o quadro de Manutenções registra ${porIdManut["manut-total"]} manutenções no mês, com posição atual de ${porIdManut["manut-vencidas"]} revisão(ões) vencida(s), ${porIdManut["manut-a-vencer"]} a vencer e ${porIdManut["manut-oficina"]} veículo(s) em oficina (precedência máxima no mapa). Já em Sinistros foram ${porIdSin["sinistros-total"]} ocorrência(s) no mês, somando ${porIdSin["sinistros-custo"]}.`,
    metricas: [
      { label: "Manut. no mês", valor: porIdManut["manut-total"] ?? "0", tom: "indigo" },
      { label: "Em oficina", valor: porIdManut["manut-oficina"] ?? "0", tom: "alerta" },
      { label: "Rev. vencidas", valor: porIdManut["manut-vencidas"] ?? "0", tom: "perigo" },
      { label: "Custo sinistros", valor: porIdSin["sinistros-custo"] ?? "R$ 0", tom: "perigo" },
    ],
    itens: emManutencao.map((v) => ({
      titulo: `${v.plate} · ${v.model}`,
      descricao: `Em Oficina (${v.origemPosicao === "telemetria" ? "Telemetria" : "Cadastro"}) — ${v.filial}`,
      tom: v.alerta?.nivel === "critico" ? ("perigo" as const) : ("alerta" as const),
    })),
    acoes: emManutencao.slice(0, 2).map((v) => ({
      tipo: "focar-veiculo" as const,
      placa: v.plate,
      label: `Focar ${v.plate} no mapa`,
    })),
  };
}

function respostaMultasECnh(dados: DadosTorreConsolidados): RespostaIA {
  const porId = Object.fromEntries(dados.quadroMultasCnh.map((i) => [i.id, i.valor]));
  const irregulares = dados.condutoresAtencao.slice(0, 3);

  return {
    texto: `No quadro de Multas & CNH (${dados.periodoRotulo}), foram registradas ${porId["multas-total"]} infrações no mês fechado. Na posição atual há ${porId["multas-pendentes"]} multa(s) pendente(s) de identificação de condutor, ${porId["multas-vencidas"]} multa(s) vencida(s) e ${porId["cnhs-vencidas"]} CNH(s) vencida(s).`,
    metricas: [
      { label: "Infrações (mês)", valor: porId["multas-total"] ?? "0", tom: "indigo" },
      { label: "Pend. identif.", valor: porId["multas-pendentes"] ?? "0", tom: "alerta" },
      { label: "Multas vencidas", valor: porId["multas-vencidas"] ?? "0", tom: "perigo" },
      { label: "CNHs vencidas", valor: porId["cnhs-vencidas"] ?? "0", tom: "perigo" },
    ],
    itens: irregulares.map((c) => ({
      titulo: c.nome,
      descricao: `${c.status} · ${c.veiculo}`,
      tom: c.status === "CNH Vencida" ? ("perigo" as const) : ("alerta" as const),
    })),
    acoes: irregulares.slice(0, 2).map((c) => {
      const placa = c.veiculo.split(" · ")[0];
      return { tipo: "focar-veiculo" as const, placa, label: `Ver veículo de ${c.nome.split(" ")[0]}` };
    }),
  };
}

function respostaConsumo(dados: DadosTorreConsolidados): RespostaIA {
  const kpiAbast = dados.kpis.find((k) => k.id === "abastecimento");
  const mediaDetalhe = kpiAbast?.detalhes.find((d) => d.label.includes("km/l"))?.valor ?? "11,6 km/l";
  const lider = CONSUMO_FILIAIS[0];

  return {
    texto: `No período fechado (${dados.periodoRotulo}), o gasto em Abastecimento foi de ${kpiAbast?.valor ?? "R$ 9,1 mil"} (${kpiAbast?.sub ?? "988 L"}). A média de consumo apurada pela fórmula oficial (km final − km inicial) ÷ litros abastecidos é de ${mediaDetalhe}. Clique no card "Abastecimento (mês)" para ver a memória completa.`,
    metricas: [
      { label: "Gasto no mês", valor: kpiAbast?.valor ?? "—", tom: "indigo" },
      { label: "Volume", valor: kpiAbast?.sub ?? "—", tom: "neutro" },
      { label: "Consumo (km/l)", valor: mediaDetalhe, tom: "sucesso" },
    ],
    itens: CONSUMO_FILIAIS.slice(0, 3).map((f, i) => ({
      titulo: `${i + 1}º ${f.filial}`,
      descricao: `${formatoMoedaInteiro.format(f.valor)} · ${f.litros} L na última semana`,
      tom: i === 0 ? ("alerta" as const) : ("neutro" as const),
    })),
    acoes: [{ tipo: "focar-veiculo", placa: lider.placaDestaque, label: `Focar ${lider.placaDestaque} no mapa` }],
  };
}

function respostaTco(dados: DadosTorreConsolidados): RespostaIA {
  const ids = CATEGORIAS_TCO.map((c) => c.id);
  const mesAtual = dados.historicoTco[dados.historicoTco.length - 1];
  const mesAnterior = dados.historicoTco[dados.historicoTco.length - 2];
  const totalTco = totalDoMes(mesAtual, ids);
  const totalAnt = mesAnterior ? totalDoMes(mesAnterior, ids) : totalTco;
  const itens = CATEGORIAS_TCO.map((c) => ({ label: c.label, valor: mesAtual.custos[c.id] }));
  const [maior] = [...itens].sort((a, b) => b.valor - a.valor);
  const kpiCustoKm = dados.kpis.find((k) => k.id === "custo-km");
  const mediaPorVeiculo = mesAtual.veiculos > 0 ? formatarMoeda(totalTco / mesAtual.veiculos) : "R$ 0,00";

  return {
    texto: `Em ${dados.periodoRotulo}, o TCO fechado está em ${formatarMoedaCompacta(totalTco)} (frente a ${formatarMoedaCompacta(totalAnt)} em ${dados.mesAnteriorRotulo}). ${maior.label} representa a maior fatia (${totalTco > 0 ? Math.round((maior.valor / totalTco) * 100) : 0}% do total), o Custo por KM fechado está em ${kpiCustoKm?.valor ?? "—"} e a média por veículo ativo é de ${mediaPorVeiculo}.`,
    metricas: [
      { label: "TCO do mês", valor: formatarMoedaCompacta(totalTco), tom: "alerta" },
      { label: "Custo por km", valor: kpiCustoKm?.valor ?? "—", tom: "sucesso" },
      { label: "Média/veículo", valor: mediaPorVeiculo, tom: "indigo" },
    ],
    itens: itens.slice(0, 3).map((i) => ({
      titulo: i.label,
      descricao: `${formatarMoedaCompacta(i.valor)} · ${totalTco > 0 ? Math.round((i.valor / totalTco) * 100) : 0}% do TCO`,
      tom: "neutro" as const,
    })),
    acoes: [],
  };
}

function respostaPanorama(prefixo: string, dados: DadosTorreConsolidados): RespostaIA {
  const c = dados.contagemStatusMapa;
  const total = dados.veiculosEscopo.length;

  return {
    texto: `${prefixo}No escopo selecionado (${dados.escopoRotulo}) há ${total} veículos ativos distribuídos nos 5 status exclusivos do mapa: ${c.in_transit} Em Rota, ${c.stopped} Parados, ${c.maintenance} Em Oficina, ${c.no_position} Sem posição (há mais de 7 dias) e ${c.no_telemetry} Sem telemetria (posicionados pela cidade de alocação do cadastro).`,
    metricas: [
      { label: "Em Rota", valor: String(c.in_transit), tom: "sucesso" },
      { label: "Parado", valor: String(c.stopped), tom: "indigo" },
      { label: "Em Oficina", valor: String(c.maintenance), tom: "alerta" },
      { label: "Sem pos. / Sem tel.", valor: `${c.no_position} / ${c.no_telemetry}`, tom: "neutro" },
    ],
    itens: [],
    acoes: [],
  };
}

/* ========================================================= */
/*  ROTEADOR DE INTENÇÕES                                    */
/* ========================================================= */

export function gerarRespostaIA(pergunta: string, filtros: FiltrosTorre = FILTROS_PADRAO): RespostaIA {
  const dados = obterDadosTorre(filtros);

  const placa = extrairPlaca(pergunta);
  if (placa) {
    const resposta = respostaVeiculo(placa, dados);
    if (resposta) return resposta;
  }

  const texto = normalizar(pergunta);

  if (contemAlguma(texto, ["critic", "alerta", "urgent", "risco", "problema"])) {
    return respostaAlertas(dados);
  }
  if (contemAlguma(texto, ["multa", "infrac", "identific", "cnh", "condutor", "motorista", "habilita"])) {
    return respostaMultasECnh(dados);
  }
  if (contemAlguma(texto, ["manuten", "oficina", "revis", "sinistro", "vitima", "perda total"])) {
    return respostaManutencaoESinistros(dados);
  }
  if (contemAlguma(texto, ["consumo", "abastec", "combust", "litro", "gasolina", "diesel", "km/l"])) {
    return respostaConsumo(dados);
  }
  if (contemAlguma(texto, ["tco", "custo", "gasto", "financ", "despesa"])) {
    return respostaTco(dados);
  }
  if (contemAlguma(texto, ["rota", "status", "frota", "resumo", "quantos", "panorama", "geral", "telemetria"])) {
    return respostaPanorama("", dados);
  }

  return respostaPanorama(
    "Na versão de demonstração eu respondo sobre os 5 status da frota, alertas, manutenções, sinistros, multas & CNH, consumo, TCO e placas específicas. Aqui vai o panorama atual: ",
    dados
  );
}
