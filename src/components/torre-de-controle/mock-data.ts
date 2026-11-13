/**
 * Dados mockados e motor de consolidação da Torre de Controle V1.
 *
 * Implementa as decisões fechadas de Produto (13/11/2026):
 * - Período em mês fechado (sem intervalo personalizado; variação vs. mês fechado anterior);
 * - Filtro de agrupamento dinâmico conforme o nível hierárquico do perfil do usuário
 *   (`Filiais`, `Unidades de Negócio`, `Regionais` ou `Departamentos`);
 * - 3 quadros 2×2 consistentes (Manutenções, Sinistros e Multas & CNH);
 * - Gráfico de KM dos últimos 12 meses fechados (janela móvel);
 * - Fórmula explícita de consumo `(km final − km inicial) ÷ litros abastecidos` no KPI Abastecimento.
 *
 * Valores determinísticos (sem `Math.random`) para evitar hydration mismatch.
 */

import type { ContagemStatus, EscopoFrotaFiltro, NivelAgrupamento, VeiculoFrota } from "@/types/frota-mapa";
import type {
  AtividadeRecente,
  BarraKm,
  CategoriaTco,
  CondutorAtencao,
  FiltrosTorre,
  ItemQuadroResumo,
  KpiTorre,
  MesTco,
  OpcaoFiltro,
  VeiculoAtencao,
} from "@/types/torre-de-controle";
import { criarContagemStatusVazia } from "./mapa/config";
import {
  DEPARTAMENTOS_ADMIN_RESTRITO,
  FROTA_COMPLETA,
  filtrarFrotaPorEscopo,
} from "./mapa/dados-frota";
import { formatarMoedaCompacta, totalDoMes } from "./tco/tco-utils";

/* ========================================================= */
/*  PALETA (Design Tokens da identidade Índigo)              */
/* ========================================================= */

export const CORES = {
  indigoProfundo: "#1E1B4B",
  indigoBorda: "#312E81",
  indigo: "#4F46E5",
  indigoHover: "#4338CA",
  indigoClaro: "#EEF2FF",
  indigoBordaClara: "#C7D2FE",
  indigo400: "#818CF8",
  indigo300: "#A5B4FC",
  indigo200: "#E0E7FF",
  ouro: "#D4AB00",
  textoForte: "#1E1B4B",
  textoCorpo: "#334155",
  textoMuted: "#64748B",
  textoSuave: "#94A3B8",
  perigo: "#E11D48",
  alerta: "#D97706",
  alertaEscuro: "#B45309",
  sucesso: "#059669",
  bordaCard: "#E7E7F0",
  canvas: "#F4F4F8",
} as const;

export const MESES_COMPLETOS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

/** Último mês fechado na linha do tempo do projeto (Novembro/2026 em andamento → Outubro/2026 fechado) */
export const ULTIMO_MES_FECHADO_2026 = 10;

/* ========================================================= */
/*  OPÇÕES DOS FILTROS DO CABEÇALHO (V1)                     */
/* ========================================================= */

export const OPCOES_ANO: OpcaoFiltro[] = ["2026", "2025", "2024"].map((ano) => ({
  valor: ano,
  label: ano,
}));

/**
 * Retorna os meses do seletor de período (mês fechado).
 * Em 2026, Novembro e Dezembro ainda não fecharam e ficam desabilitados.
 */
export function obterOpcoesMesFechado(ano: string): OpcaoFiltro[] {
  return MESES_COMPLETOS.map((nome, indice) => {
    const numeroMes = indice + 1;
    const naoFechado = ano === "2026" && numeroMes > ULTIMO_MES_FECHADO_2026;
    return {
      valor: String(numeroMes),
      label: naoFechado ? `${nome} (aberto)` : nome,
      desabilitado: naoFechado,
    };
  });
}

/** Perfis simulados para demonstrar ao vivo a regra #2 (rótulo e escopo dinâmicos por permissão) */
export interface ConfigPerfilAgrupamento {
  valor: NivelAgrupamento;
  /** Rótulo exibido no filtro de agrupamento (muda conforme o nível mais alto do perfil) */
  rotuloFiltro: "Filiais" | "Unidades de Negócio" | "Regionais" | "Departamentos";
  /** Rótulo enxuto da opção padrão "todos" (dispensa prefixo repetitivo no cabeçalho) */
  rotuloTodosCompacto: string;
  /** Nome curto usado no seletor discreto de demonstração */
  rotuloDemo: string;
  /** Explicação do escopo de permissão ativo (exibida no Relatório Gerencial e em tooltips) */
  descricaoEscopo: string;
}

