"use client";

import { useEffect, useState } from "react";
import { Plus, Save } from "lucide-react";
import type { ScenarioWithEvidences } from "@/lib/actions/scenarios";
import {
  bulkUpdateScenarios,
  deleteScenario,
  bulkUpdateFields,
} from "@/lib/actions/scenarios";
import { ScenarioModal } from "./ScenarioModal";
import { ReportLinkButton } from "./ReportLinkButton";
import { SCENARIO_STATUSES, type ScenarioStatus } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { ScenarioTableRow } from "./ScenarioTableRow";

type ScenarioTableProps = {
  moduleName: string;
  scenarios: ScenarioWithEvidences[];
};

export type ScenarioDraft = {
  status: ScenarioStatus;
  executionDate: string;
  executor: string;
  observations: string;
};

function initDrafts(scenarios: ScenarioWithEvidences[]): Record<number, ScenarioDraft> {
  return Object.fromEntries(
    scenarios.map((s) => [
      s.id,
      {
        status: s.status,
        executionDate: s.executionDate ?? "",
        executor: s.executor ?? "",
        observations: s.observations ?? "",
      },
    ]),
  );
}

function initEvidenceCounts(
  scenarios: ScenarioWithEvidences[],
): Record<number, number> {
  return Object.fromEntries(
    scenarios.map((s) => [s.id, s.evidences.length]),
  );
}


