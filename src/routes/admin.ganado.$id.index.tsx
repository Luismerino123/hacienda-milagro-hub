import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { obtenerAnimal, eliminarAnimal, calcularEdad, PHOTO_FALLBACK, listarAnimales } from "@/lib/animals";
import { listarEventosDeAnimal, tipoColor, tipoLabel } from "@/lib/health";
import { listarEventosReproDeAnimal, reproColor, reproLabel } from "@/lib/reproduction";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, QrCode, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/admin/ganado/$id/")({
  component: Detalle,
  errorComponent: ErrorDetalle,
  pendingComponent: () => <div className="p-8 text-muted-foreground">Cargando ficha del animal…</div>,
});

function ErrorDetalle({ error }: { error: Error }) {
  return (
    <Card className="p-6 border-destructive/30 bg-destructive/5 max-w-3xl">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
        <div>
          <h2 className="font-display text-xl text-destructive">No se pudo cargar este animal</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Detalle del error abajo. Si persiste, revise la consola del navegador (F12).
          </p>
        </div>
      </div>
      <pre className="text-xs bg-background p-3 rounded border overflow-x-auto whitespace-pre-wrap">
        {error.message}
        {"\n\n"}
        {error.stack ?? ""}
      </pre>
      <div className="mt-3">
        <Link to="/admin/ganado" className="text-sm text-primary hover:underline">← Volver al registro</Link>
      </div>
    </Card>
  );
}

