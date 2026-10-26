/**
 * Dados mockados da Torre de Controle.
 *
 * Fonte da verdade: `PAINEL_GESTAO_REF.md` (raiz do repositório).
 * Valores fixos (sem Math.random) para evitar hydration mismatch.
 *
 * TODO(backend): substituir estas constantes por chamadas à API da Torre de Controle.
 */

import type {
  AtividadeRecente,
  BarraKm,
  CondutorAtencao,
  ItemManutencao,
  ItemTco,
  KpiTorre,
  OpcaoFiltro,
  VeiculoAtencao,
} from "@/types/torre-de-controle";

/* ========================================================= */
/*  PALETA (Design Tokens da identidade Índigo)              */
/* ========================================================= */

/** Cores da nova identidade. Use sempre estas constantes em vez de hex soltos. */
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

/* ========================================================= */
/*  KPIs                                                     */
/* ========================================================= */

export const KPIS: KpiTorre[] = [
  {
    id: "veiculos-ativos",
    label: "Veículos Ativos",
    valor: "52",
    delta: "—",
    bom: null,
    tip: "Composição: veículos mobilizados e em operação. Exclui veículos desmobilizados.",
    legenda: "sem variação vs. mês anterior",
    detalhes: [
      { label: "Em rota agora", valor: "24" },
      { label: "Estacionados", valor: "16" },
      { label: "No pátio", valor: "9" },
      { label: "Em manutenção", valor: "3" },
    ],
  },
  {
    id: "condutores",
    label: "Condutores",
    valor: "39",
    delta: "▼ 1",
    bom: null,
    tip: "Composição: condutores ativos com CNH válida vinculados a veículos da frota.",
    legenda: "1 desligamento no mês",
    detalhes: [
      { label: "CNH regular", valor: "34" },
      { label: "CNH à vencer (60 dias)", valor: "3" },
      { label: "CNH com impedimento", valor: "1" },
      { label: "CNH vencida", valor: "1" },
    ],
  },
  {
    id: "tco",
    label: "TCO do Mês",
    valor: "R$ 87,4 mil",
    delta: "▲ 3%",
    bom: false,
    tip: "Composição: soma de todos os custos da frota no mês — locação, combustível, manutenção, multas e sinistros.",
    legenda: "vs. R$ 84,9 mil no mês anterior",
    detalhes: [
      { label: "Combustível", valor: "R$ 52,1 mil" },
      { label: "Manutenção", valor: "R$ 18,6 mil" },
      { label: "Aluguel", valor: "R$ 8,3 mil" },
      { label: "Multas", valor: "R$ 4,2 mil" },
      { label: "Sinistros", valor: "R$ 4,2 mil" },
    ],
  },
  {
    id: "custo-km",
    label: "Custo por KM (mês)",
    valor: "R$ 2,38",
    delta: "▼ 6%",
    bom: true,
    tip: "Composição: (Combustível + Manutenção + Locação) ÷ total de KMs rodados no mês.",
    legenda: "vs. R$ 2,53 no mês anterior",
    detalhes: [
      { label: "KMs rodados no mês", valor: "3.659 km" },
      { label: "Custo considerado", valor: "R$ 8,7 mil" },
      { label: "Melhor filial", valor: "Curitiba · R$ 1,92" },
      { label: "Pior filial", valor: "Rio de Janeiro · R$ 2,91" },
    ],
  },
  {
    id: "abastecimento",
    label: "Abastecimento (mês)",
    valor: "R$ 9,1 mil",
    sub: "988 L",
    delta: "▲ 4%",
    bom: false,
    tip: "Composição: total gasto em combustível no mês, em todas as formas de pagamento, e litros abastecidos.",
    legenda: "vs. R$ 8,7 mil no mês anterior",
    detalhes: [
      { label: "Litros abastecidos", valor: "988 L" },
      { label: "Preço médio (L)", valor: "R$ 5,79" },
      { label: "Média de consumo", valor: "11,6 Km/L" },
      { label: "Veículos sem abastecer (+7 dias)", valor: "4" },
    ],
  },
];

