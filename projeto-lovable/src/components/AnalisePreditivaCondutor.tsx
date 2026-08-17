import { useState, useMemo, Fragment } from 'react';
import {
  Activity, TrendingUp, AlertTriangle, RefreshCw, MapPin,
  ArrowUp, ArrowDown, ArrowRight, AlertCircle, CheckCircle2, Trophy, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
  BarChart, Bar, Cell,
  RadialBarChart, RadialBar
} from 'recharts';
import InfoTooltip from '@/components/InfoTooltip';

// ===================== Tipos & dados mock =====================
type Tendencia = 'crescente' | 'estavel' | 'decrescente';

export interface CondutorPreditivo {
  id: string;
  nome: string;
  irc: number;
  tendencia: Tendencia;
  probabilidadeInfracao: number;
  taxaReincidencia: number;
  contribuicaoTelemetria: number;
  contribuicaoMultas: number;
  contribuicaoSinistros: number;
  historicoIrc: { data: string; valor: number }[];
  contextoCritico: string;
  contextoSeguro: string;
  percentualRiscoContexto: number;
  fatoresRisco: { fator: string; score: number }[];
  sinaisAlerta: string[];
  sinaisPositivos: string[];
}

function gerarHistorico(base: number, tend: Tendencia): { data: string; valor: number }[] {
  const out: { data: string; valor: number }[] = [];
  const today = new Date();
  for (let i = 179; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const progresso = (179 - i) / 179;
    let v = base;
    if (tend === 'crescente') v = base - 20 + progresso * 30;
    else if (tend === 'decrescente') v = base + 15 - progresso * 25;
    else v = base + (Math.sin(i / 8) * 4);
    v += (Math.random() - 0.5) * 6;
    out.push({ data: d.toISOString().slice(0, 10), valor: Math.max(0, Math.min(100, Math.round(v))) });
  }
  return out;
}

// Helper to build a default predictive profile from a driver name + base IRC
export function buildCondutorPreditivo(nome: string, baseIrc: number): CondutorPreditivo {
  const tendencia: Tendencia = baseIrc > 70 ? 'crescente' : baseIrc < 35 ? 'decrescente' : 'estavel';
  const id = String(nome.charCodeAt(0) + nome.length);
  return {
    id, nome, irc: baseIrc, tendencia,
    probabilidadeInfracao: Math.min(95, baseIrc - 5 + Math.round(Math.random() * 10)),
    taxaReincidencia: Math.min(90, Math.max(0, baseIrc - 15 + Math.round(Math.random() * 10))),
    contribuicaoTelemetria: 45, contribuicaoMultas: 35, contribuicaoSinistros: 20,
    historicoIrc: gerarHistorico(baseIrc, tendencia),
    contextoCritico: 'Rodovias no período noturno',
    contextoSeguro: 'Trajetos urbanos diurnos',
    percentualRiscoContexto: Math.min(95, baseIrc),
    fatoresRisco: [
      { fator: 'Excesso de velocidade', score: Math.min(95, baseIrc + 5) },
      { fator: 'Frenagem brusca', score: Math.max(10, baseIrc - 10) },
      { fator: 'Aceleração brusca', score: Math.max(5, baseIrc - 20) },
      { fator: 'Curvas acentuadas', score: Math.max(5, baseIrc - 30) },
      { fator: 'Uso de celular', score: Math.max(5, baseIrc - 40) },
    ],
    sinaisAlerta: baseIrc > 60
      ? ['IRC em zona crítica', 'Reincidência elevada nos últimos 30 dias', 'Eventos bruscos em alta']
      : ['Padrão estável'],
    sinaisPositivos: baseIrc < 40
      ? ['IRC em queda', 'Sem multas recentes', 'Reincidência reduzida']
      : [],
  };
}

// ===================== Helpers de cor =====================
const CORES = { verde: '#16a34a', amarelo: '#ca8a04', vermelho: '#dc2626', roxo: '#7c3aed', azul: '#2563eb' };

function corIrc(v: number) {
  if (v <= 30) return CORES.verde;
  if (v <= 60) return CORES.amarelo;
  if (v <= 80) return CORES.vermelho;
  return CORES.roxo;
}
function nivelIrc(v: number) {
  if (v <= 30) return 'Baixo Risco';
  if (v <= 60) return 'Risco Moderado';
  if (v <= 80) return 'Alto Risco';
  return 'Risco Crítico';
}

