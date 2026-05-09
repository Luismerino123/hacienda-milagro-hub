import holstein from "@/assets/cow-holstein.jpg";
import jersey from "@/assets/cow-jersey.jpg";
import brahman from "@/assets/cow-brahman.jpg";
import pardo from "@/assets/cow-pardo.jpg";

export type Sexo = "Hembra" | "Macho";
export type Proposito = "Lechera" | "Engorde" | "Reproducción" | "Cría";
export type EstadoAnimal = "Activo" | "En venta" | "Vendido" | "Tratamiento";
export type Raza = "Holstein" | "Jersey" | "Brahman" | "Pardo Suizo";

const fotoPorRaza: Record<Raza, string> = {
  Holstein: holstein,
  Jersey: jersey,
  Brahman: brahman,
  "Pardo Suizo": pardo,
};

export interface Animal {
  id: string;
  arete: string;
  nombre: string;
  raza: Raza;
  sexo: Sexo;
  color: string;
  fechaNacimiento: string;
  pesoKg: number;
  proposito: Proposito;
  estado: EstadoAnimal;
  potrero: string;
  madre?: string;
  padre?: string;
  produccionPromedio?: number;
  notas?: string;
  foto: string;
}

const nombresHembras = ["Lucero", "Margarita", "Estrella", "Flor", "Dulce", "Bonita", "Negrita", "Manchita", "Azucena", "Reina", "Linda", "Pinta", "Catrina"];
const nombresMachos = ["Tornado", "Trueno", "Capitán", "Sultán", "Bravo", "Rayo", "Milagro"];

function diasAtras(d: number): string {
  const f = new Date();
  f.setDate(f.getDate() - d);
  return f.toISOString().slice(0, 10);
}

export const animales: Animal[] = [
  { id: "a1", arete: "EM-001", nombre: "Lucero", raza: "Holstein", sexo: "Hembra", color: "Blanco con negro", fechaNacimiento: diasAtras(365 * 4), pesoKg: 580, proposito: "Lechera", estado: "Activo", potrero: "Potrero 1", produccionPromedio: 24.5, foto: fotoPorRaza.Holstein, notas: "Mejor productora del hato." },
  { id: "a2", arete: "EM-002", nombre: "Margarita", raza: "Holstein", sexo: "Hembra", color: "Blanco con negro", fechaNacimiento: diasAtras(365 * 5), pesoKg: 600, proposito: "Lechera", estado: "Activo", potrero: "Potrero 1", produccionPromedio: 22.8, foto: fotoPorRaza.Holstein },
  { id: "a3", arete: "EM-003", nombre: "Estrella", raza: "Jersey", sexo: "Hembra", color: "Café claro", fechaNacimiento: diasAtras(365 * 3), pesoKg: 420, proposito: "Lechera", estado: "Activo", potrero: "Potrero 2", produccionPromedio: 18.2, foto: fotoPorRaza.Jersey },
  { id: "a4", arete: "EM-004", nombre: "Tornado", raza: "Brahman", sexo: "Macho", color: "Blanco", fechaNacimiento: diasAtras(365 * 6), pesoKg: 850, proposito: "Reproducción", estado: "Activo", potrero: "Potrero 5", foto: fotoPorRaza.Brahman, notas: "Toro reproductor principal." },
  { id: "a5", arete: "EM-005", nombre: "Flor", raza: "Pardo Suizo", sexo: "Hembra", color: "Pardo", fechaNacimiento: diasAtras(365 * 4), pesoKg: 560, proposito: "Lechera", estado: "Activo", potrero: "Potrero 1", produccionPromedio: 21.0, foto: fotoPorRaza["Pardo Suizo"] },
  { id: "a6", arete: "EM-006", nombre: "Dulce", raza: "Jersey", sexo: "Hembra", color: "Café", fechaNacimiento: diasAtras(365 * 2), pesoKg: 380, proposito: "Lechera", estado: "Activo", potrero: "Potrero 2", produccionPromedio: 17.5, foto: fotoPorRaza.Jersey, madre: "Estrella" },
  { id: "a7", arete: "EM-007", nombre: "Bonita", raza: "Holstein", sexo: "Hembra", color: "Blanco con negro", fechaNacimiento: diasAtras(365 * 3), pesoKg: 540, proposito: "Lechera", estado: "Activo", potrero: "Potrero 1", produccionPromedio: 23.1, foto: fotoPorRaza.Holstein },
  { id: "a8", arete: "EM-008", nombre: "Trueno", raza: "Brahman", sexo: "Macho", color: "Blanco", fechaNacimiento: diasAtras(365), pesoKg: 320, proposito: "Engorde", estado: "En venta", potrero: "Potrero 4", foto: fotoPorRaza.Brahman, padre: "Tornado" },
  { id: "a9", arete: "EM-009", nombre: "Negrita", raza: "Holstein", sexo: "Hembra", color: "Negro", fechaNacimiento: diasAtras(365 * 5), pesoKg: 590, proposito: "Lechera", estado: "Activo", potrero: "Potrero 1", produccionPromedio: 25.3, foto: fotoPorRaza.Holstein, notas: "Top productora." },
  { id: "a10", arete: "EM-010", nombre: "Manchita", raza: "Pardo Suizo", sexo: "Hembra", color: "Pardo claro", fechaNacimiento: diasAtras(365 * 3), pesoKg: 510, proposito: "Lechera", estado: "Activo", potrero: "Potrero 2", produccionPromedio: 19.8, foto: fotoPorRaza["Pardo Suizo"] },
  { id: "a11", arete: "EM-011", nombre: "Capitán", raza: "Brahman", sexo: "Macho", color: "Blanco", fechaNacimiento: diasAtras(540), pesoKg: 480, proposito: "Engorde", estado: "En venta", potrero: "Potrero 4", foto: fotoPorRaza.Brahman },
  { id: "a12", arete: "EM-012", nombre: "Azucena", raza: "Jersey", sexo: "Hembra", color: "Café", fechaNacimiento: diasAtras(365 * 4), pesoKg: 410, proposito: "Lechera", estado: "Activo", potrero: "Potrero 2", produccionPromedio: 18.9, foto: fotoPorRaza.Jersey },
  { id: "a13", arete: "EM-013", nombre: "Reina", raza: "Holstein", sexo: "Hembra", color: "Blanco con negro", fechaNacimiento: diasAtras(365 * 6), pesoKg: 620, proposito: "Lechera", estado: "Tratamiento", potrero: "Enfermería", produccionPromedio: 20.1, foto: fotoPorRaza.Holstein, notas: "En tratamiento por mastitis leve." },
  { id: "a14", arete: "EM-014", nombre: "Sultán", raza: "Pardo Suizo", sexo: "Macho", color: "Pardo", fechaNacimiento: diasAtras(365 * 2), pesoKg: 540, proposito: "Reproducción", estado: "Activo", potrero: "Potrero 5", foto: fotoPorRaza["Pardo Suizo"] },
  { id: "a15", arete: "EM-015", nombre: "Linda", raza: "Holstein", sexo: "Hembra", color: "Blanco con negro", fechaNacimiento: diasAtras(180), pesoKg: 220, proposito: "Cría", estado: "Activo", potrero: "Potrero 3", foto: fotoPorRaza.Holstein, madre: "Lucero" },
  { id: "a16", arete: "EM-016", nombre: "Pinta", raza: "Jersey", sexo: "Hembra", color: "Café con blanco", fechaNacimiento: diasAtras(150), pesoKg: 180, proposito: "Cría", estado: "Activo", potrero: "Potrero 3", foto: fotoPorRaza.Jersey, madre: "Estrella" },
  { id: "a17", arete: "EM-017", nombre: "Bravo", raza: "Brahman", sexo: "Macho", color: "Blanco", fechaNacimiento: diasAtras(720), pesoKg: 600, proposito: "Engorde", estado: "En venta", potrero: "Potrero 4", foto: fotoPorRaza.Brahman },
  { id: "a18", arete: "EM-018", nombre: "Catrina", raza: "Pardo Suizo", sexo: "Hembra", color: "Pardo", fechaNacimiento: diasAtras(365 * 4), pesoKg: 550, proposito: "Lechera", estado: "Activo", potrero: "Potrero 1", produccionPromedio: 22.0, foto: fotoPorRaza["Pardo Suizo"] },
];

