import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Settings = Database["public"]["Tables"]["hacienda_settings"]["Row"];
export type SettingsUpdate = Database["public"]["Tables"]["hacienda_settings"]["Update"];

const SETTINGS_ID = 1;

/** Obtiene los settings de la hacienda (singleton). */
export async function obtenerSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from("hacienda_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Actualiza los settings de la hacienda. */
export async function actualizarSettings(input: SettingsUpdate): Promise<Settings> {
  const { data, error } = await supabase
    .from("hacienda_settings")
    .update(input)
    .eq("id", SETTINGS_ID)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Cambia la contraseña del usuario autenticado actual. */
export async function cambiarPassword(nueva: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) throw error;
}
