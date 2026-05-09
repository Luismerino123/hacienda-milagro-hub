import { createFileRoute, Link } from "@tanstack/react-router";
import { animales } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/ganado")({ component: Ganado });

function Ganado() {
  const [q, setQ] = useState("");
  const filtrados = useMemo(
    () => animales.filter(a => `${a.nombre} ${a.arete} ${a.raza}`.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Registro de ganado</h1>
          <p className="text-muted-foreground text-sm mt-1">{animales.length} animales registrados.</p>
        </div>
        <Button variant="forest"><Plus className="h-4 w-4" /> Agregar animal</Button>
      </div>

      <Card className="p-4 shadow-soft">
        <div className="relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, arete o raza" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
        </div>
      </Card>

      <Card className="shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Animal</TableHead>
              <TableHead>Arete</TableHead>
              <TableHead>Raza</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Propósito</TableHead>
              <TableHead>Potrero</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map(a => (
              <TableRow key={a.id} className="cursor-pointer hover:bg-muted/40">
                <TableCell>
                  <Link to="/admin/ganado/$id" params={{ id: a.id }} className="flex items-center gap-3">
                    <img src={a.foto} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <span className="font-medium">{a.nombre}</span>
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">{a.arete}</TableCell>
                <TableCell>{a.raza}</TableCell>
                <TableCell>{a.sexo}</TableCell>
                <TableCell>{a.proposito}</TableCell>
                <TableCell>{a.potrero}</TableCell>
                <TableCell>
                  <Badge variant={a.estado === "Tratamiento" ? "destructive" : a.estado === "En venta" ? "default" : "secondary"}
                    className={a.estado === "En venta" ? "bg-accent text-accent-foreground" : ""}>
                    {a.estado}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
