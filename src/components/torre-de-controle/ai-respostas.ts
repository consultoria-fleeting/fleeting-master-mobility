/**
 * Motor de respostas do Assistente de IA da Frota (mock para demonstração).
 *
 * Identifica a intenção da pergunta por palavras-chave (ou placa) e monta uma
 * resposta rica a partir dos MESMOS mocks usados na Torre de Controle e no mapa, para que
 * tudo seja coerente durante a apresentação.
 *
 * TODO(backend): substituir `gerarRespostaIA` por uma chamada ao endpoint de IA
 * (via BFF, sem expor chaves no cliente). O contrato `RespostaIA` pode ser mantido.
 */

import {
  CONDUTORES_ATENCAO,
  MANUTENCAO,
  TCO_RESUMO,
  VEICULOS_ATENCAO,
} from "./mock-data";
import { STATUS_CONFIG } from "./mapa/config";
import { obterResumoFrota, obterVeiculoPorPlaca } from "./mapa/dados-frota";

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
  "Quais veículos têm alerta crítico agora?",
  "Resumo da frota em manutenção",
  "Qual filial teve maior consumo na semana?",
  "Como está o TCO deste mês?",
  "Condutores com CNH irregular",
  "Onde está o veículo SVR2C84?",
];

/** Etapas exibidas no estado "Analisando dados da frota..." */
export const ETAPAS_ANALISE = [
  "Consultando telemetria de 52 veículos",
  "Cruzando alertas, manutenções e CNHs",
  "Gerando resposta",
];

/* ========================================================= */
/*  DADOS AUXILIARES (mock)                                  */
/* ========================================================= */

/** Consumo de combustível por filial na última semana (mock) */
const CONSUMO_SEMANA = [
  { filial: "São Paulo — Matriz", valor: 1142, litros: 196, placaDestaque: "GHJ7E89" },
  { filial: "Campinas", valor: 486, litros: 84, placaDestaque: "MNB2M34" },
  { filial: "Rio de Janeiro", valor: 438, litros: 76, placaDestaque: "RIO3Q12" },
  { filial: "Belo Horizonte", valor: 401, litros: 69, placaDestaque: "PAM7V56" },
  { filial: "Curitiba", valor: 297, litros: 52, placaDestaque: "PRN8Y34" },
];

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Remove acentos e caixa para comparar palavras-chave */
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

function respostaVeiculo(placa: string): RespostaIA | null {
  const veiculo = obterVeiculoPorPlaca(placa);
  if (!veiculo) return null;

  const status = STATUS_CONFIG[veiculo.status].label.toLowerCase();
  const alerta = veiculo.alerta
    ? ` Atenção: ${veiculo.alerta.nivel === "critico" ? "alerta crítico" : "pendência"} — ${veiculo.alerta.descricao.toLowerCase()}.`
    : " Nenhuma pendência ativa para este veículo.";

  return {
    texto: `O ${veiculo.model} ${veiculo.plate} está ${status} em ${veiculo.address}, com ${veiculo.driver} como condutor. Última transmissão: ${veiculo.lastTransmission.toLowerCase()}.${alerta}`,
    metricas: [
      { label: "Velocidade", valor: `${veiculo.speed} km/h`, tom: veiculo.speed > 0 ? "sucesso" : "neutro" },
      { label: "Combustível", valor: `${veiculo.fuelLevel}%`, tom: veiculo.fuelLevel < 25 ? "perigo" : "indigo" },
      { label: "Odômetro", valor: `${veiculo.odometer.toLocaleString("pt-BR")} km`, tom: "neutro" },
    ],
    itens: [],
    acoes: [{ tipo: "focar-veiculo", placa: veiculo.plate, label: `Focar ${veiculo.plate} no mapa` }],
  };
}

function respostaAlertas(): RespostaIA {
  const criticos = VEICULOS_ATENCAO.filter((v) => v.status === "Crítico");
  const atencao = VEICULOS_ATENCAO.filter((v) => v.status === "Atenção");
  const cnhIrregular = CONDUTORES_ATENCAO.filter((c) => c.status !== "CNH à Vencer").length;

  return {
    texto: `Neste momento há ${criticos.length} veículos com alerta crítico e ${atencao.length} em atenção. A prioridade é o ${criticos[0].placa} (${criticos[0].modelo}), com revisão vencida há 42 dias em ${criticos[0].filial}, seguido do ${criticos[1].placa}, que está com sinistro em aberto e já foi encaminhado à oficina. Recomendo bloquear novas reservas do ${criticos[0].placa} até a revisão ser agendada.`,
    metricas: [
      { label: "Críticos", valor: String(criticos.length), tom: "perigo" },
      { label: "Em atenção", valor: String(atencao.length), tom: "alerta" },
      { label: "CNH irregular", valor: String(cnhIrregular), tom: "indigo" },
    ],
    itens: criticos.map((v) => ({
      titulo: `${v.placa} · ${v.modelo}`,
      descricao: `${v.pendencia} — ${v.filial}`,
      tom: "perigo" as const,
    })),
    acoes: criticos.map((v) => ({ tipo: "focar-veiculo" as const, placa: v.placa, label: `Focar ${v.placa} no mapa` })),
  };
}

