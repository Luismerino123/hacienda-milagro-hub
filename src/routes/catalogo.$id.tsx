import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { animales } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/catalogo/$id")({
  component: Detalle,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center"><p>Animal no encontrado. <Link to="/catalogo" className="text-primary underline">Volver</Link></p></div>
  ),
  loader: ({ params }) => {
    const a = animales.find(x => x.id === params.id);
    if (!a) throw notFound();
    return a;
  },
});

function Detalle() {
  const a = Route.useLoaderData();
  const edadAños = ((Date.now() - new Date(a.fechaNacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-3">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-elevated">
              <img src={a.foto} alt={a.nombre} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-muted-foreground">{a.arete}</span>
              {a.estado === "En venta" && <Badge className="bg-accent text-accent-foreground">En venta</Badge>}
              {a.estado === "Tratamiento" && <Badge variant="destructive">En tratamiento</Badge>}
            </div>
            <h1 className="font-display text-5xl">{a.nombre}</h1>
            <p className="text-muted-foreground">{a.raza} · {a.sexo} · {edadAños} años</p>

            <Card className="p-5 grid grid-cols-2 gap-4 text-sm">
              <Info label="Color" value={a.color} />
              <Info label="Peso" value={`${a.pesoKg} kg`} />
              <Info label="Propósito" value={a.proposito} />
              <Info label="Potrero" value={a.potrero} />
              {a.madre && <Info label="Madre" value={a.madre} />}
              {a.padre && <Info label="Padre" value={a.padre} />}
              {a.produccionPromedio && <Info label="Producción promedio" value={`${a.produccionPromedio} L/día`} />}
            </Card>

            {a.notas && <p className="text-sm text-muted-foreground italic">"{a.notas}"</p>}

            <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
              <a href={`https://wa.me/50370000000?text=Hola, me interesa ${a.nombre} (${a.arete})`} target="_blank" rel="noreferrer">
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
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