export const PERFIS_AGRUPAMENTO_DEMO: ConfigPerfilAgrupamento[] = [
  {
    valor: "filiais",
    rotuloFiltro: "Filiais",
    rotuloTodosCompacto: "Todas Filiais",
    rotuloDemo: "Super Admin · Filiais",
    descricaoEscopo: "Super Admin — acesso integral a todas as Filiais da organização",
  },
  {
    valor: "regionais",
    rotuloFiltro: "Regionais",
    rotuloTodosCompacto: "Todas Regionais",
    rotuloDemo: "Union Agro · Regionais",
    descricaoEscopo: "Visão por Regionais — acesso a todas as Regionais habilitadas",
  },
  {
    valor: "unidades",
    rotuloFiltro: "Unidades de Negócio",
    rotuloTodosCompacto: "Todas Unidades",
    rotuloDemo: "Super Admin · Unidades",
    descricaoEscopo: "Visão por Unidades de Negócio — todas as unidades do escopo",
  },
  {
    valor: "departamentos_restrito",
    rotuloFiltro: "Departamentos",
    rotuloTodosCompacto: `Meus Deptos. (${DEPARTAMENTOS_ADMIN_RESTRITO.length})`,
    rotuloDemo: "Admin · 3 Deptos.",
    descricaoEscopo: `Admin restrito — limitado a ${DEPARTAMENTOS_ADMIN_RESTRITO.length} departamentos (${DEPARTAMENTOS_ADMIN_RESTRITO.join(", ")})`,
  },
];

export function obterConfigPerfilAgrupamento(perfil: NivelAgrupamento): ConfigPerfilAgrupamento {
  return PERFIS_AGRUPAMENTO_DEMO.find((p) => p.valor === perfil) ?? PERFIS_AGRUPAMENTO_DEMO[0];
}

/** Gera as opções do select de Agrupamento respeitando o nível mais alto e a permissão do perfil */
export function obterOpcoesAgrupamento(perfil: NivelAgrupamento): OpcaoFiltro[] {
  const config = obterConfigPerfilAgrupamento(perfil);
  const opcaoPadrao: OpcaoFiltro = { valor: "todos", label: config.rotuloTodosCompacto };

  if (perfil === "departamentos_restrito") {
    return [
      opcaoPadrao,
      ...DEPARTAMENTOS_ADMIN_RESTRITO.map((dep) => ({ valor: dep, label: dep })),
    ];
  }

  const valoresUnicos = Array.from(
    new Set(
      FROTA_COMPLETA.map((v) => {
        if (perfil === "filiais") return v.filial;
        if (perfil === "regionais") return v.regional;
        return v.unidadeNegocio;
      })
    )
  );

  return [opcaoPadrao, ...valoresUnicos.map((item) => ({ valor: item, label: item }))];
}

export const OPCOES_LOCADORA: OpcaoFiltro[] = [
  { valor: "todas", label: "Todas Locadoras" },
  { valor: "Localiza", label: "Localiza" },
  { valor: "Movida", label: "Movida" },
  { valor: "Unidas", label: "Unidas" },
  { valor: "Frota Própria", label: "Frota Própria" },
];

/* ========================================================= */
/*  BASES OPERACIONAIS (TABELAS DE ATENÇÃO E ATIVIDADES)     */
/* ========================================================= */

export const VEICULOS_ATENCAO_BASE: VeiculoAtencao[] = [
  {
    placa: "SVR2C84",
    modelo: "Fiat Strada",
    condutor: "Carlos Mendes",
    pendencia: "Revisão vencida há 42 dias",
    status: "Crítico",
    filial: "São Paulo — Matriz",
    km: "61.240 km",
    revisao: "Vencida em 26/09/2026",
  },
  {
    placa: "QRN8H73",
    modelo: "VW Saveiro",
    condutor: "—",
    pendencia: "Sinistro em aberto · Em oficina",
    status: "Crítico",
    filial: "Campinas",
    km: "48.902 km",
    revisao: "Em dia",
  },
  {
    placa: "BRA4E21",
    modelo: "Chevrolet Onix",
    condutor: "João Silva",
    pendencia: "CNH vence em 18 dias",
    status: "Atenção",
    filial: "Rio de Janeiro",
    km: "35.117 km",
    revisao: "Em dia",
  },
  {
    placa: "RDX7J99",
    modelo: "Fiat Mobi",
    condutor: "Ana Paula",
    pendencia: "KM 32% acima da média",
    status: "Atenção",
    filial: "Belo Horizonte",
    km: "72.586 km",
    revisao: "A vencer em 29/11/2026",
  },
  {
    placa: "HST3A16",
    modelo: "Toyota Hilux",
    condutor: "Pedro Alves",
    pendencia: "Licenciamento a vencer",
    status: "Atenção",
    filial: "Curitiba",
    km: "54.330 km",
    revisao: "Em dia",
  },
  {
    placa: "MKP2D45",
    modelo: "Renault Kwid",
    condutor: "Luiza Costa",
    pendencia: "Multa pendente de identificação",
    status: "Atenção",
    filial: "São Paulo — Matriz",
    km: "22.408 km",
    revisao: "Em dia",
  },
  {
    placa: "ZXC3J12",
    modelo: "Renault Master",
    condutor: "Marcelo Tavares",
    pendencia: "Sem posição de telemetria há 11 dias",
    status: "Atenção",
    filial: "São Paulo — Matriz",
    km: "68.190 km",
    revisao: "Em dia",
  },
];

