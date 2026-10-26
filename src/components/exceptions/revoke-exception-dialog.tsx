/**
 * RevokeExceptionDialog — Confirmação para revogar uma exceção (FLEET-2301).
 *
 * `DELETE /exceptions/:id`: o evento volta a descontar pontos e a pontuação do mês do condutor
 * é recalculada. Após o sucesso mostra a pontuação restaurada e avisa o pai (`onRevoked`).
 *
 * Use com `key={excecao.id}` para reiniciar o estado interno a cada exceção.
 *
 * @example
 * {excecaoParaRevogar && (
 *   <RevokeExceptionDialog
 *     key={excecaoParaRevogar.id}
 *     excecao={excecaoParaRevogar}
 *     onClose={() => setExcecaoParaRevogar(null)}
 *     onRevoked={handleRevogada}
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
import { deleteException } from "@/services/driver-scoring.service";
import type { DeleteExceptionResponse, ExceptionItem } from "@/types/driver-scoring";
import { getExceptionActionErrorMessage } from "@/utils/api-error";

interface RevokeExceptionDialogProps {
  excecao: ExceptionItem;
  onClose: () => void;
  /** Chamado após o sucesso para o pai recarregar a listagem. */
  onRevoked: () => void;
}

export function RevokeExceptionDialog({ excecao, onClose, onRevoked }: RevokeExceptionDialogProps) {
  const [revogando, setRevogando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<DeleteExceptionResponse | null>(null);

  async function handleConfirmar() {
    setRevogando(true);
    setErro(null);
    try {
      const resposta = await deleteException(excecao.id);
      setResultado(resposta);
      onRevoked();
    } catch (error) {
      setErro(getExceptionActionErrorMessage(error));
    } finally {
      setRevogando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && !revogando && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revogar exceção</DialogTitle>
          <DialogDescription>
            O evento <span className="font-medium text-foreground">{excecao.eventLabel}</span> de{" "}
            <span className="font-medium text-foreground">{excecao.driverName}</span> voltará a descontar
            pontos e a pontuação do mês será recalculada.
          </DialogDescription>
        </DialogHeader>

        {resultado && (
          <div className="flex flex-col items-center gap-2 py-4 text-center" role="status">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Exceção revogada com sucesso</p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              Pontuação do mês:
              <span className="font-semibold text-foreground">{resultado.scoreBefore}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-semibold text-foreground">{resultado.scoreAfter}</span>
            </p>
          </div>
        )}

        {erro && (
          <p role="alert" className="text-xs text-destructive">
            {erro}
          </p>
        )}

        <DialogFooter>
          {resultado ? (
            <Button onClick={onClose}>Fechar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={revogando}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmar} disabled={revogando}>
                {revogando ? "Revogando..." : "Revogar exceção"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
