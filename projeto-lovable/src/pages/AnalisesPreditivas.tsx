import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ReferenceLine, RadialBarChart, RadialBar,
} from 'recharts';
import { Fragment } from 'react';
import { ArrowRight, AlertTriangle, MapPin } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

const CORES = { verde: '#16a34a', amarelo: '#ca8a04', vermelho: '#dc2626', azul: '#2563eb', primary: '#0A2C66' };

function corIrc(v: number) {
  if (v <= 30) return CORES.verde;
  if (v <= 60) return CORES.amarelo;
  if (v <= 80) return CORES.vermelho;
  return '#7c3aed';
}
function nivelIrc(v: number) {
  if (v <= 30) return 'Baixo';
  if (v <= 60) return 'Moderado';
  if (v <= 80) return 'Alto';
  return 'Crítico';
}

function Card({
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

// ===== Mocks =====
const IRC_FROTA = 62;
const EVOLUCAO_MES = [
  { mes: 'Jan', irc: 58, meta: 55 },
  { mes: 'Fev', irc: 61, meta: 55 },
  { mes: 'Mar', irc: 67, meta: 55 },
  { mes: 'Abr', irc: 63, meta: 55 },
  { mes: 'Mai', irc: 70, meta: 55 },
  { mes: 'Jun', irc: 65, meta: 55 },
];

const TOP_CONDUTORES = [
  { nome: 'Mariana Costa', irc: 91 },
  { nome: 'Carlos Mendes', irc: 88 },
  { nome: 'Roberto Lima', irc: 85 },
  { nome: 'Felipe Souza', irc: 83 },
  { nome: 'Patrícia Nunes', irc: 81 },
  { nome: 'Luiza Ribeiro', irc: 79 },
  { nome: 'André Silveira', irc: 77 },
  { nome: 'Beatriz Tavares', irc: 75 },
  { nome: 'Thiago Borges', irc: 73 },
  { nome: 'Camila Duarte', irc: 72 },
];

const TOP_INFRACOES = [
  { tipo: 'Excesso de velocidade', qtd: 312 },
  { tipo: 'Frenagem brusca', qtd: 287 },
  { tipo: 'Aceleração brusca', qtd: 201 },
  { tipo: 'Uso de celular', qtd: 178 },
  { tipo: 'Curva acentuada', qtd: 143 },
  { tipo: 'Não uso de cinto', qtd: 112 },
  { tipo: 'Direção em chuva', qtd: 89 },
  { tipo: 'Madrugada sem pausa', qtd: 64 },
];

const ZONAS = [
  { zona: 'Rodovias', risco: 85 },
  { zona: 'Centro Urbano', risco: 62 },
  { zona: 'Zona Rural', risco: 38 },
];
const LOCAIS = [
  { local: 'BR-101 noturno', risco: 85 },
  { local: 'Centro Urbano - Pico', risco: 62 },
  { local: 'Zona Industrial', risco: 45 },
  { local: 'Periferia Sul', risco: 38 },
];

export default function AnalisesPreditivas() {
  const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const heatmap = useMemo(() => {
    return Array.from({ length: 7 }, (_, d) =>
      Array.from({ length: 24 }, (_, h) => {
        const fimSemana = d === 4 || d === 5; // sex/sab
        const segManha = d === 0 && h >= 6 && h <= 8;
        const noite = h >= 18 && h <= 23;
        let v = 0.15 + Math.abs(Math.sin((d + 1) * (h + 1) * 0.3)) * 0.25;
        if (fimSemana && noite) v += 0.55;
        if (segManha) v += 0.5;
        return Math.min(1, v);
      })
    );
  }, []);

  const corCel = (v: number) => {
    if (v < 0.2) return '#dcfce7';
    if (v < 0.4) return '#fef9c3';
    if (v < 0.6) return '#fed7aa';
    if (v < 0.8) return '#fecaca';
    return '#dc2626';
  };

  const corFrota = corIrc(IRC_FROTA);
  const maxInfracao = Math.max(...TOP_INFRACOES.map(i => i.qtd));

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Análises Preditivas</h1>
          <p className="text-sm text-muted-foreground">Visão geral da frota</p>
        </div>
        <Link
          to="/performance-condutores"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          Ver performance dos condutores <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Filtros */}
      <div className="rounded-lg border bg-card p-4 flex flex-wrap gap-3 items-end">
        {['Gestor', 'Filial', 'Departamento', 'Unidade', 'Período'].map(f => (
          <div key={f} className="flex flex-col gap-1 min-w-[140px] flex-1">
            <label className="text-[11px] text-muted-foreground font-medium">{f}</label>
            <select className="h-9 rounded-md border bg-background px-2 text-sm">
              <option>Todos</option>
            </select>
          </div>
        ))}
        <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
          Aplicar filtros
        </button>
      </div>

      {/* Linha 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          title="IRC da Frota"
          subtitle="Média do IRC dos condutores da frota"
          info="Score médio do Índice de Risco Composto considerando todos os condutores ativos da frota."
        >
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={[{ name: 'IRC', value: IRC_FROTA, fill: corFrota }]}>
                <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-5xl font-bold" style={{ color: corFrota }}>{IRC_FROTA}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: corFrota }}>
              {nivelIrc(IRC_FROTA)}
            </span>
          </div>
        </Card>

        <Card
          title="Evolução do IRC no Ano"
          subtitle="IRC médio mensal vs meta"
          info="Evolução do IRC médio da frota ao longo dos últimos meses, comparado à meta institucional."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EVOLUCAO_MES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <RTooltip />
                <Bar dataKey="irc" fill={CORES.azul} radius={[4, 4, 0, 0]} />
                <ReferenceLine y={55} stroke={CORES.vermelho} strokeDasharray="4 4" label={{ value: 'Meta 55', position: 'right', fontSize: 10, fill: CORES.vermelho }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Linha 2 */}
      <Card
        title="Top 10 Condutores com Maior IRC"
        subtitle="Ordenado do maior para o menor"
        info="Lista dos 10 condutores com maior Índice de Risco Composto na frota."
      >
        <div className="space-y-2">
          {TOP_CONDUTORES.map((c, i) => {
            const cor = corIrc(c.irc);
            return (
              <div key={c.nome} className="flex items-center gap-3 text-sm">
                <span className="w-6 text-xs text-muted-foreground font-semibold">{i + 1}º</span>
                <span className="flex-1 truncate font-medium">{c.nome}</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.irc}%`, background: cor }} />
                </div>
                <span className="w-8 text-right font-bold" style={{ color: cor }}>{c.irc}</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full text-white" style={{ background: cor }}>
                  {nivelIrc(c.irc)}
                </span>
                <Link
                  to={`/performance-condutores/${encodeURIComponent(c.nome)}`}
                  className="text-[11px] text-primary hover:underline"
                >
                  Ver condutor
                </Link>
              </div>
            );
          })}
        </div>
      </Card>





      {/* Linha 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          title="Zonas de Maior Risco da Frota"
          subtitle="Locais com maiores riscos por contexto"
          info="Concentração de risco por contexto operacional e locais específicos."
        >
          <div className="space-y-3">
            {ZONAS.map(z => (
              <div key={z.zona}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5" />{z.zona}</span>
                  <span className="font-bold">{z.risco}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${z.risco}%`, background: z.risco > 60 ? CORES.vermelho : z.risco > 40 ? CORES.amarelo : CORES.verde }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Locais específicos</p>
            <div className="space-y-2">
              {LOCAIS.map(l => (
                <div key={l.local}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{l.local}</span>
                    <span className="font-semibold">{l.risco}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${l.risco}%`, background: l.risco > 60 ? CORES.vermelho : l.risco > 40 ? CORES.amarelo : CORES.verde }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          title="Probabilidade de eventos de risco"
          subtitle="Baseado no histórico agregado de todos os condutores da frota"
          info="Estimativa de janelas de maior probabilidade de eventos de risco na frota."
        >
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-red-50/40">
              <p className="text-[11px] text-muted-foreground uppercase">Maior probabilidade por horário</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold">Sextas entre 18h–21h</span>
                <span className="text-3xl font-bold" style={{ color: CORES.vermelho }}>74%</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold">
                <AlertTriangle className="w-3 h-3" /> Alerta — acima de 60%
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-red-50/40">
              <p className="text-[11px] text-muted-foreground uppercase">Maior probabilidade por local</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold">Rodovias noturnas</span>
                <span className="text-3xl font-bold" style={{ color: CORES.vermelho }}>68%</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold">
                <AlertTriangle className="w-3 h-3" /> Alerta — acima de 60%
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Linha 4 — Heatmap frota */}
      <Card
        title="Heatmap de risco por dia × hora"
        subtitle="Concentração média de eventos de risco de toda a frota"
        info="Concentração média de eventos de risco da frota cruzando dia da semana e hora."
      >
        <div className="overflow-x-auto">
          <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `40px repeat(24, 1fr)`, minWidth: 800 }}>
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
                    title={`${dias[d]} ${h}h — ${(v * 100).toFixed(0)}%`}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground overflow-x-auto">
          <span>Baixa</span>
          {['#dcfce7', '#fef9c3', '#fed7aa', '#fecaca', '#dc2626'].map(c => (
            <div key={c} className="w-6 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span>Alta</span>
        </div>
      </Card>
    </div>
  );
}
