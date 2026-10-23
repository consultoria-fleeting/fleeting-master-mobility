/**
 * AiFleetAssistant — Barra de pesquisa / chat com IA da frota (demonstração).
 *
 * Fluxo:
 * 1. O usuário digita uma pergunta (validada com Zod) ou clica numa sugestão.
 * 2. Painel abre em "Analisando dados da frota..." com etapas animadas.
 * 3. A resposta aparece com efeito de digitação, seguida de mini-cards de
 *    métricas, itens destacados e ações rápidas (ex.: "Focar veículo no mapa").
 *
 * As respostas vêm de `ai-respostas.ts` (mock). Esc ou clique fora fecham o painel.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, Crosshair, LoaderCircle, Sparkles, X } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useEfeitoDigitacao } from "@/hooks/use-efeito-digitacao";
import {
  ETAPAS_ANALISE,
  PERGUNTAS_SUGERIDAS,
  gerarRespostaIA,
  type RespostaIA,
  type TomIA,
} from "./ai-respostas";

/* ---------- Validação ---------- */

const esquemaPergunta = z
  .string()
  .trim()
  .min(3, "Digite ao menos 3 caracteres.")
  .max(200, "A pergunta pode ter no máximo 200 caracteres.");

/* ---------- Estilos por tom ---------- */

const ESTILO_TOM: Record<TomIA, { caixa: string; valor: string }> = {
  perigo: { caixa: "border-[#E11D48]/20 bg-[#E11D48]/[0.06]", valor: "text-[#E11D48]" },
  alerta: { caixa: "border-[#D97706]/20 bg-[#D97706]/[0.07]", valor: "text-[#B45309]" },
  sucesso: { caixa: "border-[#059669]/20 bg-[#059669]/[0.06]", valor: "text-[#059669]" },
  indigo: { caixa: "border-[#C7D2FE] bg-[#EEF2FF]", valor: "text-[#4F46E5]" },
  neutro: { caixa: "border-[#E7E7F0] bg-[#F8F8FC]", valor: "text-[#1E1B4B]" },
};

const COR_PONTO_TOM: Record<TomIA, string> = {
  perigo: "#E11D48",
  alerta: "#D97706",
  sucesso: "#059669",
  indigo: "#4F46E5",
  neutro: "#94A3B8",
};

const DURACAO_ETAPA_MS = 550;

interface Conversa {
  id: number;
  pergunta: string;
  resposta: RespostaIA;
}

type Fase = "analisando" | "respondendo";

/* ========================================================= */
/*  SUBCOMPONENTES                                           */
/* ========================================================= */

function AvatarIA({ pulsando = false }: { pulsando?: boolean }) {
  return (
    <span
      className={cn(
        "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#4F46E5] to-[#818CF8] text-white shadow-[0_4px_12px_-4px_rgba(79,70,229,0.7)]",
        pulsando && "animate-pulse"
      )}
    >
      <Sparkles className="h-3.5 w-3.5" />
    </span>
  );
}

function EtapasAnalise({ etapaAtual }: { etapaAtual: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="bg-gradient-to-r from-[#4F46E5] via-[#818CF8] to-[#4F46E5] bg-[length:200%_100%] bg-clip-text text-[13px] font-semibold text-transparent animate-[brilho-texto_1.6s_linear_infinite]">
        Analisando dados da frota...
      </p>
      <ul className="flex flex-col gap-1.5">
        {ETAPAS_ANALISE.map((etapa, indice) => {
          const concluida = indice < etapaAtual;
          const ativa = indice === etapaAtual;
          return (
            <li
              key={etapa}
              className={cn(
                "flex items-center gap-2 text-[11.5px] transition-colors",
                concluida ? "text-[#334155]" : ativa ? "text-[#4F46E5]" : "text-[#CBD5E1]"
              )}
            >
              {concluida ? (
                <Check className="h-3.5 w-3.5 text-[#059669]" />
              ) : ativa ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-current" />
              )}
              {etapa}
            </li>
          );
        })}
      </ul>
      <div className="mt-1 flex flex-col gap-1.5" aria-hidden>
        <span className="h-2 w-11/12 animate-pulse rounded-full bg-[#EEF2FF]" />
        <span className="h-2 w-8/12 animate-pulse rounded-full bg-[#EEF2FF]" />
      </div>
    </div>
  );
}

interface ConteudoRespostaProps {
  resposta: RespostaIA;
  textoVisivel: string;
  concluido: boolean;
  onAcao: (placa: string) => void;
}

