/**
 * PeriodoSelector — Seletor de Mês e Ano
 *
 * Dois selects para selecionar o período de análise.
 * Fica separado da barra de filtros, na parte superior da página.
 *
 * @example
 * <PeriodoSelector
 *   mesSelecionado="Fevereiro"
 *   anoSelecionado={2026}
 *   onMesChange={setMes}
 *   onAnoChange={setAno}
 * />
 *
 * Com `opcaoTodosMeses`, aparece a opção "Todos os meses" (valor `""`), usada quando o mês é opcional.
 */

"use client";

import { ChevronDown } from "lucide-react";

const CLASSE_SELECT_PERIODO =
  "appearance-none cursor-pointer text-xs border border-border rounded-md pl-2.5 pr-7 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const ANO_INICIAL = 2024;

function obterAnosDisponiveis(anoSelecionado: number): number[] {
  const anoMaximo = Math.max(2026, new Date().getFullYear(), anoSelecionado);
  const anos: number[] = [];
  for (let ano = ANO_INICIAL; ano <= anoMaximo; ano++) {
    anos.push(ano);
  }
  return anos;
}

interface PeriodoSelectorProps {
  mesSelecionado?: string;
  anoSelecionado: number;
  onMesChange?: (mes: string) => void;
  onAnoChange: (ano: number) => void;
  /** Exibe a opção "Todos os meses" (valor vazio). */
  opcaoTodosMeses?: boolean;
  /** Oculta o seletor de mês, exibindo apenas o seletor de ano (ex.: telas de visão anual). */
  ocultarMes?: boolean;
}

export function PeriodoSelector({
  mesSelecionado = "",
  anoSelecionado,
  onMesChange,
  onAnoChange,
  opcaoTodosMeses = false,
  ocultarMes = false,
}: PeriodoSelectorProps) {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtualIndice = hoje.getMonth();
  const anosDisponiveis = obterAnosDisponiveis(anoSelecionado);

  function handleAnoChange(novoAno: number) {
    onAnoChange(novoAno);
    // Se trocar de um ano anterior para o ano atual com um mês futuro selecionado, ajusta para o mês atual
    if (!ocultarMes && onMesChange && novoAno >= anoAtual && mesSelecionado) {
      const indiceSelecionado = MESES.indexOf(mesSelecionado);
      if (indiceSelecionado > mesAtualIndice) {
        onMesChange(MESES[mesAtualIndice]);
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!ocultarMes && (
        <div className="relative inline-flex items-center">
          <select
            id="filtro-mes"
            value={mesSelecionado}
            onChange={(e) => onMesChange?.(e.target.value)}
            className={CLASSE_SELECT_PERIODO}
            aria-label="Selecionar mês"
          >
            {opcaoTodosMeses && <option value="">Todos os meses</option>}
            {MESES.map((mes, indice) => {
              const ehMesFuturo = anoSelecionado >= anoAtual && indice > mesAtualIndice;
              return (
                <option
                  key={mes}
                  value={mes}
                  disabled={ehMesFuturo}
                  className={ehMesFuturo ? "text-muted-foreground/50" : undefined}
                >
                  {mes}
                </option>
              );
            })}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="relative inline-flex items-center">
        <select
          id="filtro-ano"
          value={anoSelecionado}
          onChange={(e) => handleAnoChange(Number(e.target.value))}
          className={CLASSE_SELECT_PERIODO}
          aria-label="Selecionar ano"
        >
          {anosDisponiveis.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
