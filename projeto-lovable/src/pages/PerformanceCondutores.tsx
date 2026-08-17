import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { condutores } from '@/data/mockData';
import { FileDown, Filter } from 'lucide-react';
import ClassificationBadge from '@/components/ClassificationBadge';

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const anos = [2024, 2025, 2026];

export default function PerformanceCondutores() {
  const navigate = useNavigate();
  const [mesSel, setMesSel] = useState('Fevereiro');
  const [anoSel, setAnoSel] = useState(2026);
  const [nomeFilter, setNomeFilter] = useState('');
  const [gestorFilter, setGestorFilter] = useState('');
  const [deptoFilter, setDeptoFilter] = useState('');
  const [funcaoFilter, setFuncaoFilter] = useState('');
  const [negocioFilter, setNegocioFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
  }).sort((a, b) => b.pontuacao - a.pontuacao);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);



  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Performance dos Condutores</h1>
          <p className="page-subtitle">Relatórios analíticos para gestão de frota</p>
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
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-1.5 text-xs font-medium bg-success text-success-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition">
            <FileDown className="w-3.5 h-3.5" /> Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border p-5">
        <h3 className="section-title">Relatório de Performance dos Condutores</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 px-2">Ranking</th>
              <th className="text-left py-2">Condutor</th>
              <th className="text-left py-2">Gestor</th>
              <th className="text-left py-2">Filial</th>
              <th className="text-left py-2">Departamento</th>
              <th className="text-left py-2">Unidade</th>
              <th className="text-right py-2">Pontuação</th>
              <th className="text-right py-2 px-2">Classificação</th>
            </tr></thead>
            <tbody>
              {paginated.map((c, i) => (
                <tr key={c.nome} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/performance-condutores/${encodeURIComponent(c.nome)}`)}>
                  <td className="py-2 px-2 font-semibold">{(currentPage - 1) * pageSize + i + 1}º</td>
                  <td className="py-2 font-medium">{c.nome}</td>
                  <td className="py-2 text-muted-foreground">{c.gestor}</td>
                  <td className="py-2 text-muted-foreground">{c.departamento}</td>
                  <td className="py-2 text-muted-foreground">{c.funcao}</td>
                  <td className="py-2 text-muted-foreground">{c.negocio}</td>
                  <td className="py-2 text-right font-bold">{c.pontuacao}</td>
                  <td className="py-2 px-2 text-right"><ClassificationBadge classificacao={c.classificacao} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-muted-foreground">
            Mostrando {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            –{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 border rounded-md disabled:opacity-40 hover:bg-muted"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const n = idx + 1;
              if (totalPages > 7 && Math.abs(n - currentPage) > 2 && n !== 1 && n !== totalPages) {
                if (n === 2 || n === totalPages - 1) return <span key={n} className="px-1 text-muted-foreground">…</span>;
                return null;
              }
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-2.5 py-1 border rounded-md ${n === currentPage ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
                >
                  {n}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 border rounded-md disabled:opacity-40 hover:bg-muted"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