function SectionCard({
  title, subtitle, info, children, className = '',
}: { title: string; subtitle?: string; info?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border bg-card shadow-sm p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {info && <InfoTooltip text={info} />}
      </div>
      {children}
    </div>
  );
}

// ===================== Seção 1: IRC (sem card de pesos) =====================
function SecaoIRC({ condutor }: { condutor: CondutorPreditivo }) {
  const cor = corIrc(condutor.irc);
  const nivel = nivelIrc(condutor.irc);
  const dadosGauge = [{ name: 'IRC', value: condutor.irc, fill: cor }];
  const dadosStack = [{
    name: 'Contribuição',
    Telemetria: condutor.contribuicaoTelemetria,
    Multas: condutor.contribuicaoMultas,
    Sinistros: condutor.contribuicaoSinistros,
  }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SectionCard
        title="Índice de Risco Composto"
        subtitle="Score preditivo 0–100"
        info="Score único que combina telemetria, multas e sinistros para estimar a probabilidade de risco do condutor."
      >
        <div className="relative h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={dadosGauge}>
              <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <span className="text-5xl font-bold" style={{ color: cor }}>{condutor.irc}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: cor }}>{nivel}</span>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-3 px-2">
          <span>0-30 Baixo</span><span>31-60 Mod</span><span>61-80 Alto</span><span>81-100 Crítico</span>
        </div>
      </SectionCard>

      <SectionCard
        title="Composição do IRC"
        subtitle="Contribuição por fonte de dados"
        info="Mostra o peso relativo de telemetria, multas e sinistros no IRC do condutor."
      >
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosStack} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="name" hide />
              <RTooltip />
              <Bar dataKey="Telemetria" stackId="a" fill={CORES.azul} />
              <Bar dataKey="Multas" stackId="a" fill={CORES.amarelo} />
              <Bar dataKey="Sinistros" stackId="a" fill={CORES.vermelho} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-4">
          {[
            { label: 'Telemetria', val: condutor.contribuicaoTelemetria, cor: CORES.azul },
            { label: 'Multas', val: condutor.contribuicaoMultas, cor: CORES.amarelo },
            { label: 'Sinistros', val: condutor.contribuicaoSinistros, cor: CORES.vermelho },
          ].map(i => (
            <div key={i.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: i.cor }} />
                <span>{i.label}</span>
              </div>
              <span className="font-semibold">{i.val}%</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ===================== Seção 2: Tendência (gráfico antes, variação depois) =====================
function SecaoTendencia({ condutor }: { condutor: CondutorPreditivo }) {
  const [periodo, setPeriodo] = useState<60 | 90 | 180>(90);
  const dados = condutor.historicoIrc.slice(-periodo);
  const variacao = useMemo(() => {
    if (dados.length < 2) return 0;
    return Math.round(((dados[dados.length - 1].valor - dados[0].valor) / dados[0].valor) * 100);
  }, [dados]);

  const tendInfo = {
    crescente: { icon: ArrowUp, label: 'Piorando', cor: CORES.vermelho, bg: 'bg-red-50' },
    estavel: { icon: ArrowRight, label: 'Estável', cor: CORES.amarelo, bg: 'bg-yellow-50' },
    decrescente: { icon: ArrowDown, label: 'Melhorando', cor: CORES.verde, bg: 'bg-green-50' },
  }[condutor.tendencia];
  const TIcon = tendInfo.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <SectionCard
        title="Evolução temporal do IRC"
        subtitle="Linha histórica"
        info="Evolução do IRC do condutor no período selecionado, comparando últimas semanas / meses."
        className="lg:col-span-2"
      >
        <div className="flex gap-2 mb-3">
          {([60, 90, 180] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1 text-xs rounded-md border ${periodo === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
            >
              {p} dias
            </button>
          ))}
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} interval={Math.floor(dados.length / 6)} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <RTooltip />
              <Line type="monotone" dataKey="valor" stroke={CORES.azul} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard
        title="Variação do IRC"
        subtitle="Período selecionado"
        info="Variação percentual entre o IRC no início e no fim do período selecionado."
      >
        <div className="text-4xl font-bold" style={{ color: variacao > 0 ? CORES.vermelho : variacao < 0 ? CORES.verde : CORES.amarelo }}>
          {variacao > 0 ? '+' : ''}{variacao}%
        </div>
        <p className="text-xs text-muted-foreground mt-1">Últimos {periodo} dias</p>
        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${tendInfo.bg}`}>
          <TIcon className="w-4 h-4" style={{ color: tendInfo.cor }} />
          <span className="text-sm font-semibold" style={{ color: tendInfo.cor }}>{tendInfo.label}</span>
        </div>
      </SectionCard>

      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">Sinais de Alerta</h4>
          </div>
          {condutor.sinaisAlerta.length > 0 ? (
            <ul className="space-y-2">
              {condutor.sinaisAlerta.map((s, i) => (
                <li key={i} className="text-sm text-red-900 flex gap-2"><span>•</span>{s}</li>
              ))}
            </ul>
          ) : <p className="text-sm text-red-900/60">Nenhum sinal de alerta detectado.</p>}
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Sinais Positivos</h4>
          </div>
          {condutor.sinaisPositivos.length > 0 ? (
            <ul className="space-y-2">
              {condutor.sinaisPositivos.map((s, i) => (
                <li key={i} className="text-sm text-green-900 flex gap-2"><span>•</span>{s}</li>
              ))}
            </ul>
          ) : <p className="text-sm text-green-900/60">Nenhum sinal positivo recente.</p>}
        </div>
      </div>
    </div>
  );
}

// ===================== Seção 3: Probabilidade =====================
function SecaoProbabilidade({ condutor }: { condutor: CondutorPreditivo }) {
  const p = condutor.probabilidadeInfracao;
  const classificacao = p <= 30 ? { l: 'Baixa', c: CORES.verde } : p <= 60 ? { l: 'Média', c: CORES.amarelo } : { l: 'Alta', c: CORES.vermelho };

  const infracoesProvaveis = useMemo(() => {
    const factor = p / 80;
    return [
      { tipo: 'Excesso de velocidade', prob: Math.min(95, Math.round(82 * factor + 10)) },
      { tipo: 'Frenagem brusca', prob: Math.min(90, Math.round(65 * factor + 8)) },
      { tipo: 'Uso de celular', prob: Math.min(85, Math.round(40 * factor + 6)) },
      { tipo: 'Aceleração brusca', prob: Math.min(80, Math.round(38 * factor + 4)) },
      { tipo: 'Curva acentuada', prob: Math.min(70, Math.round(25 * factor + 4)) },
    ].sort((a, b) => b.prob - a.prob);
  }, [p]);

  const heatmap = useMemo(() => {
    const seed = condutor.id.charCodeAt(0);
    return Array.from({ length: 7 }, (_, d) =>
      Array.from({ length: 24 }, (_, h) => {
        const peak = (h >= 7 && h <= 9) || (h >= 17 && h <= 21) || (h >= 22 || h <= 4);
        const base = peak ? 0.6 : 0.2;
        const v = base + Math.sin((d * 24 + h + seed) * 0.7) * 0.3 + 0.15;
        return Math.max(0, Math.min(1, v)) * (p / 100);
      })
    );
  }, [condutor, p]);

  const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const corCel = (v: number) => {
    if (v < 0.2) return '#dcfce7';
    if (v < 0.4) return '#fef9c3';
    if (v < 0.6) return '#fed7aa';
    if (v < 0.8) return '#fecaca';
    return '#dc2626';
  };

  // Resumo textual automático: encontra dia/hora de maior intensidade
  const resumo = useMemo(() => {
    let melhor = { d: 0, h: 0, v: -1 };
    heatmap.forEach((row, d) => row.forEach((v, h) => { if (v > melhor.v) melhor = { d, h, v }; }));
    return `Este condutor tem maior concentração de infrações às ${dias[melhor.d].toLowerCase()}-feiras entre ${melhor.h}h e ${melhor.h + 2}h, principalmente por ${infracoesProvaveis[0].tipo.toLowerCase()}.`;
  }, [heatmap, infracoesProvaveis]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <SectionCard
        title="Probabilidade nos próximos 30 dias"
        info="Estimativa da probabilidade do condutor cometer uma nova infração nos próximos 30 dias."
      >
        <div className="text-6xl font-bold text-center" style={{ color: classificacao.c }}>{p}%</div>
        <div className="flex justify-center mt-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: classificacao.c }}>
            Classificação: {classificacao.l}
          </span>
        </div>
        <div className="mt-5 space-y-1 text-xs text-muted-foreground">
          <p>• Baixa: 0-30%</p>
          <p>• Média: 31-60%</p>
          <p>• Alta: &gt; 60%</p>
        </div>
      </SectionCard>

      <SectionCard
        title="Infrações mais prováveis"
        subtitle="Baseado na recorrência histórica do condutor"
        info="Tipos de infração com maior probabilidade de ocorrência para este condutor."
        className="lg:col-span-2"
      >
        <div className="space-y-3">
          {infracoesProvaveis.map(item => {
            const cor = item.prob > 60 ? CORES.vermelho : item.prob > 40 ? CORES.amarelo : CORES.verde;
            return (
              <div key={item.tipo}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.tipo}</span>
                  <span className="font-bold" style={{ color: cor }}>{item.prob}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.prob}%`, background: cor }} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="lg:col-span-3 rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10 p-4">
        <p className="text-sm">
          <span className="font-semibold text-primary">Resumo automático: </span>{resumo}
        </p>
      </div>

      <SectionCard
        title="Heatmap Dia × Hora"
        subtitle="Intensidade histórica de infrações"
        info="Concentração de infrações ao longo da semana, cruzando dia e horário."
        className="lg:col-span-3"
      >
        <div className="overflow-x-auto">
          <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `40px repeat(24, 1fr)`, minWidth: 700 }}>
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-[9px] text-center text-muted-foreground">{h}h</div>
            ))}
            {heatmap.map((row, d) => (
              <Fragment key={`row-${d}`}>
                <div className="text-[10px] text-muted-foreground font-medium flex items-center">{dias[d]}</div>
                {row.map((v, h) => (
                  <div
                    key={`${d}-${h}`}
                    className="aspect-square rounded-sm"
                    style={{ background: corCel(v) }}
                    title={`${dias[d]} ${h}h - intensidade ${(v * 100).toFixed(0)}%`}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Baixa</span>
          {[
            { cor: '#dcfce7', label: 'Baixo risco (0-20%)' },
            { cor: '#fef9c3', label: 'Risco baixo-moderado (20-40%)' },
            { cor: '#fed7aa', label: 'Risco moderado (40-60%)' },
            { cor: '#fecaca', label: 'Risco alto (60-80%)' },
            { cor: '#dc2626', label: 'Risco crítico (80-100%)' },
          ].map(c => (
            <div key={c.cor} className="w-6 h-3 rounded-sm cursor-help" style={{ background: c.cor }} title={c.label} />
          ))}
          <span>Alta</span>
        </div>
      </SectionCard>
    </div>
  );
}

// ===================== Seção 4: Reincidência (reescrita) =====================
function SecaoReincidencia({ condutor }: { condutor: CondutorPreditivo }) {
  const taxa = condutor.taxaReincidencia;

  // Bolinhas das colunas Antes e Depois
  const bolinhasAntes = [
    { x: 8, cor: '#EF9F27', nome: 'Frenagem brusca', data: '21/03/2026', grav: 'Moderado' },
    { x: 22, cor: '#E24B4A', nome: 'Excesso de velocidade', data: '28/03/2026', grav: 'Alto' },
    { x: 38, cor: '#EF9F27', nome: 'Curva acentuada', data: '02/04/2026', grav: 'Moderado' },
    { x: 55, cor: '#E24B4A', nome: 'Excesso de velocidade', data: '09/04/2026', grav: 'Alto' },
    { x: 78, cor: '#E24B4A', nome: 'Frenagem brusca', data: '15/04/2026', grav: 'Alto' },
  ];
  const bolinhasDepois = [
    { x: 10, cor: '#7F77DD', nome: 'Notificação enviada', data: '22/04/2026', grav: 'Admin.' },
    { x: 45, cor: '#EF9F27', nome: 'Frenagem brusca', data: '05/05/2026', grav: 'Moderado' },
    { x: 68, cor: '#E24B4A', nome: 'Excesso de velocidade', data: '15/05/2026', grav: 'Alto' },
    { x: 88, cor: '#EF9F27', nome: 'Curva acentuada', data: '22/05/2026', grav: 'Moderado' },
  ];

  const reincTipos = [
    { tipo: 'Excesso de velocidade', pct: 65, ocor: 6, nivel: 'alta' as const },
    { tipo: 'Frenagem brusca', pct: 40, ocor: 3, nivel: 'moderada' as const },
    { tipo: 'Sinistro', pct: 0, ocor: 0, nivel: 'zero' as const },
    { tipo: 'Curva acentuada', pct: 25, ocor: 2, nivel: 'moderada' as const },
  ];

  const corNivel = (n: 'alta' | 'moderada' | 'zero') =>
    n === 'alta' ? '#E24B4A' : n === 'moderada' ? '#EF9F27' : '#639922';
  const labelNivel = (n: 'alta' | 'moderada' | 'zero') =>
    n === 'alta' ? 'Reincidência alta' : n === 'moderada' ? 'Reincidência moderada' : 'Sem reincidência';

  const eventos = [
    { data: '21/03/2026', tipo: 'Frenagem brusca', desc: 'Frenagem brusca em rodovia', grav: 'Moderado', fase: 'Antes' },
    { data: '28/03/2026', tipo: 'Excesso de velocidade', desc: '20% acima do limite — BR-101', grav: 'Alto', fase: 'Antes' },
    { data: '02/04/2026', tipo: 'Curva acentuada', desc: 'Curva tomada acima do recomendado', grav: 'Moderado', fase: 'Antes' },
    { data: '09/04/2026', tipo: 'Excesso de velocidade', desc: '30% acima do limite — Av. Brasil', grav: 'Alto', fase: 'Antes' },
    { data: '15/04/2026', tipo: 'Frenagem brusca', desc: 'Frenagem brusca em zona urbana', grav: 'Alto', fase: 'Antes' },
    { data: '20/04/2026', tipo: 'Sinistro', desc: 'Sinistro — responsabilidade do condutor', grav: 'Crítico', fase: 'Incidente' },
    { data: '22/04/2026', tipo: 'Notificação', desc: 'Notificação administrativa enviada', grav: 'Admin.', fase: 'Depois' },
    { data: '05/05/2026', tipo: 'Frenagem brusca', desc: 'Frenagem brusca em saída de rotatória', grav: 'Moderado', fase: 'Depois' },
    { data: '15/05/2026', tipo: 'Excesso de velocidade', desc: '15% acima do limite — Rodovia', grav: 'Alto', fase: 'Depois' },
  ];

  const badgeGrav = (g: string) => {
    const map: Record<string, string> = {
      'Crítico': 'bg-[#FCEBEB] text-[#E24B4A] border-[#E24B4A]/30',
      'Alto': 'bg-red-50 text-red-700 border-red-200',
      'Moderado': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Admin.': 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return map[g] || 'bg-muted text-foreground border-border';
  };

  const corFase = (f: string) =>
    f === 'Antes' ? 'text-orange-700' : f === 'Incidente' ? 'text-[#E24B4A] font-bold' : 'text-blue-800';

  return (
    <div className="space-y-5">
      {/* Bloco 1: Card evento crítico */}
      <div
        className="rounded-lg border p-5 flex items-start gap-4"
        style={{ background: '#FCEBEB', borderLeft: '3px solid #E24B4A' }}
      >
        <AlertTriangle className="w-6 h-6 mt-1" style={{ color: '#7a1c1c' }} />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7a1c1c' }}>
            Evento crítico de referência
          </p>
          <div className="flex items-baseline gap-3 mt-1 flex-wrap">
            <span className="text-[20px] font-bold" style={{ color: '#7a1c1c' }}>20/04/2026</span>
            <span className="text-sm" style={{ color: '#7a1c1c' }}>Sinistro — responsabilidade do condutor</span>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full text-white" style={{ background: '#E24B4A' }}>
              Crítico
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Última atualização dos dados: 27/05/2026</p>
        </div>
      </div>

      {/* Bloco 2: Linha do tempo horizontal */}
      <SectionCard
        title="Linha do tempo do evento crítico"
        subtitle="30 dias antes × incidente × 30 dias depois"
        info="Distribuição dos eventos do condutor antes e depois do incidente crítico de referência."
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_1fr] gap-3 items-stretch">
          {/* Antes */}
          <div className="rounded-md p-4 relative min-h-[120px] flex flex-col justify-center" style={{ background: '#FFF7ED' }}>
            <p className="text-[11px] font-semibold uppercase text-orange-700 mb-3">Antes (30 dias)</p>
            <div className="relative h-8">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-orange-400" />
              {bolinhasAntes.map((b, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full cursor-pointer group"
                  style={{ left: `${b.x}%`, background: b.cor, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 whitespace-nowrap bg-white border rounded-md shadow-md px-2 py-1 text-[11px]">
                    <p className="font-semibold">{b.nome}</p>
                    <p className="text-muted-foreground">{b.data} — {b.grav}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Incidente */}
          <div className="rounded-md p-4 flex flex-col items-center justify-center text-center" style={{ background: '#FCEBEB' }}>
            <ShieldAlert className="w-8 h-8" style={{ color: '#E24B4A' }} />
            <p className="text-[11px] font-bold mt-1" style={{ color: '#E24B4A' }}>20/04/2026</p>
            <p className="text-[10px] text-[#7a1c1c]">Sinistro</p>
          </div>
          {/* Depois */}
          <div className="rounded-md p-4 relative min-h-[120px] flex flex-col justify-center" style={{ background: '#E6F1FB' }}>
            <p className="text-[11px] font-semibold uppercase text-blue-800 mb-3">Depois (30 dias)</p>
            <div className="relative h-8">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-400" />
              {bolinhasDepois.map((b, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full cursor-pointer group"
                  style={{ left: `${b.x}%`, background: b.cor, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 whitespace-nowrap bg-white border rounded-md shadow-md px-2 py-1 text-[11px]">
                    <p className="font-semibold">{b.nome}</p>
                    <p className="text-muted-foreground">{b.data} — {b.grav}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
          {[
            { c: '#E24B4A', l: 'Crítico / Alto' },
            { c: '#EF9F27', l: 'Moderado' },
            { c: '#7F77DD', l: 'Administrativo' },
          ].map(i => (
            <div key={i.c} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: i.c, border: '2px solid white', boxShadow: '0 0 0 1px #cbd5e1' }} />
              <span className="text-muted-foreground">{i.l}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Bloco 3: Taxa de reincidência por tipo de evento */}
      <SectionCard
        title="Taxa de reincidência por tipo de evento"
        subtitle={`Taxa geral do condutor: ${taxa}%`}
        info="Percentual de reincidência por tipo de evento nos 30 dias após o incidente crítico."
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {reincTipos.map(t => {
            const cor = corNivel(t.nivel);
            return (
              <div key={t.tipo} className="rounded-md bg-muted/40 p-3 border">
                <p className="text-[11px] text-muted-foreground">{t.tipo}</p>
                <p className="text-[22px] font-bold mt-1" style={{ color: cor }}>{t.pct}%</p>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                  <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: cor }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">{t.ocor} ocorrências nos 30 dias seguintes</p>
                <span
                  className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold rounded-full text-white"
                  style={{ background: cor }}
                >
                  {labelNivel(t.nivel)}
                </span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Bloco 4: Tabela detalhada */}
      <SectionCard
        title="Todos os eventos no período"
        subtitle="Eventos registrados antes, durante e depois do incidente"
        info="Lista completa dos eventos do condutor no período analisado."
      >
        <div className="max-h-[360px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">Data</th>
                <th className="text-left py-2 px-2">Tipo de evento</th>
                <th className="text-left py-2 px-2">Descrição</th>
                <th className="text-left py-2 px-2">Gravidade</th>
                <th className="text-left py-2 px-2">Fase</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e, i) => {
                const isIncidente = e.fase === 'Incidente';
                return (
                  <tr key={i} className="border-b last:border-0" style={isIncidente ? { background: '#FCEBEB' } : {}}>
                    <td className="py-2 px-2">{e.data}</td>
                    <td className="py-2 px-2">{e.tipo}</td>
                    <td className="py-2 px-2 text-muted-foreground">{e.desc}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${badgeGrav(e.grav)}`}>
                        {e.grav}
                      </span>
                    </td>
                    <td className={`py-2 px-2 ${corFase(e.fase)}`}>{e.fase}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ===================== Seção 5: Contexto Operacional =====================
// SVG estilizado do Brasil (path simplificado)
const BRASIL_PATH = "M 180 40 L 240 50 L 280 80 L 310 130 L 320 180 L 310 230 L 290 280 L 260 320 L 220 340 L 180 345 L 140 330 L 110 300 L 90 260 L 80 220 L 75 180 L 90 140 L 110 100 L 140 70 Z";

function SecaoContexto({ condutor }: { condutor: CondutorPreditivo }) {
  const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const heatmap = useMemo(() => {
    const seed = condutor.id.charCodeAt(0);
    return Array.from({ length: 7 }, (_, d) =>
      Array.from({ length: 24 }, (_, h) => {
        const v = Math.abs(Math.sin((d + 1) * (h + 1) * 0.3 + seed)) * (condutor.percentualRiscoContexto / 100);
        return v;
      })
    );
  }, [condutor]);

  const corCel = (v: number) => {
    if (v < 0.2) return '#dcfce7';
    if (v < 0.4) return '#fef9c3';
    if (v < 0.6) return '#fed7aa';
    if (v < 0.8) return '#fecaca';
    return '#dc2626';
  };

  const zonas = [
    { zona: 'Rodovias', risco: Math.min(95, condutor.percentualRiscoContexto + 10) },
    { zona: 'Centro Urbano', risco: Math.max(15, condutor.percentualRiscoContexto - 10) },
    { zona: 'Zona Rural', risco: Math.max(5, condutor.percentualRiscoContexto - 30) },
  ];

  // pontinhos no mapa (coordenadas aprox em viewBox 400x400)
  const pontosMapa = useMemo(() => {
    const seed = condutor.id.charCodeAt(0);
    return [
      { x: 200, y: 120, label: 'Norte' },
      { x: 250, y: 180, label: 'Nordeste' },
      { x: 180, y: 220, label: 'Centro-Oeste' },
      { x: 230, y: 260, label: 'Sudeste' },
      { x: 200, y: 310, label: 'Sul' },
      { x: 270, y: 150 + (seed % 30), label: 'Litoral NE' },
    ];
  }, [condutor]);

  const tabelaInfracoes = [
    { tipo: 'Excesso de velocidade', qtd: 18 },
    { tipo: 'Frenagem brusca', qtd: 12 },
    { tipo: 'Aceleração brusca', qtd: 9 },
    { tipo: 'Curva acentuada', qtd: 6 },
    { tipo: 'Uso de celular', qtd: 4 },
    { tipo: 'Não uso de cinto', qtd: 2 },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10 p-5">
        <p className="text-sm">
          <span className="font-semibold text-primary">Resumo: </span>
          Condutor <strong>{condutor.nome}</strong> apresenta <strong style={{ color: '#dc2626' }}>{condutor.percentualRiscoContexto}%</strong> maior exposição ao risco em <strong>{condutor.contextoCritico}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard
          title="Mapa de eventos de risco"
          subtitle="Locais com ocorrências do condutor"
          info="Mapa estilizado do Brasil com marcadores nos locais onde ocorreram eventos de risco."
          className="lg:col-span-2"
        >
          <div className="h-64 flex items-center justify-center">
            <svg viewBox="0 0 400 400" className="h-full">
              <path d={BRASIL_PATH} fill="#e6f1fb" stroke="#0A2C66" strokeWidth="1.5" />
              {pontosMapa.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="6" fill="#dc2626" opacity="0.25" />
                  <circle cx={p.x} cy={p.y} r="3" fill="#dc2626" />
                  <title>{p.label}</title>
                </g>
              ))}
            </svg>
          </div>
        </SectionCard>

        <SectionCard
          title="Zonas de risco"
          subtitle="Percentual por contexto"
          info="Concentração de risco por tipo de contexto operacional."
        >
          <div className="space-y-3">
            {zonas.map(r => (
              <div key={r.zona}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{r.zona}</span>
                  <span className="font-semibold">{r.risco}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.risco}%`, background: r.risco > 60 ? CORES.vermelho : r.risco > 40 ? CORES.amarelo : CORES.verde }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard
          title="Top 5 fatores de risco"
          info="Principais fatores que impactam o risco operacional do condutor."
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={condutor.fatoresRisco} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="fator" tick={{ fontSize: 11 }} width={150} />
                <RTooltip />
                <Bar dataKey="score" fill={CORES.azul} radius={[0, 4, 4, 0]}>
                  {condutor.fatoresRisco.map((f, i) => (
                    <Cell key={i} fill={f.score > 70 ? CORES.vermelho : f.score > 40 ? CORES.amarelo : CORES.verde} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-red-900 uppercase">Contexto mais crítico</span>
            </div>
            <p className="text-sm font-semibold text-red-900">{condutor.contextoCritico}</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-900 uppercase">Contexto mais seguro</span>
            </div>
            <p className="text-sm font-semibold text-green-900">{condutor.contextoSeguro}</p>
          </div>
        </div>
      </div>

      {/* Heatmap depois do Top 5 */}
      <SectionCard
        title="Heatmap Dia × Hora"
        subtitle="Intensidade de risco operacional"
        info="Concentração de risco operacional do condutor por dia e hora."
      >
        <div className="overflow-x-auto">
          <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `40px repeat(24, 1fr)`, minWidth: 600 }}>
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-[9px] text-center text-muted-foreground">{h}h</div>
            ))}
            {heatmap.map((row, d) => (
              <Fragment key={`row-${d}`}>
                <div className="text-[10px] text-muted-foreground font-medium flex items-center">{dias[d]}</div>
                {row.map((v, h) => (
                  <div key={`${d}-${h}`} className="aspect-square rounded-sm" style={{ background: corCel(v) }} />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Baixa</span>
          {[
            { cor: '#dcfce7', label: 'Baixo risco (0-20%)' },
            { cor: '#fef9c3', label: 'Risco baixo-moderado (20-40%)' },
            { cor: '#fed7aa', label: 'Risco moderado (40-60%)' },
            { cor: '#fecaca', label: 'Risco alto (60-80%)' },
            { cor: '#dc2626', label: 'Risco crítico (80-100%)' },
          ].map(c => (
            <div key={c.cor} className="w-6 h-3 rounded-sm cursor-help" style={{ background: c.cor }} title={c.label} />
          ))}
          <span>Alta</span>
        </div>
      </SectionCard>

      {/* Tabela final */}
      <SectionCard
        title="Infrações registradas"
        subtitle="Quantidade total por tipo"
        info="Total de ocorrências por tipo de infração no período analisado."
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground text-xs">
              <th className="text-left py-2">Tipo de Infração</th>
              <th className="text-right py-2">Quantidade de Ocorrências</th>
            </tr>
          </thead>
          <tbody>
            {tabelaInfracoes.map(r => (
              <tr key={r.tipo} className="border-b last:border-0">
                <td className="py-2">{r.tipo}</td>
                <td className="py-2 text-right font-semibold">{r.qtd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

// ===================== Layout principal =====================
const SECOES = [
  { id: 'irc', label: 'Índice de Risco Composto', icon: Activity },
  { id: 'tendencia', label: 'Tendência de Risco', icon: TrendingUp },
  { id: 'probabilidade', label: 'Prob. Nova Infração', icon: AlertTriangle },
  { id: 'reincidencia', label: 'Reincidência', icon: RefreshCw },
  { id: 'contexto', label: 'Risco por Contexto', icon: MapPin },
] as const;

type SecaoId = typeof SECOES[number]['id'];

export default function AnalisePreditivaCondutor({ condutor }: { condutor: CondutorPreditivo }) {
  const [secao, setSecao] = useState<SecaoId>('irc');

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-card p-2">
        <nav className="flex flex-wrap gap-1">
          {SECOES.map(s => {
            const Icon = s.icon;
            const ativo = secao === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSecao(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${
                  ativo ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted text-foreground/70'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        {secao === 'irc' && <SecaoIRC condutor={condutor} />}
        {secao === 'tendencia' && <SecaoTendencia condutor={condutor} />}
        {secao === 'probabilidade' && <SecaoProbabilidade condutor={condutor} />}
        {secao === 'reincidencia' && <SecaoReincidencia condutor={condutor} />}
        {secao === 'contexto' && <SecaoContexto condutor={condutor} />}
      </div>
    </div>
  );
}

