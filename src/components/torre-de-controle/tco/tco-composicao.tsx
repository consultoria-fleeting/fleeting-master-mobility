/**
 * TcoComposicao — Composição do TCO de um mês (antigo card "Resumo do TCO").
 *
 * Exibe o total do mês, a média por veículo, a variação vs. mês anterior,
 * a barra empilhada com a proporção de cada custo e o detalhamento por categoria
 * (valor, % do total e variação vs. mês anterior).
 *
 * O mês exibido é o selecionado no gráfico de evolução; por padrão, o mês atual.
 */

import { CalendarDays, RotateCcw } from "lucide-react";
import type { CategoriaTco, MesTco } from "@/types/torre-de-controle";
import { DeltaBadge, variacaoDeCusto } from "../delta-badge";
import { formatarMoeda, formatarMoedaCompacta, formatarPercentual, totalDoMes, variacaoPercentual } from "./tco-utils";

interface TcoComposicaoProps {
  mes: MesTco;
  /** Mês anterior ao exibido (para as variações). Ausente no primeiro mês do histórico. */
  mesAnterior?: MesTco;
  categorias: CategoriaTco[];
  ehMesAtual: boolean;
  onVoltarMesAtual: () => void;
}

export function TcoComposicao({ mes, mesAnterior, categorias, ehMesAtual, onVoltarMesAtual }: TcoComposicaoProps) {
  const idsCategorias = categorias.map((categoria) => categoria.id);
  const total = totalDoMes(mes, idsCategorias);
  const totalAnterior = mesAnterior ? totalDoMes(mesAnterior, idsCategorias) : 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#E0E7FF] bg-linear-to-br from-[#EEF2FF]/80 via-white to-white p-5">
      {/* Brilho decorativo */}
      <span className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[#818CF8]/15 blur-2xl" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-2.5">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#6366F1]">Composição do TCO</p>
            <p className="mt-1 flex items-center gap-2 text-[14px] font-semibold text-[#1E1B4B]">
              <CalendarDays className="h-4 w-4 text-[#818CF8]" />
              {mes.mesCompleto}
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[10.5px] font-semibold text-[#64748B] ring-1 ring-[#E7E7F0]">
                {ehMesAtual ? "Mês filtrado" : "Mês selecionado"}
              </span>
            </p>
          </div>
          {!ehMesAtual && (
            <button
              type="button"
              onClick={onVoltarMesAtual}
              className="inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-[#C7D2FE] bg-white px-3 text-[11.5px] font-semibold text-[#4F46E5] transition-colors hover:bg-[#EEF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Voltar ao mês filtrado
            </button>
          )}
        </div>

        {/* Destaques do mês */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Destaque rotulo="Total do mês" valor={formatarMoedaCompacta(total)} />
          <Destaque rotulo="Média por veículo" valor={formatarMoeda(total / mes.veiculos)} detalhe={`${mes.veiculos} veículos`} />
          <Destaque
            rotulo="vs. mês anterior"
            valor={<DeltaBadge {...variacaoDeCusto(mesAnterior ? variacaoPercentual(total, totalAnterior) : null)} className="text-[11.5px]" />}
            detalhe={mesAnterior ? formatarMoedaCompacta(totalAnterior) : "sem histórico"}
          />
        </div>

        {/* Barra empilhada com a proporção dos custos */}
        <div className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full bg-[#EEF0F6]" aria-hidden>
          {categorias.map((categoria) => (
            <span
              key={categoria.id}
              title={categoria.label}
              className="h-full transition-[width] duration-700 first:rounded-l-full last:rounded-r-full"
              style={{ width: `${total > 0 ? (mes.custos[categoria.id] / total) * 100 : 0}%`, background: categoria.cor }}
            />
          ))}
        </div>

        {/* Detalhamento por categoria */}
        <ul className="mt-4 divide-y divide-[#F1F1F6] rounded-xl border border-[#E7E7F0] bg-white">
          {categorias.map((categoria) => {
            const valor = mes.custos[categoria.id];
            const participacao = total > 0 ? (valor / total) * 100 : 0;
            const variacao = mesAnterior ? variacaoPercentual(valor, mesAnterior.custos[categoria.id]) : null;

            return (
              <li key={categoria.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-[4px]" style={{ background: categoria.cor }} />
                    <span className="truncate text-[13px] font-medium text-[#334155]">{categoria.label}</span>
                    <span className="text-[11.5px] tabular-nums text-[#64748B]">{formatarPercentual(participacao)}</span>
                  </div>
                  {/* Mini barra de participação */}
                  <div className="ml-5 mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F1F1F6]">
                    <span
                      className="block h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${participacao}%`, background: categoria.cor }}
                    />
                  </div>
                </div>
                <DeltaBadge {...variacaoDeCusto(variacao)} />
                <span className="w-[92px] whitespace-nowrap text-right text-[13.5px] font-bold tabular-nums text-[#1E1B4B]">
                  {formatarMoedaCompacta(valor)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Mini card de destaque ---------- */

interface DestaqueProps {
  rotulo: string;
  valor: React.ReactNode;
  detalhe?: string;
}

function Destaque({ rotulo, valor, detalhe }: DestaqueProps) {
  return (
    <div className="rounded-xl border border-[#E7E7F0] bg-white/85 px-4 py-3 backdrop-blur-sm">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#64748B]">{rotulo}</p>
      <div className="mt-1 whitespace-nowrap text-[17px] font-bold leading-tight tabular-nums text-[#1E1B4B]">{valor}</div>
      {detalhe && <p className="mt-0.5 text-[11px] text-[#64748B]">{detalhe}</p>}
    </div>
  );
}
