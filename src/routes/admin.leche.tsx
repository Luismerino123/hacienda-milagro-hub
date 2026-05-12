import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useMemo, useState } from "react";
import { usePaginated } from "@/lib/usePagination";
import { Pager } from "@/components/ui/pager";
import { toast } from "sonner";
import { Milk } from "lucide-react";
import { listarAnimales } from "@/lib/animals";
import { agruparPorDia, listarOrdenosRecientes, listarUltimos30Dias, registrarOrdeno } from "@/lib/milk";

export const Route = createFileRoute("/admin/leche")({ component: Leche });

function Leche() {
  const qc = useQueryClient();
  const animalesQ = useQuery({ queryKey: ["animals"], queryFn: listarAnimales });
  const recientesQ = useQuery({ queryKey: ["milk", "recent"], queryFn: () => listarOrdenosRecientes(50) });
  const trendQ = useQuery({ queryKey: ["milk", "trend30"], queryFn: listarUltimos30Dias });

  const lecheras = useMemo(
    () => (animalesQ.data ?? []).filter(a => a.purpose === "lechera" && a.sex === "hembra" && a.status === "activo"),
    [animalesQ.data],
  );

  const [animalId, setAnimalId] = useState<string>("");
  const [turno, setTurno] = useState<"mañana" | "tarde">("mañana");
  const [litros, setLitros] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));

  const recientesPaged = usePaginated(recientesQ.data ?? []);

  const trend = useMemo(() => agruparPorDia((trendQ.data ?? []) as { fecha: string; litros: number }[]), [trendQ.data]);
  const totalHoy = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return (trendQ.data ?? []).filter(r => r.fecha === hoy).reduce((s, r) => s + Number(r.litros), 0);
  }, [trendQ.data]);

  const m = useMutation({
    mutationFn: registrarOrdeno,
    onSuccess: () => {
      toast.success("Ordeño registrado correctamente");
      setLitros("");
      qc.invalidateQueries({ queryKey: ["milk"] });
    },
    onError: (e: Error) => {
      const msg = e.message.includes("duplicate") || e.message.includes("unique")
        ? "Ya existe un registro para esa vaca, fecha y turno."
        : `No se pudo guardar: ${e.message}`;
      toast.error(msg);
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = animalId || lecheras[0]?.id;
    const l = parseFloat(litros);
    if (!id) { toast.error("Seleccione una vaca"); return; }
    if (!l || l <= 0) { toast.error("Ingrese una cantidad de litros válida"); return; }
    m.mutate({ animal_id: id, turno, litros: l, fecha });
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Producción de leche</h1>
        <p className="text-muted-foreground text-sm mt-1">Registre cada ordeño para mantener el control diario.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 shadow-soft">
          <h2 className="font-display text-xl mb-4 flex items-center gap-2">
            <Milk className="h-5 w-5 text-primary" /> Nuevo ordeño
          </h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Vaca</Label>
              <Select value={animalId || lecheras[0]?.id || ""} onValueChange={setAnimalId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {lecheras.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name ?? "Sin nombre"} ({a.tag_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Turno</Label>
                <Select value={turno} onValueChange={(v) => setTurno(v as "mañana" | "tarde")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mañana">Mañana</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha</Label>
                <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
              </div>
            </div>
            <div>
              <Label>Litros</Label>
              <Input type="number" step="0.1" min="0" value={litros} onChange={e => setLitros(e.target.value)} placeholder="Ej. 12.5" required />
            </div>
            <Button type="submit" variant="forest" className="w-full" disabled={m.isPending || lecheras.length === 0}>
              {m.isPending ? "Guardando…" : "Registrar ordeño"}
            </Button>
          </form>
        </Card>

        <Card className="p-5 lg:col-span-2 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl">Tendencia de los últimos 30 días</h2>
              <p className="text-xs text-muted-foreground">
                Hoy: <span className="font-semibold text-foreground">{totalHoy.toFixed(1)} L</span>
              </p>
            </div>
          </div>
          <div className="h-72">
            {trendQ.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="litros" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="shadow-soft overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-display text-xl">Registros recientes</h2>
        </div>
        {recientesQ.isLoading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vaca</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead className="text-right">Litros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recientesPaged.items.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.fecha}</TableCell>
                    <TableCell className="font-medium">
                      {r.animals?.name ?? "—"} <span className="text-muted-foreground text-xs">({r.animals?.tag_number})</span>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{r.turno}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">{Number(r.litros).toFixed(1)} L</TableCell>
                  </TableRow>
                ))}
                {recientesQ.data?.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Sin registros aún.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <Pager page={recientesPaged.page} total={recientesPaged.totalPages} onChange={recientesPaged.setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}