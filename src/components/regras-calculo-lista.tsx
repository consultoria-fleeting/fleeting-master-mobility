/**
 * RegrasCalculoLista — Lista de Regras de Cálculo do Ranking
 *
 * Exibe as regras de cálculo em formato de lista numerada
 * com círculos sequenciais. Suporta destaques (strong) e
 * destaques em cor de perigo para regras eliminatórias.
 *
 * Reutilizável para qualquer lista de regras numeradas.
 *
 * @example
 * <RegrasCalculoLista regras={regrasCalculo} />
 */

import type { RegraCalculo } from "@/types/matriz-pontuacao";

interface RegrasCalculoListaProps {
  regras: RegraCalculo[];
}

/**
 * Renderiza a descrição da regra com trechos em destaque.
 * Trechos entre chaves {texto} são renderizados como <strong>.
 */
function renderizarDescricao(
  descricao: string,
  destaques?: string[],
  destaqueDanger?: boolean
) {
  if (!destaques || destaques.length === 0) {
    return <p>{descricao}</p>;
  }

  // Substitui {texto} pelo strong colorido
  const partes: React.ReactNode[] = [];
  let textoRestante = descricao;
  let chaveIndex = 0;

  for (const destaque of destaques) {
    const marcador = `{${destaque}}`;
    const indice = textoRestante.indexOf(marcador);

    if (indice === -1) continue;

    // Texto antes do destaque
    if (indice > 0) {
      partes.push(textoRestante.substring(0, indice));
    }

    // Destaque
    partes.push(
      <strong
        key={chaveIndex}
        className={
          destaqueDanger
            ? "text-[hsl(var(--danger))]"
            : "text-foreground"
        }
      >
        {destaque}
      </strong>
    );

    textoRestante = textoRestante.substring(indice + marcador.length);
    chaveIndex++;
  }

  // Texto restante após todos os destaques
  if (textoRestante) {
    partes.push(textoRestante);
  }

  return <p>{partes}</p>;
}

export function RegrasCalculoLista({ regras }: RegrasCalculoListaProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Regras de Cálculo do Ranking
      </h3>

      <div className="space-y-3 text-sm text-muted-foreground">
        {regras.map((regra) => (
          <div key={regra.numero} className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {regra.numero}
            </span>
            {renderizarDescricao(
              regra.descricao,
              regra.destaques,
              regra.destaqueDanger
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
