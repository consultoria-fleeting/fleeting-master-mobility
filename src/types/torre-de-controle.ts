/**
 * Tipos da Torre de Controle (visão consolidada da frota).
 *
 * Os dados hoje vêm de mocks (`src/components/torre-de-controle/mock-data.ts`).
 * Quando o backend for integrado, as respostas da API devem seguir estes contratos.
 */

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
  /** Variação vs. período anterior (ex.: "▲ 3%", "—") */
  delta: string;
  /** true = variação boa (verde), false = ruim (vermelho), null = neutra (cinza) */
  bom: boolean | null;
  /** Explicação da composição do indicador (tooltip "i") */
  tip: string;
  /** Legenda curta abaixo do valor */
  legenda: string;
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
}

export type TomManutencao = "perigo" | "alerta" | "neutro";

/** Tile do card "Manutenção da Frota" */
export interface ItemManutencao {
  label: string;
  quantidade: number;
  tom: TomManutencao;
}

/** Identificador de cada categoria de custo que compõe o TCO */
export type CategoriaTcoId = "combustivel" | "manutencao" | "aluguel" | "multas" | "sinistros";

/** Categoria de custo do TCO (rótulo e cor usados no gráfico e na composição) */
export interface CategoriaTco {
  id: CategoriaTcoId;
  label: string;
  cor: string;
}

/** Custos da frota em um mês (base do drawer "TCO do Mês") */
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

/** Barra do gráfico "KMs Rodados" */
export interface BarraKm {
  mes: string;
  mesCompleto: string;
  km: number;
  destaque: boolean;
}

/** Opção de um select de filtro do cabeçalho */
export interface OpcaoFiltro {
  valor: string;
  label: string;
}
