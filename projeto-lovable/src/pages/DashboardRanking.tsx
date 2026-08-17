import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { condutores, evolucaoAnual, condutoresPorNegocio, condutoresPorFuncao, condutoresPorDepto, fadigaPorDepto, eventosPorParametro } from '@/data/mockData';
import StatCard from '@/components/StatCard';
import ClassificationBadge from '@/components/ClassificationBadge';
import InfoTooltip from '@/components/InfoTooltip';
import { Users, Trophy, TrendingUp, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getClassificacao } from '@/data/mockData';

const COLORS = {
  referencia: '#92D050',
  baixa: '#EEDA2B',
  media: '#FF0000',
  alta: '#9B23AB',
};

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const anos = [2024, 2025, 2026];

function ScoreCircle({ score }: { score: number }) {
  const cls = getClassificacao(score);
  const colorMap: Record<string, string> = {
    referencia: 'bg-[hsl(var(--referencia))] text-black',
    baixa: 'bg-[hsl(var(--baixa-exposicao))] text-black',
    media: 'bg-[hsl(var(--media-exposicao))] text-white',
    alta: 'bg-[hsl(var(--alta-exposicao))] text-white',
  };
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold ${colorMap[cls]}`}>
      {score}
    </span>
  );
}

const ITEMS_PER_PAGE = 15;

export default function DashboardRanking() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('mensal');
  const [mesSel, setMesSel] = useState('Fevereiro');
  const [anoSel, setAnoSel] = useState(2026);
  const [page, setPage] = useState(1);

  // Filters
  const [nomeFilter, setNomeFilter] = useState('');
  const [gestorFilter, setGestorFilter] = useState('');
  const [deptoFilter, setDeptoFilter] = useState('');
  const [funcaoFilter, setFuncaoFilter] = useState('');
  const [negocioFilter, setNegocioFilter] = useState('');

  const gestores = [...new Set(condutores.map(c => c.gestor))];
  const deptos = [...new Set(condutores.map(c => c.departamento))];
  const funcoes = [...new Set(condutores.map(c => c.funcao))];
  const negocios = [...new Set(condutores.map(c => c.negocio))];

  const filtered = condutores.filter(c => {
    if (nomeFilter && !c.nome.toLowerCase().includes(nomeFilter.toLowerCase())) return false;
    if (gestorFilter && c.gestor !== gestorFilter) return false;
    if (deptoFilter && c.departamento !== deptoFilter) return false;
    if (funcaoFilter && c.funcao !== funcaoFilter) return false;
    if (negocioFilter && c.negocio !== negocioFilter) return false;
    return true;
  });

  const total = filtered.length;
  const refs = filtered.filter(c => c.classificacao === 'referencia').length;
  const baixas = filtered.filter(c => c.classificacao === 'baixa').length;
  const medias = filtered.filter(c => c.classificacao === 'media').length;
  const altas = filtered.filter(c => c.classificacao === 'alta').length;

  const top10Ref = filtered.filter(c => c.classificacao === 'referencia').sort((a, b) => b.pontuacao - a.pontuacao).slice(0, 10);
  const top10Crit = [...filtered].sort((a, b) => a.pontuacao - b.pontuacao).slice(0, 10);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Dashboard Geral do Ranking</h1>
          <p className="page-subtitle">Visão consolidada de performance dos condutores</p>
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
          onChange={e => handleFilterChange(setNomeFilter)(e.target.value)}
          className="text-xs border rounded-md px-3 py-1.5 bg-background w-40"
        />
        <select value={gestorFilter} onChange={e => handleFilterChange(setGestorFilter)(e.target.value)} className="text-xs border rounded-md px-3 py-1.5 bg-background">
          <option value="">Todos os Gestores</option>
          {gestores.map(g => <option key={g}>{g}</option>)}
        </select>
        <select value={deptoFilter} onChange={e => handleFilterChange(setDeptoFilter)(e.target.value)} className="text-xs border rounded-md px-3 py-1.5 bg-background">
          <option value="">Todas as Filiais</option>
          {deptos.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={funcaoFilter} onChange={e => handleFilterChange(setFuncaoFilter)(e.target.value)} className="text-xs border rounded-md px-3 py-1.5 bg-background">
          <option value="">Todos os Departamentos</option>
          {funcoes.map(f => <option key={f}>{f}</option>)}
        </select>
        <select value={negocioFilter} onChange={e => handleFilterChange(setNegocioFilter)(e.target.value)} className="text-xs border rounded-md px-3 py-1.5 bg-background">
          <option value="">Todas as Unidades</option>
          {negocios.map(n => <option key={n}>{n}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard title="Total Condutores" value={total} icon={Users} variant="primary" onClick={() => navigate('/condutores-categoria/todos')} />
        <StatCard title="Referência" value={refs} variant="success" icon={Trophy} subtitle="> 85 pontos no mês" onClick={() => navigate('/condutores-categoria/referencia')} />
        <StatCard title="Baixa Exposição" value={baixas} variant="baixa" subtitle="Entre 40-85 no mês" onClick={() => navigate('/condutores-categoria/baixa')} />
        <StatCard title="Média Exposição" value={medias} variant="warning" subtitle="< 40 pontos" onClick={() => navigate('/condutores-categoria/media')} />
        <StatCard title="Alta Exposição ao Risco" value={altas} variant="danger" subtitle="Condutor sem pontos" onClick={() => navigate('/condutores-categoria/alta')} />
      </div>

      {/* Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-5">
          <h3 className="section-title flex items-center gap-2">
            <Trophy className="w-4 h-4 text-success" /> Top 10 Condutores Referência
            <InfoTooltip text="Os 10 condutores com maior pontuação no período selecionado, classificados como Referência (> 85 pts)." />
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">#</th><th className="text-left py-2">Nome</th><th className="text-left py-2">Unidade</th><th className="text-right py-2 px-2">Pts</th>
              </tr></thead>
              <tbody>
                {top10Ref.map((c, i) => (
                  <tr key={c.nome} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/performance-condutores/${encodeURIComponent(c.nome)}`)}>
                    <td className="py-2 px-2 font-medium">{i + 1}</td>
                    <td className="py-2">{c.nome}</td>
                    <td className="py-2 text-muted-foreground">{c.negocio}</td>
                    <td className="py-2 px-2 text-right font-bold">{c.pontuacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h3 className="section-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-danger" /> Top 10 Condutores Críticos
            <InfoTooltip text="Os 10 condutores com menor pontuação no período, que necessitam de atenção imediata." />
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">#</th><th className="text-left py-2">Nome</th><th className="text-left py-2">Unidade</th><th className="text-right py-2 px-2">Pts</th><th className="text-right py-2 px-2">Classificação</th>
              </tr></thead>
              <tbody>
                {top10Crit.map((c, i) => (
                  <tr key={c.nome} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/performance-condutores/${encodeURIComponent(c.nome)}`)}>
                    <td className="py-2 px-2 font-medium">{i + 1}</td>
                    <td className="py-2">{c.nome}</td>
                    <td className="py-2 text-muted-foreground">{c.negocio}</td>
                    <td className="py-2 px-2 text-right font-bold">{c.pontuacao}</td>
                    <td className="py-2 px-2 text-right"><ClassificationBadge classificacao={c.classificacao} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ranking Tables */}
      <div className="bg-card rounded-lg border p-5">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0 flex items-center gap-2">
              Ranking dos Condutores
              <InfoTooltip text="Classificação geral de todos os condutores com base na pontuação do período selecionado." />
            </h3>
            <TabsList>
              <TabsTrigger value="mensal">Mensal</TabsTrigger>
              <TabsTrigger value="anual">Anual</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="mensal">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">#</th><th className="text-left py-2">Condutor</th><th className="text-left py-2">Gestor</th>
                  <th className="text-left py-2">C. Custo</th><th className="text-left py-2">Filial</th><th className="text-left py-2">Departamento</th>
                  <th className="text-left py-2">Unidade</th><th className="text-right py-2 px-2">Pontuação</th><th className="text-right py-2 px-2">Classificação</th>
                </tr></thead>
                <tbody>
                  {paginatedData.map((c, i) => (
                    <tr key={c.nome} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/performance-condutores/${encodeURIComponent(c.nome)}`)}>
                      <td className="py-2 px-2 font-medium">{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                      <td className="py-2 font-medium">{c.nome}</td>
                      <td className="py-2 text-muted-foreground">{c.gestor}</td>
                      <td className="py-2 text-muted-foreground">{c.centroCusto}</td>
                      <td className="py-2 text-muted-foreground">{c.departamento}</td>
                      <td className="py-2 text-muted-foreground">{c.funcao}</td>
                      <td className="py-2 text-muted-foreground">{c.negocio}</td>
                      <td className="py-2 px-2 text-right font-bold">{c.pontuacao}</td>
                      <td className="py-2 px-2 text-right"><ClassificationBadge classificacao={c.classificacao} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Exibindo {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} condutores
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-md text-xs font-medium ${p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="anual">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">Pos.</th><th className="text-left py-2">Condutor</th><th className="text-left py-2">Gestor</th>
                  <th className="text-left py-2">C. Custo</th><th className="text-left py-2">Filial</th><th className="text-left py-2">Departamento</th>
                  <th className="text-left py-2">Unidade</th>
                  <th className="text-center py-2 font-bold">Acum. Ano</th>
                  <th className="text-center py-2">Jan</th><th className="text-center py-2">Fev</th>
                  <th className="text-center py-2">Mar</th><th className="text-center py-2">Abr</th>
                </tr></thead>
                <tbody>
                  {paginatedData.map((c, i) => {
                    const acumulado = c.pontuacoesMensais
                      ? Object.values(c.pontuacoesMensais).reduce((sum, v) => sum + v, 0)
                      : 0;
                    return (
                      <tr key={c.nome} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/performance-condutores/${encodeURIComponent(c.nome)}`)}>
                        <td className="py-2 px-2 font-medium">{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                        <td className="py-2 font-medium">{c.nome}</td>
                        <td className="py-2 text-muted-foreground">{c.gestor}</td>
                        <td className="py-2 text-muted-foreground">{c.centroCusto}</td>
                        <td className="py-2 text-muted-foreground">{c.departamento}</td>
                        <td className="py-2 text-muted-foreground">{c.funcao}</td>
                        <td className="py-2 text-muted-foreground">{c.negocio}</td>
                        <td className="py-2 text-center font-bold">{acumulado}</td>
                        <td className="py-2 text-center">{c.pontuacoesMensais?.Janeiro && <ScoreCircle score={c.pontuacoesMensais.Janeiro} />}</td>
                        <td className="py-2 text-center">{c.pontuacoesMensais?.Fevereiro && <ScoreCircle score={c.pontuacoesMensais.Fevereiro} />}</td>
                        <td className="py-2 text-center">{c.pontuacoesMensais?.Março && <ScoreCircle score={c.pontuacoesMensais.Março} />}</td>
                        <td className="py-2 text-center">{c.pontuacoesMensais?.Abril && <ScoreCircle score={c.pontuacoesMensais.Abril} />}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Exibindo {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} condutores
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-md text-xs font-medium ${p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Charts Section */}
      <div className="page-header mt-2">
        <h2 className="section-title">Análises Gráficas</h2>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
          Evolução do Comportamento — Ano
          <InfoTooltip text="Grau de exposição ao risco por mês: evolução anual da distribuição dos condutores por classificação." />
        </h4>
        <div className="overflow-x-auto">
          <div style={{ width: `${Math.max(evolucaoAnual.length * 80, 600)}px`, height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolucaoAnual}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} interval={0} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="referencia" name="Referência" fill={COLORS.referencia} radius={[2, 2, 0, 0]} />
                <Bar dataKey="baixa" name="Baixa" fill={COLORS.baixa} radius={[2, 2, 0, 0]} />
                <Bar dataKey="media" name="Média" fill={COLORS.media} radius={[2, 2, 0, 0]} />
                <Bar dataKey="alta" name="Alta" fill={COLORS.alta} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Arraste horizontalmente para visualizar todos os meses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-card rounded-lg border p-5">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            Condutores por Unidade x Comportamento
            <InfoTooltip text="Distribuição dos condutores por unidade, segmentados pela classificação de risco." />
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={condutoresPorNegocio} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="negocio" type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="referencia" name="Ref." fill={COLORS.referencia} stackId="s" />
              <Bar dataKey="baixa" name="Baixa" fill={COLORS.baixa} stackId="s" />
              <Bar dataKey="media" name="Média" fill={COLORS.media} stackId="s" />
              <Bar dataKey="alta" name="Alta" fill={COLORS.alta} stackId="s" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            Condutores por Departamento x Comportamento
            <InfoTooltip text="Distribuição dos condutores por departamento, segmentados pela classificação de risco." />
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={condutoresPorFuncao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="funcao" type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="referencia" name="Ref." fill={COLORS.referencia} stackId="s" />
              <Bar dataKey="baixa" name="Baixa" fill={COLORS.baixa} stackId="s" />
              <Bar dataKey="media" name="Média" fill={COLORS.media} stackId="s" />
              <Bar dataKey="alta" name="Alta" fill={COLORS.alta} stackId="s" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            Condutores por Filial x Comportamento
            <InfoTooltip text="Distribuição dos condutores por filial, segmentados pela classificação de risco." />
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={condutoresPorDepto} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="departamento" type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="referencia" name="Ref." fill={COLORS.referencia} stackId="s" />
              <Bar dataKey="baixa" name="Baixa" fill={COLORS.baixa} stackId="s" />
              <Bar dataKey="media" name="Média" fill={COLORS.media} stackId="s" />
              <Bar dataKey="alta" name="Alta" fill={COLORS.alta} stackId="s" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            Registros de Fadiga por Filial
            <InfoTooltip text="Quantidade de registros de fadiga aguda e acumulada por filial no período selecionado." />
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fadigaPorDepto}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
              <XAxis dataKey="departamento" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="aguda" name="Fadiga Aguda" fill={COLORS.media} radius={[2, 2, 0, 0]} />
              <Bar dataKey="acumulada" name="Fadiga Acumulada" fill={COLORS.alta} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
          Quantidade de Eventos por Parâmetro do Ranking
          <InfoTooltip text="Total de eventos registrados para cada parâmetro do ranking no período selecionado." />
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={eventosPorParametro} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="parametro" type="category" width={160} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="total" name="Total" fill="hsl(220 72% 49%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