export const CONDUTORES_ATENCAO_BASE: CondutorAtencao[] = [
  {
    nome: "Marcos Ferreira",
    filial: "Campinas",
    status: "CNH Vencida",
    categoria: "B",
    validade: "Vencida em 12/09/2026",
    veiculo: "QRN8H73 · VW Saveiro",
    obs: "Condutor bloqueado para novas reservas até regularização.",
  },
  {
    nome: "Fernanda Lima",
    filial: "São Paulo — Matriz",
    status: "CNH com Impedimento",
    categoria: "AB",
    validade: "Válida até 03/2028",
    veiculo: "SVR2C84 · Fiat Strada",
    obs: "Suspensão por pontuação — 22 pontos nos últimos 12 meses.",
  },
  {
    nome: "João Silva",
    filial: "Rio de Janeiro",
    status: "CNH à Vencer",
    categoria: "B",
    validade: "Vence em 01/12/2026 (18 dias)",
    veiculo: "BRA4E21 · Chevrolet Onix",
    obs: "Renovação ainda não iniciada. Notificar o condutor.",
  },
  {
    nome: "Pedro Alves",
    filial: "Curitiba",
    status: "CNH à Vencer",
    categoria: "AE",
    validade: "Vence em 17/12/2026 (34 dias)",
    veiculo: "HST3A16 · Toyota Hilux",
    obs: "Renovação agendada no Detran-PR.",
  },
  {
    nome: "Ana Paula",
    filial: "Belo Horizonte",
    status: "CNH à Vencer",
    categoria: "B",
    validade: "Vence em 04/01/2027 (52 dias)",
    veiculo: "RDX7J99 · Fiat Mobi",
    obs: "Dentro da janela de 60 dias. Acompanhar renovação.",
  },
];

export const ATIVIDADES_BASE: AtividadeRecente[] = [
  { titulo: "Sinistro Registrado", meta: "QRN8H73 · há 2 horas", cor: "#E11D48", placa: "QRN8H73" },
  { titulo: "Multa Autuada", meta: "BRA4E21 · há 5 horas", cor: "#D97706", placa: "BRA4E21" },
  { titulo: "Manutenção Concluída", meta: "HST3A16 · há 8 horas", cor: "#312E81", placa: "HST3A16" },
  { titulo: "Abastecimento", meta: "RDX7J99 · ontem", cor: "#818CF8", placa: "RDX7J99" },
  { titulo: "Falha de Telemetria (+7d)", meta: "ZXC3J12 · ontem", cor: "#64748B", placa: "ZXC3J12" },
  { titulo: "Entrada em Oficina", meta: "CTG5X12 · ontem", cor: "#F59E0B", placa: "CTG5X12" },
  { titulo: "Condutor Cadastrado", meta: "Luiza Costa · há 2 dias", cor: "#818CF8", placa: "MKP2D45" },
  { titulo: "Revisão Agendada", meta: "MKP2D45 · há 2 dias", cor: "#312E81", placa: "MKP2D45" },
  { titulo: "Multa Indicada", meta: "SVR2C84 · há 3 dias", cor: "#D97706", placa: "SVR2C84" },
  { titulo: "Checklist Diário", meta: "Frota ativa · há 3 dias", cor: "#94A3B8" },
];

/* ========================================================= */
/*  HISTÓRICO MENSAL DETERMINÍSTICO (2024 A OUT/2026)        */
/* ========================================================= */

export const CATEGORIAS_TCO: CategoriaTco[] = [
  { id: "combustivel", label: "Combustível", cor: "#312E81" },
  { id: "manutencao", label: "Manutenção", cor: "#6366F1" },
  { id: "aluguel", label: "Aluguel", cor: "#A5B4FC" },
  { id: "multas", label: "Multas", cor: "#D4AB00" },
  { id: "sinistros", label: "Sinistros", cor: "#E11D48" },
];

function criarMesTco(chave: string, veiculos: number, custos: MesTco["custos"]): MesTco {
  const [ano, mes] = chave.split("-");
  const nomeMes = MESES_COMPLETOS[Number(mes) - 1];
  return {
    chave,
    ano,
    mes: nomeMes.slice(0, 3),
    mesCompleto: `${nomeMes}/${ano}`,
    veiculos,
    custos,
  };
}

/**
 * Série de referência dos últimos 12 meses até Outubro/2026 (mantém os números já validados).
 * Para meses anteriores a Nov/2025, gera valores determinísticos coerentes.
 */
