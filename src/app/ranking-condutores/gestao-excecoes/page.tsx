/**
 * Gestão de exceções — Página
 *
 * Integrada ao backend `api-driver-scoring`:
 * histórico (auditoria) das exceções aplicadas na organização, com busca por condutor e paginação.
 * A criação de exceções acontece no detalhe do condutor (`/performance-condutores/[id]`).
 * Exceções são irreversíveis: não há edição, revogação ou exclusão.
 *
 * Rota: /ranking-condutores/gestao-excecoes
 * Acesso: perfis de gestor (os demais recebem 403 do backend).
 */

"use client";

import { ExceptionsHistoryTable } from "@/components/exceptions/exceptions-history-table";

export default function GestaoExcecoesPage() {
  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Gestão de exceções</h1>
        <p className="text-sm text-muted-foreground">Análise de exceções ao ranking</p>
      </div>

      <ExceptionsHistoryTable />
    </div>
  );
}
