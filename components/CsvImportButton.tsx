"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { bulkImportScenarios } from "@/lib/actions/scenarios";
import { mapCsvRow, validateCsvHeaders } from "@/lib/csv-import";

export function CsvImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      complete: async (results) => {
        try {
          const headers = results.meta.fields ?? [];
          const headerError = validateCsvHeaders(headers);
          if (headerError) {
            setMessage({ type: "error", text: headerError });
            return;
          }

          const mapped = results.data
            .map(mapCsvRow)
            .filter((row): row is NonNullable<typeof row> => row !== null);

          const skipped = results.data.length - mapped.length;
          if (mapped.length === 0) {
            setMessage({
              type: "error",
              text: "Nenhuma linha válida encontrada. Verifique se Cenário, Módulo, Funcionalidade e Resultado esperado estão preenchidos.",
            });
            return;
          }

          const { inserted } = await bulkImportScenarios(mapped);
          router.refresh();

          const skippedMsg =
            skipped > 0 ? ` (${skipped} linha(s) ignorada(s) por dados incompletos)` : "";
          setMessage({
            type: "success",
            text: `${inserted} cenário(s) importado(s) com sucesso${skippedMsg}.`,
          });
        } catch {
          setMessage({ type: "error", text: "Erro ao importar CSV." });
        } finally {
          setImporting(false);
          if (inputRef.current) inputRef.current.value = "";
        }
      },
      error: () => {
        setMessage({ type: "error", text: "Erro ao ler o arquivo CSV." });
        setImporting(false);
        if (inputRef.current) inputRef.current.value = "";
      },
    });
  }

  return (
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={importing}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {importing ? "Importando..." : "Importar CSV"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
      />
      {message && (
        <p
          className={`mt-2 text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
