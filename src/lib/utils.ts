import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return "—";
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const MESES_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export function getMesesRecientes(n = 13): Array<{ value: string; label: string }> {
  const hoy = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    return { value: d.toISOString().slice(0, 7), label: `${MESES_ES[d.getMonth()]} ${d.getFullYear()}` };
  });
}