const HISTORICO_TCO_REFERENCIA: Record<string, { veiculos: number; custos: MesTco["custos"]; km: number }> = {
  "2025-11": { veiculos: 48, km: 3210, custos: { combustivel: 46800, manutencao: 15200, aluguel: 8100, multas: 3600, sinistros: 0 } },
  "2025-12": { veiculos: 48, km: 3680, custos: { combustivel: 48200, manutencao: 17900, aluguel: 8100, multas: 5100, sinistros: 6200 } },
  "2026-01": { veiculos: 49, km: 2980, custos: { combustivel: 47100, manutencao: 16400, aluguel: 8100, multas: 4300, sinistros: 1800 } },
  "2026-02": { veiculos: 49, km: 2790, custos: { combustivel: 45900, manutencao: 14800, aluguel: 8100, multas: 2900, sinistros: 0 } },
  "2026-03": { veiculos: 50, km: 3420, custos: { combustivel: 49300, manutencao: 15600, aluguel: 8100, multas: 3800, sinistros: 2400 } },
  "2026-04": { veiculos: 50, km: 3190, custos: { combustivel: 48700, manutencao: 19800, aluguel: 8300, multas: 4600, sinistros: 0 } },
  "2026-05": { veiculos: 50, km: 3560, custos: { combustivel: 50400, manutencao: 16900, aluguel: 8300, multas: 3300, sinistros: 3900 } },
  "2026-06": { veiculos: 51, km: 3740, custos: { combustivel: 51200, manutencao: 17300, aluguel: 8300, multas: 5400, sinistros: 1200 } },
  "2026-07": { veiculos: 51, km: 4380, custos: { combustivel: 53800, manutencao: 18200, aluguel: 8300, multas: 4800, sinistros: 7600 } },
  "2026-08": { veiculos: 52, km: 3350, custos: { combustivel: 51900, manutencao: 16700, aluguel: 8300, multas: 3900, sinistros: 2100 } },
  "2026-09": { veiculos: 52, km: 3321, custos: { combustivel: 50600, manutencao: 18100, aluguel: 8300, multas: 4500, sinistros: 3400 } },
  "2026-10": { veiculos: 52, km: 3659, custos: { combustivel: 52100, manutencao: 18600, aluguel: 8300, multas: 4200, sinistros: 4200 } },
};

function obterRegistroMensalBase(anoNum: number, mesNum: number) {
  const chave = `${anoNum}-${String(mesNum).padStart(2, "0")}`;
  const existente = HISTORICO_TCO_REFERENCIA[chave];
  if (existente) return { chave, ...existente };

  // Fallback determinístico para meses de 2024 e início de 2025
  const semente = anoNum * 12 + mesNum;
  const oscilacao = ((semente * 7) % 9) - 4;
  return {
    chave,
    veiculos: Math.max(44, 48 + Math.floor((anoNum - 2025) * 2)),
    km: 3150 + oscilacao * 115,
    custos: {
      combustivel: 46200 + oscilacao * 950,
      manutencao: 15800 + ((semente * 3) % 5) * 650,
      aluguel: 7900,
      multas: 3500 + ((semente * 5) % 4) * 420,
      sinistros: semente % 3 === 0 ? 0 : 1900 + (semente % 4) * 900,
    },
  };
}

/** Gera `quantidade` meses fechados terminando em `(anoFim, mesFim)` em ordem cronológica */
function gerarJanelaMesesFechados(anoFim: number, mesFim: number, quantidade: number) {
  const resultado: ReturnType<typeof obterRegistroMensalBase>[] = [];
  for (let deslocamento = quantidade - 1; deslocamento >= 0; deslocamento--) {
    const totalMeses = anoFim * 12 + (mesFim - 1) - deslocamento;
    const a = Math.floor(totalMeses / 12);
    const m = (totalMeses % 12) + 1;
    resultado.push(obterRegistroMensalBase(a, m));
  }
  return resultado;
}

/* ========================================================= */
/*  CONSOLIDAÇÃO COMPLETA DA TELA POR PERÍODO + ESCOPO       */
/* ========================================================= */

const formatoInteiro = new Intl.NumberFormat("pt-BR");
const formatoDecimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const formatoMoedaUnidade = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatarDeltaPercentual(atual: number, anterior: number): { delta: string; percentual: number } {
  if (anterior <= 0) return { delta: "—", percentual: 0 };
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  if (pct === 0) return { delta: "0%", percentual: 0 };
  return {
    delta: `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct)}%`,
    percentual: pct,
  };
}

export interface DadosTorreConsolidados {
  escopoMapa: EscopoFrotaFiltro;
  veiculosEscopo: VeiculoFrota[];
  contagemStatusMapa: ContagemStatus;
  periodoRotulo: string;
  mesAnteriorRotulo: string;
  escopoRotulo: string;
  kpis: KpiTorre[];
  historicoTco: MesTco[];
  barrasKm12Meses: BarraKm[];
  intervaloKmRotulo: string;
  totalKm12Meses: number;
  veiculosAtencao: VeiculoAtencao[];
  condutoresAtencao: CondutorAtencao[];
  atividades: AtividadeRecente[];
  quadroManutencoes: ItemQuadroResumo[];
  quadroMultasCnh: ItemQuadroResumo[];
  quadroSinistros: ItemQuadroResumo[];
}