function respostaManutencao(): RespostaIA {
  const { emManutencao } = obterResumoFrota();
  const custoManutencao = TCO_RESUMO.itens.find((i) => i.label === "Manutenção")?.valor ?? 0;
  const totalTco = TCO_RESUMO.itens.reduce((soma, i) => soma + i.valor, 0);
  const percentual = Math.round((custoManutencao / totalTco) * 100);
  const porLabel = Object.fromEntries(MANUTENCAO.map((m) => [m.label, m.quantidade]));

  return {
    texto: `Hoje ${emManutencao.length} veículos estão fora de operação por manutenção: ${emManutencao.map((v) => `${v.plate} (${v.filial})`).join(", ")}. Há ${porLabel["Rev. Vencidas"]} revisão vencida e ${porLabel["Rev. a Vencer"]} a vencer nos próximos 30 dias. O custo de manutenção do mês soma ${formatoMoeda.format(custoManutencao)}, ${percentual}% do TCO da frota.`,
    metricas: [
      { label: "Em oficina", valor: String(porLabel["Em Oficina"]), tom: "neutro" },
      { label: "Rev. vencidas", valor: String(porLabel["Rev. Vencidas"]), tom: "perigo" },
      { label: "Rev. a vencer", valor: String(porLabel["Rev. a Vencer"]), tom: "alerta" },
      { label: "Custo no mês", valor: `R$ ${(custoManutencao / 1000).toFixed(1).replace(".", ",")} mil`, tom: "indigo" },
    ],
    itens: emManutencao.map((v) => ({
      titulo: `${v.plate} · ${v.model}`,
      descricao: v.alerta ? `${v.alerta.descricao} — ${v.filial}` : `Manutenção preventiva — ${v.filial}`,
      tom: v.alerta?.nivel === "critico" ? ("perigo" as const) : ("alerta" as const),
    })),
    acoes: emManutencao.slice(0, 2).map((v) => ({
      tipo: "focar-veiculo" as const,
      placa: v.plate,
      label: `Focar ${v.plate} no mapa`,
    })),
  };
}

function respostaConsumo(): RespostaIA {
  const total = CONSUMO_SEMANA.reduce((soma, f) => soma + f.valor, 0);
  const litros = CONSUMO_SEMANA.reduce((soma, f) => soma + f.litros, 0);
  const lider = CONSUMO_SEMANA[0];
  const participacao = Math.round((lider.valor / total) * 100);

  return {
    texto: `Na última semana, a filial ${lider.filial} liderou o consumo com ${formatoMoeda.format(lider.valor)} em ${lider.litros} litros — ${participacao}% do gasto da frota —, puxada principalmente pelas picapes a diesel em rota (destaque para a ${lider.placaDestaque}). Em seguida aparecem ${CONSUMO_SEMANA[1].filial} e ${CONSUMO_SEMANA[2].filial}. A média de consumo da frota está em 11,6 km/L, 2% melhor que o mês anterior.`,
    metricas: [
      { label: "Gasto na semana", valor: formatoMoeda.format(total), tom: "indigo" },
      { label: "Litros", valor: `${litros} L`, tom: "neutro" },
      { label: "Média", valor: "11,6 km/L", tom: "sucesso" },
    ],
    itens: CONSUMO_SEMANA.slice(0, 3).map((f, i) => ({
      titulo: `${i + 1}º ${f.filial}`,
      descricao: `${formatoMoeda.format(f.valor)} · ${f.litros} L`,
      tom: i === 0 ? ("alerta" as const) : ("neutro" as const),
    })),
    acoes: [{ tipo: "focar-veiculo", placa: lider.placaDestaque, label: `Focar ${lider.placaDestaque} no mapa` }],
  };
}

function respostaTco(): RespostaIA {
  const [maior] = [...TCO_RESUMO.itens].sort((a, b) => b.valor - a.valor);
  const totalTco = TCO_RESUMO.itens.reduce((soma, i) => soma + i.valor, 0);

  return {
    texto: `O TCO do mês está em ${TCO_RESUMO.total}, alta de 3% sobre o mês anterior (R$ 84,9 mil). ${maior.label} é o maior componente, com ${Math.round((maior.valor / totalTco) * 100)}% do total. A boa notícia: o custo por km caiu 6%, para R$ 2,38, indicando melhor aproveitamento da frota. A média por veículo é de ${TCO_RESUMO.mediaPorVeiculo}.`,
    metricas: [
      { label: "TCO do mês", valor: TCO_RESUMO.total, tom: "alerta" },
      { label: "Custo por km", valor: "R$ 2,38", tom: "sucesso" },
      { label: "Média/veículo", valor: TCO_RESUMO.mediaPorVeiculo, tom: "indigo" },
    ],
    itens: TCO_RESUMO.itens.slice(0, 3).map((i) => ({
      titulo: i.label,
      descricao: `R$ ${(i.valor / 1000).toFixed(1).replace(".", ",")} mil · ${Math.round((i.valor / totalTco) * 100)}% do TCO`,
      tom: "neutro" as const,
    })),
    acoes: [],
  };
}