/* ========================================================= */
/*  TABELAS DE ATENÇÃO                                       */
/* ========================================================= */

export const VEICULOS_ATENCAO: VeiculoAtencao[] = [
  { placa: "SVR2C84", modelo: "Fiat Strada", condutor: "Carlos Mendes", pendencia: "Revisão vencida há 42 dias", status: "Crítico", filial: "São Paulo — Matriz", km: "61.240 km", revisao: "Vencida em 26/05/2026" },
  { placa: "QRN8H73", modelo: "VW Saveiro", condutor: "—", pendencia: "Sinistro em aberto", status: "Crítico", filial: "Campinas", km: "48.902 km", revisao: "Em dia" },
  { placa: "BRA4E21", modelo: "Chevrolet Onix", condutor: "João Silva", pendencia: "CNH vence em 18 dias", status: "Atenção", filial: "Rio de Janeiro", km: "35.117 km", revisao: "Em dia" },
  { placa: "RDX7J99", modelo: "Fiat Mobi", condutor: "Ana Paula", pendencia: "KM 32% acima da média", status: "Atenção", filial: "Belo Horizonte", km: "72.586 km", revisao: "A vencer em 09/08/2026" },
  { placa: "HST3A16", modelo: "Toyota Hilux", condutor: "Pedro Alves", pendencia: "Licenciamento a vencer", status: "Atenção", filial: "Curitiba", km: "54.330 km", revisao: "Em dia" },
  { placa: "MKP2D45", modelo: "Renault Kwid", condutor: "Luiza Costa", pendencia: "Multa sem indicação de condutor", status: "Atenção", filial: "São Paulo — Matriz", km: "22.408 km", revisao: "Em dia" },
  { placa: "PTZ5B60", modelo: "VW Polo", condutor: "Rafael Souza", pendencia: "Checklist atrasado há 3 dias", status: "Atenção", filial: "Campinas", km: "41.775 km", revisao: "Em dia" },
];

export const CONDUTORES_ATENCAO: CondutorAtencao[] = [
  { nome: "Marcos Ferreira", filial: "Campinas", status: "CNH Vencida", categoria: "B", validade: "Vencida em 12/06/2026", veiculo: "QRN8H73 · VW Saveiro", obs: "Condutor bloqueado para novas reservas até regularização." },
  { nome: "Fernanda Lima", filial: "São Paulo — Matriz", status: "CNH com Impedimento", categoria: "AB", validade: "Válida até 03/2028", veiculo: "SVR2C84 · Fiat Strada", obs: "Suspensão por pontuação — 22 pontos nos últimos 12 meses." },
  { nome: "João Silva", filial: "Rio de Janeiro", status: "CNH à Vencer", categoria: "B", validade: "Vence em 26/07/2026 (18 dias)", veiculo: "BRA4E21 · Chevrolet Onix", obs: "Renovação ainda não iniciada. Notificar o condutor." },
  { nome: "Pedro Alves", filial: "Curitiba", status: "CNH à Vencer", categoria: "AE", validade: "Vence em 11/08/2026 (34 dias)", veiculo: "HST3A16 · Toyota Hilux", obs: "Renovação agendada no Detran-PR." },
  { nome: "Ana Paula", filial: "Belo Horizonte", status: "CNH à Vencer", categoria: "B", validade: "Vence em 29/08/2026 (52 dias)", veiculo: "RDX7J99 · Fiat Mobi", obs: "Dentro da janela de 60 dias. Acompanhar renovação." },
];

/* ========================================================= */
/*  ATIVIDADE RECENTE                                        */
/* ========================================================= */

