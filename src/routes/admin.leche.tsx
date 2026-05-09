import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { animales, produccionDiaria } from "@/data/mock";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useState } from "react";
import { toast } from "sonner";
import { Milk } from "lucide-react";

export const Route = createFileRoute("/admin/leche")({ component: Leche });

const lecheras = animales.filter(a => a.proposito === "Lechera");

interface Registro { id: string; animal: string; turno: string; litros: number; fecha: string; }

function Leche() {
  const [animal, setAnimal] = useState(lecheras[0].id);
  const [turno, setTurno] = useState("Mañana");
  const [litros, setLitros] = useState("");
  const [registros, setRegistros] = useState<Registro[]>([
    { id: "1", animal: "Lucero", turno: "Mañana", litros: 13.2, fecha: new Date().toISOString().slice(0, 10) },
    { id: "2", animal: "Negrita", turno: "Mañana", litros: 14.0, fecha: new Date().toISOString().slice(0, 10) },
    { id: "3", animal: "Margarita", turno: "Mañana", litros: 12.5, fecha: new Date().toISOString().slice(0, 10) },
  ]);

  function registrar(e: React.FormEvent) {
    e.preventDefault();
    const l = parseFloat(litros);
    if (!l || l <= 0) { toast.error("Ingrese una cantidad válida en litros"); return; }
    const a = lecheras.find(x => x.id === animal)!;
    setRegistros(r => [{ id: crypto.randomUUID(), animal: a.nombre, turno, litros: l, fecha: new Date().toISOString().slice(0, 10) }, ...r]);
    setLitros("");
    toast.success(`Ordeño registrado: ${a.nombre} — ${l} L`);
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Producción de leche</h1>
        <p className="text-muted-foreground text-sm mt-1">Registre cada ordeño para mantener el control diario.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 shadow-soft">
          <h2 className="font-display text-xl mb-4 flex items-center gap-2"><Milk className="h-5 w-5 text-primary" /> Nuevo ordeño</h2>
          <form onSubmit={registrar} className="space-y-3">
            <div>
              <Label>Vaca</Label>
              <Select value={animal} onValueChange={setAnimal}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{lecheras.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre} ({a.arete})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Turno</Label>
              <Select value={turno} onValueChange={setTurno}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mañana">Mañana</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Litros</Label>
              <Input type="number" step="0.1" min="0" value={litros} onChange={e => setLitros(e.target.value)} placeholder="Ej. 12.5" required />
            </div>
            <Button type="submit" variant="forest" className="w-full">Registrar ordeño</Button>
          </form>
        </Card>

        <Card className="p-5 lg:col-span-2 shadow-soft">
          <h2 className="font-display text-xl mb-4">Tendencia de los últimos 30 días</h2>
          <div className="h-72">
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
      </div>

      <Card className="shadow-soft overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-display text-xl">Registros recientes</h2>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Vaca</TableHead><TableHead>Turno</TableHead><TableHead className="text-right">Litros</TableHead></TableRow></TableHeader>
          <TableBody>
            {registros.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.fecha}</TableCell>
                <TableCell className="font-medium">{r.animal}</TableCell>
                <TableCell>{r.turno}</TableCell>
                <TableCell className="text-right font-semibold">{r.litros.toFixed(1)} L</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
