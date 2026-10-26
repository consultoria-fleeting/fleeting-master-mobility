/**
 * Exportação de dados tabulares para CSV (compatível com Excel).
 *
 * Segurança: valores que começam com `=`, `+`, `-` ou `@` podem ser interpretados como
 * fórmulas pelo Excel (CSV/formula injection). Esses valores recebem um apóstrofo na frente.
 */

const SEPARATOR = ";";

/** Neutraliza fórmulas e escapa aspas/separadores de uma célula. */
export function sanitizeCsvCell(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? "" : String(value);

  // Números (inclusive negativos) nunca viram fórmula; só texto precisa ser neutralizado.
  if (typeof value !== "number" && /^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Gera o conteúdo CSV (cabeçalho + linhas). */
export function buildCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [header, ...rows].map((row) => row.map(sanitizeCsvCell).join(SEPARATOR));
  return lines.join("\n");
}

/** Baixa um CSV no navegador. O BOM UTF-8 faz o Excel reconhecer os acentos. */
export function downloadCsv(
  fileName: string,
  header: string[],
  rows: (string | number | null | undefined)[][],
): void {
  const blob = new Blob(["\uFEFF" + buildCsv(header, rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
