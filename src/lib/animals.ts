import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Animal = Database["public"]["Tables"]["animals"]["Row"];
export type AnimalInsert = Database["public"]["Tables"]["animals"]["Insert"];
export type AnimalUpdate = Database["public"]["Tables"]["animals"]["Update"];

export const RAZAS = ["Holstein", "Jersey", "Brahman", "Pardo Suizo", "Otro"] as const;
export const PROPOSITOS = [
  { value: "lechera", label: "Lechera" },
  { value: "engorde", label: "Engorde" },
  { value: "reproduccion", label: "Reproducción" },
  { value: "mixto", label: "Mixto" },
] as const;
export const ESTADOS = [
  { value: "activo", label: "Activo" },
  { value: "vendido", label: "Vendido" },
  { value: "fallecido", label: "Fallecido" },
  { value: "en_tratamiento", label: "En tratamiento" },
] as const;

export function calcularEdad(fecha: string): string {
  const años = (Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (años < 1) return `${Math.max(1, Math.round(años * 12))} meses`;
  return `${años.toFixed(1)} años`;
}

export const PHOTO_FALLBACK = "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=900";

export async function listarAnimales() {
  const { data, error } = await supabase.from("animals").select("*").order("tag_number");
  if (error) throw error;
  return data;
}

export async function listarEnVenta() {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("for_sale", true)
    .eq("status", "activo")
    .order("tag_number");
  if (error) throw error;
  return data;
}

export async function obtenerAnimal(id: string) {
  const { data, error } = await supabase.from("animals").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function crearAnimal(input: AnimalInsert) {
  const { data, error } = await supabase.from("animals").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function actualizarAnimal(id: string, input: AnimalUpdate) {
  const { data, error } = await supabase.from("animals").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function eliminarAnimal(id: string) {
  const { error } = await supabase.from("animals").delete().eq("id", id);
  if (error) throw error;
}

export async function subirFoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("animal-photos").upload(path, file, {
    cacheControl: "3600", upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("animal-photos").getPublicUrl(path);
  return data.publicUrl;
}