export function ScenarioTable({ moduleName, scenarios }: ScenarioTableProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioWithEvidences | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, ScenarioDraft>>(() =>
    initDrafts(scenarios),
  );
  const [evidenceCounts, setEvidenceCounts] = useState<Record<number, number>>(
    () => initEvidenceCounts(scenarios),
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkDate, setBulkDate] = useState<string>("");
  const [bulkExecutor, setBulkExecutor] = useState<string>("");
  const [bulkObservations, setBulkObservations] = useState<string>("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);

  function handleSelectToggle(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function handleBulkApply() {
    if (selectedIds.length === 0) return;
    setBulkError(null);

    if (!bulkObservations.trim() && !bulkFile) {
      setBulkError("Para aplicar alterações, preencha o campo de observações ou anexe um arquivo de evidência.");
      return;
    }

    setBulkSaving(true);
    setSaveMessage(null);
    try {
      const dataToUpdate: {
        status?: ScenarioStatus;
        executionDate?: string | null;
        executor?: string | null;
        observations?: string | null;
      } = {};

      if (bulkStatus) {
        dataToUpdate.status = bulkStatus as ScenarioStatus;
      }
      if (bulkDate !== undefined && bulkDate !== "") {
        dataToUpdate.executionDate = bulkDate;
      }
      if (bulkExecutor !== undefined && bulkExecutor !== "") {
        dataToUpdate.executor = bulkExecutor;
      }
      if (bulkObservations !== undefined && bulkObservations !== "") {
        dataToUpdate.observations = bulkObservations;
      }

      await bulkUpdateFields(selectedIds, dataToUpdate);

      if (bulkFile) {
        for (const id of selectedIds) {
          const formData = new FormData();
          formData.append("scenarioId", String(id));
          formData.append("file", bulkFile);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Erro ao enviar anexo de evidência.");
          }
        }
      }

      setDrafts((prev) => {
        const next = { ...prev };
        for (const id of selectedIds) {
          if (next[id]) {
            if (bulkStatus) next[id].status = bulkStatus as ScenarioStatus;
            if (bulkDate !== "") next[id].executionDate = bulkDate;
            if (bulkExecutor !== "") next[id].executor = bulkExecutor;
            if (bulkObservations !== "") next[id].observations = bulkObservations;
          }
        }
        return next;
      });

      setSelectedIds([]);
      setBulkStatus("");
      setBulkDate("");
      setBulkExecutor("");
      setBulkObservations("");
      setBulkFile(null);
      setBulkError(null);
      setSaveMessage("Atualização em massa concluída com sucesso.");
      router.refresh();
    } catch (e: any) {
      setBulkError(e.message || "Erro ao aplicar atualização em massa.");
      setSaveMessage("Erro ao aplicar atualização em massa.");
    } finally {
      setBulkSaving(false);
    }
  }

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const s of scenarios) {
        if (!(s.id in next)) {
          next[s.id] = {
            status: s.status,
            executionDate: s.executionDate ?? "",
            executor: s.executor ?? "",
            observations: s.observations ?? "",
          };
        }
      }
      const ids = new Set(scenarios.map((s) => s.id));
      for (const id of Object.keys(next)) {
        if (!ids.has(Number(id))) delete next[Number(id)];
      }
      return next;
    });

    setEvidenceCounts((prev) => {
      const next = { ...prev };
      for (const s of scenarios) {
        if (!(s.id in next)) {
          next[s.id] = s.evidences.length;
        }
      }
      const ids = new Set(scenarios.map((s) => s.id));
      for (const id of Object.keys(next)) {
        if (!ids.has(Number(id))) delete next[Number(id)];
      }
      return next;
    });
  }, [scenarios]);

  function handleDraftChange(
    id: number,
    field: keyof ScenarioDraft,
    value: string,
  ) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: field === "status" ? (value as ScenarioStatus) : value,
      },
    }));
    setDirty(true);
    setSaveMessage(null);
  }

  function handleEvidenceUploaded(id: number) {
    setEvidenceCounts((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }));
  }

  async function handleSaveAll() {
    setSaving(true);
    setSaveMessage(null);
    try {
      const updates = scenarios.map((s) => {
        const draft = drafts[s.id];
        return {
          id: s.id,
          status: draft.status,
          executionDate: draft.executionDate || null,
          executor: draft.executor || null,
          observations: draft.observations || null,
        };
      });
      await bulkUpdateScenarios(updates);
      setDirty(false);
      setSaveMessage("Alterações salvas com sucesso.");
      router.refresh();
    } catch {
      setSaveMessage("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  function openCreate() {
    setSelectedScenario(null);
    setIsCreating(true);
    setModalOpen(true);
  }

  function openEdit(scenario: ScenarioWithEvidences) {
    setSelectedScenario(scenario);
    setIsCreating(false);
    setModalOpen(true);
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Deseja excluir o cenário "${name}"?`)) return;
    await deleteScenario(id);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setEvidenceCounts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    router.refresh();
  }

  const columns = [
    "",
    "Cenário",
    "Evidências",
    "Funcionalidade",
    "Status",
    "Data de Conclusão",
    "Executado por",
    "Resultado Esperado",
    "Observações",
    "Ações",
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {scenarios.length} cenário{scenarios.length !== 1 ? "s" : ""} neste módulo
          </p>
          {dirty && (
            <p className="mt-1 text-xs font-medium text-amber-600">
              Alterações não salvas
            </p>
          )}
          {saveMessage && (
            <p
              className={`mt-1 text-xs ${saveMessage.includes("sucesso") ? "text-green-700" : "text-red-600"}`}
            >
              {saveMessage}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {scenarios.length > 0 && (
            <button
              onClick={handleSaveAll}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          )}
          <ReportLinkButton
            moduleName={moduleName}
            disabled={scenarios.length === 0}
          />
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Novo Cenário
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm animate-fadeIn">
          <div className="text-sm font-medium text-blue-800 self-center">
            {selectedIds.length} cenário{selectedIds.length !== 1 ? "s" : ""} selecionado{selectedIds.length !== 1 ? "s" : ""}
          </div>
          
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alterar Status</label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">(Não alterar)</option>
                {SCENARIO_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alterar Conclusão</label>
              <input
                type="date"
                value={bulkDate}
                onChange={(e) => setBulkDate(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alterar Executor</label>
              <input
                type="text"
                value={bulkExecutor}
                onChange={(e) => setBulkExecutor(e.target.value)}
                placeholder="Nome do executor"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alterar Observações</label>
              <input
                type="text"
                value={bulkObservations}
                onChange={(e) => {
                  setBulkObservations(e.target.value);
                  setBulkError(null);
                }}
                placeholder="Observações"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Anexar Evidência</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setBulkFile(e.target.files?.[0] || null);
                  setBulkError(null);
                }}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[180px]"
              />
            </div>

            <button
              onClick={handleBulkApply}
              disabled={bulkSaving || (!bulkObservations.trim() && !bulkFile)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Aplicar em Lote
            </button>

            <button
              onClick={() => {
                setSelectedIds([]);
                setBulkStatus("");
                setBulkDate("");
                setBulkExecutor("");
                setBulkObservations("");
                setBulkFile(null);
                setBulkError(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
          {bulkError && (
            <div className="w-full text-xs font-semibold text-red-600 mt-2">
              {bulkError}
            </div>
          )}
        </div>
      )}

      {scenarios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-slate-500">Nenhum cenário cadastrado neste módulo.</p>
          <button
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Adicionar primeiro cenário
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1500px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={col || idx}
                      className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap"
                    >
                      {idx === 0 ? (
                        <input
                          type="checkbox"
                          checked={scenarios.length > 0 && selectedIds.length === scenarios.length}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = selectedIds.length > 0 && selectedIds.length < scenarios.length;
                            }
                          }}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(scenarios.map((s) => s.id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      ) : (
                        col
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scenarios.map((scenario) => (
                  <ScenarioTableRow
                    key={scenario.id}
                    scenario={scenario}
                    draft={
                      drafts[scenario.id] ?? {
                        status: scenario.status,
                        executionDate: scenario.executionDate ?? "",
                        executor: scenario.executor ?? "",
                        observations: scenario.observations ?? "",
                      }
                    }
                    evidenceCount={evidenceCounts[scenario.id] ?? 0}
                    onDraftChange={handleDraftChange}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onEvidenceUploaded={handleEvidenceUploaded}
                    isSelected={selectedIds.includes(scenario.id)}
                    onSelectToggle={handleSelectToggle}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveAll}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <ScenarioModal
          moduleName={moduleName}
          scenario={selectedScenario}
          isCreating={isCreating}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
