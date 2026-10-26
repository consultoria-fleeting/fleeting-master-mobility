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

const ANOS = [2024, 2025, 2026];

interface PeriodoSelectorProps {
  mesSelecionado: string;
  anoSelecionado: number;
  onMesChange: (mes: string) => void;
  onAnoChange: (ano: number) => void;
  /** Exibe a opção "Todos os meses" (valor vazio). */
  opcaoTodosMeses?: boolean;
}

export function PeriodoSelector({
  mesSelecionado,
  anoSelecionado,
  onMesChange,
  onAnoChange,
  opcaoTodosMeses = false,
}: PeriodoSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        id="filtro-mes"
        value={mesSelecionado}
        onChange={(e) => onMesChange(e.target.value)}
        className="text-xs border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Selecionar mês"
      >
        {opcaoTodosMeses && <option value="">Todos os meses</option>}
        {MESES.map((mes) => (
          <option key={mes} value={mes}>
            {mes}
          </option>
        ))}
      </select>

      <select
        id="filtro-ano"
        value={anoSelecionado}
        onChange={(e) => onAnoChange(Number(e.target.value))}
        className="text-xs border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Selecionar ano"
      >
        {ANOS.map((ano) => (
          <option key={ano} value={ano}>
            {ano}
          </option>
        ))}
      </select>
    </div>
  );
}