function respostaCondutores(): RespostaIA {
  const vencidas = CONDUTORES_ATENCAO.filter((c) => c.status === "CNH Vencida");
  const impedimento = CONDUTORES_ATENCAO.filter((c) => c.status === "CNH com Impedimento");
  const aVencer = CONDUTORES_ATENCAO.filter((c) => c.status === "CNH à Vencer");

  return {
    texto: `${CONDUTORES_ATENCAO.length} condutores exigem atenção. ${vencidas[0].nome} está com a CNH vencida desde 12/06 e já foi bloqueado para novas reservas; ${impedimento[0].nome} tem a CNH suspensa por pontuação (22 pontos em 12 meses). Outros ${aVencer.length} condutores estão dentro da janela de 60 dias para renovação — o mais urgente é ${aVencer[0].nome}, com vencimento em 18 dias.`,
    metricas: [
      { label: "CNH vencida", valor: String(vencidas.length), tom: "perigo" },
      { label: "Impedimento", valor: String(impedimento.length), tom: "indigo" },
      { label: "A vencer (60d)", valor: String(aVencer.length), tom: "alerta" },
    ],
    itens: [...vencidas, ...impedimento].map((c) => ({
      titulo: c.nome,
      descricao: `${c.status} · ${c.veiculo}`,
      tom: c.status === "CNH Vencida" ? ("perigo" as const) : ("indigo" as const),
    })),
    acoes: [...vencidas, ...impedimento].map((c) => {
      const placa = c.veiculo.split(" · ")[0];
      return { tipo: "focar-veiculo" as const, placa, label: `Ver veículo de ${c.nome.split(" ")[0]}` };
    }),
  };
}

function respostaPanorama(prefixo: string): RespostaIA {
  const resumo = obterResumoFrota();
  return {
    texto: `${prefixo}A frota tem ${resumo.total} veículos ativos: ${resumo.porStatus.in_transit} em rota agora, ${resumo.porStatus.parked} estacionados, ${resumo.porStatus.depot} no pátio e ${resumo.porStatus.maintenance} em manutenção. Por contrato, são ${resumo.porGrupo["Vivo"] ?? 0} veículos Vivo, ${resumo.porGrupo["Comgás"] ?? 0} Comgás e ${resumo.porGrupo["Coprel"] ?? 0} Coprel. ${resumo.comAlerta.length} veículos têm pendências abertas.`,
    metricas: [
      { label: "Em rota", valor: String(resumo.porStatus.in_transit), tom: "sucesso" },
      { label: "Estacionados", valor: String(resumo.porStatus.parked), tom: "indigo" },
      { label: "Pátio", valor: String(resumo.porStatus.depot), tom: "neutro" },
      { label: "Manutenção", valor: String(resumo.porStatus.maintenance), tom: "alerta" },
    ],
    itens: [],
    acoes: [],
  };
}

/* ========================================================= */
/*  ROTEADOR DE INTENÇÕES                                    */
/* ========================================================= */

export function gerarRespostaIA(pergunta: string): RespostaIA {
  const placa = extrairPlaca(pergunta);
  if (placa) {
    const resposta = respostaVeiculo(placa);
    if (resposta) return resposta;
  }

  const texto = normalizar(pergunta);

  if (contemAlguma(texto, ["critic", "alerta", "urgent", "risco", "problema"])) return respostaAlertas();
  if (contemAlguma(texto, ["manuten", "oficina", "revis", "sinistro"])) return respostaManutencao();
  if (contemAlguma(texto, ["consumo", "abastec", "combust", "litro", "gasolina", "diesel"])) return respostaConsumo();
  if (contemAlguma(texto, ["tco", "custo", "gasto", "financ", "despesa"])) return respostaTco();
  if (contemAlguma(texto, ["cnh", "condutor", "motorista", "habilita"])) return respostaCondutores();
  if (contemAlguma(texto, ["rota", "status", "frota", "resumo", "quantos", "panorama", "geral"])) {
    return respostaPanorama("");
  }

  return respostaPanorama(
    "Na versão de demonstração eu respondo sobre alertas, manutenção, consumo, TCO, CNHs e placas específicas. Enquanto isso, aqui vai um panorama: "
  );
}