export function obterDadosTorre(filtros: FiltrosTorre): DadosTorreConsolidados {
  const escoMapa: EscopoFrotaFiltro = {
    perfilDemo: filtros.perfilDemo,
    agrupamento: filtros.agrupamento,
    locadora: filtros.locadora,
  };

  const veiculosEscopo = filtrarFrotaPorEscopo(escoMapa);
  const placasNoEscopo = new Set(veiculosEscopo.map((v) => v.plate));
  const fatorEscopo = FROTA_COMPLETA.length > 0 ? veiculosEscopo.length / FROTA_COMPLETA.length : 0;

  const contagemStatusMapa = criarContagemStatusVazia();
  veiculosEscopo.forEach((v) => contagemStatusMapa[v.status]++);

  const anoNum = Number(filtros.ano) || 2026;
  const mesBruto = Number(filtros.mes) || ULTIMO_MES_FECHADO_2026;
  const mesNum = anoNum === 2026 ? Math.min(mesBruto, ULTIMO_MES_FECHADO_2026) : mesBruto;

  // Janela de 13 meses fechados: índice 12 = mês filtrado, índice 11 = mês fechado anterior, índices 1..12 = últimos 12 meses
  const janela13 = gerarJanelaMesesFechados(anoNum, mesNum, 13);
  const janela12 = janela13.slice(1);
  const regAtualBase = janela13[12];
  const regAnteriorBase = janela13[11];

  const escalarMoeda = (valor: number) => Math.round(valor * fatorEscopo);
  const escalarContagem = (valor: number) =>
    veiculosEscopo.length === 0 ? 0 : Math.max(0, Math.round(valor * fatorEscopo));

  const historicoTco: MesTco[] = janela12.map((reg) =>
    criarMesTco(
      reg.chave,
       Math.max(veiculosEscopo.length > 0 ? 1 : 0, Math.round(reg.veiculos * fatorEscopo)),
      {
        combustivel: escalarMoeda(reg.custos.combustivel),
        manutencao: escalarMoeda(reg.custos.manutencao),
        aluguel: escalarMoeda(reg.custos.aluguel),
        multas: escalarMoeda(reg.custos.multas),
        sinistros: escalarMoeda(reg.custos.sinistros),
      }
    )
  );

  const mesTcoAtual = historicoTco[historicoTco.length - 1];
  const mesTcoAnterior = criarMesTco(
    regAnteriorBase.chave,
    Math.max(veiculosEscopo.length > 0 ? 1 : 0, Math.round(regAnteriorBase.veiculos * fatorEscopo)),
    {
      combustivel: escalarMoeda(regAnteriorBase.custos.combustivel),
      manutencao: escalarMoeda(regAnteriorBase.custos.manutencao),
      aluguel: escalarMoeda(regAnteriorBase.custos.aluguel),
      multas: escalarMoeda(regAnteriorBase.custos.multas),
      sinistros: escalarMoeda(regAnteriorBase.custos.sinistros),
    }
  );

  const idsCategorias = CATEGORIAS_TCO.map((c) => c.id);
  const totalTcoAtual = totalDoMes(mesTcoAtual, idsCategorias);
  const totalTcoAnterior = totalDoMes(mesTcoAnterior, idsCategorias);
  const varTco = formatarDeltaPercentual(totalTcoAtual, totalTcoAnterior);

  // Gráfico "KM rodado nos últimos 12 meses"
  const barrasKm12Meses: BarraKm[] = janela12.map((reg, idx) => {
    const [a, m] = reg.chave.split("-");
    const nomeMes = MESES_COMPLETOS[Number(m) - 1];
    const anoCurto = a.slice(2);
    return {
      chave: reg.chave,
      mes: `${nomeMes.slice(0, 3)}/${anoCurto}`,
      mesCompleto: `${nomeMes}/${a}`,
      km: Math.round(reg.km * fatorEscopo),
      destaque: idx === janela12.length - 1,
    };
  });

  const totalKm12Meses = barrasKm12Meses.reduce((soma, b) => soma + b.km, 0);
  const primeiroMes12 = barrasKm12Meses[0];
  const ultimoMes12 = barrasKm12Meses[barrasKm12Meses.length - 1];
  const intervaloKmRotulo = `${primeiroMes12.mes} – ${ultimoMes12.mes}`;

  // Tabelas filtradas pelo escopo ativo
  const veiculosAtencao = VEICULOS_ATENCAO_BASE.filter((v) => placasNoEscopo.has(v.placa));
  const condutoresAtencao = CONDUTORES_ATENCAO_BASE.filter((c) => {
    const placa = c.veiculo.split(" · ")[0];
    return placasNoEscopo.has(placa);
  });
  const atividades = ATIVIDADES_BASE.filter((a) => !a.placa || placasNoEscopo.has(a.placa));

  // Cálculos de Custo/KM e Abastecimento (km/l = (km final - km inicial) ÷ litros abastecidos)
  const kmMesAtual = ultimoMes12.km;
  const kmMesAnterior = Math.max(1, Math.round(regAnteriorBase.km * fatorEscopo));
  const custoOperacionalMes =
    mesTcoAtual.custos.combustivel + mesTcoAtual.custos.manutencao + mesTcoAtual.custos.aluguel;
  const custoOperacionalAnterior =
    mesTcoAnterior.custos.combustivel +
    mesTcoAnterior.custos.manutencao +
    mesTcoAnterior.custos.aluguel;

  const custoPorKmAtual = kmMesAtual > 0 ? (custoOperacionalMes / 1000) / (kmMesAtual / 105) : 0;
  const custoPorKmAnterior =
    kmMesAnterior > 0 ? (custoOperacionalAnterior / 1000) / (kmMesAnterior / 105) : 0;
  const varCustoKm = formatarDeltaPercentual(custoPorKmAtual, custoPorKmAnterior);

  const litrosMesAtual = Math.max(0, Math.round(988 * (regAtualBase.custos.combustivel / 52100) * fatorEscopo));
  const gastoAbastecimentoAtual = Math.round(9100 * (regAtualBase.custos.combustivel / 52100) * fatorEscopo);
  const gastoAbastecimentoAnterior = Math.round(
    9100 * (regAnteriorBase.custos.combustivel / 52100) * fatorEscopo
  );
  const varAbastecimento = formatarDeltaPercentual(gastoAbastecimentoAtual, gastoAbastecimentoAnterior);

  // Fórmula oficial (#4): (km final − km inicial) ÷ litros abastecidos no período
  const deslocamentoApuradoKm = Math.round(litrosMesAtual * 11.6);
  const mediaConsumoKmL = litrosMesAtual > 0 ? deslocamentoApuradoKm / litrosMesAtual : 0;
  const precoMedioLitro = litrosMesAtual > 0 ? gastoAbastecimentoAtual / litrosMesAtual : 0;

  // Condutores ativos no escopo
  const condutoresAtivosCount = new Set(
    veiculosEscopo
      .map((v) => v.driver)
      .filter((nome) => nome !== "Sem condutor vinculado" && nome !== "—")
  ).size;
  const cnhVencidasCount = condutoresAtencao.filter((c) => c.status === "CNH Vencida").length;
  const cnhImpedimentoCount = condutoresAtencao.filter((c) => c.status === "CNH com Impedimento").length;
  const cnhAVencerCount = condutoresAtencao.filter((c) => c.status === "CNH à Vencer").length;
  const cnhRegularesCount = Math.max(
    0,
    condutoresAtivosCount - cnhVencidasCount - cnhImpedimentoCount - cnhAVencerCount
  );

  const nomeMesFiltrado = MESES_COMPLETOS[mesNum - 1];
  const [anoAntStr, mesAntStr] = regAnteriorBase.chave.split("-");
  const nomeMesAnterior = `${MESES_COMPLETOS[Number(mesAntStr) - 1]}/${anoAntStr}`;
  const periodoQuery = `mes=${mesNum}&ano=${anoNum}`;

  const kpis: KpiTorre[] = [
    {
      id: "veiculos-ativos",
      label: "Veículos Ativos",
      valor: String(veiculosEscopo.length),
      delta: "—",
      bom: null,
      tip: "Composição: total da frota ativa no escopo selecionado, distribuída nos 5 status exclusivos do mapa.",
      legenda: `vs. ${nomeMesAnterior} (mês fechado)`,
      detalhes: [
        { label: "Em Rota", valor: String(contagemStatusMapa.in_transit) },
        { label: "Parado", valor: String(contagemStatusMapa.stopped) },
        { label: "Em Oficina", valor: String(contagemStatusMapa.maintenance) },
        { label: "Sem posição (há mais de 7 dias)", valor: String(contagemStatusMapa.no_position) },
        { label: "Sem telemetria (cadastro)", valor: String(contagemStatusMapa.no_telemetry) },
      ],
    },
    {
      id: "condutores",
      label: "Condutores",
      valor: String(condutoresAtivosCount),
      delta: veiculosEscopo.length > 0 ? "▼ 1" : "—",
      bom: null,
      tip: "Composição: condutores ativos vinculados aos veículos do escopo selecionado.",
      legenda: `vs. ${nomeMesAnterior}`,
      detalhes: [
        { label: "CNH regular", valor: String(cnhRegularesCount) },
        { label: "CNH à vencer (60 dias)", valor: String(cnhAVencerCount) },
        { label: "CNH com impedimento", valor: String(cnhImpedimentoCount) },
        { label: "CNH vencida", valor: String(cnhVencidasCount) },
      ],
    },
    {
      id: "tco",
      label: "TCO do Mês",
      valor: formatarMoedaCompacta(totalTcoAtual),
      delta: varTco.delta,
      bom: varTco.percentual === 0 ? null : varTco.percentual < 0,
      tip: "Composição: soma dos custos fechados da frota no mês filtrado — combustível, manutenção, aluguel, multas e sinistros.",
      legenda: `vs. ${formatarMoedaCompacta(totalTcoAnterior)} em ${nomeMesAnterior}`,
      detalhes: [
        { label: "Combustível", valor: formatarMoedaCompacta(mesTcoAtual.custos.combustivel) },
        { label: "Manutenção", valor: formatarMoedaCompacta(mesTcoAtual.custos.manutencao) },
        { label: "Aluguel", valor: formatarMoedaCompacta(mesTcoAtual.custos.aluguel) },
        { label: "Multas", valor: formatarMoedaCompacta(mesTcoAtual.custos.multas) },
        { label: "Sinistros", valor: formatarMoedaCompacta(mesTcoAtual.custos.sinistros) },
      ],
    },
    {
      id: "custo-km",
      label: "Custo por KM (mês)",
      valor: formatoMoedaUnidade.format(custoPorKmAtual),
      delta: varCustoKm.delta,
      bom: varCustoKm.percentual === 0 ? null : varCustoKm.percentual < 0,
      tip: "Composição: (Combustível + Manutenção + Locação) ÷ total de KMs rodados no mês fechado.",
      legenda: `vs. ${formatoMoedaUnidade.format(custoPorKmAnterior)} em ${nomeMesAnterior}`,
      detalhes: [
        { label: "KMs rodados no mês fechado", valor: `${formatoInteiro.format(kmMesAtual)} km` },
        { label: "Custo operacional considerado", valor: formatarMoedaCompacta(custoOperacionalMes) },
        { label: "Referência mês anterior", valor: formatoMoedaUnidade.format(custoPorKmAnterior) },
      ],
    },
    {
      id: "abastecimento",
      label: "Abastecimento (mês)",
      valor: formatarMoedaCompacta(gastoAbastecimentoAtual),
      sub: `${formatoInteiro.format(litrosMesAtual)} L`,
      delta: varAbastecimento.delta,
      bom: varAbastecimento.percentual === 0 ? null : varAbastecimento.percentual < 0,
      tip: "Composição: total gasto e litros abastecidos no mês fechado. O consumo médio (km/l) usa a fórmula (km final − km inicial) ÷ litros abastecidos, no período.",
      legenda: `vs. ${formatarMoedaCompacta(gastoAbastecimentoAnterior)} em ${nomeMesAnterior}`,
      notaMetodologia:
        "Fórmula aplicada no consumo médio: (km final − km inicial) ÷ litros abastecidos no período fechado.",
      detalhes: [
        { label: "Litros abastecidos no período", valor: `${formatoInteiro.format(litrosMesAtual)} L` },
        { label: "Deslocamento apurado (km final − km inicial)", valor: `${formatoInteiro.format(deslocamentoApuradoKm)} km` },
        { label: "Média de consumo (km/l)", valor: `${formatoDecimal.format(mediaConsumoKmL)} km/l` },
        { label: "Preço médio por litro", valor: formatoMoedaUnidade.format(precoMedioLitro) },
      ],
    },
  ];

  /* ---------- Quadro #5: Manutenções (sem Sinistros) ---------- */
  const totalManutencoesMes = escalarContagem(Math.round(regAtualBase.custos.manutencao / 1320));
  const revisoesVencidas = veiculosAtencao.filter((v) => v.pendencia.toLowerCase().includes("revisão vencida")).length;
  const revisoesAVencer = escalarContagem(3);
  const veiculosEmOficina = contagemStatusMapa.maintenance;

  const quadroManutencoes: ItemQuadroResumo[] = [
    {
      id: "manut-total",
      label: "Total de Manutenções",
      valor: String(totalManutencoesMes),
      detalhe: "no mês",
      tom: "indigo",
      caminhoLegado: `/manutencao/?${periodoQuery}`,
    },
    {
      id: "manut-vencidas",
      label: "Revisões Vencidas",
      valor: String(revisoesVencidas),
      detalhe: "posição atual",
      tom: revisoesVencidas > 0 ? "perigo" : "neutro",
      caminhoLegado: "/manutencao/?recorte=revisoes-vencidas",
    },
    {
      id: "manut-a-vencer",
      label: "Revisões a Vencer",
      valor: String(revisoesAVencer),
      detalhe: "posição atual",
      tom: revisoesAVencer > 0 ? "alerta" : "neutro",
      caminhoLegado: "/manutencao/?recorte=revisoes-a-vencer",
    },
    {
      id: "manut-oficina",
      label: "Veículos em Oficina",
      valor: String(veiculosEmOficina),
      detalhe: "posição atual",
      tom: veiculosEmOficina > 0 ? "alerta" : "neutro",
      caminhoLegado: "/manutencao/?recorte=em-oficina",
    },
  ];

  /* ---------- Quadro #7: Multas & CNH (novo) ---------- */
  const totalInfracoesMes = escalarContagem(Math.round(regAtualBase.custos.multas / 465));
  const pendentesIdentificacao = veiculosAtencao.filter((v) =>
    v.pendencia.toLowerCase().includes("multa")
  ).length + escalarContagem(1);
  const multasVencidas = escalarContagem(2);

  const quadroMultasCnh: ItemQuadroResumo[] = [
    {
      id: "multas-total",
      label: "Total de Infrações",
      valor: String(totalInfracoesMes),
      detalhe: "no mês",
      tom: "indigo",
      caminhoLegado: `/multas-e-documentacao/?${periodoQuery}`,
    },
    {
      id: "multas-pendentes",
      label: "Pendentes de Identificação",
      valor: String(pendentesIdentificacao),
      detalhe: "posição atual",
      tom: pendentesIdentificacao > 0 ? "alerta" : "neutro",
      caminhoLegado: "/multas-e-documentacao/?recorte=pendentes-identificacao",
    },
    {
      id: "multas-vencidas",
      label: "Multas Vencidas",
      valor: String(multasVencidas),
      detalhe: "pagto. vencido",
      tom: multasVencidas > 0 ? "perigo" : "neutro",
      caminhoLegado: "/multas-e-documentacao/?recorte=multas-vencidas",
    },
    {
      id: "cnhs-vencidas",
      label: "CNHs Vencidas",
      valor: String(cnhVencidasCount),
      detalhe: "posição atual",
      tom: cnhVencidasCount > 0 ? "perigo" : "neutro",
      caminhoLegado: "/multas-e-documentacao/?recorte=cnhs-vencidas",
    },
  ];

  /* ---------- Quadro #6: Sinistros (novo) ---------- */
  const custoSinistrosMes = mesTcoAtual.custos.sinistros;
  const totalSinistrosMes =
    custoSinistrosMes === 0 ? 0 : Math.max(1, escalarContagem(Math.round(regAtualBase.custos.sinistros / 2100)));
  const sinistrosComVitima = regAtualBase.chave === "2026-07" && veiculosEscopo.length > 0 ? 1 : 0;
  const sinistrosPerdaTotal = regAtualBase.chave === "2025-12" && veiculosEscopo.length > 0 ? 1 : 0;

  const quadroSinistros: ItemQuadroResumo[] = [
    {
      id: "sinistros-total",
      label: "Total de Sinistros",
      valor: String(totalSinistrosMes),
      detalhe: "no mês",
      tom: totalSinistrosMes > 0 ? "alerta" : "neutro",
      caminhoLegado: `/sinistro/?${periodoQuery}`,
    },
    {
      id: "sinistros-vitima",
      label: "Com Vítima",
      valor: String(sinistrosComVitima),
      detalhe: "no mês",
      tom: sinistrosComVitima > 0 ? "perigo" : "neutro",
      caminhoLegado: `/sinistro/?recorte=com-vitima&${periodoQuery}`,
    },
    {
      id: "sinistros-pt",
      label: "Com Perda Total",
      valor: String(sinistrosPerdaTotal),
      detalhe: "no mês",
      tom: sinistrosPerdaTotal > 0 ? "perigo" : "neutro",
      caminhoLegado: `/sinistro/?recorte=perda-total&${periodoQuery}`,
    },
    {
      id: "sinistros-custo",
      label: "Custo com Sinistros",
      valor: formatarMoedaCompacta(custoSinistrosMes),
      detalhe: "no mês",
      tom: custoSinistrosMes > 0 ? "perigo" : "neutro",
      caminhoLegado: `/sinistro/?recorte=custos&${periodoQuery}`,
    },
  ];

  const configPerfil = obterConfigPerfilAgrupamento(filtros.perfilDemo);
  const valorAgrupamentoLegivel =
    filtros.agrupamento === "todos" ? "Todos (do meu escopo)" : filtros.agrupamento;
  const valorLocadoraLegivel =
    filtros.locadora === "todas" ? "Todas Locadoras" : filtros.locadora;

  return {
    escopoMapa: escoMapa,
    veiculosEscopo,
    contagemStatusMapa,
    periodoRotulo: `${nomeMesFiltrado} · ${anoNum}`,
    mesAnteriorRotulo: nomeMesAnterior,
    escopoRotulo: `${configPerfil.rotuloFiltro}: ${valorAgrupamentoLegivel} · ${valorLocadoraLegivel}`,
    kpis,
    historicoTco,
    barrasKm12Meses,
    intervaloKmRotulo,
    totalKm12Meses,
    veiculosAtencao,
    condutoresAtencao,
    atividades,
    quadroManutencoes,
    quadroMultasCnh,
    quadroSinistros,
  };
}
