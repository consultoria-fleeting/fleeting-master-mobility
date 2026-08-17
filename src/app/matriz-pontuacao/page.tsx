/**
 * Matriz de Pontuação — Página
 *
 * Exibe todas as regras que definem o cálculo do ranking de condutores.
 * Contém quatro seções:
 * 1. Tabela de Pontuação por Evento (Origem, Evento, Pontuação)
 * 2. Classificação dos Condutores (faixas com cores)
 * 3. Regras de Cálculo do Ranking (lista numerada)
 * 4. Periodicidade de Atualização
 *
 * Tela apenas visual (V1 — sem edição).
 * Dados mockados, prontos para futura integração com backend.
 *
 * TODO(backend): Substituir dados mock pela configuração ativa do cliente via API.
 * TODO(security): Implementar autenticação/autorização quando integrar com backend.
 *
 * Rota: /matriz-pontuacao
 */

import { TabelaPontuacao } from "@/components/tabela-pontuacao";
import { ClassificacaoGrid } from "@/components/classificacao-grid";
import { RegrasCalculoLista } from "@/components/regras-calculo-lista";
import { PeriodicidadeSecao } from "@/components/periodicidade-secao";
import {
  matrizPontuacao,
  classificacoes,
  regrasCalculo,
  periodicidade,
} from "@/data/mock-matriz-pontuacao";

export default function MatrizPontuacaoPage() {
  return (
    <div className="animate-fade-in min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Matriz de Pontuação
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Critérios, pesos e regras de cálculo do ranking
        </p>
      </div>

      {/* Seção 1: Tabela de Pontuação */}
      <TabelaPontuacao eventos={matrizPontuacao} />

      {/* Seção 2: Classificação dos Condutores */}
      <ClassificacaoGrid classificacoes={classificacoes} />

      {/* Seção 3: Regras de Cálculo */}
      <RegrasCalculoLista regras={regrasCalculo} />

      {/* Seção 4: Periodicidade */}
      <PeriodicidadeSecao itens={periodicidade} />
    </div>
  );
}
