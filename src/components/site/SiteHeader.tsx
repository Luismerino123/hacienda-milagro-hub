import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.to} to={l.to as any} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
              {l.label}
            </Link>
          ))}
          <Button asChild variant="forest" size="sm">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </nav>
        <button className="md:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="Menú">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {links.map(l => (
              <Link key={l.to} to={l.to as any} onClick={() => setOpen(false)} className="text-sm py-2">
                {l.label}
              </Link>
            ))}
            <Button asChild variant="forest" size="sm" className="w-full">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
