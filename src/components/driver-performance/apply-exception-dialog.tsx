/**
 * ApplyExceptionDialog — Modal para aplicar uma exceção a um evento do condutor (Gestão de exceções).
 *
 * `POST /drivers/:driverId/events/:eventId/exceptions` com body estrito `{ justification }`
 * (10 a 500 caracteres, validado com Zod antes do envio).
 *
 * Exibe o resumo do evento (Data, Tipo, Gravidade e Impacto), a pontuação atual do mês do evento
 * e a pontuação prevista (estimada) após a exceção, além do aviso de irreversibilidade.
 * Em caso de sucesso mostra a pontuação real devolvida pelo backend (`scoreBefore → scoreAfter`)
 * e avisa o pai (`onApplied`) para recarregar os dados. Também recarrega em 409/422, porque nesses
 * casos o evento mudou de estado (ex.: exceção aplicada por outro gestor ao mesmo tempo).
 *
 * Exceções são irreversíveis: não há edição nem exclusão no front.
 *
 * Use com `key={evento.id}` para o estado interno ser reiniciado a cada evento.
 *
 * @example
 * {eventoSelecionado && (
 *   <ApplyExceptionDialog
 *     key={eventoSelecionado.id}
 *     driverId={driver.id}
 *     evento={eventoSelecionado}
 *     pontuacaoAtual={getEventMonthScore(eventoSelecionado, data.monthly_scores)}
 *     onClose={() => setEventoSelecionado(null)}
 *     onApplied={refetch}
 *   />
 * )}
 */

"use client";

import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  JUSTIFICATION_MAX_LENGTH,
  JUSTIFICATION_MIN_LENGTH,
  createExceptionBodySchema,
} from "@/schemas/driver-scoring";
import { createException } from "@/services/driver-scoring.service";
import type { CreateExceptionResponse, DriverEvent } from "@/types/driver-scoring";
import { getExceptionActionErrorMessage } from "@/utils/api-error";
import { formatDateTime, getSeverityClassName } from "@/utils/driver-scoring-display";
import { estimateScoreAfterException } from "@/utils/exception-score-estimate";

interface ApplyExceptionDialogProps {
  /** UUID do condutor (`driver.id`) — nunca o nome. */
  driverId: string;
  evento: DriverEvent;
  /** Pontuação atual do mês do evento (`null` se indisponível). */
  pontuacaoAtual: number | null;
  onClose: () => void;
  /** Chamado após o 201 (ou 409/422) para o pai recarregar o detalhe do condutor. */
  onApplied: () => void;
}

/** Status em que o evento mudou no backend e a tela precisa ser recarregada. */
const STATUS_QUE_RECARREGAM = [409, 422];

