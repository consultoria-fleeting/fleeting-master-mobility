/**
 * Itens do menu lateral (AppSidebar).
 *
 * - `destino: "legado"`  → rota do sistema principal (front legado). O link é montado
 *   com a URL do ambiente atual: dev.master-mobility.com, demo.master-mobility.com
 *   ou master-mobility.com (ver `getLegacyUrl` em `src/utils/env-config.ts`).
 * - `destino: "interno"` → rota deste projeto (navegação client-side com `next/link`).
 * - Grupos não são clicáveis: apenas expandem/recolhem os sub-itens.
 *
 * A Torre de Controle (`/torre-de-controle`) fica fora do menu de propósito:
 * por enquanto é acessada apenas pela URL.
 */

import {
  Boxes,
  Brain,
  Building2,
  CalendarCheck,
  Car,
  CarFront,
  ChartColumn,
  ClipboardCheck,
  FolderPlus,
  Fuel,
  GraduationCap,
  Grid3X3,
  Handshake,
  Headset,
  LayoutDashboard,
  ReceiptText,
  Satellite,
  Settings2,
  ShieldAlert,
  Trophy,
  UserCog,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DestinoMenu = "interno" | "legado";

export interface ItemMenuLink {
  tipo: "link";
  label: string;
  icone: LucideIcon;
  path: string;
  destino: DestinoMenu;
}

export interface ItemMenuGrupo {
  tipo: "grupo";
  /** Identificador estável (controle de aberto/fechado) */
  id: string;
  label: string;
  icone: LucideIcon;
  filhos: ItemMenuLink[];
  /** Mantém o grupo aberto em qualquer rota com este prefixo (ex.: páginas de detalhe) */
  prefixoAtivo?: string;
}

export type ItemMenu = ItemMenuLink | ItemMenuGrupo;

/** Atalho para rotas do sistema legado */
function legado(label: string, path: string, icone: LucideIcon): ItemMenuLink {
  return { tipo: "link", label, path, icone, destino: "legado" };
}

/** Atalho para rotas deste projeto */
function interno(label: string, path: string, icone: LucideIcon): ItemMenuLink {
  return { tipo: "link", label, path, icone, destino: "interno" };
}

export const ITENS_MENU: ItemMenu[] = [
  legado("Painel de Gestão", "/painel-de-gestao/", LayoutDashboard),
  legado("Help Desk", "/help-desk/", Headset),
  legado("Inventário", "/inventario/", Boxes),
  legado("Manutenção", "/manutencao/", Wrench),
  legado("Sinistros", "/sinistro/", CarFront),
  legado("Multas e Documentação", "/multas-e-documentacao/", ReceiptText),
  legado("Telemetria", "/telemetria/", Satellite),
  legado("Abastecimento", "/abastecimento/", Fuel),
  legado("Reservas", "/reservas/", CalendarCheck),
  {
    tipo: "grupo",
    id: "ranking-condutores",
    label: "Ranking de Condutores",
    icone: Trophy,
    prefixoAtivo: "/ranking-condutores",
    filhos: [
      interno("Dashboard Geral", "/ranking-condutores", ChartColumn),
      interno("Parâmetros do Ranking", "/ranking-condutores/dashboard-parametros", Settings2),
      interno("Gestão de Exceções", "/ranking-condutores/gestao-excecoes", ShieldAlert),
      interno("Performance dos Condutores", "/ranking-condutores/performance-condutores", Users),
      interno("Matriz de Pontuação", "/ranking-condutores/matriz-pontuacao", Grid3X3),
      interno("Análises Preditivas", "/ranking-condutores/analises-preditivas", Brain),
    ],
  },
  legado("Treinamentos", "/treinamentos/", GraduationCap),
  legado("Financeiro", "/financeiro/", Wallet),
  legado("Checklist", "/checklist/", ClipboardCheck),
  {
    tipo: "grupo",
    id: "cadastros",
    label: "Cadastros",
    icone: FolderPlus,
    filhos: [
      legado("Veículos", "/cadastros/veiculos/", Car),
      legado("Fornecedores", "/cadastros/fornecedores/", Handshake),
      legado("Empresas", "/cadastros/empresas/", Building2),
      legado("Usuários", "/cadastros/usuarios/", UserCog),
    ],
  },
];
