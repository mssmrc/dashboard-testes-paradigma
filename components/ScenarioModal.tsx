"use client";

import { useState, useRef } from "react";
import { X, Upload, Trash2, Save } from "lucide-react";
import Image from "next/image";
import type { ScenarioWithEvidences } from "@/lib/actions/scenarios";
import {
  createScenario,
  updateScenario,
  deleteEvidence,
} from "@/lib/actions/scenarios";
import { SCENARIO_STATUSES, type ScenarioStatus } from "@/lib/constants";
import { useRouter } from "next/navigation";

type ScenarioModalProps = {
  moduleName: string;
  scenario: ScenarioWithEvidences | null;
  isCreating: boolean;
  onClose: () => void;
};

export function ScenarioModal({
  moduleName,
  scenario,
  isCreating,
  onClose,
}: ScenarioModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evidences, setEvidences] = useState(scenario?.evidences ?? []);

  const [form, setForm] = useState<{
    functionality: string;
    name: string;
    expectedResult: string;
    status: ScenarioStatus;
    executionDate: string;
    executor: string;
    observations: string;
  }>({
    functionality: scenario?.functionality ?? "",
    name: scenario?.name ?? "",
    expectedResult: scenario?.expectedResult ?? "",
    status: scenario?.status ?? "Não iniciado",
    executionDate: scenario?.executionDate ?? "",
    executor: scenario?.executor ?? "",
    observations: scenario?.observations ?? "",
  });

  async function handleSave() {
    setError(null);
    if (!form.functionality || !form.name || !form.expectedResult) {
      setError("Preencha funcionalidade, cenário e resultado esperado.");
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        await createScenario({
          module: moduleName,
          functionality: form.functionality,
          name: form.name,
          expectedResult: form.expectedResult,
          status: form.status,
          executionDate: form.executionDate || null,
          executor: form.executor || null,
          observations: form.observations || null,
        });
      } else if (scenario) {
        await updateScenario(scenario.id, {
          functionality: form.functionality,
          name: form.name,
          expectedResult: form.expectedResult,
          status: form.status,
          executionDate: form.executionDate || null,
          executor: form.executor || null,
          observations: form.observations || null,
        });
      }
      router.refresh();
      onClose();
    } catch {
      setError("Erro ao salvar cenário.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !scenario) return;

    if (evidences.length >= 5) {
      setError("Limite de 5 evidências por cenário.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("scenarioId", String(scenario.id));
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro no upload.");
        return;
      }
      setEvidences((prev) => [...prev, data.evidence]);
      router.refresh();
    } catch {
      setError("Erro no upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteEvidence(id: number) {
    await deleteEvidence(id);
    setEvidences((prev) => prev.filter((e) => e.id !== id));
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {isCreating ? "Novo Cenário" : "Detalhes do Cenário"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Funcionalidade
              </label>
              <input
                type="text"
                value={form.functionality}
                onChange={(e) => setForm({ ...form, functionality: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ScenarioStatus })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SCENARIO_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Cenário
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Resultado Esperado
            </label>
            <textarea
              value={form.expectedResult}
              onChange={(e) => setForm({ ...form, expectedResult: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Data de Conclusão
              </label>
              <input
                type="date"
                value={form.executionDate}
                onChange={(e) => setForm({ ...form, executionDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Executado por
              </label>
              <input
                type="text"
                value={form.executor}
                onChange={(e) => setForm({ ...form, executor: e.target.value })}
                placeholder="Opcional"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Observações
            </label>
            <textarea
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              rows={5}
              placeholder="Opcional — descreva passos, observações e detalhes da execução..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {!isCreating && scenario && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Evidências ({evidences.length}/5)
                </label>
                {evidences.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? "Enviando..." : "Upload"}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>
              {evidences.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {evidences.map((ev) => (
                    <div
                      key={ev.id}
                      className="group relative overflow-hidden rounded-lg border border-slate-200"
                    >
                      <Image
                        src={ev.filePath}
                        alt="Evidência"
                        width={200}
                        height={150}
                        className="h-32 w-full object-cover"
                      />
                      <button
                        onClick={() => handleDeleteEvidence(ev.id)}
                        className="absolute right-2 top-2 rounded bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Nenhuma evidência anexada. Salve o cenário e faça upload de prints.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
