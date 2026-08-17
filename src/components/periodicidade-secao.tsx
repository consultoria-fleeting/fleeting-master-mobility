/**
 * PeriodicidadeSecao — Seção de Periodicidade de Atualização
 *
 * Exibe os itens descritivos sobre a periodicidade de atualização
 * do ranking. Suporta destaques em texto (mesma lógica do RegrasCalculoLista).
 *
 * @example
 * <PeriodicidadeSecao itens={periodicidade} />
 */

import { Clock } from "lucide-react";
import type { ItemPeriodicidade } from "@/types/matriz-pontuacao";

interface PeriodicidadeSecaoProps {
  itens: ItemPeriodicidade[];
}

/**
 * Renderiza texto com destaques marcados por {texto}.
 */
function renderizarTexto(descricao: string, destaques?: string[]) {
  if (!destaques || destaques.length === 0) {
    return <p>{descricao}</p>;
  }

  const partes: React.ReactNode[] = [];
  let textoRestante = descricao;
  let chaveIndex = 0;

  for (const destaque of destaques) {
    const marcador = `{${destaque}}`;
    const indice = textoRestante.indexOf(marcador);

    if (indice === -1) continue;

    if (indice > 0) {
      partes.push(textoRestante.substring(0, indice));
    }

    partes.push(
      <strong key={chaveIndex} className="text-foreground">
        {destaque}
      </strong>
    );

    textoRestante = textoRestante.substring(indice + marcador.length);
    chaveIndex++;
  }

  if (textoRestante) {
    partes.push(textoRestante);
  }

  return <p>{partes}</p>;
}

export function PeriodicidadeSecao({ itens }: PeriodicidadeSecaoProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-[hsl(var(--accent))]" />
        Periodicidade de Atualização
      </h3>

      <div className="space-y-2 text-sm text-muted-foreground">
        {itens.map((item, indice) => (
          <div key={indice}>
            {renderizarTexto(item.descricao, item.destaques)}
          </div>
        ))}
      </div>
    </div>
  );
}
