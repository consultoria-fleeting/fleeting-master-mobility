/**
 * ApplyExceptionDialog — Modal para aplicar uma exceção a um evento do condutor (FLEET-2301).
 *
 * `POST /drivers/:driverId/events/:eventId/exceptions` com body estrito `{ justification }`
 * (10 a 500 caracteres, validado com Zod antes do envio).
 * Em caso de sucesso exibe a pontuação antes → depois e avisa o pai (`onApplied`) para recarregar os dados.
 *
 * Use com `key={evento.id}` para o estado interno ser reiniciado a cada evento.
 *
 * @example
 * {eventoSelecionado && (
 *   <ApplyExceptionDialog
 *     key={eventoSelecionado.id}
 *     driverId={driver.id}
 *     evento={eventoSelecionado}
 *     onClose={() => setEventoSelecionado(null)}
 *     onApplied={refetch}
 *   />
 * )}
 */

"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
import { formatDateTime } from "@/utils/driver-scoring-display";

interface ApplyExceptionDialogProps {
  /** UUID do condutor (`driver.id`) — nunca o nome. */
  driverId: string;
  evento: DriverEvent;
  onClose: () => void;
  /** Chamado após o 201 para o pai recarregar o detalhe do condutor. */
  onApplied: () => void;
}

/** Resultado exibido após aplicar a exceção com sucesso. */
function ResultadoExcecao({ resultado }: { resultado: CreateExceptionResponse }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center" role="status">
      <CheckCircle2 className="w-8 h-8 text-emerald-600" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">Exceção aplicada com sucesso</p>
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
  onClose,
  onApplied,
}: ApplyExceptionDialogProps) {
  const [justificativa, setJustificativa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<CreateExceptionResponse | null>(null);

  const tamanho = justificativa.trim().length;
  const justificativaValida = createExceptionBodySchema.safeParse({ justification: justificativa }).success;

  async function handleConfirmar() {
    setEnviando(true);
    setErro(null);
    try {
      const resposta = await createException(driverId, evento.id, { justification: justificativa });
      setResultado(resposta);
      onApplied();
    } catch (error) {
      setErro(getExceptionActionErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && !enviando && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aplicar exceção</DialogTitle>
          <DialogDescription>
            O evento <span className="font-medium text-foreground">{evento.label}</span> (
            {formatDateTime(evento.date)}) será desconsiderado e a pontuação do mês, recalculada.
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          <ResultadoExcecao resultado={resultado} />
        ) : (
          <div className="space-y-2">
            <label htmlFor="justificativa-excecao" className="text-xs font-medium text-foreground">
              Justificativa
            </label>
            <Textarea
              id="justificativa-excecao"
              value={justificativa}
              onChange={(mudanca) => setJustificativa(mudanca.target.value)}
              maxLength={JUSTIFICATION_MAX_LENGTH}
              placeholder="Descreva o motivo da exceção (mínimo de 10 caracteres)"
              aria-invalid={Boolean(erro)}
              disabled={enviando}
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {tamanho < JUSTIFICATION_MIN_LENGTH
                  ? `Mínimo de ${JUSTIFICATION_MIN_LENGTH} caracteres`
                  : "A justificativa fica registrada na auditoria"}
              </span>
              <span>
                {tamanho}/{JUSTIFICATION_MAX_LENGTH}
              </span>
            </div>
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
                {enviando ? "Aplicando..." : "Aplicar exceção"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
