import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { animales } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo de ganado — Hacienda El Milagrito" },
      { name: "description", content: "Conozca nuestro hato: vacas lecheras, ganado de engorde y reproductores." },
    ],
  }),
  component: Catalogo,
});

function edad(fecha: string) {
  const años = (Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (años < 1) return `${Math.round(años * 12)} meses`;
  return `${años.toFixed(1)} años`;
}

function Catalogo() {
  const [q, setQ] = useState("");
  const [raza, setRaza] = useState("todas");
  const [sexo, setSexo] = useState("todos");
  const [proposito, setProposito] = useState("todos");

  const filtrados = useMemo(() => {
    return animales.filter(a => {
      if (q && !`${a.nombre} ${a.arete}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (raza !== "todas" && a.raza !== raza) return false;
      if (sexo !== "todos" && a.sexo !== sexo) return false;
      if (proposito !== "todos" && a.proposito !== proposito) return false;
      return true;
    });
  }, [q, raza, sexo, proposito]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="bg-secondary py-14">
        <div className="container mx-auto px-4">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Catálogo</span>
          <h1 className="font-display text-5xl mt-2">Nuestro ganado</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">Cada animal con su historia, su raza y su propósito. Consúltenos por WhatsApp para ventas.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        {/* Filtros */}
        <Card className="p-4 mb-8 grid gap-3 md:grid-cols-4 shadow-soft">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o arete" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={raza} onValueChange={setRaza}>
            <SelectTrigger><SelectValue placeholder="Raza" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las razas</SelectItem>
              <SelectItem value="Holstein">Holstein</SelectItem>
              <SelectItem value="Jersey">Jersey</SelectItem>
              <SelectItem value="Brahman">Brahman</SelectItem>
              <SelectItem value="Pardo Suizo">Pardo Suizo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sexo} onValueChange={setSexo}>
            <SelectTrigger><SelectValue placeholder="Sexo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Ambos sexos</SelectItem>
              <SelectItem value="Hembra">Hembra</SelectItem>
              <SelectItem value="Macho">Macho</SelectItem>
            </SelectContent>
          </Select>
          <Select value={proposito} onValueChange={setProposito}>
            <SelectTrigger><SelectValue placeholder="Propósito" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los propósitos</SelectItem>
              <SelectItem value="Lechera">Lechera</SelectItem>
              <SelectItem value="Engorde">Engorde</SelectItem>
              <SelectItem value="Reproducción">Reproducción</SelectItem>
              <SelectItem value="Cría">Cría</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {filtrados.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No encontramos animales con esos filtros.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtrados.map(a => (
              <Link key={a.id} to="/catalogo/$id" params={{ id: a.id }}>
                <Card className="overflow-hidden group cursor-pointer shadow-soft hover:shadow-elevated transition-all hover:-translate-y-1 h-full">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={a.foto} alt={a.nombre} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-xl">{a.nombre}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{a.arete}</p>
                      </div>
                      {a.estado === "En venta" && <Badge className="bg-accent text-accent-foreground">En venta</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p>{a.raza} · {a.sexo}</p>
                      <p>{edad(a.fechaNacimiento)} · {a.proposito}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
