import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, CalendarHeart, HeartHandshake, Heart, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { usePaginated } from "@/lib/usePagination";
import { Pager } from "@/components/ui/pager";
import { toast } from "sonner";
import { listarAnimales } from "@/lib/animals";
import {
  TIPOS_REPRO,
  crearEventoRepro,
  diasDesdeHoy,
  estimarParto,
  listarEventosReproRecientes,
  listarPrenadas,
  reproColor,
  reproLabel,
} from "@/lib/reproduction";

export const Route = createFileRoute("/admin/reproduccion")({ component: Reproduccion });

function Reproduccion() {
  const qc = useQueryClient();
  const animalesQ = useQuery({ queryKey: ["animals"], queryFn: listarAnimales });
  const recientesQ = useQuery({
    queryKey: ["repro", "recent"],
    queryFn: () => listarEventosReproRecientes(50),
  });
  const prenadasQ = useQuery({ queryKey: ["repro", "pregnant"], queryFn: listarPrenadas });
  const historialPaged = usePaginated(recientesQ.data ?? []);

  const animales = animalesQ.data ?? [];
  const hembras = useMemo(
    () => animales.filter((a) => a.sex === "hembra" && a.status !== "fallecido" && a.status !== "vendido"),
    [animales],
  );
  const machos = useMemo(
    () => animales.filter((a) => a.sex === "macho" && a.status !== "fallecido"),
    [animales],
  );

  // ----- form state -----
  const [animalId, setAnimalId] = useState<string>("");
  const [tipo, setTipo] = useState<string>("celo");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [toroId, setToroId] = useState<string>("");
  const [terneroId, setTerneroId] = useState<string>("");
  const [veterinario, setVeterinario] = useState("");
  const [notas, setNotas] = useState("");
  const [costo, setCosto] = useState("");

  function reset() {
    setNotas("");
    setVeterinario("");
    setCosto("");
    setToroId("");
    setTerneroId("");
  }

  const m = useMutation({
    mutationFn: crearEventoRepro,
    onSuccess: () => {
      toast.success("Evento reproductivo registrado");
      reset();
      qc.invalidateQueries({ queryKey: ["repro"] });
    },
    onError: (e: Error) => toast.error(`No se pudo guardar: ${e.message}`),
  });

  const requiereToro = tipo === "monta" || tipo === "inseminacion" || tipo === "parto";
  const requiereTernero = tipo === "parto";
  const calculaParto = tipo === "monta" || tipo === "inseminacion" || tipo === "prenez_confirmada";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!animalId) { toast.error("Seleccione una hembra"); return; }

    const fechaEstimada = calculaParto ? estimarParto(fecha) : null;

    m.mutate({
      animal_id: animalId,
      tipo,
      fecha,
      fecha_estimada_parto: fechaEstimada,
      toro_id: requiereToro && toroId ? toroId : null,
      ternero_id: requiereTernero && terneroId ? terneroId : null,
      veterinario: veterinario.trim() || null,
      notas: notas.trim() || null,
      costo: costo ? Number(costo) : null,
    });
  }

  // KPIs
  const totalPrenadas = (prenadasQ.data ?? []).length;
  const proximosPartos30 = (prenadasQ.data ?? []).filter(
    (p) => diasDesdeHoy(p.fecha_estimada_parto!) <= 30 && diasDesdeHoy(p.fecha_estimada_parto!) >= 0,
  ).length;
  const proximosPartos90 = (prenadasQ.data ?? []).filter(
    (p) => diasDesdeHoy(p.fecha_estimada_parto!) <= 90 && diasDesdeHoy(p.fecha_estimada_parto!) >= 0,
  ).length;
  const celosUltimoMes = useMemo(() => {
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    return (recientesQ.data ?? []).filter(
      (e) => e.tipo === "celo" && new Date(e.fecha) >= hace30,
    ).length;
  }, [recientesQ.data]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Reproducción</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Celos, montas, inseminaciones, preñeces y partos.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<HeartHandshake className="h-5 w-5" />} label="Vacas preñadas" value={totalPrenadas} tone="primary" />
        <KpiCard icon={<CalendarHeart className="h-5 w-5" />} label="Partos próximos (30d)" value={proximosPartos30} tone={proximosPartos30 > 0 ? "warning" : "muted"} />
        <KpiCard icon={<CalendarHeart className="h-5 w-5" />} label="Partos próximos (90d)" value={proximosPartos90} tone="muted" />
        <KpiCard icon={<Heart className="h-5 w-5" />} label="Celos último mes" value={celosUltimoMes} tone="muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="p-5 shadow-soft lg:col-span-1">
          <h2 className="font-display text-xl mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Registrar evento
          </h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Hembra</Label>
              <Select value={animalId} onValueChange={setAnimalId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar hembra" /></SelectTrigger>
                <SelectContent>
                  {hembras.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name ?? "Sin nombre"} ({a.tag_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de evento</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS_REPRO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha</Label>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
              {calculaParto && (
                <p className="text-xs text-muted-foreground mt-1">
                  Parto estimado: <strong>{estimarParto(fecha)}</strong>
                </p>
              )}
            </div>

            {requiereToro && (
              <div>
                <Label>Toro / padre</Label>
                <Select value={toroId} onValueChange={setToroId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {machos.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name ?? "Sin nombre"} ({a.tag_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {requiereTernero && (
              <div>
                <Label>Ternero (registrado)</Label>
                <Select value={terneroId} onValueChange={setTerneroId}>
                  <SelectTrigger><SelectValue placeholder="Vincular ternero (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {animales.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name ?? "Sin nombre"} ({a.tag_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Si el ternero aún no está registrado, primero créalo en <em>Ganado → Agregar animal</em>.
                </p>
              </div>
            )}

            <div>
              <Label>Veterinario (opcional)</Label>
              <Input value={veterinario} onChange={(e) => setVeterinario(e.target.value)} placeholder="Nombre del profesional" />
            </div>

            <div>
              <Label>Costo (US$, opcional)</Label>
              <Input type="number" step="0.01" min="0" value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="0.00" />
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Detalles del evento" />
            </div>

            <Button type="submit" variant="forest" className="w-full" disabled={m.isPending || hembras.length === 0}>
              {m.isPending ? "Guardando…" : "Registrar evento"}
            </Button>
          </form>
        </Card>

        {/* Tabs */}
        <Card className="p-5 shadow-soft lg:col-span-2 overflow-hidden">
          <Tabs defaultValue="prenadas">
            <TabsList className="mb-4">
              <TabsTrigger value="prenadas">Preñadas activas</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="prenadas">
              {prenadasQ.isLoading ? (
                <SkeletonRows />
              ) : prenadasQ.data?.length === 0 ? (
                <EmptyState
                  icon={<Baby className="h-7 w-7" />}
                  title="Sin preñeces activas"
                  text="Cuando registres una monta, inseminación o preñez confirmada, aparecerá aquí."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaca</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Parto estimado</TableHead>
                      <TableHead className="text-right">Plazo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(prenadasQ.data ?? []).map((p) => {
                      const dias = diasDesdeHoy(p.fecha_estimada_parto!);
                      const inminente = dias <= 14 && dias >= 0;
                      const atrasada = dias < 0;
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            {p.animals?.name ?? "—"}{" "}
                            <span className="text-muted-foreground text-xs">({p.animals?.tag_number})</span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${reproColor(p.tipo)}`}>
                              {reproLabel(p.tipo)}
                            </span>
                          </TableCell>
                          <TableCell>{p.fecha}</TableCell>
                          <TableCell>{p.fecha_estimada_parto}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={atrasada ? "destructive" : inminente ? "default" : "secondary"}>
                              {atrasada ? `${Math.abs(dias)}d atrás` : dias === 0 ? "Hoy" : `En ${dias}d`}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="historial">
              {recientesQ.isLoading ? (
                <SkeletonRows />
              ) : recientesQ.data?.length === 0 ? (
                <EmptyState
                  icon={<Heart className="h-7 w-7" />}
                  title="Sin eventos"
                  text="Comience registrando un celo, monta o inseminación."
                />
              ) : (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hembra</TableHead>
                        <TableHead>Evento</TableHead>
                        <TableHead>Toro / Ternero</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historialPaged.items.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{e.fecha}</TableCell>
                          <TableCell className="font-medium">
                            {e.animals?.name ?? "—"}{" "}
                            <span className="text-muted-foreground text-xs">({e.animals?.tag_number})</span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${reproColor(e.tipo)}`}>
                              {reproLabel(e.tipo)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {e.toro && <div>♂ {e.toro.name ?? e.toro.tag_number}</div>}
                            {e.ternero && <div>🐄 {e.ternero.name ?? e.ternero.tag_number}</div>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pager page={historialPaged.page} total={historialPaged.totalPages} onChange={historialPaged.setPage} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "primary" | "warning" | "muted";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-amber-500/10 text-amber-700",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${toneClass}`}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-2xl">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-14 w-14 rounded-full bg-accent/15 text-accent flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-display text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{text}</p>
    </div>
  );
}
