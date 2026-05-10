import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowRight,
  Baby,
  Beef,
  Bell,
  HeartHandshake,
  HeartPulse,
  Milk,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listarAnimales, calcularEdad, PHOTO_FALLBACK } from "@/lib/animals";
import { agruparPorDia, listarUltimos30Dias, topProductoras } from "@/lib/milk";
import { resumenMensual } from "@/lib/finance";
import {
  diasDesdeHoy,
  listarProximasVacunas,
  listarTratamientosActivos,
} from "@/lib/health";
import { listarPrenadas } from "@/lib/reproduction";
import { useMemo } from "react";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const animalesQ = useQuery({ queryKey: ["animals"], queryFn: listarAnimales });
  const trendQ = useQuery({ queryKey: ["milk", "trend30"], queryFn: listarUltimos30Dias });
  const finanzasQ = useQuery({ queryKey: ["finance", "summary", 6], queryFn: () => resumenMensual(6) });
  const vacunasQ = useQuery({ queryKey: ["health", "upcoming"], queryFn: () => listarProximasVacunas(60) });
  const tratamientosQ = useQuery({ queryKey: ["health", "active"], queryFn: listarTratamientosActivos });
  const prenadasQ = useQuery({ queryKey: ["repro", "pregnant"], queryFn: listarPrenadas });

  const animales = animalesQ.data ?? [];
  const trendRows = (trendQ.data ?? []) as { fecha: string; litros: number; animal_id: string }[];

  const kpis = useMemo(() => {
    const total = animales.length;
    const enProduccion = animales.filter(a => a.purpose === "lechera" && a.sex === "hembra" && a.status === "activo").length;
    const terneros = animales.filter(a => {
      const edad = (Date.now() - new Date(a.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
      return edad < 1;
    }).length;
    const prenadas = (prenadasQ.data ?? []).length;
    const enTratamiento = animales.filter(a => a.status === "en_tratamiento").length + (tratamientosQ.data?.length ?? 0);
    return [
      { label: "Total cabezas", value: total, icon: Beef, color: "text-primary" },
      { label: "Vacas en producción", value: enProduccion, icon: Milk, color: "text-chart-1" },
      { label: "Terneros", value: terneros, icon: Baby, color: "text-accent" },
      { label: "Preñadas", value: prenadas, icon: HeartHandshake, color: "text-pink-600" },
      { label: "En tratamiento", value: enTratamiento, icon: HeartPulse, color: "text-destructive" },
    ];
  }, [animales, prenadasQ.data, tratamientosQ.data]);

  const trend = useMemo(() => agruparPorDia(trendRows), [trendRows]);
  const litrosHoy = trend[trend.length - 1]?.litros ?? 0;

  const top = useMemo(
    () => topProductoras(trendRows, animales.map(a => ({ id: a.id, name: a.name, tag_number: a.tag_number }))),
    [trendRows, animales],
  );

  const enVenta = animales.filter(a => a.for_sale).slice(0, 5);

  // Alertas urgentes (atrasadas + esta semana + tratamientos activos + partos en 14 días)
  const alertasUrgentes = useMemo(() => {
    const atrasadas = (vacunasQ.data ?? []).filter(v => diasDesdeHoy(v.proxima_fecha!) < 0).length;
    const semana = (vacunasQ.data ?? []).filter(v => {
      const d = diasDesdeHoy(v.proxima_fecha!);
      return d >= 0 && d <= 7;
    }).length;
    const partos = (prenadasQ.data ?? []).filter(p => {
      const d = diasDesdeHoy(p.fecha_estimada_parto!);
      return d >= -7 && d <= 14;
    }).length;
    const trat = tratamientosQ.data?.length ?? 0;
    return atrasadas + semana + partos + trat;
  }, [vacunasQ.data, prenadasQ.data, tratamientosQ.data]);

  const loading = animalesQ.isLoading || trendQ.isLoading;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Resumen general de la hacienda.</p>
        </div>
        {alertasUrgentes > 0 && (
          <Link
            to="/admin/alertas"
            className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-4 py-2 text-sm hover:bg-destructive/20 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="font-semibold">{alertasUrgentes}</span> alertas requieren atención
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map(k => (
          <Card key={k.label} className="p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="text-3xl font-display mt-1">
                  {loading ? <Skeleton className="h-8 w-12" /> : k.value}
                </div>
              </div>
              <div className={`h-11 w-11 rounded-lg bg-muted flex items-center justify-center ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl">Producción de leche (últimos 30 días)</h2>
              <p className="text-xs text-muted-foreground">
                Hoy: <span className="font-semibold text-foreground">{litrosHoy.toFixed(1)} L</span>
              </p>
            </div>
            <Link to="/admin/leche" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Ir a ordeño <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-64">
            {loading ? <Skeleton className="h-full w-full" /> : (
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

        <Card className="p-5 shadow-soft">
          <h2 className="font-display text-xl mb-4">Top 5 productoras</h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : top.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay registros de ordeño.</p>
          ) : (
            <ul className="space-y-3">
              {top.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center text-sm font-bold">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{a.nombre}</div>
                    <div className="text-xs text-muted-foreground">{a.arete}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{a.promedio}</div>
                    <div className="text-xs text-muted-foreground">L/día</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Ingresos vs Egresos (últimos 6 meses)</h2>
            <Link to="/admin/finanzas" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Ir a finanzas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-64">
            {finanzasQ.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer>
                <BarChart data={finanzasQ.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                    formatter={(v: number) => `$${v.toFixed(2)}`}
                  />
                  <Legend />
                  <Bar dataKey="ingresos" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="egresos" fill="var(--color-chart-5)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card className="p-5 shadow-soft">
          <h2 className="font-display text-xl mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" /> En venta
          </h2>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : enVenta.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin animales publicados en venta.</p>
          ) : (
            <ul className="space-y-3">
              {enVenta.map(a => (
                <li key={a.id} className="flex items-center gap-3">
                  <img src={a.photos?.[0] ?? PHOTO_FALLBACK} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{a.name ?? "Sin nombre"}</div>
                    <div className="text-xs text-muted-foreground">{a.breed} · {calcularEdad(a.birth_date)}</div>
                  </div>
                  {a.sale_price && <Badge className="bg-accent text-accent-foreground">${a.sale_price}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
