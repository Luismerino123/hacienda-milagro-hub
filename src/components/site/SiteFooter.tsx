import { Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 space-y-3">
          <Logo light />
          <p className="text-sm text-primary-foreground/80 max-w-sm">
            Hacienda ganadera familiar comprometida con la tradición lechera y el bienestar animal desde 1978.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-display text-lg mb-3">Contacto</h4>
          <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +503 7000 0000</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Cantón El Milagrito, El Salvador</p>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-display text-lg mb-3">Síguenos</h4>
          <div className="flex gap-3">
            <a href="#" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition"><Facebook className="h-4 w-4" /></a>
            <a href="#" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition"><Instagram className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container mx-auto px-4 py-4 text-xs text-primary-foreground/70 text-center">
          © {new Date().getFullYear()} Hacienda El Milagrito. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
