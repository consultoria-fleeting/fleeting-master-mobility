/**
 * FatoresQuilometragem — Fatores de quilometragem da Matriz de Pontuação.
 *
 * Exibe a faixa de km rodados no mês e o fator multiplicador aplicado
 * (`km_factors` de `GET /dashboard/scoring-matrix`).
 *
 * @example
 * <FatoresQuilometragem fatores={data.km_factors} />
 */

import type { ScoringMatrixKmFactor } from "@/types/driver-scoring";

interface FatoresQuilometragemProps {
  fatores: ScoringMatrixKmFactor[];
}

/** Ex.: `0.9` -> `0,9`. */
function formatarFator(fator: number): string {
  return fator.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

export function FatoresQuilometragem({ fatores }: FatoresQuilometragemProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">Fatores de Quilometragem</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-3 font-semibold">Faixa de km no mês</th>
              <th className="text-right py-3 px-3 font-semibold">Fator</th>
            </tr>
          </thead>
          <tbody>
            {fatores.map((item) => (
              <tr key={item.range} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-3">{item.range}</td>
                <td className="py-2.5 px-3 text-right font-bold">× {formatarFator(item.factor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
