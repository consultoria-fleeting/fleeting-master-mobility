/**
 * AppSidebar — Menu lateral de navegação
 *
 * Menu lateral com:
 * - Logo e título do sistema
 * - Itens vindos de `src/config/menu-navegacao.ts`:
 *   links do sistema legado (URL do ambiente atual), links internos e grupos expansíveis
 * - Estado colapsado (apenas ícones) / expandido
 * - Menu mobile com overlay
 * - Barra compacta no mobile (apenas botão de menu; sem breadcrumb)
 * - Indicador de página ativa
 * - Avatar do usuário e botão "Sair" no footer
 *
 * Baseado na estrutura do projeto-lovable,
 * adaptado para Next.js App Router com `usePathname`.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { LogoMenu } from "@/components/logo-menu";
import {
  ITENS_MENU,
  type ItemMenuGrupo,
  type ItemMenuLink,
} from "@/config/menu-navegacao";
import { useAmbiente } from "@/hooks/use-ambiente";
import { logout } from "@/utils/auth";
import { getLegacyUrl } from "@/utils/env-config";

/* ========================================================= */
/*  ESTILOS COMPARTILHADOS                                   */
/* ========================================================= */

const CLASSE_ITEM_BASE = "flex items-center gap-3 rounded-lg text-sm transition-colors";
const CLASSE_ITEM_ATIVO =
  "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-semibold";
const CLASSE_ITEM_INATIVO =
  "hover:bg-[hsl(var(--sidebar-accent)/0.3)] opacity-80 hover:opacity-100";

