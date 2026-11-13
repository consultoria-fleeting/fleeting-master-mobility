/**
 * Tipos da Torre de Controle V1 (visão consolidada da frota).
 *
 * Os dados hoje vêm de mocks (`src/components/torre-de-controle/mock-data.ts`).
 * Quando o backend for integrado, as respostas da API devem seguir estes contratos.
 */

import type { NivelAgrupamento } from "./frota-mapa";

export type { NivelAgrupamento };

/** Estado dos filtros globais do cabeçalho da Torre de Controle */
export interface FiltrosTorre {
  /** Mês fechado de 1 ("1") a 12 ("12") */
  mes: string;
  /** Ano com 4 dígitos (ex.: "2026") */
  ano: string;
  /** Valor selecionado no filtro de agrupamento hierárquico ("todos" = escopo completo do perfil) */
  agrupamento: string;
  /** Locadora selecionada ou "todas" */
  locadora: string;
  /**
   * Simulador de perfil/nível hierárquico exclusivo do protótipo de validação.
   * TODO(security): em produção, o nível e a lista de opções vêm exclusivamente do JWT no backend.
   */
  perfilDemo: NivelAgrupamento;
}

/** Item de detalhamento exibido no drawer de um KPI */
export interface DetalheKpi {
  label: string;
  valor: string;
}

/** Card de KPI do topo da Torre de Controle */
export interface KpiTorre {
  id: string;
  label: string;
  valor: string;
  /** Texto complementar ao lado do valor (ex.: "988 L") */
  sub?: string;
  /** Variação vs. mês fechado anterior (ex.: "▲ 3%", "—") */
  delta: string;
  /** true = variação boa (verde), false = ruim (vermelho), null = neutra (cinza) */
  bom: boolean | null;
  /** Explicação da composição do indicador (tooltip "i") */
  tip: string;
  /** Legenda curta abaixo do valor */
  legenda: string;
  /** Observação metodológica opcional no rodapé do drawer (ex.: fórmula de km/l) */
  notaMetodologia?: string;
  /** Linhas exibidas no drawer de detalhamento */
  detalhes: DetalheKpi[];
}

export type StatusPendencia = "Crítico" | "Atenção";

/** Linha da tabela "Veículos que Exigem Atenção" */
export interface VeiculoAtencao {
  placa: string;
  modelo: string;
  condutor: string;
  pendencia: string;
  status: StatusPendencia;
  filial: string;
  km: string;
  revisao: string;
}

export type StatusCnh = "CNH Vencida" | "CNH com Impedimento" | "CNH à Vencer";

/** Linha da tabela "Condutores que Exigem Atenção" */
export interface CondutorAtencao {
  nome: string;
  filial: string;
  status: StatusCnh;
  categoria: string;
  validade: string;
  veiculo: string;
  obs: string;
}

/** Item da timeline "Atividade Recente" */
export interface AtividadeRecente {
  titulo: string;
  meta: string;
  cor: string;
  /** Placa associada opcional (usada para filtrar por escopo no protótipo) */
  placa?: string;
}

export type TomQuadroResumo = "perigo" | "alerta" | "indigo" | "neutro";

/** Tile clicável dos quadros 2×2 (Manutenções, Sinistros e Multas & CNH) */
export interface ItemQuadroResumo {
  id: string;
  label: string;
  /** Valor formatado (ex.: "14" ou "R$ 4,2 mil") */
  valor: string;
  /** Subtítulo curto para indicar semântica temporal (ex.: "no mês" ou "posição atual") */
  detalhe?: string;
  tom: TomQuadroResumo;
  /** Rota de destino no módulo correspondente do Master Mobility */
  caminhoLegado: string;
}

/** Identificador de cada categoria de custo que compõe o TCO */
export type CategoriaTcoId = "combustivel" | "manutencao" | "aluguel" | "multas" | "sinistros";

/** Categoria de custo do TCO (rótulo e cor usados no gráfico e na composição) */
export interface CategoriaTco {
  id: CategoriaTcoId;
  label: string;
  cor: string;
}

/** Custos da frota em um mês fechado (base do drawer "TCO do Mês") */
export interface MesTco {
  /** Chave única do mês no formato "AAAA-MM" (ex.: "2026-10") */
  chave: string;
  /** Mês abreviado para o eixo do gráfico (ex.: "Out") */
  mes: string;
  /** Ano com 4 dígitos (ex.: "2026") */
  ano: string;
  /** Rótulo completo (ex.: "Outubro/2026") */
  mesCompleto: string;
  /** Veículos ativos no mês (usado na média por veículo) */
  veiculos: number;
  /** Valor em reais (número puro) de cada categoria */
  custos: Record<CategoriaTcoId, number>;
}

/** Barra do gráfico "KM rodado nos últimos 12 meses" */
export interface BarraKm {
  /** Chave única "AAAA-MM" */
  chave: string;
  /** Rótulo curto exibido no eixo X (ex.: "Nov", "Dez", "Jan") */
  mes: string;
  /** Rótulo completo exibido no tooltip (ex.: "Outubro/2026") */
  mesCompleto: string;
  km: number;
  destaque: boolean;
}

/** Opção de um select de filtro do cabeçalho */
export interface OpcaoFiltro {
  valor: string;
  label: string;
  /** Desabilita meses futuros/ainda não fechados */
  desabilitado?: boolean;
}