function Detalle() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: a, isLoading, error } = useQuery({ queryKey: ["animal", id], queryFn: () => obtenerAnimal(id) });
  const { data: todos } = useQuery({ queryKey: ["animals"], queryFn: listarAnimales });
  const { data: eventos } = useQuery({ queryKey: ["health", "animal", id], queryFn: () => listarEventosDeAnimal(id) });
  const { data: reproEventos } = useQuery({ queryKey: ["repro", "animal", id], queryFn: () => listarEventosReproDeAnimal(id) });
  const [foto, setFoto] = useState(0);

  if (error) throw error;
  if (!isLoading && !a) throw notFound();

  if (isLoading || !a) return <Skeleton className="h-96 max-w-6xl" />;

  const madre = todos?.find(x => x.id === a.mother_id);
  const padre = todos?.find(x => x.id === a.father_id);
  const hijos = todos?.filter(x => x.mother_id === a.id || x.father_id === a.id) ?? [];
  const fotos = a.photos.length ? a.photos : [PHOTO_FALLBACK];

  async function handleDelete() {
    try {
      await eliminarAnimal(id);
      toast.success("Animal eliminado");
      qc.invalidateQueries({ queryKey: ["animals"] });
      navigate({ to: "/admin/ganado" });
    } catch (e: any) { toast.error("No se pudo eliminar: " + e.message); }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Link to="/admin/ganado" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Volver al registro</Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-5 shadow-soft">
          <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-muted">
            <img src={fotos[foto]} alt={a.name ?? a.tag_number} className="h-full w-full object-cover" />
          </div>
          {fotos.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {fotos.map((f, i) => (
                <button key={i} onClick={() => setFoto(i)} className={`h-14 w-14 rounded-md overflow-hidden border-2 shrink-0 ${i === foto ? "border-accent" : "border-transparent"}`}>
                  <img src={f} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <h1 className="font-display text-3xl">{a.name ?? "Sin nombre"}</h1>
          <p className="font-mono text-sm text-muted-foreground">{a.tag_number}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge variant="secondary">{a.breed}</Badge>
            <Badge variant="secondary" className="capitalize">{a.sex}</Badge>
            <Badge variant="secondary">{calcularEdad(a.birth_date)}</Badge>
            <Badge className="bg-primary/15 text-primary capitalize" variant="secondary">{a.status.replace("_", " ")}</Badge>
            {a.for_sale && <Badge className="bg-accent text-accent-foreground">En venta</Badge>}
          </div>
          <div className="mt-5 grid gap-2">
            <Button asChild variant="forest"><Link to="/admin/ganado/$id/editar" params={{ id }}><Pencil className="h-4 w-4" /> Editar</Link></Button>
            <Button variant="gold" onClick={() => toast.info("Generador de QR — próximamente")}><QrCode className="h-4 w-4" /> Generar QR</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /> Eliminar</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar este animal?</AlertDialogTitle>
                  <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará {a.name ?? a.tag_number} permanentemente.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Sí, eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5 shadow-soft">
          <Tabs defaultValue="info">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="genealogia">Genealogía</TabsTrigger>
              <TabsTrigger value="timeline">Línea de tiempo</TabsTrigger>
              <TabsTrigger value="salud">Salud</TabsTrigger>
              <TabsTrigger value="prod">Producción</TabsTrigger>
              <TabsTrigger value="repro">Reproducción</TabsTrigger>
              <TabsTrigger value="fotos">Fotos</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="grid grid-cols-2 gap-4 pt-4 text-sm">
              <Info label="Color" value={a.color ?? "—"} />
              <Info label="Peso actual" value={a.current_weight_kg ? `${a.current_weight_kg} kg` : "—"} />
              <Info label="Peso al nacer" value={a.birth_weight_kg ? `${a.birth_weight_kg} kg` : "—"} />
              <Info label="Fecha de nacimiento" value={a.birth_date} />
              <Info label="Ubicación" value={a.location ?? "—"} />
              <Info label="Propósito" value={a.purpose ?? "—"} />
              {a.for_sale && <Info label="Precio de venta" value={a.sale_price ? `$${a.sale_price}` : "—"} />}
              {a.notes && <div className="col-span-2"><Info label="Notas" value={a.notes} /></div>}
            </TabsContent>
            <TabsContent value="genealogia" className="pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Linaje titulo="Madre" animal={madre} />
                <Linaje titulo="Padre" animal={padre} />
              </div>
              <div className="text-center py-4 border-y">
                <div className="text-xs text-muted-foreground">Animal</div>
                <div className="font-display text-2xl">{a.name ?? a.tag_number}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Hijos ({hijos.length})</div>
                {hijos.length === 0 ? <p className="text-sm text-muted-foreground">No tiene crías registradas.</p> :
                  <div className="grid sm:grid-cols-2 gap-2">
                    {hijos.map(h => (
                      <Link key={h.id} to="/admin/ganado/$id" params={{ id: h.id }} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                        <img src={h.photos[0] || PHOTO_FALLBACK} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <div className="text-sm"><div className="font-medium">{h.name ?? "—"}</div><div className="text-xs text-muted-foreground">{h.tag_number}</div></div>
                      </Link>
                    ))}
                  </div>}
              </div>
            </TabsContent>
            <TabsContent value="timeline" className="pt-4 text-sm space-y-3">
              {[
                ...(eventos ?? []).map((e) => ({
                  id: e.id,
                  fecha: e.fecha,
                  txt: `${tipoLabel(e.tipo)}: ${e.titulo}${e.descripcion ? ` — ${e.descripcion}` : ""}`,
                })),
                ...(reproEventos ?? []).map((e) => ({
                  id: e.id,
                  fecha: e.fecha,
                  txt: `${reproLabel(e.tipo)}${e.notas ? ` — ${e.notas}` : ""}`,
                })),
              ]
                .sort((x, y) => y.fecha.localeCompare(x.fecha))
                .map((ev) => (
                  <Evento key={ev.id} fecha={ev.fecha} txt={ev.txt} />
                ))}
              <Evento fecha={a.birth_date} txt={`Nacimiento de ${a.name ?? a.tag_number}`} />
              {(eventos?.length ?? 0) === 0 && (reproEventos?.length ?? 0) === 0 && (
                <p className="text-muted-foreground text-xs italic pl-3">
                  Aún no hay eventos. Registralos desde Salud o Reproducción.
                </p>
              )}
            </TabsContent>
            <TabsContent value="salud" className="pt-4 space-y-3">
              {!eventos ? (
                <Skeleton className="h-32 w-full" />
              ) : eventos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin eventos médicos registrados para este animal.</p>
              ) : (
                <div className="space-y-2">
                  {eventos.map((e) => (
                    <div key={e.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tipoColor(e.tipo)}`}>
                          {tipoLabel(e.tipo)}
                        </span>
                        <span className="font-medium">{e.titulo}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{e.fecha}</span>
                      </div>
                      {e.descripcion && <p className="text-muted-foreground text-xs mb-1">{e.descripcion}</p>}
                      <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
                        {e.medicamento && <span>💊 {e.medicamento}{e.dosis ? ` · ${e.dosis}` : ""}</span>}
                        {e.veterinario && <span>👨‍⚕️ {e.veterinario}</span>}
                        {e.proxima_fecha && <span>📅 Próxima: {e.proxima_fecha}</span>}
                        {e.costo != null && <span>💵 ${Number(e.costo).toFixed(2)}</span>}
                        {!e.resuelto && <Badge variant="destructive" className="text-[10px]">En curso</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="prod" className="pt-4 text-sm text-muted-foreground">Próximamente: registro de producción de leche.</TabsContent>
            <TabsContent value="repro" className="pt-4 space-y-3">
              {!reproEventos ? (
                <Skeleton className="h-32 w-full" />
              ) : reproEventos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin eventos reproductivos registrados.</p>
              ) : (
                <div className="space-y-2">
                  {reproEventos.map((e) => (
                    <div key={e.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${reproColor(e.tipo)}`}>
                          {reproLabel(e.tipo)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">{e.fecha}</span>
                      </div>
                      <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
                        {e.toro && <span>♂ Toro: {e.toro.name ?? e.toro.tag_number}</span>}
                        {e.ternero && <span>🐄 Ternero: {e.ternero.name ?? e.ternero.tag_number}</span>}
                        {e.fecha_estimada_parto && <span>📅 Parto estimado: {e.fecha_estimada_parto}</span>}
                        {e.veterinario && <span>👨‍⚕️ {e.veterinario}</span>}
                      </div>
                      {e.notas && <p className="text-muted-foreground text-xs mt-1">{e.notas}</p>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="fotos" className="pt-4">
              {a.photos.length === 0 ? <p className="text-sm text-muted-foreground">No hay fotos cargadas.</p> :
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {a.photos.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener" className="aspect-square rounded-lg overflow-hidden border block hover:opacity-90">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>}
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
function Linaje({ titulo, animal }: { titulo: string; animal?: { id: string; name: string | null; tag_number: string; photos: string[] } }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{titulo}</div>
      {animal ? (
        <Link to="/admin/ganado/$id" params={{ id: animal.id }} className="inline-flex flex-col items-center gap-2 hover:opacity-80">
          <img src={animal.photos[0] || PHOTO_FALLBACK} alt="" className="h-14 w-14 rounded-full object-cover" />
          <div className="text-sm"><div className="font-medium">{animal.name ?? "—"}</div><div className="text-xs text-muted-foreground">{animal.tag_number}</div></div>
        </Link>
      ) : <div className="text-sm text-muted-foreground py-4">Sin asignar</div>}
    </div>
  );
}
