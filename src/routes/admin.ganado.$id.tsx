import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { animales } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, QrCode } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ganado/$id")({
  loader: ({ params }) => {
    const a = animales.find(x => x.id === params.id);
    if (!a) throw notFound();
    return a;
  },
  component: Detalle,
});

function Detalle() {
  const a = Route.useLoaderData();
  return (
    <div className="space-y-6 max-w-6xl">
      <Link to="/admin/ganado" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Volver al registro</Link>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 p-5 shadow-soft">
          <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-muted">
            <img src={a.foto} alt={a.nombre} className="h-full w-full object-cover" />
          </div>
          <h1 className="font-display text-3xl">{a.nombre}</h1>
          <p className="font-mono text-sm text-muted-foreground">{a.arete}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge variant="secondary">{a.raza}</Badge>
            <Badge variant="secondary">{a.sexo}</Badge>
            <Badge className="bg-accent text-accent-foreground">{a.proposito}</Badge>
          </div>
          <Button variant="gold" className="w-full mt-5" onClick={() => toast.success(`QR de ${a.arete} generado`)}>
            <QrCode className="h-4 w-4" /> Generar QR
          </Button>
        </Card>

        <Card className="md:col-span-2 p-5 shadow-soft">
          <Tabs defaultValue="info">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="timeline">Línea de tiempo</TabsTrigger>
              <TabsTrigger value="salud">Salud</TabsTrigger>
              <TabsTrigger value="prod">Producción</TabsTrigger>
              <TabsTrigger value="repro">Reproducción</TabsTrigger>
              <TabsTrigger value="genealogia">Genealogía</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="grid grid-cols-2 gap-4 pt-4 text-sm">
              <Info label="Color" value={a.color} />
              <Info label="Peso" value={`${a.pesoKg} kg`} />
              <Info label="Fecha de nacimiento" value={a.fechaNacimiento} />
              <Info label="Potrero" value={a.potrero} />
              <Info label="Madre" value={a.madre ?? "—"} />
              <Info label="Padre" value={a.padre ?? "—"} />
              {a.produccionPromedio && <Info label="Producción promedio" value={`${a.produccionPromedio} L/día`} />}
              <Info label="Estado" value={a.estado} />
              {a.notas && <div className="col-span-2"><Info label="Notas" value={a.notas} /></div>}
            </TabsContent>
            <TabsContent value="timeline" className="pt-4 text-sm space-y-3">
              <Evento fecha={a.fechaNacimiento} txt={`Nacimiento de ${a.nombre}`} />
              <Evento fecha="2024-08-15" txt="Vacuna brucelosis aplicada" />
              <Evento fecha="2024-11-02" txt="Desparasitación general" />
              <Evento fecha="2025-02-10" txt="Chequeo veterinario rutinario" />
            </TabsContent>
            <TabsContent value="salud" className="pt-4 text-sm text-muted-foreground">Sin eventos de salud recientes.</TabsContent>
            <TabsContent value="prod" className="pt-4 text-sm text-muted-foreground">{a.produccionPromedio ? `Producción promedio: ${a.produccionPromedio} L/día.` : "Animal no productor."}</TabsContent>
            <TabsContent value="repro" className="pt-4 text-sm text-muted-foreground">Sin eventos reproductivos.</TabsContent>
            <TabsContent value="genealogia" className="pt-4">
              <div className="flex items-center justify-around text-center">
                <div><div className="text-xs text-muted-foreground">Padre</div><div className="font-medium mt-1">{a.padre ?? "—"}</div></div>
                <div className="px-6"><div className="h-px w-12 bg-border" /></div>
                <div><div className="text-xs text-muted-foreground">Madre</div><div className="font-medium mt-1">{a.madre ?? "—"}</div></div>
              </div>
              <div className="text-center mt-6 pt-6 border-t">
                <div className="text-xs text-muted-foreground">Animal</div>
                <div className="font-display text-xl">{a.nombre}</div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (<div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div><div className="font-medium">{value}</div></div>);
}
function Evento({ fecha, txt }: { fecha: string; txt: string }) {
  return (<div className="flex gap-3"><div className="text-xs text-muted-foreground w-24 shrink-0">{fecha}</div><div className="flex-1 border-l-2 border-accent pl-3">{txt}</div></div>);
}
