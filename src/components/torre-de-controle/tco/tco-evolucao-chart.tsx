/**
 * TcoEvolucaoChart — Gráfico (Recharts) da evolução do TCO mês a mês.
 *
 * Duas visualizações:
 * - "composicao": barras empilhadas por categoria de custo;
 * - "tendencia": área com o total do mês (soma das categorias ativas).
 * Nas duas, uma linha tracejada dourada marca a média do período e o mês
 * selecionado fica em destaque. Clicar em um mês avisa o pai (`onSelecionarMes`).
 *
 * Componente apenas visual: os filtros (período, categorias, visão) ficam no `TcoEvolucao`.
 *
 * Por que todas as barras ficam sempre montadas? O Recharts empilha as `<Bar>` na ordem
 * em que elas são registradas. Se uma categoria fosse desmontada e montada de novo, ela
 * iria para o topo da pilha e a ordem ficaria trocada. Por isso, categoria desligada
 * vira valor 0, e o arredondamento é calculado por coluna (só o segmento do topo arredonda).
 */

"use client";

import { useId } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoriaTco, CategoriaTcoId, MesTco } from "@/types/torre-de-controle";
import { formatarEixoMil, formatarMoeda, formatarMoedaCompacta, totalDoMes } from "./tco-utils";

export type VisaoTco = "composicao" | "tendencia";

interface TcoEvolucaoChartProps {
  meses: MesTco[];
  /** Todas as categorias, na ordem de empilhamento (base → topo) */
  categorias: CategoriaTco[];
  /** Categorias ligadas nos filtros */
  idsAtivos: CategoriaTcoId[];
  visao: VisaoTco;
  /** Média do período (linha de referência) */
  media: number;
  chaveSelecionada: string;
  onSelecionarMes: (chave: string) => void;
  altura?: number;
}

const COR_EIXO = "#94A3B8";
const COR_DESTAQUE = "#4F46E5";
const COR_MEDIA = "#D4AB00";
const RAIO_TOPO = 6;

