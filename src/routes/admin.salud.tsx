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
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { useMemo, useState } from "react";
import { usePaginated } from "@/lib/usePagination";
import { Pager } from "@/components/ui/pager";
import { toast } from "sonner";
import { listarAnimales } from "@/lib/animals";
import {
  TIPOS_EVENTO,
  crearEvento,
  diasDesdeHoy,
  listarEventosRecientes,
  listarProximasVacunas,
  listarTratamientosActivos,
  marcarResuelto,
  tipoColor,
  tipoLabel,
} from "@/lib/health";

export const Route = createFileRoute("/admin/salud")({ component: Salud });

function Salud() {
  const qc = useQueryClient();
  const animalesQ = useQuery({ queryKey: ["animals"], queryFn: listarAnimales });
  const recientesQ = useQuery({
    queryKey: ["health", "recent"],
    queryFn: () => listarEventosRecientes(50),
  });
  const proximasQ = useQuery({
    queryKey: ["health", "upcoming"],
    queryFn: () => listarProximasVacunas(60),
  });
  const tratamientosQ = useQuery({
    queryKey: ["health", "active"],
    queryFn: listarTratamientosActivos,
  });

  const animalesActivos = useMemo(
    () => (animalesQ.data ?? []).filter((a) => a.status === "activo" || a.status === "en_tratamiento"),
    [animalesQ.data],
  );

  // ----- form state -----
  const [animalId, setAnimalId] = useState<string>("");
  const [tipo, setTipo] = useState<string>("vacuna");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [medicamento, setMedicamento] = useState("");
  const [dosis, setDosis] = useState("");
  const [veterinario, setVeterinario] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [proximaFecha, setProximaFecha] = useState("");
  const [costo, setCosto] = useState("");
  const [resuelto, setResuelto] = useState(true);

  function reset() {
    setTitulo("");
    setDescripcion("");
    setMedicamento("");
    setDosis("");
    setVeterinario("");
    setProximaFecha("");
    setCosto("");
    setResuelto(true);
  }

  const m = useMutation({
    mutationFn: crearEvento,
    onSuccess: () => {
      toast.success("Evento médico registrado");
      reset();
      qc.invalidateQueries({ queryKey: ["health"] });
    },
    onError: (e: Error) => toast.error(`No se pudo guardar: ${e.message}`),
  });

  const resolver = useMutation({
    mutationFn: marcarResuelto,
    onSuccess: () => {
      toast.success("Marcado como resuelto");
      qc.invalidateQueries({ queryKey: ["health"] });
    },
    onError: (e: Error) => toast.error(`No se pudo actualizar: ${e.message}`),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!animalId) {
      toast.error("Seleccione un animal");
      return;
    }
    if (!titulo.trim()) {
      toast.error("Ingrese un título descriptivo");
      return;
    }
    const requiereProxima = tipo === "vacuna" || tipo === "desparasitacion";
    m.mutate({
      animal_id: animalId,
      tipo,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      medicamento: medicamento.trim() || null,
      dosis: dosis.trim() || null,
      veterinario: veterinario.trim() || null,
      fecha,
      proxima_fecha: requiereProxima && proximaFecha ? proximaFecha : null,
      costo: costo ? Number(costo) : null,
      resuelto,
    });
  }

  // KPIs
  const totalProximas = (proximasQ.data ?? []).length;
  const totalAtrasadas = (proximasQ.data ?? []).filter((p) => diasDesdeHoy(p.proxima_fecha!) < 0).length;
  const totalTratamientos = (tratamientosQ.data ?? []).length;
  const eventosEsteMes = useMemo(() => {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    return (recientesQ.data ?? []).filter((e) => new Date(e.fecha) >= inicioMes).length;
  }, [recientesQ.data]);

  const historialPaged = usePaginated(recientesQ.data ?? []);

  const requiereProxima = tipo === "vacuna" || tipo === "desparasitacion";
  const requiereResuelto = tipo === "enfermedad" || tipo === "tratamiento" || tipo === "lesion";

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Salud y veterinaria</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vacunas, tratamientos, visitas del veterinario y desparasitaciones de la hacienda.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<CalendarClock className="h-5 w-5" />}
          label="Próximas (60 días)"
          value={totalProximas}
          tone="primary"
        />
        <KpiCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Vacunas atrasadas"
          value={totalAtrasadas}
          tone={totalAtrasadas > 0 ? "danger" : "muted"}
        />
        <KpiCard
          icon={<Activity className="h-5 w-5" />}
          label="Tratamientos activos"
          value={totalTratamientos}
          tone={totalTratamientos > 0 ? "warning" : "muted"}
        />
        <KpiCard
          icon={<Stethoscope className="h-5 w-5" />}
          label="Eventos este mes"
          value={eventosEsteMes}
          tone="muted"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form: nuevo evento */}
        <Card className="p-5 shadow-soft lg:col-span-1">
          <h2 className="font-display text-xl mb-4 flex items-center gap-2">
            <Syringe className="h-5 w-5 text-primary" /> Registrar evento médico
          </h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Animal</Label>
              <Select value={animalId} onValueChange={setAnimalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar animal" />
                </SelectTrigger>
                <SelectContent>
                  {animalesActivos.map((a) => (
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_EVENTO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Título</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Vacuna Aftosa, Mastitis, Visita rutinaria"
                required
              />
            </div>

            <div>
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                placeholder="Detalles, observaciones, síntomas…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Medicamento</Label>
                <Input
                  value={medicamento}
                  onChange={(e) => setMedicamento(e.target.value)}
                  placeholder="Ej. Ivermectina 1%"
                />
              </div>
              <div>
                <Label>Dosis</Label>
                <Input
                  value={dosis}
                  onChange={(e) => setDosis(e.target.value)}
                  placeholder="Ej. 5 ml IM"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div>
                <Label>{requiereProxima ? "Próxima dosis" : "Costo (US$)"}</Label>
                {requiereProxima ? (
                  <Input
                    type="date"
                    value={proximaFecha}
                    onChange={(e) => setProximaFecha(e.target.value)}
                    min={fecha}
                  />
                ) : (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costo}
                    onChange={(e) => setCosto(e.target.value)}
                    placeholder="0.00"
                  />
                )}
              </div>
            </div>

            {requiereProxima && (
              <div>
                <Label>Costo (US$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            <div>
              <Label>Veterinario</Label>
              <Input
                value={veterinario}
                onChange={(e) => setVeterinario(e.target.value)}
                placeholder="Nombre del profesional"
              />
            </div>

            {requiereResuelto && (
              <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                <input
                  id="resuelto"
                  type="checkbox"
                  checked={!resuelto}
                  onChange={(e) => setResuelto(!e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="resuelto" className="cursor-pointer">
                  Tratamiento aún en curso (no resuelto)
                </label>
              </div>
            )}

            <Button
              type="submit"
              variant="forest"
              className="w-full"
              disabled={m.isPending || animalesActivos.length === 0}
            >
              {m.isPending ? "Guardando…" : "Registrar evento"}
            </Button>
          </form>
        </Card>

        {/* Listas: próximas, tratamientos, historial */}
        <Card className="p-5 shadow-soft lg:col-span-2 overflow-hidden">
          <Tabs defaultValue="proximas">
            <TabsList className="mb-4">
              <TabsTrigger value="proximas">Próximas vacunas</TabsTrigger>
              <TabsTrigger value="activos">Tratamientos activos</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="proximas">
              {proximasQ.isLoading ? (
                <SkeletonRows />
              ) : proximasQ.data?.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="h-7 w-7" />}
                  title="Todo al día"
                  text="No hay vacunas ni desparasitaciones pendientes en los próximos 60 días."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Vacuna / Tratamiento</TableHead>
                      <TableHead>Próxima fecha</TableHead>
                      <TableHead className="text-right">Plazo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(proximasQ.data ?? []).map((p) => {
                      const dias = diasDesdeHoy(p.proxima_fecha!);
                      const atrasada = dias < 0;
                      const urgente = dias >= 0 && dias <= 7;
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            {p.animals?.name ?? "—"}{" "}
                            <span className="text-muted-foreground text-xs">
                              ({p.animals?.tag_number})
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tipoColor(p.tipo)}`}
                            >
                              {tipoLabel(p.tipo)}
                            </span>{" "}
                            {p.titulo}
                          </TableCell>
                          <TableCell>{p.proxima_fecha}</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={atrasada ? "destructive" : urgente ? "default" : "secondary"}
                            >
                              {atrasada
                                ? `Atrasada ${Math.abs(dias)}d`
                                : dias === 0
                                  ? "Hoy"
                                  : `En ${dias}d`}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="activos">
              {tratamientosQ.isLoading ? (
                <SkeletonRows />
              ) : tratamientosQ.data?.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="h-7 w-7" />}
                  title="Sin tratamientos activos"
                  text="Ningún animal está en tratamiento o con enfermedad pendiente."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Detalle</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(tratamientosQ.data ?? []).map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">
                          {t.animals?.name ?? "—"}{" "}
                          <span className="text-muted-foreground text-xs">
                            ({t.animals?.tag_number})
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tipoColor(t.tipo)}`}
                          >
                            {tipoLabel(t.tipo)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{t.titulo}</TableCell>
                        <TableCell>{t.fecha}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={resolver.isPending}
                            onClick={() => resolver.mutate(t.id)}
                          >
                            Marcar resuelto
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="historial">
              {recientesQ.isLoading ? (
                <SkeletonRows />
              ) : recientesQ.data?.length === 0 ? (
                <EmptyState
                  icon={<Stethoscope className="h-7 w-7" />}
                  title="Sin eventos registrados"
                  text="Comience registrando una vacuna o visita del veterinario."
                />
              ) : (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Animal</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Detalle</TableHead>
                        <TableHead className="text-right">Costo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historialPaged.items.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{e.fecha}</TableCell>
                          <TableCell className="font-medium">
                            {e.animals?.name ?? "—"}{" "}
                            <span className="text-muted-foreground text-xs">
                              ({e.animals?.tag_number})
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tipoColor(e.tipo)}`}
                            >
                              {tipoLabel(e.tipo)}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{e.titulo}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {e.costo != null ? `$${Number(e.costo).toFixed(2)}` : "—"}
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
  tone: "primary" | "danger" | "warning" | "muted";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-amber-500/10 text-amber-700",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${toneClass}`}>
          {icon}
        </div>
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

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
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
