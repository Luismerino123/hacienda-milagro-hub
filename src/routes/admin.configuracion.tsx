import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/admin/configuracion")({ component: Page });

function Page() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">Datos de la hacienda, usuarios, roles y backup.</p>
      </div>
      <Card className="p-12 text-center shadow-soft">
        <div className="mx-auto h-16 w-16 rounded-full bg-accent/15 text-accent flex items-center justify-center mb-4">
          <Construction className="h-7 w-7" />
        </div>
        <h2 className="font-display text-2xl mb-2">Módulo en construcción</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">Esta sección estará disponible muy pronto. Puede empezar a usar Dashboard, Ganado y Producción de leche desde ya.</p>
      </Card>
    </div>
  );
}
