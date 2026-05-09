import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type MilkRow = Database["public"]["Tables"]["milk_production"]["Row"];
export type MilkInsert = Database["public"]["Tables"]["milk_production"]["Insert"];

export async function listarOrdenosRecientes(limit = 50) {
  const { data, error } = await supabase
    .from("milk_production")
    .select("*, animals(name, tag_number)")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function listarUltimos30Dias() {
  const desde = new Date();
  desde.setDate(desde.getDate() - 29);
  const { data, error } = await supabase
    .from("milk_production")
    .select("fecha, litros, animal_id")
    .gte("fecha", desde.toISOString().slice(0, 10))
    .order("fecha");
  if (error) throw error;
  return data;
}

export async function registrarOrdeno(input: MilkInsert) {
  const { data, error } = await supabase
    .from("milk_production")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function agruparPorDia(rows: { fecha: string; litros: number }[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.fecha, (map.get(r.fecha) ?? 0) + Number(r.litros));
  }
  return Array.from(map.entries())
    .map(([fecha, litros]) => ({ fecha, litros: Math.round(litros * 10) / 10 }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function topProductoras(
  rows: { animal_id: string; litros: number }[],
  animales: { id: string; name: string | null; tag_number: string }[],
  n = 5,
) {
  const map = new Map<string, { total: number; dias: Set<string> }>();
  for (const r of rows as Array<{ animal_id: string; litros: number; fecha: string }>) {
    const cur = map.get(r.animal_id) ?? { total: 0, dias: new Set<string>() };
    cur.total += Number(r.litros);
    cur.dias.add(r.fecha);
    map.set(r.animal_id, cur);
  }
  const arr = Array.from(map.entries()).map(([id, v]) => {
    const a = animales.find((x) => x.id === id);
    return {
      id,
      nombre: a?.name ?? "Sin nombre",
      arete: a?.tag_number ?? "—",
      promedio: v.dias.size ? Math.round((v.total / v.dias.size) * 10) / 10 : 0,
    };
  });
  return arr.sort((a, b) => b.promedio - a.promedio).slice(0, n);
}