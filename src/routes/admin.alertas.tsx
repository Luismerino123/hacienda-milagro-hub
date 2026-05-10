import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Baby,
  Bell,
  CalendarHeart,
  CheckCircle2,
  Stethoscope,
  Syringe,
} from "lucide-react";
import {
  diasDesdeHoy,
  listarProximasVacunas,
  listarTratamientosActivos,
  tipoColor,
  tipoLabel,
} from "@/lib/health";
import { listarPrenadas, reproColor, reproLabel } from "@/lib/reproduction";

export const Route = createFileRoute("/admin/alertas")({ component: Alertas });

function Alertas() {
  const vacunasQ = useQuery({
    queryKey: ["health", "upcoming"],
    queryFn: () => listarProximasVacunas(60),
  });
  const tratamientosQ = useQuery({
    queryKey: ["health", "active"],
    queryFn: listarTratamientosActivos,
  });
  const prenadasQ = useQuery({
    queryKey: ["repro", "pregnant"],
    queryFn: listarPrenadas,
  });

  // Cálculos
  const atrasadas = (vacunasQ.data ?? []).filter((v) => diasDesdeHoy(v.proxima_fecha!) < 0);
  const enSemana = (vacunasQ.data ?? []).filter(
    (v) => diasDesdeHoy(v.proxima_fecha!) >= 0 && diasDesdeHoy(v.proxima_fecha!) <= 7,
  );
  const proximas = (vacunasQ.data ?? []).filter((v) => diasDesdeHoy(v.proxima_fecha!) > 7);
  const partosInminentes = (prenadasQ.data ?? []).filter(
    (p) => diasDesdeHoy(p.fecha_estimada_parto!) <= 14 && diasDesdeHoy(p.fecha_estimada_parto!) >= -7,
  );

  const totalAlertas =
    atrasadas.length + enSemana.length + (tratamientosQ.data?.length ?? 0) + partosInminentes.length;

  const loading = vacunasQ.isLoading || tratamientosQ.isLoading || prenadasQ.isLoading;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl flex items-center gap-3">
          <Bell className="h-8 w-8 text-accent" />
          Alertas y recordatorios
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Lo que necesita atención hoy en la hacienda.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : totalAlertas === 0 ? (
        <Card className="p-12 text-center shadow-soft">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl mb-2">Todo en orden</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No hay vacunas atrasadas, tratamientos pendientes ni partos inminentes. ¡Buen trabajo!
          </p>
        </Card>
      ) : (
        <>
          {/* Vacunas atrasadas */}
          {atrasadas.length > 0 && (
            <Card className="p-5 shadow-soft border-destructive/30 bg-destructive/5">
              <h2 className="font-display text-xl mb-3 flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Vacunas atrasadas ({atrasadas.length})
              </h2>
              <ul className="space-y-2">
                {atrasadas.map((v) => (
                  <AlertRow
                    key={v.id}
                    titulo={v.titulo}
                    subtitulo={`${v.animals?.name ?? "—"} (${v.animals?.tag_number})`}
                    chip={<span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tipoColor(v.tipo)}`}>{tipoLabel(v.tipo)}</span>}
                    badge={<Badge variant="destructive">Atrasada {Math.abs(diasDesdeHoy(v.proxima_fecha!))}d</Badge>}
                  />
                ))}
              </ul>
            </Card>
          )}

          {/* Esta semana */}
          {enSemana.length > 0 && (
            <Card className="p-5 shadow-soft border-amber-500/30 bg-amber-50/50">
              <h2 className="font-display text-xl mb-3 flex items-center gap-2 text-amber-700">
                <Syringe className="h-5 w-5" />
                Vacunas / desparasitaciones esta semana ({enSemana.length})
              </h2>
              <ul className="space-y-2">
                {enSemana.map((v) => {
                  const d = diasDesdeHoy(v.proxima_fecha!);
                  return (
                    <AlertRow
                      key={v.id}
                      titulo={v.titulo}
                      subtitulo={`${v.animals?.name ?? "—"} (${v.animals?.tag_number})`}
                      chip={<span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tipoColor(v.tipo)}`}>{tipoLabel(v.tipo)}</span>}
                      badge={<Badge>{d === 0 ? "Hoy" : `En ${d}d`}</Badge>}
                    />
                  );
                })}
              </ul>
            </Card>
          )}

          {/* Tratamientos activos */}
          {(tratamientosQ.data?.length ?? 0) > 0 && (
            <Card className="p-5 shadow-soft">
              <h2 className="font-display text-xl mb-3 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Tratamientos en curso ({tratamientosQ.data!.length})
              </h2>
              <ul className="space-y-2">
                {(tratamientosQ.data ?? []).map((t) => (
                  <AlertRow
                    key={t.id}
                    titulo={t.titulo}
                    subtitulo={`${t.animals?.name ?? "—"} (${t.animals?.tag_number}) · iniciado ${t.fecha}`}
                    chip={<span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tipoColor(t.tipo)}`}>{tipoLabel(t.tipo)}</span>}
                    badge={<Badge variant="secondary">En curso</Badge>}
                  />
                ))}
              </ul>
              <Link to="/admin/salud" className="text-sm text-primary hover:underline mt-3 inline-block">
                Ir al módulo de salud →
              </Link>
            </Card>
          )}

          {/* Partos inminentes */}
          {partosInminentes.length > 0 && (
            <Card className="p-5 shadow-soft border-pink-500/30 bg-pink-50/50">
              <h2 className="font-display text-xl mb-3 flex items-center gap-2 text-pink-700">
                <Baby className="h-5 w-5" />
                Partos inminentes ({partosInminentes.length})
              </h2>
              <ul className="space-y-2">
                {partosInminentes.map((p) => {
                  const d = diasDesdeHoy(p.fecha_estimada_parto!);
                  return (
                    <AlertRow
                      key={p.id}
                      titulo={`Parto estimado: ${p.fecha_estimada_parto}`}
                      subtitulo={`${p.animals?.name ?? "—"} (${p.animals?.tag_number})`}
                      chip={<span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${reproColor(p.tipo)}`}>{reproLabel(p.tipo)}</span>}
                      badge={
                        <Badge variant={d < 0 ? "destructive" : "default"}>
                          {d < 0 ? `${Math.abs(d)}d atrás` : d === 0 ? "Hoy" : `En ${d}d`}
                        </Badge>
                      }
                    />
                  );
                })}
              </ul>
              <Link to="/admin/reproduccion" className="text-sm text-primary hover:underline mt-3 inline-block">
                Ir al módulo de reproducción →
              </Link>
            </Card>
          )}

          {/* Próximas (no urgentes) */}
          {proximas.length > 0 && (
            <Card className="p-5 shadow-soft">
              <h2 className="font-display text-xl mb-3 flex items-center gap-2 text-muted-foreground">
                <CalendarHeart className="h-5 w-5" />
                Próximas (8-60 días)
              </h2>
              <ul className="space-y-2">
                {proximas.map((v) => (
                  <AlertRow
                    key={v.id}
                    titulo={v.titulo}
                    subtitulo={`${v.animals?.name ?? "—"} (${v.animals?.tag_number}) · ${v.proxima_fecha}`}
                    chip={<span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tipoColor(v.tipo)}`}>{tipoLabel(v.tipo)}</span>}
                    badge={<Badge variant="secondary">En {diasDesdeHoy(v.proxima_fecha!)}d</Badge>}
                  />
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function AlertRow({
  titulo,
  subtitulo,
  chip,
  badge,
}: {
  titulo: string;
  subtitulo: string;
  chip: React.ReactNode;
  badge: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {chip}
          <span className="font-medium truncate">{titulo}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{subtitulo}</p>
      </div>
      {badge}
    </li>
  );
}
