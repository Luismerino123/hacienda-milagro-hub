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
import { formatFecha, getMesesRecientes } from "@/lib/utils";
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

function ReproBadge({ tipo }: { tipo: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${reproColor(tipo)}`}>
      {reproLabel(tipo)}
    </span>
  );
}

function Reproduccion() {
  const qc = useQueryClient();
  const animalesQ = useQuery({ queryKey: ["animals"], queryFn: listarAnimales });
  const recientesQ = useQuery({
    queryKey: ["repro", "recent"],
    queryFn: listarEventosReproRecientes,
  });
  const prenadasQ = useQuery({ queryKey: ["repro", "pregnant"], queryFn: listarPrenadas });
  const [mesFiltro, setMesFiltro] = useState(() => new Date().toISOString().slice(0, 7));
  const historialFiltrado = useMemo(
    () => (recientesQ.data ?? []).filter(e => e.fecha.startsWith(mesFiltro)),
    [recientesQ.data, mesFiltro],
  );
  const historialPaged = usePaginated(historialFiltrado);

  const animales = useMemo(() => animalesQ.data ?? [], [animalesQ.data]);
  const prenadas = useMemo(() => prenadasQ.data ?? [], [prenadasQ.data]);

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
    setAnimalId("");
    setToroId("");
    setTerneroId("");
    setVeterinario("");
    setNotas("");
    setCosto("");
  }

  const mutation = useMutation({
    mutationFn: crearEventoRepro,
    onSuccess: () => {
      toast.success("Evento reproductivo registrado");
      reset();
      qc.invalidateQueries({ queryKey: ["repro"] });
    },
    onError: (e: Error) => toast.error(`No se pudo guardar: ${e.message}`),
  });

  const mostrarToro = tipo === "monta" || tipo === "inseminacion" || tipo === "parto";
  const mostrarTernero = tipo === "parto";
  const calculaParto = tipo === "monta" || tipo === "inseminacion" || tipo === "prenez_confirmada";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!animalId) { toast.error("Seleccione una hembra"); return; }

    mutation.mutate({
      animal_id: animalId,
      tipo,
      fecha,
      fecha_estimada_parto: calculaParto ? estimarParto(fecha) : null,
      toro_id: mostrarToro && toroId ? toroId : null,
      ternero_id: mostrarTernero && terneroId ? terneroId : null,
      veterinario: veterinario.trim() || null,
      notas: notas.trim() || null,
      costo: costo ? Number(costo) : null,
    });
  }

  // KPIs — todos memoizados juntos para consistencia
  const kpis = useMemo(() => {
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    return {
      totalPrenadas: prenadas.length,
      proximosPartos30: prenadas.filter((p) => {
        if (!p.fecha_estimada_parto) return false;
        const d = diasDesdeHoy(p.fecha_estimada_parto);
        return d >= 0 && d <= 30;
      }).length,
      proximosPartos90: prenadas.filter((p) => {
        if (!p.fecha_estimada_parto) return false;
        const d = diasDesdeHoy(p.fecha_estimada_parto);
        return d >= 0 && d <= 90;
      }).length,
      celosUltimoMes: (recientesQ.data ?? []).filter(
        (e) => e.tipo === "celo" && new Date(e.fecha) >= hace30,
      ).length,
    };
  }, [prenadas, recientesQ.data]);

  const kpisLoading = prenadasQ.isLoading || recientesQ.isLoading;

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
        <KpiCard icon={<HeartHandshake className="h-5 w-5" />} label="Vacas preñadas" value={kpis.totalPrenadas} tone="primary" isLoading={kpisLoading} />
        <KpiCard icon={<CalendarHeart className="h-5 w-5" />} label="Partos próximos (30d)" value={kpis.proximosPartos30} tone={kpis.proximosPartos30 > 0 ? "warning" : "muted"} isLoading={kpisLoading} />
        <KpiCard icon={<CalendarHeart className="h-5 w-5" />} label="Partos próximos (90d)" value={kpis.proximosPartos90} tone="muted" isLoading={kpisLoading} />
        <KpiCard icon={<Heart className="h-5 w-5" />} label="Celos último mes" value={kpis.celosUltimoMes} tone="muted" isLoading={kpisLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="p-5 shadow-soft lg:col-span-1">
          <h2 className="font-display text-xl mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Registrar evento
          </h2>
          {animalesQ.isError ? (
            <p className="text-sm text-destructive">Error al cargar animales. Recarga la página.</p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label>Hembra</Label>
                <Select value={animalId} onValueChange={setAnimalId} disabled={animalesQ.isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={animalesQ.isLoading ? "Cargando…" : "Seleccionar hembra"} />
                  </SelectTrigger>
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
                    Parto estimado: <strong>{formatFecha(estimarParto(fecha))}</strong>
                  </p>
                )}
              </div>

              {mostrarToro && (
                <div>
                  <Label>Toro / padre (opcional)</Label>
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

              {mostrarTernero && (
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

              <Button
                type="submit"
                variant="forest"
                className="w-full"
                disabled={mutation.isPending || animalesQ.isLoading || hembras.length === 0}
              >
                {mutation.isPending ? "Guardando…" : "Registrar evento"}
              </Button>
            </form>
          )}
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
              ) : prenadasQ.isError ? (
                <ErrorState text="Error al cargar preñeces. Recarga la página." />
              ) : prenadas.length === 0 ? (
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
                    {prenadas.map((p) => {
                      const dias = p.fecha_estimada_parto ? diasDesdeHoy(p.fecha_estimada_parto) : null;
                      const inminente = dias !== null && dias <= 14 && dias >= 0;
                      const atrasada = dias !== null && dias < 0;
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            {p.animals?.name ?? "—"}{" "}
                            <span className="text-muted-foreground text-xs">({p.animals?.tag_number})</span>
                          </TableCell>
                          <TableCell><ReproBadge tipo={p.tipo} /></TableCell>
                          <TableCell>{formatFecha(p.fecha)}</TableCell>
                          <TableCell>{formatFecha(p.fecha_estimada_parto)}</TableCell>
                          <TableCell className="text-right">
                            {dias === null ? (
                              <Badge variant="secondary">—</Badge>
                            ) : (
                              <Badge variant={atrasada ? "destructive" : inminente ? "default" : "secondary"}>
                                {atrasada ? `${Math.abs(dias)}d atrás` : dias === 0 ? "Hoy" : `En ${dias}d`}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="historial">
              <div className="flex items-center justify-end mb-3">
                <Select value={mesFiltro} onValueChange={setMesFiltro}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {getMesesRecientes().map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {recientesQ.isLoading ? (
                <SkeletonRows />
              ) : recientesQ.isError ? (
                <ErrorState text="Error al cargar el historial. Recarga la página." />
              ) : historialFiltrado.length === 0 ? (
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
                          <TableCell>{formatFecha(e.fecha)}</TableCell>
                          <TableCell className="font-medium">
                            {e.animals?.name ?? "—"}{" "}
                            <span className="text-muted-foreground text-xs">({e.animals?.tag_number})</span>
                          </TableCell>
                          <TableCell><ReproBadge tipo={e.tipo} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {e.toro && <div>♂ {e.toro.name ?? e.toro.tag_number}</div>}
                            {e.ternero && <div>Ternero: {e.ternero.name ?? e.ternero.tag_number}</div>}
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
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "primary" | "warning" | "muted";
  isLoading?: boolean;
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
          {isLoading ? (
            <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <p className="font-display text-2xl">{value}</p>
          )}
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

function ErrorState({ text }: { text: string }) {
  return <p className="text-center py-8 text-sm text-destructive">{text}</p>;
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