/** Resumo do evento: Data, Tipo, Gravidade e Impacto. */
function ResumoEvento({ evento }: { evento: DriverEvent }) {
  const itens = [
    { rotulo: "Data", valor: formatDateTime(evento.date) },
    { rotulo: "Tipo", valor: evento.label },
    {
      rotulo: "Gravidade",
      valor: <span className={getSeverityClassName(evento.severity)}>{evento.severity}</span>,
    },
    {
      rotulo: "Impacto",
      valor: <span className="font-bold text-red-600">{evento.impact}</span>,
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border bg-muted/40 p-3 text-xs">
      {itens.map((item) => (
        <div key={item.rotulo} className="min-w-0">
          <dt className="text-muted-foreground">{item.rotulo}</dt>
          <dd className="font-medium text-foreground truncate">{item.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Pontuação atual do mês × pontuação prevista após a exceção. */
function PrevisaoPontuacao({
  evento,
  pontuacaoAtual,
}: {
  evento: DriverEvent;
  pontuacaoAtual: number | null;
}) {
  const estimativa = estimateScoreAfterException(evento, pontuacaoAtual);

  return (
    <div className="rounded-lg border border-border p-3 text-xs">
      <div className="flex items-center justify-around gap-3 text-center">
        <div>
          <p className="text-muted-foreground">Pontuação atual</p>
          <p className="text-lg font-semibold text-foreground">{pontuacaoAtual ?? "-"}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="text-muted-foreground">Pontuação prevista</p>
          <p className="text-lg font-semibold text-emerald-700">
            {estimativa.kind === "estimated" ? estimativa.value : "-"}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground text-center">
        {estimativa.kind === "estimated"
          ? "Valor estimado. A pontuação final é calculada pelo motor de pontuação ao confirmar."
          : estimativa.reason}
      </p>
    </div>
  );
}

/** Resultado exibido após aplicar a exceção com sucesso. */
function ResultadoExcecao({ resultado }: { resultado: CreateExceptionResponse }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center" role="status">
      <CheckCircle2 className="w-8 h-8 text-emerald-600" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">Exceção aplicada com sucesso</p>
      <p className="text-xs text-muted-foreground">
        O evento foi desconsiderado e a pontuação do condutor foi recalculada.
      </p>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        Pontuação do mês:
        <span className="font-semibold text-foreground">{resultado.scoreBefore}</span>
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="font-semibold text-emerald-700">{resultado.scoreAfter}</span>
      </p>
    </div>
  );
}

export function ApplyExceptionDialog({
  driverId,
  evento,
  pontuacaoAtual,
  onClose,
  onApplied,
}: ApplyExceptionDialogProps) {
  const [justificativa, setJustificativa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<CreateExceptionResponse | null>(null);
  // Trava síncrona contra duplo clique (o estado `enviando` só vale no próximo render).
  const envioEmAndamento = useRef(false);

  const tamanho = justificativa.trim().length;
  const justificativaValida = createExceptionBodySchema.safeParse({ justification: justificativa }).success;

  async function handleConfirmar() {
    if (envioEmAndamento.current || !justificativaValida) return;
    envioEmAndamento.current = true;
    setEnviando(true);
    setErro(null);
    try {
      const resposta = await createException(driverId, evento.id, { justification: justificativa });
      setResultado(resposta);
      onApplied();
    } catch (error) {
      setErro(getExceptionActionErrorMessage(error));
      if (isAxiosError(error) && STATUS_QUE_RECARREGAM.includes(error.response?.status ?? 0)) {
        onApplied();
      }
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && !enviando && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aplicar exceção</DialogTitle>
          <DialogDescription>
            O evento será desconsiderado e a pontuação do condutor, recalculada.
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          <ResultadoExcecao resultado={resultado} />
        ) : (
          <div className="space-y-4">
            <ResumoEvento evento={evento} />
            <PrevisaoPontuacao evento={evento} pontuacaoAtual={pontuacaoAtual} />

            <div className="space-y-2">
              <label htmlFor="justificativa-excecao" className="text-xs font-medium text-foreground">
                Justificativa <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="justificativa-excecao"
                value={justificativa}
                onChange={(mudanca) => setJustificativa(mudanca.target.value)}
                maxLength={JUSTIFICATION_MAX_LENGTH}
                placeholder={`Descreva o motivo da exceção (mínimo de ${JUSTIFICATION_MIN_LENGTH} caracteres)`}
                aria-invalid={Boolean(erro)}
                aria-describedby="justificativa-excecao-ajuda"
                required
                disabled={enviando}
              />
              <div
                id="justificativa-excecao-ajuda"
                className="flex items-center justify-between text-[11px] text-muted-foreground"
              >
                <span>
                  {tamanho < JUSTIFICATION_MIN_LENGTH
                    ? `Mínimo de ${JUSTIFICATION_MIN_LENGTH} caracteres`
                    : "A justificativa fica registrada na auditoria"}
                </span>
                <span>
                  {tamanho}/{JUSTIFICATION_MAX_LENGTH}
                </span>
              </div>
            </div>

            <p
              role="note"
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              Esta ação é irreversível e ficará registrada para auditoria.
            </p>

            {erro && (
              <p role="alert" className="text-xs text-destructive">
                {erro}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {resultado ? (
            <Button onClick={onClose}>Fechar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={enviando}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmar} disabled={!justificativaValida || enviando}>
                {enviando ? "Confirmando..." : "Confirmar exceção"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
