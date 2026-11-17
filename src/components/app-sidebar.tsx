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

import { useState, useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { LogoMenu } from "@/components/logo-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ITENS_MENU,
  type ItemMenuGrupo,
  type ItemMenuLink,
} from "@/config/menu-navegacao";
import { useAmbiente } from "@/hooks/use-ambiente";
import { logout } from "@/utils/auth";
import { getLegacyUrl } from "@/utils/env-config";
import {
  getAuthenticatedUserProfile,
  PERFIL_USUARIO_PADRAO,
} from "@/utils/permissions";

function assinarPerfilUsuario() {
  return () => {};
}

function obterPerfilNoServidor() {
  return PERFIL_USUARIO_PADRAO;
}

/* ========================================================= */
/*  ESTILOS COMPARTILHADOS                                   */
/* ========================================================= */

const CLASSE_ITEM_BASE = "flex items-center gap-3 rounded-lg text-sm transition-colors";
const CLASSE_ITEM_ATIVO =
  "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-semibold";
const CLASSE_ITEM_INATIVO =
  "hover:bg-[hsl(var(--sidebar-accent)/0.3)] opacity-80 hover:opacity-100";

/** Envolve um elemento interativo da barra recolhida com Tooltip alinhado à direita */
function TooltipMenuLateral({
  rotulo,
  ativo = true,
  children,
}: {
  rotulo: string;
  ativo?: boolean;
  children: ReactElement;
}) {
  if (!ativo) return children;

  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="right" sideOffset={10} className="text-xs font-medium">
        {rotulo}
      </TooltipContent>
    </Tooltip>
  );
}

