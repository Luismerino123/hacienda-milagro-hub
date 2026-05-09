import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { obtenerAnimal } from "@/lib/animals";
import { AnimalForm } from "@/components/admin/AnimalForm";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/ganado/$id/editar")({ component: Editar });

function Editar() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({ queryKey: ["animal", id], queryFn: () => obtenerAnimal(id) });
  if (error) throw error;
  if (!isLoading && !data) throw notFound();
  return (
    <div className="space-y-6">
      <Link to="/admin/ganado/$id" params={{ id }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Volver al detalle</Link>
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Editar animal</h1>
        <p className="text-muted-foreground text-sm mt-1">Actualice la información del animal.</p>
      </div>
      {isLoading ? <Skeleton className="h-96 w-full max-w-4xl" /> : data && <AnimalForm existing={data} />}
    </div>
  );
}
