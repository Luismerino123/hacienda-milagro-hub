import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listarAnimales, calcularEdad, PHOTO_FALLBACK, RAZAS, ESTADOS, type Animal } from "@/lib/animals";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Beef, Eye } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/ganado/")({ component: Ganado });

const PAGE = 20;

function Ganado() {
  const { data, isLoading, error } = useQuery({ queryKey: ["animals"], queryFn: listarAnimales });
  const [q, setQ] = useState("");
  const [raza, setRaza] = useState("todas");
  const [sexo, setSexo] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [proposito, setProposito] = useState("todos");
  const [enVenta, setEnVenta] = useState(false);
  const [page, setPage] = useState(1);

  const filtrados = useMemo(() => {
    if (!data) return [];
    return data.filter(a => {
      if (q && !`${a.name ?? ""} ${a.tag_number}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (raza !== "todas" && a.breed !== raza) return false;
      if (sexo !== "todos" && a.sex !== sexo) return false;
      if (estado !== "todos" && a.status !== estado) return false;
      if (proposito !== "todos" && a.purpose !== proposito) return false;
      if (enVenta && !a.for_sale) return false;
      return true;
    });
  }, [data, q, raza, sexo, estado, proposito, enVenta]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE));
  const visibles = filtrados.slice((page - 1) * PAGE, page * PAGE);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Registro de ganado</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.length ?? 0} animales en el hato.</p>
        </div>
        <Button asChild variant="forest"><Link to="/admin/ganado/nuevo"><Plus className="h-4 w-4" /> Agregar animal</Link></Button>
      </div>

      <Card className="p-4 shadow-soft grid gap-3 md:grid-cols-6">
        <div className="relative md:col-span-2">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nombre o arete" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={raza} onValueChange={v => { setRaza(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Raza" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las razas</SelectItem>
            {RAZAS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sexo} onValueChange={v => { setSexo(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Sexo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Ambos sexos</SelectItem>
            <SelectItem value="hembra">Hembra</SelectItem>
            <SelectItem value="macho">Macho</SelectItem>
          </SelectContent>
        </Select>
        <Select value={estado} onValueChange={v => { setEstado(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Cualquier estado</SelectItem>
            {ESTADOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm justify-self-start md:justify-self-end">
          <Switch checked={enVenta} onCheckedChange={v => { setEnVenta(v); setPage(1); }} />
          <span>En venta</span>
        </label>
      </Card>

      {isLoading && (
        <Card className="p-6 space-y-3 shadow-soft">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </Card>
      )}

      {error && <Card className="p-6 text-sm text-destructive shadow-soft">No se pudo cargar el registro. Intente de nuevo.</Card>}

      {!isLoading && filtrados.length === 0 && (
        <Card className="p-12 text-center shadow-soft">
          <Beef className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-2xl">Aún no hay animales que mostrar</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">Comience registrando el primer animal de su hato.</p>
          <Button asChild variant="forest"><Link to="/admin/ganado/nuevo"><Plus className="h-4 w-4" /> Agregar animal</Link></Button>
        </Card>
      )}

      {!isLoading && visibles.length > 0 && (
        <>
          <div className="grid gap-3 md:hidden">
            {visibles.map(a => <TarjetaAnimal key={a.id} a={a} />)}
          </div>
          <Card className="shadow-soft overflow-hidden hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Arete</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Propósito</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map(a => (
                  <TableRow key={a.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Link to="/admin/ganado/$id" params={{ id: a.id }} className="flex items-center gap-3">
                        <img src={a.photos[0] || PHOTO_FALLBACK} alt={a.name ?? a.tag_number} className="h-10 w-10 rounded-full object-cover" />
                        <span className="font-medium">{a.name ?? "—"}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.tag_number}</TableCell>
                    <TableCell>{a.breed}</TableCell>
                    <TableCell className="capitalize">{a.sex}</TableCell>
                    <TableCell>{calcularEdad(a.birth_date)}</TableCell>
                    <TableCell className="capitalize">{a.purpose ?? "—"}</TableCell>
                    <TableCell><EstadoBadge estado={a.status} venta={a.for_sale} /></TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/admin/ganado/$id" params={{ id: a.id }}><Eye className="h-4 w-4" /> Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Página {page} de {totalPaginas}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPaginas} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EstadoBadge({ estado, venta }: { estado: string; venta: boolean }) {
  const map: Record<string, string> = {
    activo: "bg-primary/15 text-primary",
    vendido: "bg-muted text-muted-foreground",
    fallecido: "bg-destructive/15 text-destructive",
    en_tratamiento: "bg-accent/30 text-accent-foreground",
  };
  return (
    <div className="flex flex-wrap gap-1">
      <Badge className={map[estado] ?? ""} variant="secondary">{estado.replace("_", " ")}</Badge>
      {venta && <Badge className="bg-accent text-accent-foreground">En venta</Badge>}
    </div>
  );
}

function TarjetaAnimal({ a }: { a: Animal }) {
  return (
    <Link to="/admin/ganado/$id" params={{ id: a.id }}>
      <Card className="p-3 flex gap-3 items-center shadow-soft hover:shadow-elevated transition">
        <img src={a.photos[0] || PHOTO_FALLBACK} alt="" className="h-14 w-14 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium truncate">{a.name ?? a.tag_number}</div>
            <span className="font-mono text-xs text-muted-foreground">{a.tag_number}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{a.breed} · {a.sex} · {calcularEdad(a.birth_date)}</div>
          <div className="mt-1"><EstadoBadge estado={a.status} venta={a.for_sale} /></div>
        </div>
      </Card>
    </Link>
  );
}
