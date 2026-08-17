/**
 * ClassificacaoGrid — Grid de Classificação dos Condutores
 *
 * Exibe as faixas de classificação do ranking em cards coloridos,
 * mostrando o nome da classificação e o intervalo de pontuação.
 *
 * Reutiliza as CSS variables de classificação (--referencia, --baixa-exposicao, etc.).
 *
 * @example
 * <ClassificacaoGrid classificacoes={classificacoes} />
 */

import type { ClassificacaoFaixa } from "@/types/matriz-pontuacao";

/** Mapeamento de cor para classes CSS — fundo forte, texto branco/preto */
const ESTILOS_COR: Record<ClassificacaoFaixa["cor"], string> = {
  referencia:
    "bg-[hsl(var(--referencia))] text-white border-[hsl(var(--referencia))]",
  baixa:
    "bg-[hsl(var(--baixa-exposicao))] text-black border-[hsl(var(--baixa-exposicao))]",
  media:
    "bg-[hsl(var(--media-exposicao))] text-white border-[hsl(var(--media-exposicao))]",
  alta:
    "bg-[hsl(var(--alta-exposicao))] text-white border-[hsl(var(--alta-exposicao))]",
};

interface ClassificacaoGridProps {
  classificacoes: ClassificacaoFaixa[];
}

export function ClassificacaoGrid({
  classificacoes,
}: ClassificacaoGridProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Classificação dos Condutores
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {classificacoes.map((item) => (
          <div
            key={item.classificacao}
            className={`rounded-lg border p-4 text-center ${ESTILOS_COR[item.cor]}`}
          >
            <p className="text-sm font-bold">{item.classificacao}</p>
            <p className="text-xs opacity-80 mt-1">
              {item.descricaoPontuacao}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
