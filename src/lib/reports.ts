/**
 * Utilidades para generar reportes en CSV y para imprimir/guardar como PDF
 * usando el diálogo nativo del navegador (sin librerías pesadas).
 */

/** Escapa un campo para CSV (maneja comas, comillas y saltos de línea). */
function escapeCSV(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Convierte un array de objetos en una cadena CSV.
 * El primer objeto define las columnas. Las cabeceras se pueden personalizar.
 */
export function toCSV<T extends Record<string, unknown>>(
  rows: T[],
  headers?: Record<string, string>,
): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const headerRow = keys.map((k) => escapeCSV(headers?.[k] ?? k)).join(",");
  const dataRows = rows.map((row) =>
    keys.map((k) => escapeCSV(row[k])).join(","),
  );
  // BOM para que Excel interprete UTF-8 correctamente
  return "﻿" + [headerRow, ...dataRows].join("\n");
}

/** Dispara la descarga de un archivo CSV con el nombre dado. */
export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Abre una ventana nueva con HTML pre-formateado para imprimir.
 * El usuario puede guardar como PDF desde el diálogo de impresión del navegador.
 */
export function printableReport(title: string, htmlContent: string): void {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page { size: A4; margin: 1.5cm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1a1a1a;
          margin: 0;
          padding: 0;
        }
        h1 {
          font-family: Georgia, serif;
          font-size: 24pt;
          margin: 0 0 4pt 0;
          color: #1f3a1f;
        }
        h2 {
          font-family: Georgia, serif;
          font-size: 14pt;
          margin: 18pt 0 6pt 0;
          color: #1f3a1f;
          border-bottom: 1px solid #c2a85b;
          padding-bottom: 3pt;
        }
        .meta {
          color: #666;
          font-size: 9pt;
          margin-bottom: 18pt;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 8pt 0;
          font-size: 9pt;
        }
        th, td {
          padding: 5pt 8pt;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #f5efe3;
          font-weight: 600;
          color: #1f3a1f;
        }
        tr:nth-child(even) td { background: #fafafa; }
        .total-row {
          font-weight: 700;
          background: #f5efe3 !important;
        }
        .footer {
          margin-top: 30pt;
          font-size: 8pt;
          color: #999;
          text-align: center;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      ${htmlContent}
      <div class="footer">
        Generado el ${new Date().toLocaleString("es-SV")} — Hacienda El Milagrito
      </div>
      <script>window.onload = () => { window.print(); };</script>
    </body>
    </html>
  `);
  w.document.close();
}

/** Formatea un número como string con separador de miles. */
export function fmtNum(n: number | null | undefined, decimales = 0): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("es-SV", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/** Formatea un valor monetario en USD. */
export function fmtMoney(n: number | null | undefined): string {
  if (n == null) return "—";
  return `$${Number(n).toFixed(2)}`;
}

/** Formatea fecha YYYY-MM-DD a formato legible. */
export function fmtFecha(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("es-SV", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

/** Calcula edad de animal en años con un decimal a partir de fecha de nacimiento. */
export function edadAnos(birthDate: string): number {
  const ms = Date.now() - new Date(birthDate).getTime();
  return Math.round((ms / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10;
}
