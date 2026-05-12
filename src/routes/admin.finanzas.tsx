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
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { usePaginated } from "@/lib/usePagination";
import { Pager } from "@/components/ui/pager";
import { toast } from "sonner";
import { listarAnimales } from "@/lib/animals";
import {
  CATEGORIAS_EGRESO,
  TIPOS_VENTA,
  categoriaLabel,
  crearEgreso,
  crearVenta,
  listarClientes,
  listarEgresos,
  listarVentas,
  resumenMensual,
} from "@/lib/finance";

export const Route = createFileRoute("/admin/finanzas")({ component: Finanzas });

function Finanzas() {
  const qc = useQueryClient();
  const ventasQ = useQuery({ queryKey: ["sales"], queryFn: () => listarVentas(100) });
  const egresosQ = useQuery({ queryKey: ["expenses"], queryFn: () => listarEgresos(100) });
  const clientesQ = useQuery({ queryKey: ["clients"], queryFn: listarClientes });
  const animalesQ = useQuery({ queryKey: ["animals"], queryFn: listarAnimales });
  const resumenQ = useQuery({ queryKey: ["finance", "summary", 6], queryFn: () => resumenMensual(6) });

  const ventasPaged = usePaginated(ventasQ.data ?? []);
  const egresosPaged = usePaginated(egresosQ.data ?? []);
  const clientesPaged = usePaginated(clientesQ.data ?? []);

  // KPIs (mes actual)
  const mesActual = new Date().toISOString().slice(0, 7);
  const ingresosMes = useMemo(
    () => (ventasQ.data ?? []).filter((v) => v.fecha.startsWith(mesActual)).reduce((s, v) => s + Number(v.total), 0),
    [ventasQ.data, mesActual],
  );
  const egresosMes = useMemo(
    () => (egresosQ.data ?? []).filter((e) => e.fecha.startsWith(mesActual)).reduce((s, e) => s + Number(e.monto), 0),
    [egresosQ.data, mesActual],
  );
  const netoMes = ingresosMes - egresosMes;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Ventas y finanzas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ingresos por leche y ganado, egresos operativos y resumen financiero.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<ArrowUpCircle className="h-5 w-5" />} label="Ingresos este mes" value={`$${ingresosMes.toFixed(2)}`} tone="primary" />
        <KpiCard icon={<ArrowDownCircle className="h-5 w-5" />} label="Egresos este mes" value={`$${egresosMes.toFixed(2)}`} tone="danger" />
        <KpiCard icon={<TrendingUp className="h-5 w-5" />} label="Neto este mes" value={`$${netoMes.toFixed(2)}`} tone={netoMes >= 0 ? "success" : "danger"} />
        <KpiCard icon={<DollarSign className="h-5 w-5" />} label="Clientes activos" value={(clientesQ.data ?? []).length.toString()} tone="muted" />
      </div>

      {/* Gráfico mensual */}
      <Card className="p-5 shadow-soft">
        <h2 className="font-display text-xl mb-3">Ingresos vs egresos (últimos 6 meses)</h2>
        <div className="h-64">
          {resumenQ.isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer>
              <BarChart data={resumenQ.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => `$${v.toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="ingresos" fill="var(--color-chart-1)" name="Ingresos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="egresos" fill="var(--color-chart-2)" name="Egresos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Tabs defaultValue="ventas">
        <TabsList>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="egresos">Egresos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="ventas" className="mt-4">
          <FormVenta clientes={clientesQ.data ?? []} animales={animalesQ.data ?? []} onSaved={() => qc.invalidateQueries({ queryKey: ["sales"] })} />
          <Card className="mt-6 shadow-soft overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="font-display text-xl">Historial de ventas</h2>
            </div>
            {ventasQ.isLoading ? (
              <SkeletonRows />
            ) : ventasQ.data?.length === 0 ? (
              <EmptyState text="Aún no se han registrado ventas." />
            ) : (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cliente / Detalle</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventasPaged.items.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.fecha}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{v.tipo}</Badge></TableCell>
                        <TableCell>
                          <div className="font-medium">{v.clients?.nombre ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            {v.animals && `${v.animals.name} (${v.animals.tag_number})`}
                            {v.descripcion && !v.animals && v.descripcion}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {v.cantidad ? `${v.cantidad} ${v.unidad ?? ""}` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">${Number(v.total).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pager page={ventasPaged.page} total={ventasPaged.totalPages} onChange={ventasPaged.setPage} />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="egresos" className="mt-4">
          <FormEgreso onSaved={() => qc.invalidateQueries({ queryKey: ["expenses"] })} />
          <Card className="mt-6 shadow-soft overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="font-display text-xl">Historial de egresos</h2>
            </div>
            {egresosQ.isLoading ? (
              <SkeletonRows />
            ) : egresosQ.data?.length === 0 ? (
              <EmptyState text="Aún no se han registrado egresos." />
            ) : (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {egresosPaged.items.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.fecha}</TableCell>
                        <TableCell><Badge variant="secondary">{categoriaLabel(e.categoria)}</Badge></TableCell>
                        <TableCell className="max-w-xs">{e.descripcion}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{e.proveedor ?? "—"}</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          -${Number(e.monto).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pager page={egresosPaged.page} total={egresosPaged.totalPages} onChange={egresosPaged.setPage} />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="mt-4">
          <Card className="shadow-soft overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="font-display text-xl">Clientes</h2>
              <p className="text-sm text-muted-foreground">
                Lista de compradores frecuentes de leche y ganado.
              </p>
            </div>
            {clientesQ.isLoading ? (
              <SkeletonRows />
            ) : clientesQ.data?.length === 0 ? (
              <EmptyState text="Aún no hay clientes registrados." />
            ) : (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Dirección</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesPaged.items.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.nombre}</TableCell>
                        <TableCell>{c.telefono ?? "—"}</TableCell>
                        <TableCell>{c.email ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{c.direccion ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pager page={clientesPaged.page} total={clientesPaged.totalPages} onChange={clientesPaged.setPage} />
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormVenta({
  clientes,
  animales,
  onSaved,
}: {
  clientes: Array<{ id: string; nombre: string }>;
  animales: Array<{ id: string; name: string | null; tag_number: string }>;
  onSaved: () => void;
}) {
  const [tipo, setTipo] = useState("leche");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [clientId, setClientId] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const total = (Number(cantidad) || 0) * (Number(precio) || 0);
  const unidad = tipo === "leche" ? "L" : tipo === "ganado" ? "cabeza" : "";

  const m = useMutation({
    mutationFn: crearVenta,
    onSuccess: () => {
      toast.success("Venta registrada");
      setCantidad(""); setPrecio(""); setDescripcion("");
      onSaved();
    },
    onError: (e: Error) => toast.error(`No se pudo guardar: ${e.message}`),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cant = Number(cantidad);
    const pre = Number(precio);
    if (!cant || !pre) { toast.error("Ingrese cantidad y precio"); return; }
    m.mutate({
      tipo,
      fecha,
      client_id: clientId || null,
      animal_id: tipo === "ganado" && animalId ? animalId : null,
      cantidad: cant,
      unidad,
      precio_unitario: pre,
      total: cant * pre,
      descripcion: descripcion.trim() || null,
    });
  }

  return (
    <Card className="p-5 shadow-soft">
      <h3 className="font-display text-lg mb-3 flex items-center gap-2">
        <Receipt className="h-5 w-5 text-primary" /> Registrar venta
      </h3>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Tipo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIPOS_VENTA.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fecha</Label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <Label>Cliente</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
            <SelectContent>
              {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {tipo === "ganado" && (
          <div>
            <Label>Animal vendido</Label>
            <Select value={animalId} onValueChange={setAnimalId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {animales.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name ?? "Sin nombre"} ({a.tag_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label>Cantidad {unidad && `(${unidad})`}</Label>
          <Input type="number" step="0.01" min="0" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0" required />
        </div>
        <div>
          <Label>Precio unitario (US$)</Label>
          <Input type="number" step="0.01" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0.00" required />
        </div>
        <div>
          <Label>Total calculado</Label>
          <Input value={`$${total.toFixed(2)}`} readOnly className="bg-muted font-semibold" />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Label>Descripción (opcional)</Label>
          <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalles adicionales" />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Button type="submit" variant="forest" disabled={m.isPending} className="w-full sm:w-auto">
            {m.isPending ? "Guardando…" : "Registrar venta"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function FormEgreso({ onSaved }: { onSaved: () => void }) {
  const [categoria, setCategoria] = useState("alimento");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [proveedor, setProveedor] = useState("");

  const m = useMutation({
    mutationFn: crearEgreso,
    onSuccess: () => {
      toast.success("Egreso registrado");
      setMonto(""); setDescripcion(""); setProveedor("");
      onSaved();
    },
    onError: (e: Error) => toast.error(`No se pudo guardar: ${e.message}`),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!Number(monto)) { toast.error("Ingrese un monto"); return; }
    if (!descripcion.trim()) { toast.error("Ingrese una descripción"); return; }
    m.mutate({
      categoria,
      fecha,
      monto: Number(monto),
      descripcion: descripcion.trim(),
      proveedor: proveedor.trim() || null,
    });
  }

  return (
    <Card className="p-5 shadow-soft">
      <h3 className="font-display text-lg mb-3 flex items-center gap-2">
        <ArrowDownCircle className="h-5 w-5 text-destructive" /> Registrar egreso
      </h3>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Categoría</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIAS_EGRESO.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fecha</Label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <Label>Monto (US$)</Label>
          <Input type="number" step="0.01" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" required />
        </div>
        <div>
          <Label>Proveedor (opcional)</Label>
          <Input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Nombre del proveedor" />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Label>Descripción</Label>
          <Textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Qué se compró o pagó" required />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Button type="submit" variant="forest" disabled={m.isPending} className="w-full sm:w-auto">
            {m.isPending ? "Guardando…" : "Registrar egreso"}
          </Button>
        </div>
      </form>
    </Card>
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
  value: string;
  tone: "primary" | "danger" | "success" | "muted";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    danger: "bg-destructive/10 text-destructive",
    success: "bg-emerald-500/10 text-emerald-700",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${toneClass}`}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-xl">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function SkeletonRows() {
  return (
    <div className="p-5 space-y-2">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="p-12 text-center text-muted-foreground">{text}</div>;
}
