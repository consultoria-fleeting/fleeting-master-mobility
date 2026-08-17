export interface Condutor {
  posicao: number;
  nome: string;
  gestor: string;
  centroCusto: string;
  departamento: string;
  funcao: string;
  negocio: string;
  pontuacao: number;
  classificacao: 'referencia' | 'baixa' | 'media' | 'alta';
  pontuacoesMensais?: Record<string, number>;
}

export interface Evento {
  id: string;
  condutor: string;
  data: string;
  tipo: string;
  gravidade: 'Leve' | 'Média' | 'Grave' | 'Gravíssima' | 'Crítica';
  impactoPontuacao: number;
  status: 'Confirmado' | 'Em análise' | 'Contestado';
}

export interface Excecao {
  id: string;
  tipoEvento: string;
  condutor: string;
  analisadoPor: string;
  dataHora: string;
  decisao: 'Aprovada' | 'Reprovada' | 'Pendente';
  justificativa: string;
  pontuacaoAntes: number;
  pontuacaoDepois: number;
}

const negocios = ['Crop Protection', 'Seeds', 'Digital', 'Flores'];
const departamentos = ['Comercial', 'Operações', 'Logística', 'Técnico', 'Administrativo'];
const funcoes = ['Representante', 'Supervisor', 'Analista', 'Coordenador', 'Gerente'];
const gestores = ['Carlos Silva', 'Ana Ribeiro', 'Roberto Santos', 'Maria Costa', 'João Pereira'];
const nomes = [
  'Lucas Oliveira', 'Fernanda Souza', 'Pedro Almeida', 'Juliana Santos', 'Marcos Lima',
  'Patrícia Ferreira', 'Rafael Costa', 'Camila Rodrigues', 'Bruno Martins', 'Amanda Gomes',
  'Thiago Nascimento', 'Larissa Barbosa', 'Diego Araujo', 'Vanessa Cardoso', 'Felipe Moreira',
  'Beatriz Vieira', 'Gustavo Ribeiro', 'Isabela Dias', 'André Pereira', 'Carolina Teixeira',
  'Ricardo Mendes', 'Natália Rocha', 'Eduardo Carvalho', 'Priscila Nunes', 'Leonardo Campos',
  'Mariana Castro', 'Henrique Melo', 'Gabriela Lopes', 'Daniel Correia', 'Renata Pinto'
];

export function getClassificacao(pontuacao: number): Condutor['classificacao'] {
  if (pontuacao > 85) return 'referencia';
  if (pontuacao >= 40 && pontuacao <= 85) return 'baixa';
  if (pontuacao > 0 && pontuacao < 40) return 'media';
  return 'alta';
}

export const condutores: Condutor[] = nomes.map((nome, i) => {
  const pontuacao = Math.max(0, Math.floor(Math.random() * 100) + 5);
  return {
    posicao: i + 1,
    nome,
    gestor: gestores[i % gestores.length],
    centroCusto: `CC-${1000 + i}`,
    departamento: departamentos[i % departamentos.length],
    funcao: funcoes[i % funcoes.length],
    negocio: negocios[i % negocios.length],
    pontuacao,
    classificacao: getClassificacao(pontuacao),
    pontuacoesMensais: {
      Janeiro: Math.floor(Math.random() * 50) + 50,
      Fevereiro: Math.floor(Math.random() * 50) + 50,
      Março: Math.floor(Math.random() * 50) + 50,
      Abril: Math.floor(Math.random() * 50) + 50,
    }
  };
}).sort((a, b) => b.pontuacao - a.pontuacao).map((c, i) => ({ ...c, posicao: i + 1 }));