export function TcoEvolucaoChart({
  meses,
  categorias,
  idsAtivos,
  visao,
  media,
  chaveSelecionada,
  onSelecionarMes,
  altura = 250,
}: TcoEvolucaoChartProps) {
  // useId pode conter caracteres inválidos em `url(#...)`; mantemos só os seguros
  const idGradiente = `tco-gradiente-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const categoriasAtivas = categorias.filter((categoria) => idsAtivos.includes(categoria.id));

  // Uma linha por mês: { chave, total, topo, combustivel, manutencao, ... }
  const dados = meses.map((mes) => {
    const valores = Object.fromEntries(
      categorias.map((categoria) => [categoria.id, idsAtivos.includes(categoria.id) ? mes.custos[categoria.id] : 0])
    ) as Record<CategoriaTcoId, number>;

    // Segmento do topo da coluna: última categoria ativa com valor maior que zero
    const topo = [...categoriasAtivas].reverse().find((categoria) => valores[categoria.id] > 0)?.id;

    return { chave: mes.chave, total: totalDoMes(mes, idsAtivos), topo, ...valores };
  });

  return (
    // Sem contorno de foco do navegador ao clicar (o mês selecionado já fica em destaque)
    <div style={{ height: altura }} className="w-full [&_*]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={dados}
          margin={{ top: 14, right: 6, bottom: 0, left: -6 }}
          className="cursor-pointer"
          onClick={(estado) => {
            if (estado?.activeLabel !== undefined) onSelecionarMes(String(estado.activeLabel));
          }}
        >
          <defs>
            <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COR_DESTAQUE} stopOpacity={0.32} />
              <stop offset="100%" stopColor={COR_DESTAQUE} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="#EEF0F6" />

          <XAxis
            dataKey="chave"
            axisLine={false}
            tickLine={false}
            interval={0}
            height={34}
            // Na área, o respiro evita que o primeiro/último ponto (e o rótulo) fiquem colados na borda
            padding={visao === "tendencia" ? { left: 16, right: 16 } : undefined}
            tick={(props: TickMesProps) => (
              <TickMes {...props} meses={meses} chaveSelecionada={chaveSelecionada} />
            )}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={44}
            tick={{ fontSize: 10, fill: COR_EIXO }}
            tickFormatter={formatarEixoMil}
            domain={visao === "tendencia" ? [arredondarParaBaixo, "auto"] : [0, "auto"]}
          />

          <Tooltip
            cursor={
              visao === "composicao"
                ? { fill: "rgba(79,70,229,0.06)", radius: 6 }
                : { stroke: "#C7D2FE", strokeDasharray: "4 4" }
            }
            content={({ active, label }) => {
              const mes = meses.find((item) => item.chave === String(label));
              return active && mes ? <TooltipTco mes={mes} categorias={categoriasAtivas} /> : null;
            }}
          />

          <ReferenceLine
            y={media}
            stroke={COR_MEDIA}
            strokeDasharray="5 4"
            strokeWidth={1.5}
            ifOverflow="extendDomain"
          />

          {visao === "composicao" &&
            categorias.map((categoria) => (
              <Bar
                key={categoria.id}
                dataKey={categoria.id}
                name={categoria.label}
                stackId="tco"
                fill={categoria.cor}
                maxBarSize={34}
                animationDuration={600}
                shape={(props: SegmentoBarraProps) => (
                  <SegmentoBarra
                    {...props}
                    arredondarTopo={props.payload?.topo === categoria.id}
                    selecionado={props.payload?.chave === chaveSelecionada}
                  />
                )}
              />
            ))}

          {visao === "tendencia" && (
            <Area
              type="monotone"
              dataKey="total"
              name="TCO"
              stroke={COR_DESTAQUE}
              strokeWidth={2.5}
              fill={`url(#${idGradiente})`}
              animationDuration={700}
              activeDot={{ r: 6, fill: COR_DESTAQUE, stroke: "#fff", strokeWidth: 2 }}
              dot={({ cx, cy, index }) => {
                const selecionado = dados[index]?.chave === chaveSelecionada;
                return (
                  <circle
                    key={`ponto-${index}`}
                    cx={cx}
                    cy={cy}
                    r={selecionado ? 5.5 : 3.5}
                    fill={selecionado ? COR_MEDIA : "#fff"}
                    stroke={selecionado ? "#fff" : COR_DESTAQUE}
                    strokeWidth={2}
                  />
                );
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Piso do eixo Y na visão "tendência": 80% do menor valor, arredondado para baixo (múltiplo de 10 mil) */
function arredondarParaBaixo(menorValor: number): number {
  return Math.max(0, Math.floor((menorValor * 0.8) / 10000) * 10000);
}

/* ---------- Segmento da barra empilhada ---------- */

interface SegmentoBarraProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  fill?: string;
  payload?: { chave: string; topo?: CategoriaTcoId };
}

/**
 * Desenha um segmento da coluna. Só o segmento do topo recebe cantos arredondados,
 * e o mês selecionado fica com opacidade total (os demais ficam esmaecidos).
 */
function SegmentoBarra({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill,
  arredondarTopo,
  selecionado,
}: SegmentoBarraProps & { arredondarTopo: boolean; selecionado: boolean }) {
  const [px, py, largura, altura] = [x, y, width, height].map(Number);
  if (!(altura > 0) || !(largura > 0)) return <g />;

  const opacidade = selecionado ? 1 : 0.5;
  const raio = arredondarTopo ? Math.min(RAIO_TOPO, largura / 2, altura) : 0;

  if (raio === 0) {
    return <rect x={px} y={py} width={largura} height={altura} fill={fill} fillOpacity={opacidade} />;
  }

  // Retângulo com apenas os dois cantos de cima arredondados
  const caminho = [
    `M${px},${py + altura}`,
    `L${px},${py + raio}`,
    `A${raio},${raio} 0 0 1 ${px + raio},${py}`,
    `L${px + largura - raio},${py}`,
    `A${raio},${raio} 0 0 1 ${px + largura},${py + raio}`,
    `L${px + largura},${py + altura}`,
    "Z",
  ].join(" ");

  return <path d={caminho} fill={fill} fillOpacity={opacidade} />;
}

/* ---------- Rótulo do eixo X (mês + ano na virada) ---------- */

interface TickMesProps {
  x?: number | string;
  y?: number | string;
  index?: number;
  payload?: { value: string };
}

function TickMes({
  x = 0,
  y = 0,
  index = 0,
  payload,
  meses,
  chaveSelecionada,
}: TickMesProps & { meses: MesTco[]; chaveSelecionada: string }) {
  const mes = meses.find((item) => item.chave === payload?.value);
  if (!mes) return <g />;

  const selecionado = mes.chave === chaveSelecionada;
  // Mostra o ano no primeiro mês do gráfico e em cada janeiro
  const mostrarAno = index === 0 || mes.chave.endsWith("-01");

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={12}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={selecionado ? 700 : 500}
        fill={selecionado ? COR_DESTAQUE : COR_EIXO}
      >
        {mes.mes}
      </text>
      {mostrarAno && (
        <text dy={25} textAnchor="middle" fontSize={9} fill="#CBD5E1">
          {mes.ano}
        </text>
      )}
    </g>
  );
}

/* ---------- Tooltip ---------- */

function TooltipTco({ mes, categorias }: { mes: MesTco; categorias: CategoriaTco[] }) {
  const total = totalDoMes(mes, categorias.map((categoria) => categoria.id));

  return (
    <div className="font-poppins min-w-[190px] rounded-xl border border-[#312E81] bg-[#1E1B4B] px-3 py-2.5 text-white shadow-[0_12px_32px_-12px_rgba(30,27,75,0.6)]">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#A5B4FC]">{mes.mesCompleto}</p>
      <p className="mt-0.5 text-[17px] font-bold leading-tight">{formatarMoedaCompacta(total)}</p>

      <ul className="mt-2 space-y-1">
        {/* Ordem invertida: o topo da pilha aparece primeiro, como no gráfico */}
        {[...categorias].reverse().map((categoria) => (
          <li key={categoria.id} className="flex items-center gap-2 text-[11px]">
            <span className="h-2 w-2 shrink-0 rounded-[3px]" style={{ background: categoria.cor }} />
            <span className="text-[#C7D2FE]">{categoria.label}</span>
            <span className="ml-auto pl-3 font-semibold tabular-nums">{formatarMoedaCompacta(mes.custos[categoria.id])}</span>
          </li>
        ))}
      </ul>

      <p className="mt-2 border-t border-white/10 pt-1.5 text-[10.5px] text-[#C7D2FE]">
        Por veículo <strong className="font-semibold text-white">{formatarMoeda(total / mes.veiculos)}</strong>
        <span className="text-[#A5B4FC]"> · {mes.veiculos} veículos</span>
      </p>
    </div>
  );
}
