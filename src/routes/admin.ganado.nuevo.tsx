import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { AnimalForm } from "@/components/admin/AnimalForm";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/admin/ganado/nuevo")({
  component: Nuevo,
  errorComponent: ErrorNuevo,
  pendingComponent: () => <div className="p-8 text-muted-foreground">Cargando…</div>,
});

function Nuevo() {
  return (
    <div className="space-y-6">
      <Link to="/admin/ganado" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Volver</Link>
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Agregar animal</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete los datos del nuevo animal del hato.</p>
      </div>
      <AnimalForm />
    </div>
  );
}

function ErrorNuevo({ error }: { error: Error }) {
  return (
    <Card className="p-6 border-destructive/30 bg-destructive/5 max-w-3xl">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
        <div>
          <h2 className="font-display text-xl text-destructive">No se pudo cargar el formulario</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Esto suele pasar por un problema de red, sesión expirada o un dato inesperado.
          </p>
        </div>
      </div>
      <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
        {error.message}
        {"\n\n"}
        {error.stack ?? ""}
      </pre>
      <div className="mt-3 flex gap-2">
        <Link to="/admin/ganado" className="text-sm text-primary hover:underline">← Volver al registro</Link>
      </div>
    </Card>
  );
}
