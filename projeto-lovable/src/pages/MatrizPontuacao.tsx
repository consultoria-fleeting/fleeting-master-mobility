import { matrizPontuacao, classificacoes } from '@/data/mockData';
import { Clock } from 'lucide-react';

export default function MatrizPontuacao() {
  // Reorder: group Telemetria first, then Multa, then Registro
  const ordered = [...matrizPontuacao].sort((a, b) => {
    const order: Record<string, number> = { Telemetria: 0, Multa: 1, Registro: 2 };
    return (order[a.origem] ?? 3) - (order[b.origem] ?? 3);
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="page-title">Matriz de Pontuação</h1>
        <p className="page-subtitle">Critérios, pesos e regras de cálculo do ranking</p>
      </div>

      {/* Scoring matrix table */}
      <div className="bg-card rounded-lg border p-5">
        <h3 className="section-title">Tabela de Pontuação por Evento</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-3 font-semibold">Origem</th>
                <th className="text-left py-3 px-3 font-semibold">Evento</th>
                <th className="text-right py-3 px-3 font-semibold">Pontuação (pts)</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${
                      r.origem === 'Telemetria' ? 'bg-accent/10 text-accent' :
                      r.origem === 'Multa' ? 'bg-warning/20 text-warning-foreground' :
                      'bg-danger/10 text-danger'
                    }`}>
                      {r.origem}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{r.evento}</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${r.pontuacao === -100 ? 'text-danger' : 'text-foreground'}`}>
                    {r.pontuacao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classification ranges */}
      <div className="bg-card rounded-lg border p-5">
        <h3 className="section-title">Classificação dos Condutores</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {classificacoes.map(c => (
            <div key={c.classificacao} className={`rounded-lg p-4 text-center classification-${c.cor}`}>
              <p className="text-sm font-bold">{c.classificacao}</p>
              <p className="text-xs opacity-80 mt-1">{c.pontuacao}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calculation rules */}
      <div className="bg-card rounded-lg border p-5">
        <h3 className="section-title">Regras de Cálculo</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
            <p>Cada condutor inicia o mês com <strong className="text-foreground">100 pontos</strong>.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
            <p>Pontos são deduzidos conforme os eventos registrados (Tabela de Pontuação).</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
            <p>Um fator de multiplicação é aplicado com base na quilometragem percorrida no mês (apenas para itens de Telemetria).</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
            <p>Comportamentos críticos (álcool, velocidade &gt;140km/h, sem cinto ≥1km, celular, ultrapassagem proibida) eliminam <strong className="text-danger">todos os 100 pontos</strong>.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">5</span>
            <p><strong className="text-foreground">Score Final = 100 - Σ(deduções) × Fator de Quilometragem</strong></p>
          </div>
        </div>
      </div>

      {/* Periodicidade de Atualização */}
      <div className="bg-card rounded-lg border p-5">
        <h3 className="section-title flex items-center gap-2"><Clock className="w-5 h-5 text-accent" /> Periodicidade de Atualização</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>O ranking é atualizado <strong className="text-foreground">mensalmente</strong>, com reset de pontuação no início de cada mês.</p>
          <p>A visão anual consolida as pontuações mensais para acompanhamento de longo prazo.</p>
          <p>As exceções aprovadas pelo gestor são aplicadas no mesmo período de referência do evento.</p>
        </div>
      </div>
    </div>
  );
}