export const ATIVIDADES: AtividadeRecente[] = [
  { titulo: "Sinistro Registrado", meta: "QRN8H73 · há 2 horas", cor: "#E11D48" },
  { titulo: "Multa Autuada", meta: "BRA4E21 · há 5 horas", cor: "#D97706" },
  { titulo: "Manutenção Concluída", meta: "HST3A16 · há 8 horas", cor: "#312E81" },
  { titulo: "Abastecimento", meta: "RDX7J99 · ontem", cor: "#818CF8" },
  { titulo: "Checklist Diário", meta: "32 veículos · ontem", cor: "#94A3B8" },
  { titulo: "Veículo Desmobilizado", meta: "PTZ5B60 · ontem", cor: "#94A3B8" },
  { titulo: "Condutor Cadastrado", meta: "Luiza Costa · há 2 dias", cor: "#818CF8" },
  { titulo: "Revisão Agendada", meta: "MKP2D45 · há 2 dias", cor: "#312E81" },
  { titulo: "Multa Indicada", meta: "SVR2C84 · há 3 dias", cor: "#D97706" },
  { titulo: "Abastecimento", meta: "14 veículos · há 3 dias", cor: "#818CF8" },
];

/* ========================================================= */
/*  MANUTENÇÃO, TCO E KMs                                    */
/* ========================================================= */

export const MANUTENCAO: ItemManutencao[] = [
  { label: "Rev. Vencidas", quantidade: 1, tom: "perigo" },
  { label: "Rev. a Vencer", quantidade: 3, tom: "alerta" },
  { label: "Em Oficina", quantidade: 2, tom: "neutro" },
  { label: "Sinistros", quantidade: 2, tom: "perigo" },
];

export const TCO_RESUMO = {
  total: "R$ 87,4 mil",
  mediaPorVeiculo: "R$ 1.748",
  itens: [
    { label: "Combustível", valor: 52100, cor: "#818CF8" },
    { label: "Manutenção", valor: 18600, cor: "#A5B4FC" },
    { label: "Aluguel", valor: 8300, cor: "#E0E7FF" },
    { label: "Multas", valor: 4200, cor: "#D4AB00" },
    { label: "Sinistros", valor: 4200, cor: "#E11D48" },
  ] satisfies ItemTco[],
};

const MESES_COMPLETOS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Alturas relativas da referência; Julho (índice 6) é o mês em destaque */
const ALTURAS_KM = [46, 38, 58, 52, 64, 70, 88, 61, 55, 66, 49, 57];
export const TOTAL_KM_ANO = 41280;
const SOMA_ALTURAS = ALTURAS_KM.reduce((soma, h) => soma + h, 0);

export const BARRAS_KM: BarraKm[] = ALTURAS_KM.map((altura, i) => ({
  mes: MESES_COMPLETOS[i].charAt(0),
  mesCompleto: MESES_COMPLETOS[i],
  km: Math.round((altura / SOMA_ALTURAS) * TOTAL_KM_ANO),
  destaque: i === 6,
}));

/* ========================================================= */
/*  OPÇÕES DOS FILTROS DO CABEÇALHO                          */
/* ========================================================= */

export const OPCOES_MES: OpcaoFiltro[] = [
  { valor: "atual", label: "Mês Atual" },
  ...MESES_COMPLETOS.map((mes, i) => ({ valor: String(i + 1), label: mes })),
];

export const OPCOES_ANO: OpcaoFiltro[] = ["2026", "2025", "2024"].map((ano) => ({
  valor: ano,
  label: ano,
}));

export const OPCOES_GRUPO: OpcaoFiltro[] = [
  { valor: "todos", label: "Todos os Grupos" },
  { valor: "Comgás", label: "Comgás" },
  { valor: "Vivo", label: "Vivo" },
  { valor: "Coprel", label: "Coprel" },
];

export const OPCOES_LOCADORA: OpcaoFiltro[] = [
  { valor: "todas", label: "Todas Locadoras" },
  { valor: "Localiza", label: "Localiza" },
  { valor: "Movida", label: "Movida" },
  { valor: "Unidas", label: "Unidas" },
  { valor: "Frota Própria", label: "Frota Própria" },
];
