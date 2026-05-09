import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Beef, Stethoscope, Milk, HeartPulse, Wallet, Bell, FileBarChart, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { logout, getSesion } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/ganado", label: "Ganado", icon: Beef },
  { to: "/admin/leche", label: "Producción de leche", icon: Milk },
  { to: "/admin/salud", label: "Salud y veterinaria", icon: Stethoscope },
  { to: "/admin/reproduccion", label: "Reproducción", icon: HeartPulse },
  { to: "/admin/finanzas", label: "Ventas y finanzas", icon: Wallet },
  { to: "/admin/alertas", label: "Alertas", icon: Bell },
  { to: "/admin/reportes", label: "Reportes", icon: FileBarChart },
  { to: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: r => r.location.pathname });
  const navigate = useNavigate();
  const sesion = typeof window !== "undefined" ? getSesion() : null;

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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${active ? "bg-accent text-accent-foreground font-semibold shadow-gold" : "hover:bg-sidebar-accent"}`}>
              <it.icon className="h-4 w-4" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {sesion && (
          <div className="px-3 py-2 text-xs">
            <div className="font-medium">{sesion.nombre}</div>
            <div className="text-sidebar-foreground/60 capitalize">{sesion.rol}</div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={() => { logout(); navigate({ to: "/login" }); }}>
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
