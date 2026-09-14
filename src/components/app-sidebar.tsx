/**
 * AppSidebar — Menu lateral de navegação
 *
 * Menu lateral com:
 * - Logo e título do sistema
 * - Links de navegação com ícones e submenus colapsáveis
 * - Estado colapsado (apenas ícones) / expandido
 * - Menu mobile com overlay
 * - Breadcrumb no header
 * - Indicador de página ativa
 * - Avatar do usuário no footer
 *
 * Baseado na estrutura do projeto-lovable,
 * adaptado para Next.js App Router com `usePathname`.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Settings2,
  Grid3X3,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ChevronDown,
  Users,
  Brain,
  Home,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ========================================================= */
/*  CONFIGURAÇÃO DE NAVEGAÇÃO                                */
/* ========================================================= */

interface NavItemLink {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface NavItemGroup {
  label: string;
  icon: LucideIcon;
  children: NavItemLink[];
}

type NavItem = NavItemLink | NavItemGroup;

/** Itens de navegação — atualize quando adicionar novas páginas */
const ITENS_NAV: NavItem[] = [
  {
    path: "https://master-mobility.com/painel-de-gestao/",
    label: "Master Mobility",
    icon: Home,
  },
  {
    path: "/",
    label: "Dashboard Ranking",
    icon: BarChart3,
  },
  {
    label: "Módulos",
    icon: ChevronDown,
    children: [
      {
        path: "/dashboard-parametros",
        label: "Parâmetros do Ranking",
        icon: Settings2,
      },
      {
        path: "/gestao-excecoes",
        label: "Gestão de Exceções",
        icon: ShieldAlert,
      },
      {
        path: "/performance-condutores",
        label: "Performance dos Condutores",
        icon: Users,
      },
      {
        path: "/matriz-pontuacao",
        label: "Matriz de Pontuação",
        icon: Grid3X3,
      },
      {
        path: "/analises-preditivas",
        label: "Análises Preditivas",
        icon: Brain,
      },
    ],
  },
];

/* ========================================================= */
/*  COMPONENTE                                               */
/* ========================================================= */

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [colapsado, setColapsado] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);
  const [submenuAberto, setSubmenuAberto] = useState(true);

  /** Verifica se o path está ativo (match exato ou prefixo) */
  function estaAtivo(path: string): boolean {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(path + "/");
  }

  /** Label da página atual para o breadcrumb */
  function getLabelAtual(): string {
    for (const item of ITENS_NAV) {
      if ("path" in item && estaAtivo(item.path)) return item.label;
      if ("children" in item) {
        const child = item.children.find((c) => estaAtivo(c.path));
        if (child) return child.label;
      }
    }
    // Páginas dinâmicas
    if (pathname.startsWith("/performance-condutores"))
      return "Performance do Condutor";
    if (pathname.startsWith("/dashboard-parametros"))
      return "Detalhamento de Parâmetro";
    return "Página";
  }

  return (
    <div className="flex h-screen overflow-hidden">
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
          ${colapsado ? "w-[70px]" : "w-[260px]"}
          ${mobileAberto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header do sidebar */}
        <div
          className={`flex items-center h-16 px-4 border-b border-[#1a3a5c] ${colapsado ? "justify-center" : "justify-between"
            }`}
        >
          {!colapsado && (
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-[hsl(var(--sidebar-primary))]" />
              <div>
                <h1 className="text-sm font-bold leading-tight">
                  Master Mobility
                </h1>
                <p className="text-[10px] opacity-60">
                  Ranking de Condutores
                </p>
              </div>
            </div>
          )}
          {colapsado && (
            <LayoutDashboard className="w-6 h-6 text-[hsl(var(--sidebar-primary))]" />
          )}

          {/* Botão colapsar (desktop) */}
          <button
            onClick={() => setColapsado(!colapsado)}
            className="hidden lg:block p-1 rounded hover:bg-[hsl(var(--sidebar-accent)/0.5)] transition-colors"
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
            className="lg:hidden p-1"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {ITENS_NAV.map((item, idx) => {
            /* --- Link direto --- */
            if ("path" in item) {
              const externo = item.path.startsWith("http");
              const ativo = !externo && estaAtivo(item.path);

              const classes = `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${ativo
                  ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-semibold"
                  : "hover:bg-[hsl(var(--sidebar-accent)/0.3)] opacity-80 hover:opacity-100"
                }
              `;

              if (externo) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={classes}
                    title={colapsado ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!colapsado && (
                      <span className="truncate">{item.label}</span>
                    )}
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
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!colapsado && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            }

            /* --- Grupo com submenu --- */
            return (
              <div key={idx}>
                {!colapsado && (
                  <button
                    onClick={() => setSubmenuAberto(!submenuAberto)}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm hover:bg-[hsl(var(--sidebar-accent)/0.3)] opacity-80 hover:opacity-100 transition-colors"
                  >
                    <span className="text-[10px] uppercase tracking-widest opacity-60 font-semibold">
                      {item.label}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${submenuAberto ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                )}

                {(submenuAberto || colapsado) &&
                  item.children.map((child) => {
                    const ativo = estaAtivo(child.path);
                    return (
                      <Link
                        key={child.path}
                        href={child.path}
                        onClick={() => setMobileAberto(false)}
                        className={`
                          flex items-center gap-3 py-2.5 rounded-lg text-sm transition-colors
                          ${!colapsado ? "pl-6 pr-3" : "px-3"}
                          ${ativo
                            ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-semibold"
                            : "hover:bg-[hsl(var(--sidebar-accent)/0.3)] opacity-80 hover:opacity-100"
                          }
                        `}
                        title={colapsado ? child.label : undefined}
                      >
                        <child.icon className="w-4 h-4 shrink-0" />
                        {!colapsado && (
                          <span className="truncate text-[13px]">
                            {child.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            );
          })}
        </nav>

        {/* Footer: Usuário */}
        {!colapsado && (
          <div className="p-4 border-t border-[#1a3a5c]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--sidebar-accent))] flex items-center justify-center text-xs font-bold">
                GF
              </div>
              <div className="text-xs">
                <p className="font-medium">Gestor de Frota</p>
                <p className="opacity-60">Admin</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header com breadcrumb */}
        <header className="h-14 flex items-center px-4 lg:px-6 bg-card border-b border-border shrink-0">
          <button
            onClick={() => setMobileAberto(true)}
            className="lg:hidden mr-3 p-1"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Ranking de Condutores</span>
            <span>/</span>
            <span className="text-foreground font-medium">
              {getLabelAtual()}
            </span>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
