/**
 * TorreCard — Card base da Torre de Controle (identidade Índigo).
 *
 * Cabeçalho com indicador colorido opcional, título, contador e ação
 * ("Ver Todos" ou conteúdo à direita). O corpo ocupa o restante da altura,
 * permitindo listas com scroll interno.
 *
 * @example
 * <TorreCard titulo="Veículos que Exigem Atenção" contador={7} corIndicador="#E11D48" acao="Ver Todos">
 *   ...
 * </TorreCard>
 * Com `rolavel`, o corpo usa o AreaRolagemSuave (barra discreta + degradê).
 */

import { AreaRolagemSuave } from "@/components/area-rolagem-suave";
import { cn } from "@/lib/utils";

interface TorreCardProps {
  titulo: string;
  /** Bolinha colorida antes do título */
  corIndicador?: string;
  /** Número exibido em badge ao lado do título */
  contador?: number;
  /** Texto do link de ação (ex.: "Ver Todos") */
  acao?: string;
  onAcao?: () => void;
  /** Conteúdo livre à direita do cabeçalho (substitui `acao`) */
  extraCabecalho?: React.ReactNode;
  className?: string;
  corpoClassName?: string;
  /** Corpo com rolagem discreta (AreaRolagemSuave). `corpoClassName` vai para a área que rola. */
  rolavel?: boolean;
  children: React.ReactNode;
}

export function TorreCard({
  titulo,
  corIndicador,
  contador,
  acao,
  onAcao,
  extraCabecalho,
  className,
  corpoClassName,
  rolavel = false,
  children,
}: TorreCardProps) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-2xl border border-[#E7E7F0] bg-white transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(30,27,75,0.18)]",
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-3.5">
        {corIndicador && (
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: corIndicador }} />
        )}
        <h2 className="truncate text-[13px] font-semibold text-[#1E1B4B]">{titulo}</h2>
        {contador !== undefined && (
          <span
            className="rounded-full px-1.5 py-px text-[10px] font-bold"
            style={{
              background: corIndicador ? `${corIndicador}1A` : "#EEF2FF",
              color: corIndicador ?? "#4F46E5",
            }}
          >
            {contador}
          </span>
        )}
        <div className="flex-1" />
        {extraCabecalho ??
          (acao && (
            <button
              type="button"
              onClick={onAcao}
              className="shrink-0 text-[11.5px] font-semibold text-[#4F46E5] transition-colors hover:text-[#4338CA] hover:underline"
            >
              {acao}
            </button>
          ))}
      </header>
      {rolavel ? (
        <AreaRolagemSuave conteudoClassName={corpoClassName}>{children}</AreaRolagemSuave>
      ) : (
        <div className={cn("min-h-0 flex-1", corpoClassName)}>{children}</div>
      )}
    </section>
  );
}
