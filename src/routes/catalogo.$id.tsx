import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { obtenerAnimal, calcularEdad, PHOTO_FALLBACK } from "@/lib/animals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/catalogo/$id")({
  component: Detalle,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center"><p>Animal no encontrado. <Link to="/catalogo" className="text-primary underline">Volver</Link></p></div>
  ),
});

function Detalle() {
  const { id } = Route.useParams();
  const { data: a, isLoading, error } = useQuery({ queryKey: ["animal-public", id], queryFn: () => obtenerAnimal(id) });
  const [foto, setFoto] = useState(0);
  if (error) throw error;
  if (!isLoading && !a) throw notFound();

  if (isLoading || !a) return (
    <div className="min-h-screen flex flex-col"><SiteHeader />
      <div className="container mx-auto px-4 py-10"><Skeleton className="h-96 w-full" /></div>
      <SiteFooter />
    </div>
  );

  const fotos = a.photos.length ? a.photos : [PHOTO_FALLBACK];
  const mensaje = encodeURIComponent(`Hola, estoy interesado en ${a.name ?? a.tag_number} (${a.tag_number}) de Hacienda El Milagrito`);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10 flex-1">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-3">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-elevated">
              <img src={fotos[foto]} alt={a.name ?? a.tag_number} className="h-full w-full object-cover" />
            </div>
            {fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {fotos.map((f, i) => (
                  <button key={i} onClick={() => setFoto(i)} className={`h-16 w-16 rounded-md overflow-hidden border-2 shrink-0 ${i === foto ? "border-accent" : "border-transparent"}`}>
                    <img src={f} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-muted-foreground">{a.tag_number}</span>
              {a.for_sale && <Badge className="bg-accent text-accent-foreground">En venta</Badge>}
            </div>
            <h1 className="font-display text-5xl">{a.name ?? "Sin nombre"}</h1>
            <p className="text-muted-foreground capitalize">{a.breed} · {a.sex} · {calcularEdad(a.birth_date)}</p>

            <Card className="p-5 grid grid-cols-2 gap-4 text-sm">
              {a.color && <Info label="Color" value={a.color} />}
              {a.current_weight_kg && <Info label="Peso" value={`${a.current_weight_kg} kg`} />}
              {a.purpose && <Info label="Propósito" value={a.purpose} />}
              {a.location && <Info label="Ubicación" value={a.location} />}
              {a.sale_price && <Info label="Precio" value={`$${a.sale_price}`} />}
            </Card>

            {a.notes && <p className="text-sm text-muted-foreground italic">"{a.notes}"</p>}

            <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
              <a href={`https://wa.me/50370000000?text=${mensaje}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (<div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div><div className="font-medium capitalize">{value}</div></div>);
}