function ConteudoResposta({ resposta, textoVisivel, concluido, onAcao }: ConteudoRespostaProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <p className="text-[12.5px] leading-relaxed text-[#334155]" aria-live="polite">
        {textoVisivel}
        {!concluido && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-[#4F46E5]" />}
      </p>

      {concluido && resposta.metricas.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {resposta.metricas.map((metrica, indice) => (
            <div
              key={metrica.label}
              className={cn("rounded-xl border px-3 py-2 animate-fade-in", ESTILO_TOM[metrica.tom].caixa)}
              style={{ animationDelay: `${indice * 70}ms`, animationFillMode: "backwards" }}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#64748B]">{metrica.label}</p>
              <p className={cn("text-[17px] font-bold tabular-nums", ESTILO_TOM[metrica.tom].valor)}>{metrica.valor}</p>
            </div>
          ))}
        </div>
      )}

      {concluido && resposta.itens.length > 0 && (
        <ul className="flex flex-col divide-y divide-[#F1F1F6] rounded-xl border border-[#E7E7F0] animate-fade-in">
          {resposta.itens.map((item) => (
            <li key={item.titulo} className="flex items-center gap-2.5 px-3 py-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: COR_PONTO_TOM[item.tom] }} />
              <span className="text-[12px] font-semibold text-[#1E1B4B]">{item.titulo}</span>
              <span className="truncate text-[11.5px] text-[#64748B]">{item.descricao}</span>
            </li>
          ))}
        </ul>
      )}

      {concluido && resposta.acoes.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {resposta.acoes.map((acao) => (
            <button
              key={acao.placa + acao.label}
              type="button"
              onClick={() => onAcao(acao.placa)}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#4F46E5] px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-[0_6px_16px_-8px_rgba(79,70,229,0.9)] transition-all hover:-translate-y-px hover:bg-[#4338CA]"
            >
              <Crosshair className="h-3.5 w-3.5" />
              {acao.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================================================= */
/*  COMPONENTE PRINCIPAL                                     */
/* ========================================================= */

interface AiFleetAssistantProps {
  /** Chamado ao clicar em "Focar veículo no mapa" */
  onFocarVeiculo: (placa: string) => void;
}

export function AiFleetAssistant({ onFocarVeiculo }: AiFleetAssistantProps) {
  const [pergunta, setPergunta] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [fase, setFase] = useState<Fase>("analisando");
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [painelAberto, setPainelAberto] = useState(false);

  const raizRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { textoVisivel, concluido } = useEfeitoDigitacao(conversa?.resposta.texto ?? "", {
    ativo: conversa !== null && fase === "respondendo",
  });

  function limparTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function perguntar(texto: string) {
    const resultado = esquemaPergunta.safeParse(texto);
    if (!resultado.success) {
      setErro(resultado.error.issues[0]?.message ?? "Pergunta inválida.");
      return;
    }

    limparTimers();
    setErro(null);
    setPergunta("");
    setConversa({ id: Date.now(), pergunta: resultado.data, resposta: gerarRespostaIA(resultado.data) });
    setFase("analisando");
    setEtapaAtual(0);
    setPainelAberto(true);

    // Simula o tempo de processamento, etapa por etapa
    ETAPAS_ANALISE.forEach((_, indice) => {
      timersRef.current.push(setTimeout(() => setEtapaAtual(indice + 1), DURACAO_ETAPA_MS * (indice + 1)));
    });
    timersRef.current.push(
      setTimeout(() => setFase("respondendo"), DURACAO_ETAPA_MS * ETAPAS_ANALISE.length + 250)
    );
  }

  function executarAcao(placa: string) {
    setPainelAberto(false);
    onFocarVeiculo(placa);
  }

  // Limpa timers ao desmontar
  useEffect(() => limparTimers, []);

  // Esc e clique fora fecham o painel
  useEffect(() => {
    if (!painelAberto) return;
    function aoClicarFora(evento: PointerEvent) {
      if (raizRef.current && !raizRef.current.contains(evento.target as Node)) setPainelAberto(false);
    }
    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setPainelAberto(false);
    }
    document.addEventListener("pointerdown", aoClicarFora);
    window.addEventListener("keydown", aoPressionarTecla);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      window.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [painelAberto]);

  const sugestoesRapidas = PERGUNTAS_SUGERIDAS.slice(0, 3);
  const sugestoesSeguintes = PERGUNTAS_SUGERIDAS.filter((s) => s !== conversa?.pergunta).slice(0, 4);

  return (
    <div ref={raizRef} className="relative z-30 shrink-0">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        {/* Barra de pergunta */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            perguntar(pergunta);
          }}
          className="group relative flex items-center gap-2 rounded-[14px] border border-[#E7E7F0] bg-white py-1.5 pl-1.5 pr-1.5 shadow-sm transition-all focus-within:border-[#A5B4FC] focus-within:shadow-[0_0_0_4px_rgba(79,70,229,0.12)] lg:w-[min(560px,48%)]"
        >
          <AvatarIA />
          <input
            id="ia-pergunta"
            type="text"
            value={pergunta}
            onChange={(e) => {
              setPergunta(e.target.value);
              if (erro) setErro(null);
            }}
            onFocus={() => conversa && setPainelAberto(true)}
            maxLength={200}
            autoComplete="off"
            placeholder="Pergunte à IA sobre sua frota… ex.: “Onde está o SVR2C84?”"
            aria-label="Pergunte ao assistente de IA da frota"
            aria-invalid={erro !== null}
            className="min-w-0 flex-1 bg-transparent text-[12.5px] text-[#1E1B4B] placeholder:text-[#94A3B8] focus:outline-none"
          />
          <kbd className="hidden rounded-md border border-[#E7E7F0] bg-[#F8F8FC] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#94A3B8] md:inline">
            Enter
          </kbd>
          <button
            id="ia-enviar"
            type="submit"
            disabled={pergunta.trim().length === 0}
            aria-label="Enviar pergunta"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#1E1B4B] text-white transition-all hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:bg-[#E0E7FF] disabled:text-[#A5B4FC]"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>

        {/* Perguntas sugeridas */}
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Sugestões
          </span>
          {sugestoesRapidas.map((sugestao, indice) => (
            <button
              key={sugestao}
              id={`ia-sugestao-${indice}`}
              type="button"
              onClick={() => perguntar(sugestao)}
              className="shrink-0 rounded-full border border-[#E0E7FF] bg-white px-3 py-1.5 text-[11px] font-medium text-[#4F46E5] transition-all hover:-translate-y-px hover:border-[#A5B4FC] hover:bg-[#EEF2FF] hover:shadow-sm"
            >
              {sugestao}
            </button>
          ))}
        </div>
      </div>

      {erro && <p className="mt-1 pl-2 text-[11px] font-medium text-[#E11D48]">{erro}</p>}

      {/* Painel de resposta */}
      {painelAberto && conversa && (
        <div
          role="dialog"
          aria-label="Resposta do assistente de IA"
          className="absolute left-0 top-full mt-2 w-full max-w-[880px] overflow-hidden rounded-2xl border border-[#C7D2FE] bg-white shadow-[0_28px_70px_-24px_rgba(30,27,75,0.55)] animate-fade-in"
        >
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#4338CA] px-4 py-2.5 text-white">
            <Sparkles className="h-4 w-4 text-[#A5B4FC]" />
            <span className="text-[12.5px] font-semibold">Assistente IA da Frota</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#E0E7FF]">
              Demo
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setPainelAberto(false)}
              className="rounded-md p-1 text-[#C7D2FE] transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fechar assistente"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex max-h-[min(60vh,520px)] flex-col gap-4 overflow-y-auto p-4">
            {/* Pergunta do usuário */}
            <div className="flex justify-end">
              <p className="max-w-[80%] rounded-2xl rounded-br-md bg-[#EEF2FF] px-3.5 py-2 text-[12.5px] font-medium text-[#1E1B4B]">
                {conversa.pergunta}
              </p>
            </div>

            {/* Resposta */}
            <div key={conversa.id} className="flex items-start gap-3">
              <AvatarIA pulsando={fase === "analisando"} />
              {fase === "analisando" ? (
                <EtapasAnalise etapaAtual={etapaAtual} />
              ) : (
                <ConteudoResposta
                  resposta={conversa.resposta}
                  textoVisivel={textoVisivel}
                  concluido={concluido}
                  onAcao={executarAcao}
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 border-t border-[#F1F1F6] bg-[#FAFAFD] px-4 py-2.5">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
              Pergunte também
            </span>
            {sugestoesSeguintes.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => perguntar(sugestao)}
                className="rounded-full border border-[#E7E7F0] bg-white px-2.5 py-1 text-[10.5px] font-medium text-[#334155] transition-colors hover:border-[#A5B4FC] hover:text-[#4F46E5]"
              >
                {sugestao}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-[#94A3B8]">Respostas geradas a partir de dados simulados.</span>
          </div>
        </div>
      )}
    </div>
  );
}
