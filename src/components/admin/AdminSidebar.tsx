import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Beef, Stethoscope, Milk, HeartPulse, Wallet, FileBarChart, Settings, LogOut, Bell } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { logout, useSesion } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, soon: false },
  { to: "/admin/ganado", label: "Ganado", icon: Beef, soon: false },
  { to: "/admin/leche", label: "Producción", icon: Milk, soon: false },
  { to: "/admin/salud", label: "Salud", icon: Stethoscope, soon: false },
  { to: "/admin/reproduccion", label: "Reproducción", icon: HeartPulse, soon: false },
  { to: "/admin/finanzas", label: "Ventas", icon: Wallet, soon: false },
  { to: "/admin/alertas", label: "Alertas", icon: Bell, soon: false },
  { to: "/admin/reportes", label: "Reportes", icon: FileBarChart, soon: false },
  { to: "/admin/configuracion", label: "Configuración", icon: Settings, soon: false },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: r => r.location.pathname });
  const navigate = useNavigate();
  const { user } = useSesion();

  return (
    <aside className="bg-sidebar text-sidebar-foreground w-64 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-sidebar-border">
        <Logo light />
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map(it => {
          const active = it.exact ? path === it.to : path.startsWith(it.to);
          return (
            <Link key={it.to} to={it.to as any} onClick={onNavigate}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${active ? "bg-accent text-accent-foreground font-semibold shadow-gold" : "hover:bg-sidebar-accent"}`}>
              <span className="flex items-center gap-3"><it.icon className="h-4 w-4" />{it.label}</span>
              {it.soon && <span className="text-[10px] uppercase tracking-wider opacity-70">Pronto</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {user && (
          <div className="px-3 py-2 text-xs">
            <div className="font-medium truncate">{user.user_metadata?.name ?? user.email}</div>
            <div className="text-sidebar-foreground/60 truncate">{user.email}</div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={async () => { await logout(); navigate({ to: "/login" }); }}>
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
