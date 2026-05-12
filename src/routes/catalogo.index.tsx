import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { listarEnVenta, calcularEdad, PHOTO_FALLBACK, RAZAS } from "@/lib/animals";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/catalogo/")({
  head: () => ({
    meta: [
      { title: "Catálogo de ganado en venta — Hacienda El Milagrito" },
      { name: "description", content: "Vacas lecheras, ganado de engorde y reproductores disponibles a la venta. Consúltenos por WhatsApp." },
    ],
  }),
  component: Catalogo,
});

function Catalogo() {
  const { data, isLoading } = useQuery({ queryKey: ["catalogo"], queryFn: listarEnVenta });
  const [q, setQ] = useState("");
  const [raza, setRaza] = useState("todas");
  const [sexo, setSexo] = useState("todos");
  const [proposito, setProposito] = useState("todos");

  const filtrados = useMemo(() => {
    if (!data) return [];
    return data.filter(a => {
      if (q && !`${a.name ?? ""} ${a.tag_number}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (raza !== "todas" && a.breed !== raza) return false;
      if (sexo !== "todos" && a.sex !== sexo) return false;
      if (proposito !== "todos" && a.purpose !== proposito) return false;
      return true;
    });
  }, [data, q, raza, sexo, proposito]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="bg-secondary py-14">
        <div className="container mx-auto px-4">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Catálogo</span>
          <h1 className="font-display text-5xl mt-2">Ganado en venta</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">Animales disponibles del hato. Consúltenos por WhatsApp para más información o visita.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 flex-1">
        <Card className="p-4 mb-8 grid gap-3 md:grid-cols-4 shadow-soft">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o arete" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={raza} onValueChange={setRaza}>
            <SelectTrigger><SelectValue placeholder="Raza" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las razas</SelectItem>
              {RAZAS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sexo} onValueChange={setSexo}>
            <SelectTrigger><SelectValue placeholder="Sexo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Ambos sexos</SelectItem>
              <SelectItem value="hembra">Hembra</SelectItem>
              <SelectItem value="macho">Macho</SelectItem>
            </SelectContent>
          </Select>
          <Select value={proposito} onValueChange={setProposito}>
            <SelectTrigger><SelectValue placeholder="Propósito" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los propósitos</SelectItem>
              <SelectItem value="lechera">Lechera</SelectItem>
              <SelectItem value="engorde">Engorde</SelectItem>
              <SelectItem value="reproduccion">Reproducción</SelectItem>
              <SelectItem value="mixto">Mixto</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No hay animales disponibles con esos filtros.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtrados.map(a => (
              <Link key={a.id} to="/catalogo/$id" params={{ id: a.id }}>
                <Card className="overflow-hidden group cursor-pointer shadow-soft hover:shadow-elevated transition-all hover:-translate-y-1 h-full">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={a.photos[0] || PHOTO_FALLBACK} alt={a.name ?? a.tag_number} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-xl">{a.name ?? "Sin nombre"}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{a.tag_number}</p>
                      </div>
                      <Badge className="bg-accent text-accent-foreground">En venta</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p>{a.breed} · <span className="capitalize">{a.sex}</span></p>
                      <p>{calcularEdad(a.birth_date)} · {a.purpose ?? "—"}</p>
                    </div>
                    {a.sale_price && <p className="font-display text-lg text-primary">${a.sale_price}</p>}
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