export const parametrosRanking = [
  // Alta Exposição (Roxo)
  { id: 'ultrapassagem', label: 'Multa por ultrapassar em local não permitido', total: 8, icon: 'Ban', grupo: 'alta' as const },
  { id: 'celular', label: 'Multa por usar telefone celular ao dirigir', total: 12, icon: 'Smartphone', grupo: 'alta' as const },
  { id: 'cinto-multa', label: 'Multa por dirigir sem cinto de segurança', total: 15, icon: 'ShieldAlert', grupo: 'alta' as const },
  { id: 'alcool', label: 'Multa por dirigir sob influência de álcool', total: 3, icon: 'Wine', grupo: 'alta' as const },
  { id: 'velocidade-140', label: 'Excesso de velocidade > 140 km/h por mais de 30s', total: 5, icon: 'Skull', grupo: 'alta' as const },
  { id: 'cinto-telemetria', label: 'Não usar cinto de segurança ≥ 1 km', total: 18, icon: 'ShieldAlert', grupo: 'alta' as const },
  // Média Exposição (Vermelho)
  { id: 'multa-grave', label: 'Multa Grave', total: 22, icon: 'AlertTriangle', grupo: 'media' as const },
  { id: 'multa-gravissima', label: 'Multa Gravíssima', total: 14, icon: 'AlertTriangle', grupo: 'media' as const },
  { id: 'incidentes', label: 'Incidentes evitáveis com alto potencial', total: 9, icon: 'CarFront', grupo: 'media' as const },
  // Baixa / Referência (Verde/Amarelo)
  { id: 'aceleracao', label: 'Aceleração brusca', total: 67, icon: 'TrendingUp', grupo: 'baixa' as const },
  { id: 'frenagem', label: 'Frenagem brusca', total: 89, icon: 'AlertTriangle', grupo: 'baixa' as const },
  { id: 'curva', label: 'Curva acentuada', total: 45, icon: 'Gauge', grupo: 'baixa' as const },
  { id: 'km-dia', label: 'Dirigir mais de 650 km no dia', total: 28, icon: 'Gauge', grupo: 'baixa' as const },
  { id: 'km-mes', label: 'Dirigir mais de 5.000 km no mês', total: 11, icon: 'Gauge', grupo: 'baixa' as const },
  { id: 'velocidade-medio', label: 'Excesso de velocidade – Médio', total: 52, icon: 'Gauge', grupo: 'baixa' as const },
  { id: 'velocidade-grave', label: 'Excesso de velocidade – Grave', total: 34, icon: 'Gauge', grupo: 'baixa' as const },
  { id: 'velocidade-gravissimo', label: 'Excesso de velocidade – Gravíssimo', total: 19, icon: 'Gauge', grupo: 'baixa' as const },
  { id: 'multa-leve', label: 'Multa Leve - CTB', total: 38, icon: 'AlertTriangle', grupo: 'baixa' as const },
  { id: 'multa-media', label: 'Multa Média - CTB', total: 27, icon: 'AlertTriangle', grupo: 'baixa' as const },
];

