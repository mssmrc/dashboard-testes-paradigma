"use client";

import { useRef, useState } from "react";
import { Eye, Pencil, Trash2, Paperclip } from "lucide-react";
import type { ScenarioWithEvidences } from "@/lib/actions/scenarios";
import { SCENARIO_STATUSES } from "@/lib/constants";
import type { ScenarioDraft } from "./ScenarioTable";

type ScenarioTableRowProps = {
  scenario: ScenarioWithEvidences;
  draft: ScenarioDraft;
  evidenceCount: number;
  onDraftChange: (id: number, field: keyof ScenarioDraft, value: string) => void;
  onEdit: (s: ScenarioWithEvidences) => void;
  onDelete: (id: number, name: string) => void;
  onEvidenceUploaded: (id: number) => void;
  isSelected: boolean;
  onSelectToggle: (id: number) => void;
};

function TextCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-300">—</span>;
  return <span className="whitespace-normal break-words">{value}</span>;
}

export function ScenarioTableRow({
  scenario,
  draft,
  evidenceCount,
  onDraftChange,
  onEdit,
  onDelete,
  onEvidenceUploaded,
  isSelected,
  onSelectToggle,
}: ScenarioTableRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (evidenceCount >= 5) {
      alert("Limite de 5 evidências por cenário atingido.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("scenarioId", String(scenario.id));
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Erro no upload.");
        return;
      }
      onEvidenceUploaded(scenario.id);
    } catch {
      alert("Erro no upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const isCompleted = draft.status === "Concluído";

  return (
    <tr className={`align-top hover:bg-slate-50 ${isCompleted ? "bg-gray-100" : ""}`}>
      <td className="px-3 py-2.5 select-none">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectToggle(scenario.id)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="min-w-[300px] px-3 py-2.5 font-medium text-slate-800">
        <TextCell value={scenario.name} />
      </td>
      <td className="min-w-[140px] px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {evidenceCount}/5
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || evidenceCount >= 5}
            title="Subir anexo"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Paperclip className="h-3.5 w-3.5" />
            {uploading ? "..." : "Subir Anexo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </td>
      <td className="min-w-[160px] px-3 py-2.5 text-slate-700">
        <TextCell value={scenario.functionality} />
      </td>
      <td className="min-w-[140px] px-3 py-2.5">
        <select
          value={draft.status}
          onChange={(e) =>
            onDraftChange(scenario.id, "status", e.target.value)
          }
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {SCENARIO_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="min-w-[150px] px-3 py-2.5">
        <input
          type="date"
          lang="pt-BR"
          value={draft.executionDate}
          onChange={(e) =>
            onDraftChange(scenario.id, "executionDate", e.target.value)
          }
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </td>
      <td className="min-w-[150px] px-3 py-2.5">
        <input
          type="text"
          value={draft.executor}
          onChange={(e) =>
            onDraftChange(scenario.id, "executor", e.target.value)
          }
          placeholder="Opcional"
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </td>
      <td className="min-w-[300px] px-3 py-2.5 text-slate-700">
        <TextCell value={scenario.expectedResult} />
      </td>
      <td className="min-w-[300px] px-3 py-2.5">
        <input
          type="text"
          value={draft.observations}
          onChange={(e) =>
            onDraftChange(scenario.id, "observations", e.target.value)
          }
          placeholder="Opcional"
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </td>
      <td className="min-w-[100px] px-3 py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(scenario)}
            className="rounded p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
            title="Ver / Editar"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(scenario)}
            className="rounded p-1.5 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(scenario.id, scenario.name)}
            className="rounded p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
