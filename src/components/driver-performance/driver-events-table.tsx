/**
 * DriverEventsTable — Eventos/infrações do condutor (seção 4.12, `events`).
 *
 * Colunas: data, evento, origem, severidade, pontos, impacto, status e ações.
 * Quando `has_exception === true` o evento fica com o status "Desconsiderado", o impacto original
 * aparece riscado (o backend devolve `impact: 0` e preserva `raw_points`) e a justificativa da
 * exceção é exibida abaixo do nome do evento.
 *
 * Ação "Aplicar exceção" (Gestão de exceções): habilitada apenas se `eligible === true` e o usuário
 * tiver perfil de gestor; caso contrário fica desabilitada e o motivo aparece no tooltip
 * (`ineligible_reason` do backend).
 *
 * @example
 * <DriverEventsTable
 *   driverId={data.driver.id}
 *   events={data.events.data}
 *   monthlyScores={data.monthly_scores}
 *   pagination={data.events.pagination}
 *   onPaginaChange={setPagina}
 *   onExceptionApplied={refetch}
 * />
 */

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ApplyExceptionDialog } from "@/components/driver-performance/apply-exception-dialog";
import { PaginacaoNumerada } from "@/components/paginacao-numerada";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DriverEvent, DriverMonthlyScore, PaginationTotalPages } from "@/types/driver-scoring";
import { formatDateTime, getSeverityClassName } from "@/utils/driver-scoring-display";
import { displayValue } from "@/utils/driver-scoring-helpers";
import { getEventMonthScore } from "@/utils/exception-score-estimate";
import { canManageExceptions } from "@/utils/permissions";

interface DriverEventsTableProps {
  /** UUID do condutor (`driver.id`), usado ao aplicar exceções. */
  driverId: string;
  events: DriverEvent[];
  /** Pontuações mensais do condutor, usadas na prévia do modal de exceção. */
  monthlyScores: DriverMonthlyScore[];
  pagination: PaginationTotalPages;
  /** Desabilita a paginação enquanto uma nova página carrega. */
  carregando?: boolean;
  onPaginaChange: (pagina: number) => void;
  /** Chamado após aplicar uma exceção, para recarregar o detalhe do condutor. */
  onExceptionApplied: () => void;
}

/** Nome do evento + justificativa da exceção, quando houver. */
function EventoComExcecao({ evento }: { evento: DriverEvent }) {
  return (
    <div>
      <span className={evento.has_exception ? "text-muted-foreground" : ""}>{evento.label}</span>

      {evento.has_exception && (
        <div className="mt-1 flex items-start gap-1.5 text-[11px] text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
          <span>{evento.exception?.justification ?? "Desconsiderado pela Gestão de Exceções"}</span>
        </div>
      )}
    </div>
  );
}

/** Impacto na pontuação; riscado (com o valor original) quando o evento foi desconsiderado. */
function ImpactoEvento({ evento }: { evento: DriverEvent }) {
  if (!evento.has_exception) {
    return <span className="font-bold text-red-600">{evento.impact}</span>;
  }

  return (
    <span className="font-bold text-muted-foreground line-through" title="Impacto desconsiderado pela exceção">
      <span className="sr-only">Impacto desconsiderado: </span>
      {evento.raw_points ? -evento.raw_points : 0}
    </span>
  );
}

function StatusEvento({ evento }: { evento: DriverEvent }) {
  const desconsiderado = evento.has_exception || evento.status === "Desconsiderado";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${
        desconsiderado ? "bg-emerald-50 text-emerald-700" : "bg-muted text-foreground"
      }`}
    >
      {desconsiderado ? "Desconsiderado" : "Confirmado"}
    </span>
  );
}

/** Botão "Aplicar exceção"; desabilitado (com motivo no tooltip) quando não é possível aplicar. */
function BotaoAplicarExcecao({
  evento,
  podeGerenciar,
  onClick,
}: {
  evento: DriverEvent;
  podeGerenciar: boolean;
  onClick: () => void;
}) {
  const motivoBloqueio = !podeGerenciar
    ? "Apenas gestores de frota podem aplicar exceções."
    : !evento.eligible
      ? (evento.ineligible_reason ?? "Este evento não é elegível para exceção.")
      : undefined;

  const botao = (
    <Button variant="outline" size="xs" disabled={Boolean(motivoBloqueio)} onClick={onClick}>
      Aplicar exceção
    </Button>
  );

  if (!motivoBloqueio) return botao;

  // Botões desabilitados não disparam hover/foco: o tooltip fica num wrapper focável.
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span tabIndex={0} aria-label={`Aplicar exceção indisponível: ${motivoBloqueio}`} />}
        className="inline-block rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {botao}
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs text-xs">
        {motivoBloqueio}
      </TooltipContent>
    </Tooltip>
  );
}

export function DriverEventsTable({
  driverId,
  events,
  monthlyScores,
  pagination,
  carregando = false,
  onPaginaChange,
  onExceptionApplied,
}: DriverEventsTableProps) {
  const [eventoSelecionado, setEventoSelecionado] = useState<DriverEvent | null>(null);
  const podeGerenciar = canManageExceptions();

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">Eventos Registrados</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-left py-2 px-2">Data</th>
              <th className="text-left py-2 px-2">Evento</th>
              <th className="text-left py-2 px-2">Origem</th>
              <th className="text-left py-2 px-2">Severidade</th>
              <th className="text-right py-2 px-2">Pontos</th>
              <th className="text-right py-2 px-2">Impacto</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-right py-2 px-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map((evento) => (
                <tr
                  key={evento.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors align-top"
                >
                  <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">
                    {formatDateTime(evento.date)}
                  </td>
                  <td className="py-2 px-2">
                    <EventoComExcecao evento={evento} />
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">{displayValue(evento.origin)}</td>
                  <td className={`py-2 px-2 ${getSeverityClassName(evento.severity)}`}>
                    {evento.severity}
                  </td>
                  <td className="py-2 px-2 text-right">{evento.raw_points}</td>
                  <td className="py-2 px-2 text-right">
                    <ImpactoEvento evento={evento} />
                  </td>
                  <td className="py-2 px-2">
                    <StatusEvento evento={evento} />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <BotaoAplicarExcecao
                      evento={evento}
                      podeGerenciar={podeGerenciar}
                      onClick={() => setEventoSelecionado(evento)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum evento registrado no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginacaoNumerada
        pagina={pagination.page}
        totalPaginas={pagination.totalPages}
        totalItens={pagination.total}
        itensPorPagina={pagination.limit}
        rotuloItens="eventos"
        desabilitado={carregando}
        onPaginaChange={onPaginaChange}
      />

      {eventoSelecionado && (
        <ApplyExceptionDialog
          key={eventoSelecionado.id}
          driverId={driverId}
          evento={eventoSelecionado}
          pontuacaoAtual={getEventMonthScore(eventoSelecionado, monthlyScores)}
          onClose={() => setEventoSelecionado(null)}
          onApplied={onExceptionApplied}
        />
      )}
    </div>
  );
}
