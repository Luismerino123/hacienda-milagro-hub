import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type HealthEvent = Database["public"]["Tables"]["health_events"]["Row"];
export type HealthEventInsert = Database["public"]["Tables"]["health_events"]["Insert"];
export type HealthEventUpdate = Database["public"]["Tables"]["health_events"]["Update"];

export const TIPOS_EVENTO = [
  { value: "vacuna", label: "Vacuna", color: "bg-emerald-100 text-emerald-900" },
  { value: "desparasitacion", label: "Desparasitación", color: "bg-teal-100 text-teal-900" },
  { value: "enfermedad", label: "Enfermedad", color: "bg-red-100 text-red-900" },
  { value: "tratamiento", label: "Tratamiento", color: "bg-amber-100 text-amber-900" },
  { value: "visita_vet", label: "Visita veterinario", color: "bg-blue-100 text-blue-900" },
  { value: "lesion", label: "Lesión", color: "bg-orange-100 text-orange-900" },
  { value: "otro", label: "Otro", color: "bg-slate-100 text-slate-900" },
] as const;

export type TipoEvento = (typeof TIPOS_EVENTO)[number]["value"];

export function tipoLabel(tipo: string): string {
  return TIPOS_EVENTO.find((t) => t.value === tipo)?.label ?? tipo;
}

export function tipoColor(tipo: string): string {
  return TIPOS_EVENTO.find((t) => t.value === tipo)?.color ?? "bg-slate-100 text-slate-900";
}

/** Lista los eventos médicos más recientes (con info del animal). */
export async function listarEventosRecientes(limit = 50) {
  const { data, error } = await supabase
    .from("health_events")
    .select("*, animals(name, tag_number)")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/** Eventos médicos de un animal específico, en orden cronológico inverso. */
export async function listarEventosDeAnimal(animalId: string) {
  const { data, error } = await supabase
    .from("health_events")
    .select("*")
    .eq("animal_id", animalId)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/** Próximas vacunas/desparasitaciones (proxima_fecha en el futuro o hasta 30 días atrás). */
export async function listarProximasVacunas(diasAdelante = 60) {
  const desde = new Date();
  desde.setDate(desde.getDate() - 7); // permite ver atrasadas hasta 7 días
  const hasta = new Date();
  hasta.setDate(hasta.getDate() + diasAdelante);
  const { data, error } = await supabase
    .from("health_events")
    .select("*, animals(name, tag_number)")
    .not("proxima_fecha", "is", null)
    .gte("proxima_fecha", desde.toISOString().slice(0, 10))
    .lte("proxima_fecha", hasta.toISOString().slice(0, 10))
    .order("proxima_fecha", { ascending: true });
  if (error) throw error;
  return data;
}

/** Tratamientos / enfermedades aún no resueltas. */
export async function listarTratamientosActivos() {
  const { data, error } = await supabase
    .from("health_events")
    .select("*, animals(name, tag_number)")
    .in("tipo", ["enfermedad", "tratamiento", "lesion"])
    .eq("resuelto", false)
    .order("fecha", { ascending: false });
  if (error) throw error;
  return data;
}

export async function crearEvento(input: HealthEventInsert) {
  const { data, error } = await supabase
    .from("health_events")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarEvento(id: string, input: HealthEventUpdate) {
  const { data, error } = await supabase
    .from("health_events")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarEvento(id: string) {
  const { error } = await supabase.from("health_events").delete().eq("id", id);
  if (error) throw error;
}

/** Marca un tratamiento o enfermedad como resuelto. */
export async function marcarResuelto(id: string) {
  return actualizarEvento(id, { resuelto: true });
}

/** Días entre hoy y una fecha (positivo = futuro, negativo = pasado). */
export function diasDesdeHoy(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return Math.round((f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}
