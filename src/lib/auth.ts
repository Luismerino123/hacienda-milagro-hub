// Auth simulada en localStorage. Reemplazar por Supabase Auth.
const KEY = "milagrito_auth";
export type Rol = "admin" | "trabajador" | "contador";
export interface Sesion { email: string; nombre: string; rol: Rol; }

const USUARIOS: Record<string, { password: string; nombre: string; rol: Rol }> = {
  "admin@milagrito.com": { password: "admin123", nombre: "Don Ramiro", rol: "admin" },
  "ordeno@milagrito.com": { password: "ordeno123", nombre: "Carlos Méndez", rol: "trabajador" },
  "contador@milagrito.com": { password: "contador123", nombre: "María López", rol: "contador" },
};

export function login(email: string, password: string): Sesion | null {
  const u = USUARIOS[email.toLowerCase()];
  if (!u || u.password !== password) return null;
  const s: Sesion = { email, nombre: u.nombre, rol: u.rol };
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}
export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
export function getSesion(): Sesion | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Sesion) : null;
}
