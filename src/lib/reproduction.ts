import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ReproEvent = Database["public"]["Tables"]["reproduction_events"]["Row"];
export type ReproEventInsert = Database["public"]["Tables"]["reproduction_events"]["Insert"];
export type ReproEventUpdate = Database["public"]["Tables"]["reproduction_events"]["Update"];

export const TIPOS_REPRO = [
  { value: "celo", label: "Celo", color: "bg-pink-100 text-pink-900" },
  { value: "monta", label: "Monta", color: "bg-purple-100 text-purple-900" },
  { value: "inseminacion", label: "Inseminación", color: "bg-indigo-100 text-indigo-900" },
  { value: "prenez_confirmada", label: "Preñez confirmada", color: "bg-emerald-100 text-emerald-900" },
  { value: "parto", label: "Parto", color: "bg-amber-100 text-amber-900" },
  { value: "aborto", label: "Aborto", color: "bg-red-100 text-red-900" },
  { value: "destete", label: "Destete", color: "bg-blue-100 text-blue-900" },
] as const;

export type TipoRepro = (typeof TIPOS_REPRO)[number]["value"];

export const GESTACION_DIAS = 283; // ~ 9 meses 7 días

export function reproLabel(tipo: string): string {
  return TIPOS_REPRO.find((t) => t.value === tipo)?.label ?? tipo;
}

export function reproColor(tipo: string): string {
  return TIPOS_REPRO.find((t) => t.value === tipo)?.color ?? "bg-slate-100 text-slate-900";
}

/** Calcula la fecha estimada de parto a partir de la fecha de monta/inseminación. */
export function estimarParto(fechaMonta: string): string {
  const d = new Date(fechaMonta);
  d.setDate(d.getDate() + GESTACION_DIAS);
  return d.toISOString().slice(0, 10);
}

/** Eventos reproductivos recientes (con info de animal/toro/ternero). */
export async function listarEventosReproRecientes(limit = 50) {
  const { data, error } = await supabase
    .from("reproduction_events")
    .select(`
      *,
      animals:animal_id(name, tag_number, sex),
      toro:toro_id(name, tag_number),
      ternero:ternero_id(name, tag_number)
    `)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/** Eventos reproductivos de un animal específico. */
export async function listarEventosReproDeAnimal(animalId: string) {
  const { data, error } = await supabase
    .from("reproduction_events")
    .select(`
      *,
      toro:toro_id(name, tag_number),
      ternero:ternero_id(name, tag_number)
    `)
    .eq("animal_id", animalId)
    .order("fecha", { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Vacas actualmente preñadas: aquellas con un evento de preñez confirmada
 * o monta/inseminación más reciente que cualquier parto/aborto posterior.
 * Devuelve también la fecha estimada de parto.
 */
export async function listarPrenadas() {
  const { data, error } = await supabase
    .from("reproduction_events")
    .select(`
      *,
      animals:animal_id(name, tag_number, sex, status)
    `)
    .order("fecha", { ascending: false });
  if (error) throw error;

  // Agrupar por animal: el evento más reciente determina si está preñada.
  const porAnimal = new Map<string, ReproEvent & { animals: { name: string | null; tag_number: string; sex: string; status: string } }>();
  for (const e of data as Array<ReproEvent & { animals: { name: string | null; tag_number: string; sex: string; status: string } }>) {
    if (!porAnimal.has(e.animal_id)) porAnimal.set(e.animal_id, e);
  }

  const tiposPrenez = ["monta", "inseminacion", "prenez_confirmada"];
  return Array.from(porAnimal.values())
    .filter((e) => tiposPrenez.includes(e.tipo) && e.fecha_estimada_parto)
    .filter((e) => e.animals?.status === "activo" || e.animals?.status === "en_tratamiento")
    .sort((a, b) => (a.fecha_estimada_parto ?? "").localeCompare(b.fecha_estimada_parto ?? ""));
}

export async function crearEventoRepro(input: ReproEventInsert) {
  const { data, error } = await supabase
    .from("reproduction_events")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarEventoRepro(id: string, input: ReproEventUpdate) {
  const { data, error } = await supabase
    .from("reproduction_events")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarEventoRepro(id: string) {
  const { error } = await supabase.from("reproduction_events").delete().eq("id", id);
  if (error) throw error;
}

/** Días entre hoy y una fecha (positivo = futuro, negativo = pasado). */
export function diasDesdeHoy(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return Math.round((f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}
