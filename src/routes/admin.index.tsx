import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { animales, totalCabezas, vacasProduccion, terneros, prenadas, produccionDiaria, topProductoras, proximasVacunas, proximosPartos, ingresosVsEgresos, alertas } from "@/data/mock";
import { Beef, Milk, Baby, HeartPulse, AlertTriangle } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const kpis = [
  { label: "Total cabezas", value: totalCabezas, icon: Beef, color: "text-primary" },
  { label: "Vacas en producción", value: vacasProduccion, icon: Milk, color: "text-chart-1" },
  { label: "Terneros", value: terneros, icon: Baby, color: "text-accent" },
  { label: "Vacas preñadas", value: prenadas, icon: HeartPulse, color: "text-destructive" },
];

function Dashboard() {
  const litrosHoy = produccionDiaria[produccionDiaria.length - 1].litros;
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Resumen del hato y la producción del día.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k => (
          <Card key={k.label} className="p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="text-3xl font-display mt-1">{k.value}</div>
              </div>
              <div className={`h-11 w-11 rounded-lg bg-muted flex items-center justify-center ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Producción */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl">Producción de leche (últimos 30 días)</h2>
              <p className="text-xs text-muted-foreground">Hoy: <span className="font-semibold text-foreground">{litrosHoy} L</span></p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={produccionDiaria}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="litros" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-soft">
          <h2 className="font-display text-xl mb-4">Top 5 productoras</h2>
          <ul className="space-y-3">
            {topProductoras.map((a, i) => (
              <li key={a.id} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center text-sm font-bold">{i + 1}</div>
                <img src={a.foto} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.nombre}</div>
                  <div className="text-xs text-muted-foreground">{a.arete}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{a.produccionPromedio}</div>
                  <div className="text-xs text-muted-foreground">L/día</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Finanzas + alertas */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 shadow-soft">
          <h2 className="font-display text-xl mb-4">Ingresos vs Egresos (últimos 6 meses)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={ingresosVsEgresos}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="ingresos" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="egresos" fill="var(--color-chart-5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 shadow-soft">
          <h2 className="font-display text-xl mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-accent" /> Alertas</h2>
          <ul className="space-y-3 text-sm">
            {alertas.map((a, i) => (
              <li key={i} className="border-l-2 pl-3 py-1" style={{ borderColor: a.nivel === "alta" ? "var(--color-destructive)" : a.nivel === "media" ? "var(--color-accent)" : "var(--color-border)" }}>
                <div className="font-medium">{a.tipo}</div>
                <div className="text-xs text-muted-foreground">{a.mensaje}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Próximas vacunas y partos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-5 shadow-soft">
          <h2 className="font-display text-xl mb-4">Próximas vacunas</h2>
          <ul className="divide-y">
            {proximasVacunas.map((v, i) => (
              <li key={i} className="py-2 flex items-center justify-between text-sm">
                <div><div className="font-medium">{v.animal}</div><div className="text-xs text-muted-foreground">{v.arete} · {v.vacuna}</div></div>
                <Badge variant="secondary">{v.fecha}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 shadow-soft">
          <h2 className="font-display text-xl mb-4">Próximos partos</h2>
          <ul className="divide-y">
            {proximosPartos.map((p, i) => (
              <li key={i} className="py-2 flex items-center justify-between text-sm">
                <div><div className="font-medium">{p.animal}</div><div className="text-xs text-muted-foreground">{p.arete}</div></div>
                <Badge className="bg-accent text-accent-foreground">{p.fecha}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