/* ========================================================= */
/*  COMPONENTE                                               */
/* ========================================================= */

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ambiente = useAmbiente();
  const [colapsado, setColapsado] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);
  /** Aberto/fechado escolhido pelo usuário. Sem escolha, o grupo abre se contiver a rota atual. */
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>({});

  /** Rotas da Torre de Controle usam a nova identidade Índigo */
  const ehTorreDeControle = pathname.startsWith("/torre-de-controle");
  /** Rotas do Ranking de Condutores exibem a marca DriverScore no menu expandido */
  const ehRankingCondutores = pathname.startsWith("/ranking-condutores");

  /** Verifica se um link interno está ativo (match exato ou prefixo). Links do legado nunca estão ativos aqui. */
  function estaAtivo(item: ItemMenuLink): boolean {
    if (item.destino === "legado") return false;
    const path = item.path.replace(/\/+$/, "");
    const atual = pathname.replace(/\/+$/, "");
    // O dashboard do ranking é a raiz dos módulos: só fica ativo na rota exata
    if (path === "/ranking-condutores") return atual === path;
    return atual === path || atual.startsWith(path + "/");
  }

  function grupoContemRotaAtual(grupo: ItemMenuGrupo): boolean {
    if (grupo.prefixoAtivo && pathname.startsWith(grupo.prefixoAtivo)) return true;
    return grupo.filhos.some(estaAtivo);
  }

  function grupoEstaAberto(grupo: ItemMenuGrupo): boolean {
    return gruposAbertos[grupo.id] ?? grupoContemRotaAtual(grupo);
  }

  function alternarGrupo(grupo: ItemMenuGrupo) {
    // Com o menu colapsado, clicar no ícone do grupo expande o menu já com o grupo aberto
    if (colapsado) {
      setColapsado(false);
      setGruposAbertos((atual) => ({ ...atual, [grupo.id]: true }));
      return;
    }
    setGruposAbertos((atual) => ({ ...atual, [grupo.id]: !grupoEstaAberto(grupo) }));
  }

  /** Renderiza um link (interno com next/link; legado com <a> e URL do ambiente atual) */
  function renderizarLink(item: ItemMenuLink, subItem = false) {
    const ativo = estaAtivo(item);
    const Icone = item.icone;
    const classes = `
      ${CLASSE_ITEM_BASE} py-2.5
      ${subItem && !colapsado ? "pl-6 pr-3" : "px-3"}
      ${ativo ? CLASSE_ITEM_ATIVO : CLASSE_ITEM_INATIVO}
    `;
    const conteudo = (
      <>
        <Icone className={`${subItem ? "w-4 h-4" : "w-5 h-5"} shrink-0`} />
        {!colapsado && (
          <span className={`truncate ${subItem ? "text-[13px]" : ""}`}>{item.label}</span>
        )}
      </>
    );

    if (item.destino === "legado") {
      return (
        <a
          key={item.path}
          href={getLegacyUrl(item.path, ambiente)}
          className={classes}
          title={colapsado ? item.label : undefined}
        >
          {conteudo}
        </a>
      );
    }

    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={() => setMobileAberto(false)}
        className={classes}
        title={colapsado ? item.label : undefined}
        aria-current={ativo ? "page" : undefined}
      >
        {conteudo}
      </Link>
    );
  }

  /** Renderiza um grupo expansível (o título não é clicável como link, só abre/fecha) */
  function renderizarGrupo(grupo: ItemMenuGrupo) {
    const aberto = grupoEstaAberto(grupo);
    const contemAtivo = grupoContemRotaAtual(grupo);
    const Icone = grupo.icone;

    return (
      <div key={grupo.id}>
        <button
          type="button"
          onClick={() => alternarGrupo(grupo)}
          aria-expanded={aberto}
          title={colapsado ? grupo.label : undefined}
          className={`
            ${CLASSE_ITEM_BASE} w-full px-3 py-2.5
            ${contemAtivo ? "opacity-100 font-semibold" : CLASSE_ITEM_INATIVO}
            hover:bg-[hsl(var(--sidebar-accent)/0.3)]
          `}
        >
          <Icone className="w-5 h-5 shrink-0" />
          {!colapsado && (
            <>
              <span className="truncate text-left flex-1">{grupo.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>

        {aberto && !colapsado && (
          <div className="mt-1 space-y-1">
            {grupo.filhos.map((filho) => renderizarLink(filho, true))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen overflow-hidden ${ehTorreDeControle ? "tema-indigo" : ""}`}
    >
      {/* Overlay mobile */}
      {mobileAberto && (
        <div
          className="fixed inset-0 bg-foreground/40 z-40 lg:hidden"
          onClick={() => setMobileAberto(false)}
        />
      )}

      {/* ==================== SIDEBAR ==================== */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col
          bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]
          transition-all duration-300
          ${colapsado ? "w-[70px]" : "w-68"}
          ${mobileAberto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header do sidebar: marca + botões (recolhido: ícone e seta lado a lado) */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[hsl(var(--sidebar-divider))] ${colapsado
            ? "justify-center gap-1 px-2"
            : "justify-between gap-2 px-4"
            }`}
        >
          <div className={`flex min-w-0 items-center ${colapsado ? "shrink-0" : "flex-1"}`}>
            <LogoMenu colapsado={colapsado} ehRankingCondutores={ehRankingCondutores} />
          </div>

          {/* Botão colapsar (desktop) */}
          <button
            onClick={() => setColapsado(!colapsado)}
            className="hidden lg:block shrink-0 p-1 rounded hover:bg-[hsl(var(--sidebar-accent)/0.5)] transition-colors"
            aria-label={colapsado ? "Expandir menu" : "Colapsar menu"}
          >
            {colapsado ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Botão fechar (mobile) */}
          <button
            onClick={() => setMobileAberto(false)}
            className="lg:hidden shrink-0 p-1"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="rolagem-suave flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {ITENS_MENU.map((item) =>
            item.tipo === "grupo" ? renderizarGrupo(item) : renderizarLink(item)
          )}
        </nav>

        {/* Footer: usuário + botão sair na mesma linha (recolhido: só o botão sair) */}
        <div
          className={`flex items-center gap-3 p-3 border-t border-[hsl(var(--sidebar-divider))] ${colapsado ? "justify-center" : ""}`}
        >
          {!colapsado && (
            <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[hsl(var(--sidebar-accent))] flex items-center justify-center text-xs font-bold">
                GF
              </div>
              <div className="min-w-0 text-xs">
                <p className="truncate font-medium">Gestor de Frota</p>
                <p className="truncate opacity-60">Admin</p>
              </div>
            </div>
          )}
          <button
            id="menu-sair"
            type="button"
            onClick={logout}
            title="Sair"
            aria-label="Sair"
            className="shrink-0 rounded-lg p-2 opacity-70 transition-colors hover:opacity-100 hover:bg-[hsl(var(--sidebar-accent)/0.4)]"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra compacta só no mobile: sem ela não haveria como abrir o menu */}
        <div className="lg:hidden h-12 flex items-center gap-3 px-4 bg-card border-b border-border shrink-0">
          <button
            onClick={() => setMobileAberto(true)}
            className="p-1"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold">Master Mobility</span>
        </div>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
