import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, KeyRound, Lock, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  actualizarSettings,
  cambiarPassword,
  obtenerSettings,
  type Settings,
} from "@/lib/settings";

export const Route = createFileRoute("/admin/configuracion")({ component: Configuracion });

function Configuracion() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Datos de la hacienda, contacto público y seguridad.
        </p>
      </div>

      <Tabs defaultValue="hacienda">
        <TabsList>
          <TabsTrigger value="hacienda">
            <Building2 className="h-4 w-4" /> Hacienda
          </TabsTrigger>
          <TabsTrigger value="seguridad">
            <Lock className="h-4 w-4" /> Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hacienda" className="mt-4">
          <FormHacienda />
        </TabsContent>

        <TabsContent value="seguridad" className="mt-4">
          <FormSeguridad />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormHacienda() {
  const qc = useQueryClient();
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: obtenerSettings });

  const [form, setForm] = useState<Partial<Settings>>({});

  useEffect(() => {
    if (settingsQ.data) setForm(settingsQ.data);
  }, [settingsQ.data]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const m = useMutation({
    mutationFn: actualizarSettings,
    onSuccess: () => {
      toast.success("Configuración guardada");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(`No se pudo guardar: ${e.message}`),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre?.trim()) {
      toast.error("El nombre de la hacienda es obligatorio");
      return;
    }
    m.mutate({
      nombre: form.nombre,
      subtitulo: form.subtitulo,
      fundador: form.fundador,
      ano_fundacion: form.ano_fundacion,
      descripcion: form.descripcion,
      telefono: form.telefono,
      whatsapp: form.whatsapp,
      email: form.email,
      direccion: form.direccion,
      facebook_url: form.facebook_url,
      instagram_url: form.instagram_url,
      precio_leche_default: form.precio_leche_default,
      moneda: form.moneda,
    });
  }

  if (settingsQ.isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <form onSubmit={submit} className="space-y-4">
      <Card className="p-5 shadow-soft">
        <h2 className="font-display text-xl mb-4">Identidad</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Nombre de la hacienda *</Label>
            <Input
              value={form.nombre ?? ""}
              onChange={(e) => set("nombre", e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Subtítulo / categoría</Label>
            <Input
              value={form.subtitulo ?? ""}
              onChange={(e) => set("subtitulo", e.target.value)}
              placeholder="Hacienda Ganadera"
            />
          </div>
          <div>
            <Label>Fundador</Label>
            <Input
              value={form.fundador ?? ""}
              onChange={(e) => set("fundador", e.target.value)}
              placeholder="Don Luis de Jesús Merino Guardado"
            />
          </div>
          <div>
            <Label>Año de fundación</Label>
            <Input
              type="number"
              min="1800"
              max="2100"
              value={form.ano_fundacion ?? ""}
              onChange={(e) =>
                set("ano_fundacion", e.target.value ? Number(e.target.value) : null)
              }
              placeholder="1978"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción / lema</Label>
            <Textarea
              rows={3}
              value={form.descripcion ?? ""}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Hacienda ganadera familiar comprometida con la tradición..."
            />
          </div>
        </div>
      </Card>

      <Card className="p-5 shadow-soft">
        <h2 className="font-display text-xl mb-4">Contacto público</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Teléfono</Label>
            <Input
              value={form.telefono ?? ""}
              onChange={(e) => set("telefono", e.target.value)}
              placeholder="+503 7000 0000"
            />
          </div>
          <div>
            <Label>WhatsApp (solo números)</Label>
            <Input
              value={form.whatsapp ?? ""}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="50370000000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sin espacios ni guiones. Se usa para los botones "Consultar por WhatsApp".
            </p>
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              placeholder="contacto@elmilagrito.com"
            />
          </div>
          <div>
            <Label>Dirección</Label>
            <Input
              value={form.direccion ?? ""}
              onChange={(e) => set("direccion", e.target.value)}
              placeholder="Sonsonate, El Salvador"
            />
          </div>
          <div>
            <Label>Facebook (URL)</Label>
            <Input
              value={form.facebook_url ?? ""}
              onChange={(e) => set("facebook_url", e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <Label>Instagram (URL)</Label>
            <Input
              value={form.instagram_url ?? ""}
              onChange={(e) => set("instagram_url", e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
      </Card>

      <Card className="p-5 shadow-soft">
        <h2 className="font-display text-xl mb-4">Operación</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Precio leche por defecto (US$/L)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.precio_leche_default ?? ""}
              onChange={(e) =>
                set(
                  "precio_leche_default",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="0.85"
            />
          </div>
          <div>
            <Label>Moneda</Label>
            <Input
              value={form.moneda ?? ""}
              onChange={(e) => set("moneda", e.target.value)}
              placeholder="USD"
            />
          </div>
        </div>
      </Card>

      <Button type="submit" variant="forest" disabled={m.isPending} className="gap-2">
        <Save className="h-4 w-4" />
        {m.isPending ? "Guardando…" : "Guardar configuración"}
      </Button>
    </form>
  );
}

function FormSeguridad() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const m = useMutation({
    mutationFn: cambiarPassword,
    onSuccess: () => {
      toast.success("Contraseña actualizada");
      setActual("");
      setNueva("");
      setConfirmar("");
    },
    onError: (e: Error) => toast.error(`No se pudo cambiar: ${e.message}`),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (nueva.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (nueva !== confirmar) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    m.mutate(nueva);
  }

  return (
    <Card className="p-5 shadow-soft max-w-lg">
      <h2 className="font-display text-xl mb-4 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" /> Cambiar contraseña
      </h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label>Contraseña actual (referencia)</Label>
          <Input
            type="password"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            placeholder="Solo para confirmar que es usted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Supabase no requiere la contraseña actual para cambiarla, pero anótela aquí
            por seguridad.
          </p>
        </div>
        <div>
          <Label>Nueva contraseña</Label>
          <Input
            type="password"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div>
          <Label>Confirmar nueva contraseña</Label>
          <Input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <Button type="submit" variant="forest" disabled={m.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {m.isPending ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </form>
    </Card>
  );
}