export const eventosDetalhados: Evento[] = Array.from({ length: 50 }, (_, i) => ({
  id: `EVT-${1000 + i}`,
  condutor: nomes[i % nomes.length],
  data: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/02/2026`,
  tipo: parametrosRanking[i % parametrosRanking.length].label,
  gravidade: (['Leve', 'Média', 'Grave', 'Gravíssima', 'Crítica'] as const)[i % 5],
  impactoPontuacao: -[5, 10, 15, 30, 100][i % 5],
  status: (['Confirmado', 'Em análise', 'Contestado'] as const)[i % 3],
}));

export const excecoesData: Excecao[] = Array.from({ length: 20 }, (_, i) => ({
  id: `EXC-${2000 + i}`,
  tipoEvento: parametrosRanking[i % parametrosRanking.length].label,
  condutor: nomes[i % nomes.length],
  analisadoPor: i < 8 ? '' : gestores[i % gestores.length],
  dataHora: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/02/2026 ${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
  decisao: i < 8 ? 'Pendente' : i % 2 === 0 ? 'Aprovada' : 'Reprovada',
  justificativa: i < 8 ? '' : 'Justificativa registrada pelo gestor.',
  pontuacaoAntes: 75 + Math.floor(Math.random() * 20),
  pontuacaoDepois: 80 + Math.floor(Math.random() * 15),
}));

export const matrizPontuacao = [
  { origem: 'Telemetria', evento: 'Aceleração brusca', pontuacao: -2 },
  { origem: 'Telemetria', evento: 'Frenagem brusca', pontuacao: -3 },
  { origem: 'Telemetria', evento: 'Curva acentuada', pontuacao: -5 },
  { origem: 'Telemetria', evento: 'Não usar cinto de segurança ≥1 km', pontuacao: -100 },
  { origem: 'Telemetria', evento: 'Dirigir mais de 650 km no dia', pontuacao: -15 },
  { origem: 'Telemetria', evento: 'Dirigir mais de 5.000 km no mês', pontuacao: -20 },
  { origem: 'Multa', evento: 'Excesso de Velocidade – Médio (até 20% acima do limite da via)', pontuacao: -5 },
  { origem: 'Multa', evento: 'Excesso de Velocidade – Grave (entre 20% e 50% acima do limite da via)', pontuacao: -10 },
  { origem: 'Multa', evento: 'Excesso de Velocidade – Gravíssimo (acima de 50% acima do limite da via)', pontuacao: -30 },
  { origem: 'Multa', evento: 'Excesso de velocidade > 140 km/h por mais de 30 segundos', pontuacao: -100 },
  { origem: 'Multa', evento: 'Leve - CTB', pontuacao: -15 },
  { origem: 'Multa', evento: 'Média - CTB', pontuacao: -25 },
  { origem: 'Multa', evento: 'Grave - CTB', pontuacao: -50 },
  { origem: 'Multa', evento: 'Gravíssima - CTB', pontuacao: -80 },
  { origem: 'Multa', evento: 'Multa por dirigir sob influência de álcool', pontuacao: -100 },
  { origem: 'Multa', evento: 'Multa por dirigir sem cinto de segurança', pontuacao: -100 },
  { origem: 'Multa', evento: 'Multa por usar telefone celular ao dirigir', pontuacao: -100 },
  { origem: 'Multa', evento: 'Multa por ultrapassar em local não permitido', pontuacao: -100 },
  { origem: 'Registro', evento: 'Incidentes evitáveis com alto potencial', pontuacao: -60 },
];

export const classificacoes = [
  { classificacao: 'Referência', pontuacao: '> 85 pontos no mês', cor: 'referencia' },
  { classificacao: 'Baixa exposição ao risco', pontuacao: 'Entre 40-85 no mês', cor: 'baixa' },
  { classificacao: 'Média exposição ao risco', pontuacao: '< 40 pontos', cor: 'media' },
  { classificacao: 'Alta exposição ao risco', pontuacao: '-100 pontos', cor: 'alta' },
];

// Chart data
export const evolucaoMensal = [
  { semana: 'Sem 1', referencia: 45, baixa: 30, media: 15, alta: 10 },
  { semana: 'Sem 2', referencia: 42, baixa: 32, media: 16, alta: 10 },
  { semana: 'Sem 3', referencia: 48, baixa: 28, media: 14, alta: 10 },
  { semana: 'Sem 4', referencia: 50, baixa: 27, media: 13, alta: 10 },
];

export const evolucaoAnual = [
  { mes: 'Jan', referencia: 40, baixa: 32, media: 18, alta: 10 },
  { mes: 'Fev', referencia: 42, baixa: 30, media: 17, alta: 11 },
  { mes: 'Mar', referencia: 45, baixa: 28, media: 16, alta: 11 },
  { mes: 'Abr', referencia: 48, baixa: 27, media: 15, alta: 10 },
  { mes: 'Mai', referencia: 46, baixa: 29, media: 15, alta: 10 },
  { mes: 'Jun', referencia: 49, baixa: 26, media: 15, alta: 10 },
  { mes: 'Jul', referencia: 51, baixa: 25, media: 14, alta: 10 },
  { mes: 'Ago', referencia: 50, baixa: 26, media: 14, alta: 10 },
  { mes: 'Set', referencia: 52, baixa: 24, media: 14, alta: 10 },
  { mes: 'Out', referencia: 53, baixa: 24, media: 13, alta: 10 },
  { mes: 'Nov', referencia: 55, baixa: 22, media: 13, alta: 10 },
  { mes: 'Dez', referencia: 57, baixa: 21, media: 12, alta: 10 },
];

export const condutoresPorNegocio = negocios.map(n => ({
  negocio: n,
  referencia: Math.floor(Math.random() * 15) + 5,
  baixa: Math.floor(Math.random() * 10) + 3,
  media: Math.floor(Math.random() * 8) + 2,
  alta: Math.floor(Math.random() * 5) + 1,
}));

export const condutoresPorFuncao = funcoes.map(f => ({
  funcao: f,
  referencia: Math.floor(Math.random() * 12) + 3,
  baixa: Math.floor(Math.random() * 8) + 2,
  media: Math.floor(Math.random() * 6) + 1,
  alta: Math.floor(Math.random() * 4) + 1,
}));

export const condutoresPorDepto = departamentos.map(d => ({
  departamento: d,
  referencia: Math.floor(Math.random() * 14) + 4,
  baixa: Math.floor(Math.random() * 9) + 2,
  media: Math.floor(Math.random() * 7) + 1,
  alta: Math.floor(Math.random() * 4) + 1,
}));

export const fadigaPorDepto = departamentos.map(d => ({
  departamento: d,
  aguda: Math.floor(Math.random() * 10) + 2,
  acumulada: Math.floor(Math.random() * 8) + 1,
}));

export const eventosPorParametro = parametrosRanking.map(p => ({
  parametro: p.label.length > 20 ? p.label.substring(0, 20) + '...' : p.label,
  total: p.total,
}));
