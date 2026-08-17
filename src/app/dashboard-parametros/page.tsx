/**
 * Parâmetros do Ranking — Página
 *
 * Exibe os 19 indicadores de eventos agrupados por nível de impacto
 * na pontuação dos condutores.
 * Cada card é clicável e navega para /dashboard-parametros/{id}.
 *
 * Seções:
 * - Seletor de período (mês/ano) no header
 * - Barra de filtros (nome, gestor, filial, departamento, unidade)
 * - Cards de indicadores agrupados por nível de exposição ao risco
 *
 * Dados mockados, prontos para futura integração com backend.
 * TODO(backend): Substituir dados mock por chamadas à API.
 * TODO(security): Implementar autenticação/autorização quando integrar com backend.
 *
 * Rota: /dashboard-parametros
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PeriodoSelector } from "@/components/periodo-selector";
import { FiltroBarra } from "@/components/filtro-barra";
import { ParametroCard } from "@/components/parametro-card";
import {
  parametrosRanking,
  gruposImpacto,
} from "@/data/mock-parametros-ranking";
import { opcoesFiltro } from "@/data/mock-condutores";
import type { FiltrosState } from "@/types/condutor";

/** Estado inicial dos filtros — nenhum filtro aplicado */
const FILTROS_INICIAIS: FiltrosState = {
  nome: "",
  gestor: "",
  departamento: "",
  funcao: "",
  negocio: "",
};

export default function DashboardParametrosPage() {
  const router = useRouter();

  /* ---------- Estado do período (relativo à data atual) ---------- */
  const NOMES_MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(NOMES_MESES[hoje.getMonth()]);
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  /* ---------- Estado dos filtros ---------- */
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAIS);

  const handleFiltroChange = useCallback(
    <K extends keyof FiltrosState>(campo: K, valor: FiltrosState[K]) => {
      setFiltros((prev) => ({ ...prev, [campo]: valor }));
    },
    []
  );

  /**
   * Na versão mock, os totais dos cards não mudam com os filtros,
   * pois os dados são estáticos. Quando integrado com o backend,
   * os filtros serão enviados na requisição e os totais refletirão
   * a seleção. Aqui mantemos a estrutura pronta para isso.
   *
   * TODO(backend): Filtrar dados por período e filtros selecionados.
   */
  const parametrosFiltrados = useMemo(() => {
    return parametrosRanking;
  }, []);

  /** Navega para detalhamento do parâmetro mantendo contexto */
  function handleParametroClick(parametroId: string) {
    const params = new URLSearchParams({
      mes: mesSelecionado,
      ano: String(anoSelecionado),
    });
    router.push(`/dashboard-parametros/${parametroId}?${params.toString()}`);
  }

  return (
    <div className="animate-fade-in min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header com título e seletor de período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Parâmetros do Ranking
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Indicadores agrupados por nível de impacto na pontuação. Clique para
            ver detalhes.
          </p>
        </div>

        <PeriodoSelector
          mesSelecionado={mesSelecionado}
          anoSelecionado={anoSelecionado}
          onMesChange={setMesSelecionado}
          onAnoChange={setAnoSelecionado}
        />
      </div>

      {/* Barra de filtros */}
      <FiltroBarra
        filtros={filtros}
        opcoes={opcoesFiltro}
        onFiltroChange={handleFiltroChange}
      />

      {/* Cards agrupados por nível de impacto */}
      {gruposImpacto.map((grupo) => {
        const itensDoGrupo = parametrosFiltrados.filter(
          (p) => p.grupo === grupo.grupo
        );

        if (itensDoGrupo.length === 0) return null;

        return (
          <section key={grupo.grupo} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {grupo.label}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {itensDoGrupo.map((parametro) => (
                <ParametroCard
                  key={parametro.id}
                  label={parametro.label}
                  total={parametro.total}
                  icone={parametro.icone}
                  bgClasse={grupo.bgClasse}
                  textoClasse={grupo.textoClasse}
                  onClick={() => handleParametroClick(parametro.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
