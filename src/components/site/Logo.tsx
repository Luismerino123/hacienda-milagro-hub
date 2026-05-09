import logo from "@/assets/logo-milagrito.png";
import { Link } from "@tanstack/react-router";

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <img src={logo} alt="Hacienda El Milagrito" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
      {!compact && (
        <div className="leading-tight">
          <div className={`font-display text-lg md:text-xl ${light ? "text-primary-foreground" : "text-primary"}`}>
            El Milagrito
          </div>
          <div className={`text-[10px] md:text-xs uppercase tracking-widest ${light ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            Hacienda Ganadera
          </div>
        </div>
      )}
    </Link>
  );
}
