/**
 * TopRankingList — Lista Top 10 Genérica
 *
 * Componente reutilizável que exibe uma lista de condutores em formato de tabela.
 * Configurável para exibir ou ocultar a coluna de classificação.
 *
 * Casos de uso:
 * - Top 10 Condutores Referência (sem coluna de classificação)
 * - Top 10 Condutores Críticos (com coluna de classificação)
 * - Futuras listas de ranking em outras páginas
 *
 * @example
 * <TopRankingList
 *   titulo="Top 10 Condutores Referência"
 *   icone={Trophy}
 *   corIcone="text-green-500"
 *   descricao="Os 10 condutores com maior pontuação."
 *   condutores={top10Ref}
 *   mostrarClassificacao={false}
 * />
 */

"use client";

import type { LucideIcon } from "lucide-react";
import type { Condutor } from "@/types/condutor";
import { ClassificationBadge } from "@/components/classification-badge";
import { InfoTooltip } from "@/components/info-tooltip";

interface TopRankingListProps {
  titulo: string;
  icone: LucideIcon;
  corIcone: string;
  descricao: string;
  condutores: Condutor[];
  mostrarClassificacao?: boolean;
}

export function TopRankingList({
  titulo,
  icone: Icone,
  corIcone,
  descricao,
  condutores,
  mostrarClassificacao = false,
}: TopRankingListProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icone className={`w-4 h-4 ${corIcone}`} />
        {titulo}
        <InfoTooltip texto={descricao} />
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-left py-2 px-2">#</th>
              <th className="text-left py-2">Nome</th>
              <th className="text-left py-2">Unidade</th>
              <th className="text-right py-2 px-2">Pts</th>
              {mostrarClassificacao && (
                <th className="text-right py-2 px-2">Classificação</th>
              )}
            </tr>
          </thead>
          <tbody>
            {condutores.map((condutor, indice) => (
              <tr
                key={condutor.nome}
                className="border-b last:border-0 hover:bg-muted/50 transition-colors"
              >
                <td className="py-2 px-2 font-medium">{indice + 1}</td>
                <td className="py-2 font-medium">{condutor.nome}</td>
                <td className="py-2 text-muted-foreground">
                  {condutor.negocio}
                </td>
                <td className="py-2 px-2 text-right font-bold">
                  {condutor.pontuacao}
                </td>
                {mostrarClassificacao && (
                  <td className="py-2 px-2 text-right">
                    <ClassificationBadge
                      classificacao={condutor.classificacao}
                    />
                  </td>
                )}
              </tr>
            ))}

            {condutores.length === 0 && (
              <tr>
                <td
                  colSpan={mostrarClassificacao ? 5 : 4}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum condutor encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
