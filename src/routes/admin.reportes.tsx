import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Beef,
  Download,
  FileText,
  HeartPulse,
  Milk,
  Printer,
  Wallet,
} from "lucide-react";
import { listarAnimales, calcularEdad } from "@/lib/animals";
import { listarOrdenosRecientes, listarUltimos30Dias, agruparPorDia } from "@/lib/milk";
import { listarEventosRecientes, tipoLabel as healthLabel } from "@/lib/health";
import { listarVentas, listarEgresos, categoriaLabel, resumenMensual } from "@/lib/finance";
import {
  downloadCSV,
  edadAnos,
  fmtFecha,
  fmtMoney,
  fmtNum,
  printableReport,
  toCSV,
} from "@/lib/reports";

export const Route = createFileRoute("/admin/reportes")({ component: Reportes });

function Reportes() {
  const animalesQ = useQuery({ queryKey: ["animals"], queryFn: listarAnimales });
  const ordenosQ = useQuery({
    queryKey: ["milk", "recent", "all"],
    queryFn: () => listarOrdenosRecientes(1000),
  });
  const trendQ = useQuery({ queryKey: ["milk", "trend30"], queryFn: listarUltimos30Dias });
  const saludQ = useQuery({
    queryKey: ["health", "recent", "all"],
    queryFn: () => listarEventosRecientes(500),
  });
  const ventasQ = useQuery({ queryKey: ["sales"], queryFn: () => listarVentas(1000) });
  const egresosQ = useQuery({ queryKey: ["expenses"], queryFn: () => listarEgresos(1000) });
  const finQ = useQuery({ queryKey: ["finance", "summary", 12], queryFn: () => resumenMensual(12) });

  const ready =
    !animalesQ.isLoading &&
    !ordenosQ.isLoading &&
    !saludQ.isLoading &&
    !ventasQ.isLoading &&
    !egresosQ.isLoading;

  // ============================================================
  // REPORTE 1: Inventario de ganado
  // ============================================================
  function exportInventarioCSV() {
    const rows = (animalesQ.data ?? []).map((a) => ({
      arete: a.tag_number,
      nombre: a.name ?? "",
      raza: a.breed,
      sexo: a.sex,
      color: a.color ?? "",
      fecha_nacimiento: a.birth_date,
      edad_anos: edadAnos(a.birth_date),
      peso_kg: a.current_weight_kg ?? "",
      proposito: a.purpose ?? "",
      ubicacion: a.location ?? "",
      estado: a.status,
      en_venta: a.for_sale ? "sí" : "no",
      precio_usd: a.sale_price ?? "",
    }));
    downloadCSV(`inventario_ganado_${hoy()}`, toCSV(rows, {
      arete: "Arete",
      nombre: "Nombre",
      raza: "Raza",
      sexo: "Sexo",
      color: "Color",
      fecha_nacimiento: "Nacimiento",
      edad_anos: "Edad (años)",
      peso_kg: "Peso (kg)",
      proposito: "Propósito",
      ubicacion: "Ubicación",
      estado: "Estado",
      en_venta: "En venta",
      precio_usd: "Precio (USD)",
    }));
  }

  function imprimirInventario() {
    const animales = animalesQ.data ?? [];
    const html = `
      <h1>Inventario de Ganado</h1>
      <div class="meta">${animales.length} animales registrados al ${fmtFecha(new Date().toISOString().slice(0, 10))}</div>
      <table>
        <thead>
          <tr>
            <th>Arete</th><th>Nombre</th><th>Raza</th><th>Sexo</th>
            <th>Edad</th><th>Propósito</th><th>Ubicación</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${animales.map((a) => `
            <tr>
              <td>${a.tag_number}</td>
              <td>${a.name ?? "—"}</td>
              <td>${a.breed}</td>
              <td>${a.sex}</td>
              <td>${calcularEdad(a.birth_date)}</td>
              <td>${a.purpose ?? "—"}</td>
              <td>${a.location ?? "—"}</td>
              <td>${a.status.replace("_", " ")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    printableReport("Inventario de Ganado — El Milagrito", html);
  }

  // ============================================================
  // REPORTE 2: Producción de leche
  // ============================================================
  function exportLecheCSV() {
    const rows = (ordenosQ.data ?? []).map((o) => ({
      fecha: o.fecha,
      vaca: o.animals?.name ?? "",
      arete: o.animals?.tag_number ?? "",
      turno: o.turno,
      litros: Number(o.litros).toFixed(1),
    }));
    downloadCSV(`produccion_leche_${hoy()}`, toCSV(rows, {
      fecha: "Fecha",
      vaca: "Vaca",
      arete: "Arete",
      turno: "Turno",
      litros: "Litros",
    }));
  }

  function imprimirLeche() {
    const trend = agruparPorDia((trendQ.data ?? []) as { fecha: string; litros: number }[]);
    const total = trend.reduce((s, x) => s + x.litros, 0);
    const promedio = trend.length ? total / trend.length : 0;

    const html = `
      <h1>Producción de Leche — Últimos 30 días</h1>
      <div class="meta">Total: ${fmtNum(total, 1)} L · Promedio diario: ${fmtNum(promedio, 1)} L</div>
      <h2>Resumen por día</h2>
      <table>
        <thead><tr><th>Fecha</th><th style="text-align:right">Litros del día</th></tr></thead>
        <tbody>
          ${trend.map((d) => `
            <tr>
              <td>${fmtFecha(d.fecha)}</td>
              <td style="text-align:right">${fmtNum(d.litros, 1)}</td>
            </tr>
          `).join("")}
          <tr class="total-row"><td>TOTAL</td><td style="text-align:right">${fmtNum(total, 1)} L</td></tr>
        </tbody>
      </table>
    `;
    printableReport("Producción de Leche — El Milagrito", html);
  }

  // ============================================================
  // REPORTE 3: Eventos de salud
  // ============================================================
  function exportSaludCSV() {
    const rows = (saludQ.data ?? []).map((e) => ({
      fecha: e.fecha,
      vaca: e.animals?.name ?? "",
      arete: e.animals?.tag_number ?? "",
      tipo: healthLabel(e.tipo),
      titulo: e.titulo,
      medicamento: e.medicamento ?? "",
      dosis: e.dosis ?? "",
      veterinario: e.veterinario ?? "",
      proxima_fecha: e.proxima_fecha ?? "",
      costo: e.costo ?? "",
      resuelto: e.resuelto ? "sí" : "no",
    }));
    downloadCSV(`eventos_salud_${hoy()}`, toCSV(rows, {
      fecha: "Fecha",
      vaca: "Vaca",
      arete: "Arete",
      tipo: "Tipo",
      titulo: "Título",
      medicamento: "Medicamento",
      dosis: "Dosis",
      veterinario: "Veterinario",
      proxima_fecha: "Próxima",
      costo: "Costo (USD)",
      resuelto: "Resuelto",
    }));
  }

  function imprimirSalud() {
    const eventos = saludQ.data ?? [];
    const totalCosto = eventos.reduce((s, e) => s + Number(e.costo ?? 0), 0);

    const html = `
      <h1>Historial Sanitario</h1>
      <div class="meta">${eventos.length} eventos registrados · Costo total: ${fmtMoney(totalCosto)}</div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th><th>Vaca</th><th>Tipo</th>
            <th>Detalle</th><th>Veterinario</th><th style="text-align:right">Costo</th>
          </tr>
        </thead>
        <tbody>
          ${eventos.map((e) => `
            <tr>
              <td>${fmtFecha(e.fecha)}</td>
              <td>${e.animals?.name ?? "—"} (${e.animals?.tag_number ?? ""})</td>
              <td>${healthLabel(e.tipo)}</td>
              <td>${e.titulo}${e.medicamento ? ` — ${e.medicamento}` : ""}</td>
              <td>${e.veterinario ?? "—"}</td>
              <td style="text-align:right">${e.costo ? fmtMoney(Number(e.costo)) : "—"}</td>
            </tr>
          `).join("")}
          <tr class="total-row"><td colspan="5">TOTAL</td><td style="text-align:right">${fmtMoney(totalCosto)}</td></tr>
        </tbody>
      </table>
    `;
    printableReport("Historial Sanitario — El Milagrito", html);
  }

  // ============================================================
  // REPORTE 4: Resumen financiero
  // ============================================================
  function exportFinanzasCSV() {
    const rows = (finQ.data ?? []).map((m) => ({
      mes: m.mes,
      ingresos: m.ingresos.toFixed(2),
      egresos: m.egresos.toFixed(2),
      neto: m.neto.toFixed(2),
    }));
    downloadCSV(`resumen_financiero_${hoy()}`, toCSV(rows, {
      mes: "Mes",
      ingresos: "Ingresos (USD)",
      egresos: "Egresos (USD)",
      neto: "Neto (USD)",
    }));
  }

  function imprimirFinanzas() {
    const meses = finQ.data ?? [];
    const totalIng = meses.reduce((s, m) => s + m.ingresos, 0);
    const totalEgr = meses.reduce((s, m) => s + m.egresos, 0);
    const neto = totalIng - totalEgr;

    const html = `
      <h1>Resumen Financiero</h1>
      <div class="meta">Últimos ${meses.length} meses</div>
      <table>
        <thead>
          <tr>
            <th>Mes</th>
            <th style="text-align:right">Ingresos</th>
            <th style="text-align:right">Egresos</th>
            <th style="text-align:right">Neto</th>
          </tr>
        </thead>
        <tbody>
          ${meses.map((m) => `
            <tr>
              <td>${m.mes}</td>
              <td style="text-align:right; color:#2e7d32">${fmtMoney(m.ingresos)}</td>
              <td style="text-align:right; color:#c62828">${fmtMoney(m.egresos)}</td>
              <td style="text-align:right; font-weight:600; color:${m.neto >= 0 ? "#2e7d32" : "#c62828"}">${fmtMoney(m.neto)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td>TOTAL</td>
            <td style="text-align:right">${fmtMoney(totalIng)}</td>
            <td style="text-align:right">${fmtMoney(totalEgr)}</td>
            <td style="text-align:right">${fmtMoney(neto)}</td>
          </tr>
        </tbody>
      </table>

      <h2>Detalle de ventas recientes</h2>
      <table>
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Cliente</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>
          ${(ventasQ.data ?? []).slice(0, 30).map((v) => `
            <tr>
              <td>${fmtFecha(v.fecha)}</td>
              <td>${v.tipo}</td>
              <td>${v.clients?.nombre ?? "—"}</td>
              <td style="text-align:right">${fmtMoney(Number(v.total))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <h2>Detalle de egresos recientes</h2>
      <table>
        <thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th style="text-align:right">Monto</th></tr></thead>
        <tbody>
          ${(egresosQ.data ?? []).slice(0, 30).map((e) => `
            <tr>
              <td>${fmtFecha(e.fecha)}</td>
              <td>${categoriaLabel(e.categoria)}</td>
              <td>${e.descripcion}</td>
              <td style="text-align:right">${fmtMoney(Number(e.monto))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    printableReport("Resumen Financiero — El Milagrito", html);
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Reportes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Descargá reportes en CSV (Excel) o imprimilos como PDF.
        </p>
      </div>

      {!ready ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <ReportCard
            icon={<Beef className="h-6 w-6" />}
            titulo="Inventario de ganado"
            descripcion={`${animalesQ.data?.length ?? 0} animales registrados con sus datos clave.`}
            onCSV={exportInventarioCSV}
            onPDF={imprimirInventario}
          />
          <ReportCard
            icon={<Milk className="h-6 w-6" />}
            titulo="Producción de leche"
            descripcion={`${ordenosQ.data?.length ?? 0} ordeños registrados (últimos 30 días).`}
            onCSV={exportLecheCSV}
            onPDF={imprimirLeche}
          />
          <ReportCard
            icon={<HeartPulse className="h-6 w-6" />}
            titulo="Historial sanitario"
            descripcion={`${saludQ.data?.length ?? 0} eventos médicos: vacunas, tratamientos, visitas.`}
            onCSV={exportSaludCSV}
            onPDF={imprimirSalud}
          />
          <ReportCard
            icon={<Wallet className="h-6 w-6" />}
            titulo="Resumen financiero"
            descripcion={`Ingresos vs egresos de los últimos ${finQ.data?.length ?? 0} meses.`}
            onCSV={exportFinanzasCSV}
            onPDF={imprimirFinanzas}
          />
        </div>
      )}

      <Card className="p-5 shadow-soft bg-secondary/40">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">¿Cómo guardar como PDF?</p>
            <p className="text-muted-foreground">
              Hacé clic en <strong>"Imprimir"</strong>. Se abre el diálogo de impresión.
              En el campo "Destino" escogé <strong>"Guardar como PDF"</strong> y listo —
              te queda un archivo PDF que podés enviar o archivar.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReportCard({
  icon,
  titulo,
  descripcion,
  onCSV,
  onPDF,
}: {
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
  onCSV: () => void;
  onPDF: () => void;
}) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-display text-lg">{titulo}</h3>
          <p className="text-xs text-muted-foreground">{descripcion}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCSV} variant="outline" size="sm" className="gap-1.5 flex-1">
          <Download className="h-4 w-4" /> CSV / Excel
        </Button>
        <Button onClick={onPDF} variant="forest" size="sm" className="gap-1.5 flex-1">
          <Printer className="h-4 w-4" /> Imprimir / PDF
        </Button>
      </div>
    </Card>
  );
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}