/* ========================================================= */
/*  COMPONENTE                                               */
/* ========================================================= */

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ambiente = useAmbiente();
  const perfilUsuario = useSyncExternalStore(
    assinarPerfilUsuario,
    getAuthenticatedUserProfile,
    obterPerfilNoServidor,
  );
  const [colapsado, setColapsado] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);
  /** Aberto/fechado escolhido pelo usuário. Sem escolha, o grupo abre se contiver a rota atual. */
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>({});

  /** No drawer mobile, o menu sempre aparece expandido com os rótulos */
  const menuColapsado = colapsado && !mobileAberto;

  /** Rotas da Torre de Controle usam a nova identidade Índigo */
  const ehTorreDeControle = pathname.startsWith("/torre-de-controle");
  /** Rotas do DriverScore (`/ranking-condutores*`) exibem a marca/ícone DriverScore */
  const ehRankingCondutores = pathname.startsWith("/ranking-condutores");

  /** Verifica se um link interno está ativo (match exato ou prefixo). Links do legado ou desabilitados nunca estão ativos aqui. */
  function estaAtivo(item: ItemMenuLink): boolean {
    if (item.destino === "legado" || item.desabilitado) return false;
    const path = item.path.replace(/\/+$/, "");
    const atual = pathname.replace(/\/+$/, "");
    // O dashboard do ranking é a raiz dos módulos: só fica ativo na rota exata
    if (path === "/ranking-condutores") return atual === path;
    return atual === path || atual.startsWith(path + "/");
  }

  function grupoContemRotaAtual(grupo: ItemMenuGrupo): boolean {
    if (grupo.prefixoAtivo && pathname.startsWith(grupo.prefixoAtivo)) return true;
    return grupo.filhos.some((filho) =>
      filho.tipo === "grupo" ? grupoContemRotaAtual(filho) : estaAtivo(filho)
    );
  }

  function grupoAbertoPorPadrao(grupo: ItemMenuGrupo): boolean {
    if (grupo.fechadoPorPadraoEm) {
      return !pathname.startsWith(grupo.fechadoPorPadraoEm);
    }
    return grupoContemRotaAtual(grupo);
  }

  function grupoEstaAberto(grupo: ItemMenuGrupo): boolean {
    return gruposAbertos[grupo.id] ?? grupoAbertoPorPadrao(grupo);
  }

  function alternarGrupo(grupo: ItemMenuGrupo) {
    // Com o menu colapsado, clicar no ícone do grupo expande o menu já com o grupo aberto
    if (menuColapsado) {
      setColapsado(false);
      setGruposAbertos((atual) => ({ ...atual, [grupo.id]: true }));
      return;
    }
    setGruposAbertos((atual) => ({ ...atual, [grupo.id]: !grupoEstaAberto(grupo) }));
  }

  function obterClassesEspacamentoItem(nivel: number): string {
    if (menuColapsado) return "mx-auto h-10 w-10 justify-center p-0";
    if (nivel === 0) return "w-full px-3 py-2.5";
    if (nivel === 1) return "w-full pl-6 pr-3 py-2.5";
    return "w-full pl-10 pr-3 py-2.5";
  }

  /** Renderiza um link (interno com next/link; legado com <a> e URL do ambiente atual) */
  function renderizarLink(item: ItemMenuLink, nivel = 0) {
    const ativo = estaAtivo(item);
    const subItem = nivel > 0;
    const Icone = item.icone;
    const classes = `
      ${CLASSE_ITEM_BASE}
      ${obterClassesEspacamentoItem(nivel)}
      ${ativo ? CLASSE_ITEM_ATIVO : CLASSE_ITEM_INATIVO}
    `;
    const conteudo = (
      <>
        <Icone className={`${subItem ? "w-4 h-4" : "w-5 h-5"} shrink-0`} />
        {!menuColapsado && (
          <span className={`truncate ${subItem ? "text-[13px]" : ""}`}>{item.label}</span>
        )}
      </>
    );

    if (item.desabilitado) {
      return (
        <TooltipMenuLateral
          key={item.path}
          rotulo={menuColapsado ? `${item.label} (Disponível na V2)` : "Disponível na V2"}
        >
          <span
            tabIndex={0}
            aria-disabled="true"
            className={`
              ${CLASSE_ITEM_BASE}
              ${obterClassesEspacamentoItem(nivel)}
              opacity-40 cursor-not-allowed select-none
            `}
          >
            {conteudo}
          </span>
        </TooltipMenuLateral>
      );
    }

    if (item.destino === "legado") {
      return (
        <TooltipMenuLateral key={item.path} rotulo={item.label} ativo={menuColapsado}>
          <a href={getLegacyUrl(item.path, ambiente)} className={classes}>
            {conteudo}
          </a>
        </TooltipMenuLateral>
      );
    }

    return (
      <TooltipMenuLateral key={item.path} rotulo={item.label} ativo={menuColapsado}>
        <Link
          href={item.path}
          onClick={() => setMobileAberto(false)}
          className={classes}
          aria-current={ativo ? "page" : undefined}
        >
          {conteudo}
        </Link>
      </TooltipMenuLateral>
    );
  }

  /** Renderiza um grupo expansível (o título não é clicável como link, só abre/fecha) */
  function renderizarGrupo(grupo: ItemMenuGrupo, nivel = 0) {
    const aberto = grupoEstaAberto(grupo);
    const contemAtivo = grupoContemRotaAtual(grupo);
    const subGrupo = nivel > 0;
    const Icone = grupo.icone;

    const classesEstadoGrupo = contemAtivo
      ? menuColapsado
        ? "bg-[hsl(var(--sidebar-accent)/0.55)] text-[hsl(var(--sidebar-accent-foreground))] ring-1 ring-white/10 opacity-100"
        : "opacity-100 font-semibold"
      : CLASSE_ITEM_INATIVO;

    return (
      <div key={grupo.id}>
        <TooltipMenuLateral rotulo={grupo.label} ativo={menuColapsado}>
          <button
            type="button"
            onClick={() => alternarGrupo(grupo)}
            aria-expanded={aberto}
            aria-label={menuColapsado ? grupo.label : undefined}
            className={`
              ${CLASSE_ITEM_BASE}
              ${obterClassesEspacamentoItem(nivel)}
              ${classesEstadoGrupo}
              hover:bg-[hsl(var(--sidebar-accent)/0.35)]
            `}
          >
            <Icone className={`${subGrupo ? "w-4 h-4" : "w-5 h-5"} shrink-0`} />
            {!menuColapsado && (
              <>
                <span className={`truncate text-left flex-1 ${subGrupo ? "text-[13px]" : ""}`}>
                  {grupo.label}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>
        </TooltipMenuLateral>

        {aberto && !menuColapsado && (
          <div className="mt-1 space-y-1">
            {grupo.filhos.map((filho) =>
              filho.tipo === "grupo"
                ? renderizarGrupo(filho, nivel + 1)
                : renderizarLink(filho, nivel + 1)
            )}
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
          flex shrink-0 flex-col
          bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]
          transition-all duration-300
          w-68 ${menuColapsado ? "lg:w-[72px]" : "lg:w-68"}
          ${mobileAberto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header: recolhido => marca centralizada com morph suave em hover para expandir; expandido => marca + botão recolher */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[hsl(var(--sidebar-divider))] ${
            menuColapsado ? "justify-center px-2" : "justify-between gap-2 px-4"
          }`}
        >
          {menuColapsado ? (
            <TooltipMenuLateral rotulo="Expandir menu">
              <button
                type="button"
                onClick={() => setColapsado(false)}
                aria-label="Expandir menu"
                className="group/marca relative flex h-11 w-12 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 hover:bg-[hsl(var(--sidebar-accent)/0.55)] hover:ring-1 hover:ring-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <span className="flex items-center justify-center transition-all duration-200 ease-out motion-reduce:transition-none group-hover/marca:scale-75 group-hover/marca:opacity-0 group-focus-visible/marca:scale-75 group-focus-visible/marca:opacity-0">
                  <LogoMenu colapsado ehRankingCondutores={ehRankingCondutores} />
                </span>
                <PanelLeftOpen
                  aria-hidden="true"
                  className="pointer-events-none absolute h-5 w-5 scale-75 opacity-0 transition-all duration-200 ease-out motion-reduce:transition-none group-hover/marca:scale-100 group-hover/marca:opacity-100 group-focus-visible/marca:scale-100 group-focus-visible/marca:opacity-100"
                />
              </button>
            </TooltipMenuLateral>
          ) : (
            <>
              <div className="flex min-w-0 flex-1 items-center">
                <LogoMenu colapsado={false} ehRankingCondutores={ehRankingCondutores} />
              </div>

              {/* Botão recolher no header (desktop expandido) */}
              <TooltipMenuLateral rotulo="Recolher menu">
                <button
                  type="button"
                  onClick={() => setColapsado(true)}
                  aria-label="Recolher menu"
                  className="hidden lg:flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg opacity-75 transition-all hover:bg-[hsl(var(--sidebar-accent)/0.5)] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </TooltipMenuLateral>

              {/* Botão fechar (mobile) */}
              <button
                type="button"
                onClick={() => setMobileAberto(false)}
                className="lg:hidden shrink-0 p-1"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Navegação */}
        <nav className="rolagem-suave flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {ITENS_MENU.map((item) =>
            item.tipo === "grupo" ? renderizarGrupo(item) : renderizarLink(item)
          )}
        </nav>

        {/* Footer: expandido => perfil + sair; recolhido => apenas botão sair centralizado */}
        <div
          className={`flex items-center gap-3 border-t border-[hsl(var(--sidebar-divider))] p-3 ${
            menuColapsado ? "justify-center" : ""
          }`}
        >
          {!menuColapsado && (
            <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[hsl(var(--sidebar-accent))] flex items-center justify-center text-xs font-bold">
                {perfilUsuario.iniciais}
              </div>
              <div className="min-w-0 text-xs">
                <p className="truncate font-medium" title={perfilUsuario.nome}>
                  {perfilUsuario.nome}
                </p>
                <p className="truncate opacity-60" title={perfilUsuario.permissao}>
                  {perfilUsuario.permissao}
                </p>
              </div>
            </div>
          )}

          <TooltipMenuLateral rotulo="Sair">
            <button
              id="menu-sair"
              type="button"
              onClick={logout}
              aria-label="Sair"
              className={`shrink-0 cursor-pointer rounded-lg opacity-70 transition-colors hover:bg-[hsl(var(--sidebar-accent)/0.4)] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                menuColapsado ? "flex h-10 w-10 items-center justify-center" : "p-2"
              }`}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </TooltipMenuLateral>
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
