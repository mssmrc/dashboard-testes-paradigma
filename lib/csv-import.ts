import { SCENARIO_STATUSES, type ScenarioStatus } from "@/lib/constants";

export const CSV_COLUMNS = [
  "Cenário",
  "Módulo",
  "Funcionalidade",
  "Status",
  "Data de Conclusão",
  "Executado por",
  "Resultado esperado",
  "Observações",
] as const;

export type CsvScenarioRow = {
  name: string;
  module: string;
  functionality: string;
  status: ScenarioStatus;
  executionDate: string | null;
  executor: string | null;
  expectedResult: string;
  observations: string | null;
};

function normalizeStatus(value: string | undefined | null): ScenarioStatus {
  const trimmed = value?.trim() ?? "";
  if (SCENARIO_STATUSES.includes(trimmed as ScenarioStatus)) {
    return trimmed as ScenarioStatus;
  }
  return "Não iniciado";
}

function parseCsvDate(value: string | undefined | null): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;

  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  return null;
}

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

export function mapCsvRow(row: Record<string, string>): CsvScenarioRow | null {
  const name = row["Cenário"]?.trim();
  const module = row["Módulo"]?.trim();
  const functionality = row["Funcionalidade"]?.trim();
  const expectedResult = row["Resultado esperado"]?.trim();

  if (!name || !module || !functionality || !expectedResult) {
    return null;
  }

  return {
    name,
    module,
    functionality,
    status: normalizeStatus(row["Status"]),
    executionDate: parseCsvDate(row["Data de Conclusão"]),
    executor: emptyToNull(row["Executado por"]),
    expectedResult,
    observations: emptyToNull(row["Observações"]),
  };
}

export function validateCsvHeaders(headers: string[]): string | null {
  const missing = CSV_COLUMNS.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    return `Colunas ausentes no CSV: ${missing.join(", ")}`;
  }
  return null;
}
