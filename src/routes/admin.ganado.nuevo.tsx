import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AnimalForm } from "@/components/admin/AnimalForm";

export const Route = createFileRoute("/admin/ganado/nuevo")({ component: Nuevo });

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
