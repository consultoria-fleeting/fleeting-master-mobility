import { useParams, Link } from 'react-router-dom';
import { condutores } from '@/data/mockData';
import ClassificationBadge from '@/components/ClassificationBadge';
import { ArrowLeft } from 'lucide-react';

const labels: Record<string, string> = {
  todos: 'Todos os Condutores',
  referencia: 'Condutores Referência',
  baixa: 'Baixa Exposição ao Risco',
  media: 'Média Exposição ao Risco',
  alta: 'Alta Exposição ao Risco',
};

export default function CondutoresCategoria() {
  const { categoria } = useParams();
  const filtered = categoria === 'todos' ? condutores : condutores.filter(c => c.classificacao === categoria);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard-ranking" className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">{labels[categoria || ''] || 'Condutores'}</h1>
          <p className="page-subtitle">{filtered.length} condutores</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 px-2">#</th><th className="text-left py-2">Condutor</th>
              <th className="text-left py-2">Gestor</th><th className="text-left py-2">Filial</th>
              <th className="text-left py-2">Departamento</th><th className="text-left py-2">Unidade</th>
              <th className="text-right py-2">Pontuação</th><th className="text-right py-2 px-2">Class.</th>
            </tr></thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.nome} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2 px-2">{i + 1}</td>
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
      </div>
    </div>
  );
}
