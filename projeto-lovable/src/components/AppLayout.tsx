import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Settings2, FileText, Grid3X3,
  ShieldAlert, ChevronLeft, ChevronRight, Menu, X, ChevronDown, Users, Brain
} from 'lucide-react';

const navItems = [
  { path: '/dashboard-ranking', label: 'Dashboard Ranking', icon: BarChart3 },
  {
    label: 'Submenus', icon: ChevronDown, children: [
      { path: '/dashboard-parametros', label: 'Parâmetros do Ranking', icon: Settings2 },
      { path: '/gestao-excecoes', label: 'Gestão de Exceções', icon: ShieldAlert },
      { path: '/performance-condutores', label: 'Performance dos Condutores', icon: Users },
      { path: '/matriz-pontuacao', label: 'Matriz de Pontuação', icon: Grid3X3 },
      { path: '/analises-preditivas', label: 'Análises Preditivas', icon: Brain },
    ]
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(true);

  const isActivePath = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const currentLabel = (() => {
    for (const item of navItems) {
      if ('path' in item && isActivePath(item.path)) return item.label;
      if ('children' in item) {
        const child = item.children.find(c => isActivePath(c.path));
        if (child) return child.label;
      }
    }
    return 'Página';
  })();

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300
          ${collapsed ? 'w-[70px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className={`flex items-center h-16 px-4 border-b border-sidebar-border ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-sidebar-primary" />
              <div>
                <h1 className="text-sm font-bold leading-tight">Master Mobility</h1>
                <p className="text-[10px] text-sidebar-foreground/60">Ranking de Condutores</p>
              </div>
            </div>
          )}
          {collapsed && <LayoutDashboard className="w-6 h-6 text-sidebar-primary" />}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block p-1 rounded hover:bg-sidebar-accent/50">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            if ('path' in item) {
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            }
            // Submenu group
            return (
              <div key={idx}>
                {!collapsed && (
                  <button
                    onClick={() => setSubmenuOpen(!submenuOpen)}
                    className="nav-item nav-item-inactive w-full justify-between"
                  >
                    <span className="text-[10px] uppercase tracking-widest opacity-60 font-semibold">Módulos</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${submenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}
                {(submenuOpen || collapsed) && item.children.map(child => {
                  const isActive = isActivePath(child.path);
                  return (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-item ${!collapsed ? 'pl-6' : ''} ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                      title={collapsed ? child.label : undefined}
                    >
                      <child.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="truncate text-[13px]">{child.label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold">
                GF
              </div>
              <div className="text-xs">
                <p className="font-medium">Gestor de Frota</p>
                <p className="text-sidebar-foreground/60">Admin</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center px-4 lg:px-6 bg-card border-b shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden mr-3 p-1">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Ranking de Condutores</span>
            <span>/</span>
            <span className="text-foreground font-medium">{currentLabel}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
