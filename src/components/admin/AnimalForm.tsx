import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RAZAS, PROPOSITOS, ESTADOS, crearAnimal, actualizarAnimal, listarAnimales, subirFoto, type Animal } from "@/lib/animals";
import { Loader2, Upload, X } from "lucide-react";

const schema = z.object({
  tag_number: z.string().trim().min(1, "El arete es obligatorio").max(40),
  name: z.string().trim().max(80).optional().or(z.literal("")),
  breed: z.string().min(1, "Seleccione una raza"),
  sex: z.enum(["hembra", "macho"], { message: "Seleccione el sexo" }),
  color: z.string().trim().max(60).optional().or(z.literal("")),
  birth_date: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  birth_weight_kg: z.string().optional(),
  current_weight_kg: z.string().optional(),
  mother_id: z.string().optional(),
  father_id: z.string().optional(),
  purpose: z.string().optional(),
  status: z.enum(["activo","vendido","fallecido","en_tratamiento"]),
  location: z.string().trim().max(80).optional().or(z.literal("")),
  for_sale: z.boolean(),
  sale_price: z.string().optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export function AnimalForm({ existing }: { existing?: Animal }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<string[]>(existing?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const { data: todos } = useQuery({ queryKey: ["animals"], queryFn: listarAnimales });

  const [form, setForm] = useState({
    tag_number: existing?.tag_number ?? "",
    name: existing?.name ?? "",
    breed: existing?.breed ?? "",
    sex: (existing?.sex as "hembra"|"macho") ?? "hembra",
    color: existing?.color ?? "",
    birth_date: existing?.birth_date ?? "",
    birth_weight_kg: existing?.birth_weight_kg?.toString() ?? "",
    current_weight_kg: existing?.current_weight_kg?.toString() ?? "",
    mother_id: existing?.mother_id ?? "",
    father_id: existing?.father_id ?? "",
    purpose: existing?.purpose ?? "",
    status: (existing?.status as any) ?? "activo",
    location: existing?.location ?? "",
    for_sale: existing?.for_sale ?? false,
    sale_price: existing?.sale_price?.toString() ?? "",
    notes: existing?.notes ?? "",
  });

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));
  const hembras = (todos ?? []).filter(a => a.sex === "hembra" && a.id !== existing?.id);
  const machos = (todos ?? []).filter(a => a.sex === "macho" && a.id !== existing?.id);

  async function onUpload(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await subirFoto(f));
      setPhotos(p => [...p, ...urls]);
      toast.success(`${urls.length} foto(s) subida(s)`);
    } catch (e: any) {
      toast.error("No se pudo subir la foto: " + e.message);
    } finally { setUploading(false); }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise los campos");
      return;
    }
    const v = parsed.data;
    const payload = {
      tag_number: v.tag_number,
      name: v.name || null,
      breed: v.breed,
      sex: v.sex,
      color: v.color || null,
      birth_date: v.birth_date,
      birth_weight_kg: v.birth_weight_kg ? Number(v.birth_weight_kg) : null,
      current_weight_kg: v.current_weight_kg ? Number(v.current_weight_kg) : null,
      mother_id: v.mother_id || null,
      father_id: v.father_id || null,
      purpose: v.purpose || null,
      status: v.status,
      location: v.location || null,
      for_sale: v.for_sale,
      sale_price: v.for_sale && v.sale_price ? Number(v.sale_price) : null,
      notes: v.notes || null,
      photos,
    };
    setSaving(true);
    try {
      if (existing) {
        await actualizarAnimal(existing.id, payload);
        toast.success("Animal actualizado");
      } else {
        const a = await crearAnimal(payload);
        toast.success("Animal registrado");
        qc.invalidateQueries({ queryKey: ["animals"] });
        navigate({ to: "/admin/ganado/$id", params: { id: a.id } });
        return;
      }
      qc.invalidateQueries({ queryKey: ["animals"] });
      navigate({ to: "/admin/ganado/$id", params: { id: existing!.id } });
    } catch (e: any) {
      console.error("[AnimalForm] error guardando:", e);
      const msg = String(e?.message ?? e ?? "");
      if (msg.includes("duplicate") || msg.includes("unique")) {
        toast.error("Ya existe un animal con ese arete");
      } else if (msg.includes("row-level security") || msg.includes("RLS") || msg.includes("permission")) {
        toast.error("Sin permisos. Verifique que está autenticado.");
      } else if (msg.includes("violates check constraint")) {
        toast.error("Algún valor no es válido (sexo, propósito o estado).");
      } else {
        toast.error(`No se pudo guardar: ${msg || "error desconocido"}`);
      }
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">
      <Card className="p-5 shadow-soft">
        <Tabs defaultValue="id">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="id">Identificación</TabsTrigger>
            <TabsTrigger value="gen">Genealogía</TabsTrigger>
            <TabsTrigger value="man">Manejo</TabsTrigger>
            <TabsTrigger value="vta">Comercialización</TabsTrigger>
            <TabsTrigger value="fot">Fotos</TabsTrigger>
            <TabsTrigger value="not">Notas</TabsTrigger>
          </TabsList>

          <TabsContent value="id" className="grid gap-4 sm:grid-cols-2 pt-5">
            <Field label="Arete *"><Input value={form.tag_number} onChange={e => set("tag_number", e.target.value)} placeholder="EM-001" required /></Field>
            <Field label="Nombre"><Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Lucero" /></Field>
            <Field label="Raza *">
              <Select value={form.breed} onValueChange={v => set("breed", v)}>
                <SelectTrigger><SelectValue placeholder="Seleccione raza" /></SelectTrigger>
                <SelectContent>{RAZAS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Sexo *">
              <Select value={form.sex} onValueChange={v => set("sex", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hembra">Hembra</SelectItem>
                  <SelectItem value="macho">Macho</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Color"><Input value={form.color} onChange={e => set("color", e.target.value)} /></Field>
            <Field label="Fecha de nacimiento *"><Input type="date" value={form.birth_date} onChange={e => set("birth_date", e.target.value)} required /></Field>
            <Field label="Peso al nacer (kg)"><Input type="number" step="0.1" value={form.birth_weight_kg} onChange={e => set("birth_weight_kg", e.target.value)} /></Field>
            <Field label="Peso actual (kg)"><Input type="number" step="0.1" value={form.current_weight_kg} onChange={e => set("current_weight_kg", e.target.value)} /></Field>
          </TabsContent>

          <TabsContent value="gen" className="grid gap-4 sm:grid-cols-2 pt-5">
            <Field label="Madre">
              <Select value={form.mother_id || "_"} onValueChange={v => set("mother_id", v === "_" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">Sin asignar</SelectItem>
                  {hembras.map(h => <SelectItem key={h.id} value={h.id}>{h.tag_number} — {h.name ?? "Sin nombre"}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Padre">
              <Select value={form.father_id || "_"} onValueChange={v => set("father_id", v === "_" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">Sin asignar</SelectItem>
                  {machos.map(m => <SelectItem key={m.id} value={m.id}>{m.tag_number} — {m.name ?? "Sin nombre"}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </TabsContent>

          <TabsContent value="man" className="grid gap-4 sm:grid-cols-2 pt-5">
            <Field label="Propósito">
              <Select value={form.purpose || "_"} onValueChange={v => set("purpose", v === "_" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Sin definir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">Sin definir</SelectItem>
                  {PROPOSITOS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Ubicación / potrero"><Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Potrero 1" /></Field>
            <Field label="Estado">
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ESTADOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </TabsContent>

          <TabsContent value="vta" className="space-y-4 pt-5 max-w-md">
            <label className="flex items-center justify-between gap-4 p-4 rounded-lg border">
              <div>
                <div className="font-medium">¿En venta?</div>
                <div className="text-xs text-muted-foreground">Visible en el catálogo público.</div>
              </div>
              <Switch checked={form.for_sale} onCheckedChange={v => set("for_sale", v)} />
            </label>
            {form.for_sale && (
              <Field label="Precio (USD)"><Input type="number" step="1" value={form.sale_price} onChange={e => set("sale_price", e.target.value)} placeholder="2500" /></Field>
            )}
          </TabsContent>

          <TabsContent value="fot" className="pt-5 space-y-4">
            <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent transition">
              <input type="file" multiple accept="image/*" className="hidden" onChange={e => onUpload(e.target.files)} />
              {uploading ? <Loader2 className="h-6 w-6 mx-auto animate-spin" /> : <Upload className="h-6 w-6 mx-auto text-muted-foreground" />}
              <p className="text-sm mt-2">Arrastre o haga clic para subir fotos</p>
              <p className="text-xs text-muted-foreground">JPG, PNG. Múltiples permitidas.</p>
            </label>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="not" className="pt-5">
            <Field label="Notas">
              <Textarea rows={6} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Observaciones, hallazgos, comentarios..." />
            </Field>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="forest" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {existing ? "Guardar cambios" : "Registrar animal"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
