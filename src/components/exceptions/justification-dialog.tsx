/**
 * JustificationDialog — Texto completo da justificativa de uma exceção (Gestão de exceções).
 *
 * Aberto pela ação "ver mais" da tabela de histórico, onde a justificativa aparece truncada.
 *
 * @example
 * {excecao && <JustificationDialog excecao={excecao} onClose={() => setExcecao(null)} />}
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExceptionItem } from "@/types/driver-scoring";
import { formatDateTime } from "@/utils/driver-scoring-display";
import { displayValue } from "@/utils/driver-scoring-helpers";

interface JustificationDialogProps {
  excecao: ExceptionItem;
  onClose: () => void;
}

export function JustificationDialog({ excecao, onClose }: JustificationDialogProps) {
  return (
    <Dialog open onOpenChange={(aberto) => !aberto && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Justificativa da exceção</DialogTitle>
          <DialogDescription>
            {excecao.label || excecao.eventLabel} — {excecao.driverName} · aplicada em {formatDateTime(excecao.appliedAt)} por{" "}
            {displayValue(excecao.createdBy)}
          </DialogDescription>
        </DialogHeader>

        <p className="max-h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground">
          {displayValue(excecao.justification)}
        </p>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

