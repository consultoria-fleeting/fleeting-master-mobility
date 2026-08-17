/**
 * TabelaPontuacao — Tabela de Pontuação por Evento
 *
 * Exibe a tabela da Matriz de Pontuação com colunas:
 * Origem, Evento e Pontuação.
 * Badges coloridos para as origens (Telemetria, Multa, Registro).
 * Destaque em vermelho para pontuações eliminatórias (-100).
 *
 * @example
 * <TabelaPontuacao eventos={matrizPontuacao} />
 */

import type { EventoPontuacao, OrigemEvento } from "@/types/matriz-pontuacao";

/** Estilos dos badges de origem */
const ESTILOS_ORIGEM: Record<OrigemEvento, string> = {
  Telemetria: "bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]",
  Multa: "bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning-foreground))]",
  Registro: "bg-[hsl(var(--danger)/0.1)] text-[hsl(var(--danger))]",
};

interface TabelaPontuacaoProps {
  eventos: EventoPontuacao[];
}

export function TabelaPontuacao({ eventos }: TabelaPontuacaoProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Tabela de Pontuação por Evento
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-3 font-semibold">Origem</th>
              <th className="text-left py-3 px-3 font-semibold">Evento</th>
              <th className="text-right py-3 px-3 font-semibold">
                Pontuação (pts)
              </th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((evento, indice) => (
              <tr
                key={indice}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="py-2.5 px-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${ESTILOS_ORIGEM[evento.origem]}`}
                  >
                    {evento.origem}
                  </span>
                </td>
                <td className="py-2.5 px-3">{evento.evento}</td>
                <td
                  className={`py-2.5 px-3 text-right font-bold ${
                    evento.pontuacao === -100
                      ? "text-[hsl(var(--danger))]"
                      : "text-foreground"
                  }`}
                >
                  {evento.pontuacao}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