export const totalCabezas = animales.length;
export const vacasProduccion = animales.filter(a => a.proposito === "Lechera" && a.estado === "Activo").length;
export const terneros = animales.filter(a => a.proposito === "Cría").length;
export const prenadas = 4;

// Producción últimos 30 días (litros totales por día)
export const produccionDiaria = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const base = 240;
  const litros = Math.round(base + Math.sin(i / 3) * 18 + Math.random() * 12);
  return { fecha: d.toISOString().slice(5, 10), litros };
});

export const topProductoras = [...animales]
  .filter(a => a.produccionPromedio)
  .sort((a, b) => (b.produccionPromedio ?? 0) - (a.produccionPromedio ?? 0))
  .slice(0, 5);

export const proximasVacunas = [
  { animal: "Lucero", arete: "EM-001", vacuna: "Brucelosis", fecha: diasAtras(-3) },
  { animal: "Tornado", arete: "EM-004", vacuna: "Aftosa", fecha: diasAtras(-5) },
  { animal: "Bonita", arete: "EM-007", vacuna: "Carbón sintomático", fecha: diasAtras(-7) },
  { animal: "Linda", arete: "EM-015", vacuna: "Triple bovina", fecha: diasAtras(-10) },
];

export const proximosPartos = [
  { animal: "Margarita", arete: "EM-002", fecha: diasAtras(-12) },
  { animal: "Flor", arete: "EM-005", fecha: diasAtras(-25) },
  { animal: "Azucena", arete: "EM-012", fecha: diasAtras(-40) },
];

export const ingresosVsEgresos = [
  { mes: "May", ingresos: 18500, egresos: 9200 },
  { mes: "Jun", ingresos: 19200, egresos: 8700 },
  { mes: "Jul", ingresos: 21000, egresos: 10100 },
  { mes: "Ago", ingresos: 22300, egresos: 9800 },
  { mes: "Sep", ingresos: 23500, egresos: 11200 },
  { mes: "Oct", ingresos: 24100, egresos: 10500 },
];

export const ventasLeche = [
  { id: "v1", cliente: "Lácteos San Juan", fecha: diasAtras(2), litros: 180, precio: 0.85 },
  { id: "v2", cliente: "Quesería La Granja", fecha: diasAtras(5), litros: 220, precio: 0.90 },
  { id: "v3", cliente: "Cooperativa El Valle", fecha: diasAtras(7), litros: 350, precio: 0.82 },
  { id: "v4", cliente: "Lácteos San Juan", fecha: diasAtras(10), litros: 200, precio: 0.85 },
];

export const alertas = [
  { tipo: "Vacuna", mensaje: "Lucero (EM-001) requiere vacuna de brucelosis en 3 días", nivel: "media" },
  { tipo: "Producción", mensaje: "Reina (EM-013) bajó su producción 28% esta semana", nivel: "alta" },
  { tipo: "Parto", mensaje: "Margarita (EM-002) tiene parto estimado en 12 días", nivel: "media" },
  { tipo: "Tratamiento", mensaje: "Reina (EM-013) finaliza tratamiento mañana", nivel: "baja" },
];
