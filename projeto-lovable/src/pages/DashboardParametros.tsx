import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parametrosRanking, condutores } from '@/data/mockData';
import {
  Gauge, AlertTriangle, TrendingUp, Smartphone, Ban, Wine,
  ShieldAlert, Skull, CarFront, Filter
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Gauge, AlertTriangle, TrendingUp, Smartphone, Ban, Wine,
  ShieldAlert, Skull, CarFront,
};

const impactGroups: {
  label: string;
  color: string;
  textColor: string;
  grupo: string;
}[] = [
  {
    label: 'Alta Exposição ao Risco',
    color: 'bg-[hsl(var(--alta-exposicao))]',
    textColor: 'text-white',
    grupo: 'alta',
  },
  {
    label: 'Média Exposição',
    color: 'bg-[hsl(var(--media-exposicao))]',
    textColor: 'text-white',
    grupo: 'media',
  },
  {
    label: 'Baixa Exposição / Referência',
    color: 'bg-[hsl(var(--baixa-exposicao))]',
    textColor: 'text-black',
    grupo: 'baixa',
  },
];

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const anos = [2024, 2025, 2026];

export default function DashboardParametros() {
  const navigate = useNavigate();
  const [mesSel, setMesSel] = useState('Fevereiro');
  const [anoSel, setAnoSel] = useState(2026);

  const [nomeFilter, setNomeFilter] = useState('');
  const [gestorFilter, setGestorFilter] = useState('');
  const [deptoFilter, setDeptoFilter] = useState('');
  const [funcaoFilter, setFuncaoFilter] = useState('');
  const [negocioFilter, setNegocioFilter] = useState('');

  const gestores = [...new Set(condutores.map(c => c.gestor))];
  const deptos = [...new Set(condutores.map(c => c.departamento))];
  const funcoes = [...new Set(condutores.map(c => c.funcao))];
  const negocios = [...new Set(condutores.map(c => c.negocio))];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Parâmetros do Ranking</h1>
          <p className="page-subtitle">Indicadores agrupados por nível de impacto na pontuação. Clique para ver detalhes.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={mesSel} onChange={e => setMesSel(e.target.value)} className="text-xs border rounded-md px-3 py-1.5 bg-background">
            {meses.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={anoSel} onChange={e => setAnoSel(Number(e.target.value))} className="text-xs border rounded-md px-3 py-1.5 bg-background">
            {anos.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Nome do condutor..."
          value={nomeFilter}
          onChange={e => setNomeFilter(e.target.value)}
          className="text-xs border rounded-md px-3 py-1.5 bg-background w-40"
        />
        <select value={gestorFilter} onChange={e => setGestorFilter(e.target.value)} className="text-xs border rounded-md px-3 py-1.5 bg-background">
          <option value="">Todos os Gestores</option>
          {gestores.map(g => <option key={g}>{g}</option>)}
        </select>
        <select value={deptoFilter} onChange={e => setDeptoFilter(e.target.value)} className="text-xs border rounded-md px-3 py-1.5 bg-background">
          <option value="">Todas as Filiais</option>
          {deptos.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={funcaoFilter} onChange={e => setFuncaoFilter(e.target.value)} className="text-xs border rounded-md px-3 py-1.5 bg-background">
          <option value="">Todos os Departamentos</option>
          {funcoes.map(f => <option key={f}>{f}</option>)}
        </select>
        <select value={negocioFilter} onChange={e => setNegocioFilter(e.target.value)} className="text-xs border rounded-md px-3 py-1.5 bg-background">
          <option value="">Todas as Unidades</option>
          {negocios.map(n => <option key={n}>{n}</option>)}
        </select>
      </div>

      {impactGroups.map(group => {
        const items = parametrosRanking.filter(p => p.grupo === group.grupo);
        if (items.length === 0) return null;
        return (
          <div key={group.label} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(p => {
                const Icon = iconMap[p.icon] || Gauge;
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/dashboard-parametros/${p.id}`)}
                    className={`rounded-lg p-5 shadow-sm transition-all hover:shadow-md cursor-pointer hover:scale-[1.02] ${group.color} ${group.textColor}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-xs font-medium opacity-90 leading-tight">{p.label}</p>
                        <p className="text-3xl font-bold">{p.total}</p>
                        <p className="text-[10px] opacity-70">eventos registrados</p>
                      </div>
                      <div className="p-2 rounded-md bg-white/15">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
