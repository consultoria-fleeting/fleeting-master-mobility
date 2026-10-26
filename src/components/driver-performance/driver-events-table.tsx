/**
 * DriverEventsTable — Eventos/infrações do condutor (seção 4.12, `events`).
 *
 * Colunas: data, evento, origem, severidade, pontos e impacto. Quando `has_exception === true`
 * o evento é sinalizado com a etiqueta "Desconsiderado" e a justificativa da exceção
 * (o impacto já vem zerado do backend).
 *
 * @example
 * <DriverEventsTable events={data.events.data} pagination={data.events.pagination} onPaginaChange={setPagina} />
 */

import { ShieldCheck } from "lucide-react";
import { PaginacaoNumerada } from "@/components/paginacao-numerada";
import type { DriverEvent, PaginationTotalPages } from "@/types/driver-scoring";
import { formatDateTime, getSeverityClassName } from "@/utils/driver-scoring-display";
import { displayValue } from "@/utils/driver-scoring-helpers";

interface DriverEventsTableProps {
  events: DriverEvent[];
  pagination: PaginationTotalPages;
  /** Desabilita a paginação enquanto uma nova página carrega. */
  carregando?: boolean;
  onPaginaChange: (pagina: number) => void;
}

/** Nome do evento + selo de exceção com a justificativa. */
function EventoComExcecao({ evento }: { evento: DriverEvent }) {
  return (
    <div>
      <span className={evento.has_exception ? "line-through text-muted-foreground" : ""}>
        {evento.label}
      </span>

      {evento.has_exception && (
        <div className="mt-1 flex items-start gap-1.5 text-[11px] text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
          <span>
            <span className="font-semibold">Desconsiderado:</span>{" "}
            {evento.exception?.justification ?? "Desconsiderado pela Gestão de Exceções"}
          </span>
        </div>
      )}
    </div>
  );
}

export function DriverEventsTable({
  events,
  pagination,
  carregando = false,
  onPaginaChange,
}: DriverEventsTableProps) {
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
                  <td
                    className={`py-2 px-2 text-right font-bold ${
                      evento.has_exception ? "text-muted-foreground" : "text-red-600"
                    }`}
                  >
                    {evento.impact}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
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
    </div>
  );
}
