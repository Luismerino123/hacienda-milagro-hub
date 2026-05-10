import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Sale = Database["public"]["Tables"]["sales"]["Row"];
export type SaleInsert = Database["public"]["Tables"]["sales"]["Insert"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];

export const TIPOS_VENTA = [
  { value: "leche", label: "Leche" },
  { value: "ganado", label: "Ganado" },
  { value: "otro", label: "Otro" },
] as const;

export const CATEGORIAS_EGRESO = [
  { value: "alimento", label: "Alimento" },
  { value: "medicina", label: "Medicina" },
  { value: "servicio_vet", label: "Servicio veterinario" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "salario", label: "Salarios" },
  { value: "transporte", label: "Transporte" },
  { value: "compra_animal", label: "Compra de animal" },
  { value: "otro", label: "Otro" },
] as const;

export function categoriaLabel(c: string): string {
  return CATEGORIAS_EGRESO.find((x) => x.value === c)?.label ?? c;
}

// ----- Clientes -----
export async function listarClientes() {
  const { data, error } = await supabase.from("clients").select("*").order("nombre");
  if (error) throw error;
  return data;
}

export async function crearCliente(input: ClientInsert) {
  const { data, error } = await supabase.from("clients").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ----- Ventas -----
export async function listarVentas(limit = 100) {
  const { data, error } = await supabase
    .from("sales")
    .select("*, clients(nombre), animals(name, tag_number)")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function crearVenta(input: SaleInsert) {
  const { data, error } = await supabase.from("sales").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function eliminarVenta(id: string) {
  const { error } = await supabase.from("sales").delete().eq("id", id);
  if (error) throw error;
}

// ----- Egresos -----
export async function listarEgresos(limit = 100) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function crearEgreso(input: ExpenseInsert) {
  const { data, error } = await supabase.from("expenses").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function eliminarEgreso(id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

// ----- Reportes -----
/** Total de ventas e egresos en un rango de fechas. */
export async function resumenMensual(meses = 6) {
  const desde = new Date();
  desde.setMonth(desde.getMonth() - meses);
  desde.setDate(1);
  const fechaDesde = desde.toISOString().slice(0, 10);

  const [ventas, egresos] = await Promise.all([
    supabase.from("sales").select("fecha, total").gte("fecha", fechaDesde),
    supabase.from("expenses").select("fecha, monto").gte("fecha", fechaDesde),
  ]);

  if (ventas.error) throw ventas.error;
  if (egresos.error) throw egresos.error;

  // Agrupar por mes (YYYY-MM)
  const map = new Map<string, { ingresos: number; egresos: number }>();

  for (const v of ventas.data ?? []) {
    const mes = v.fecha.slice(0, 7);
    const cur = map.get(mes) ?? { ingresos: 0, egresos: 0 };
    cur.ingresos += Number(v.total);
    map.set(mes, cur);
  }
  for (const e of egresos.data ?? []) {
    const mes = e.fecha.slice(0, 7);
    const cur = map.get(mes) ?? { ingresos: 0, egresos: 0 };
    cur.egresos += Number(e.monto);
    map.set(mes, cur);
  }

  return Array.from(map.entries())
    .map(([mes, v]) => ({
      mes,
      ingresos: Math.round(v.ingresos * 100) / 100,
      egresos: Math.round(v.egresos * 100) / 100,
      neto: Math.round((v.ingresos - v.egresos) * 100) / 100,
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
}
