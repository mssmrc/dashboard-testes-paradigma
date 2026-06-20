"use client";

import { useRef, useState } from "react";
import { Save, Pencil, Upload } from "lucide-react";
import {
  saveProjectMetadata,
  clearClientLogo,
  clearProjectMetadata,
  type ProjectMetadataFields,
} from "@/lib/actions/project-metadata";
import { ClientLogo } from "@/components/BrandLogos";
import { useRouter } from "next/navigation";

type ProjectMetadataPanelProps = {
  initialData: ProjectMetadataFields;
};

export function ProjectMetadataPanel({ initialData }: ProjectMetadataPanelProps) {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProjectMetadataFields>(initialData);
  const [locked, setLocked] = useState(
    Boolean(
      initialData.clientName ||
        initialData.projectName ||
        initialData.analystName ||
        initialData.pmName ||
        initialData.clientLogoPath ||
        initialData.dataInicioTestes ||
        initialData.dataPrevistaFim ||
        initialData.dataRealFim ||
        initialData.faseTestes,
    ),
  );
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClearLogo() {
    const confirmed = window.confirm(
      "Tem certeza que deseja limpar o logo do cliente?",
    );
    if (!confirmed) return;

    try {
      await clearClientLogo();
      setForm((prev) => ({ ...prev, clientLogoPath: "" }));
      setMessage("Logo do cliente removido.");
      router.refresh();
    } catch {
      setMessage("Erro ao remover logo.");
    }
  }

  async function handleClearProjectMetadata() {
    const confirmed = window.confirm(
      "Tem certeza que deseja limpar os dados do projeto? Os cenários e evidências NÃO serão afetados.",
    );
    if (!confirmed) return;

    try {
      await clearProjectMetadata();
      try {
        await clearClientLogo();
      } catch (err) {
        console.error("Erro ao limpar logo do cliente:", err);
      }
      setForm({
        clientName: "",
        projectName: "",
        analystName: "",
        pmName: "",
        clientLogoPath: "",
        dataInicioTestes: "",
        dataPrevistaFim: "",
        dataRealFim: "",
        faseTestes: "",
      });
      setMessage("Dados do projeto limpos.");
      router.refresh();
    } catch {
      setMessage("Erro ao limpar dados do projeto.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await saveProjectMetadata(form);
      setLocked(true);
      setMessage("Dados do projeto salvos.");
      router.refresh();
    } catch {
      setMessage("Erro ao salvar dados do projeto.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit() {
    setLocked(false);
    setMessage(null);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/client-logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Erro ao enviar logo.");
        return;
      }
      setForm((prev) => ({ ...prev, clientLogoPath: data.path }));
      setMessage("Logo do cliente atualizado.");
      router.refresh();
    } catch {
      setMessage("Erro ao enviar logo.");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  const formatDateToBR = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const inputClass = locked
    ? "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
    : "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <form onSubmit={handleSave} className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Dados do Projeto</h2>
        <div className="flex gap-2">
          {locked ? (
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          )}
          <button
            type="button"
            onClick={handleClearProjectMetadata}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Limpar Dados do Projeto
          </button>
        </div>
      </div>

      {message && (
        <p
          className={`mb-4 text-sm ${message.includes("Erro") ? "text-red-600" : "text-green-700"}`}
        >
          {message}
        </p>
      )}

      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Logo do Cliente
        </label>
        <div className="flex flex-wrap items-center gap-4">
          {form.clientLogoPath ? (
            <ClientLogo src={form.clientLogoPath} />
          ) : (
            <span className="text-sm text-slate-400">Nenhum logo enviado</span>
          )}
          {!locked && (
            <>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploadingLogo ? "Enviando..." : "Enviar Logo"}
              </button>
              {form.clientLogoPath && (
                <button
                  type="button"
                  onClick={handleClearLogo}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  Limpar Logo
                </button>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Exibido no cabeçalho global e nos relatórios (máx. 200×60px).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nome do Cliente
          </label>
          <input
            type="text"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            readOnly={locked}
            required
            placeholder="Ex: Empresa XYZ Ltda."
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nome do Projeto
          </label>
          <input
            type="text"
            value={form.projectName}
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
            readOnly={locked}
            required
            placeholder="Ex: Homologação Portal de Compras"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Analista de Testes
          </label>
          <input
            type="text"
            value={form.analystName}
            onChange={(e) => setForm({ ...form, analystName: e.target.value })}
            readOnly={locked}
            required
            placeholder="Ex: Moisés Souza"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Gerente de Projetos
          </label>
          <input
            type="text"
            value={form.pmName}
            onChange={(e) => setForm({ ...form, pmName: e.target.value })}
            readOnly={locked}
            required
            placeholder="Ex: Moisés Souza"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Data de início dos testes
          </label>
          <input
            type={locked ? "text" : "date"}
            lang="pt-BR"
            value={locked ? formatDateToBR(form.dataInicioTestes) : form.dataInicioTestes}
            onChange={(e) => setForm({ ...form, dataInicioTestes: e.target.value })}
            readOnly={locked}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Data prevista de finalização dos testes
          </label>
          <input
            type={locked ? "text" : "date"}
            lang="pt-BR"
            value={locked ? formatDateToBR(form.dataPrevistaFim) : form.dataPrevistaFim}
            onChange={(e) => setForm({ ...form, dataPrevistaFim: e.target.value })}
            readOnly={locked}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Data real de finalização dos testes
          </label>
          <input
            type={locked ? "text" : "date"}
            lang="pt-BR"
            value={locked ? formatDateToBR(form.dataRealFim) : form.dataRealFim}
            onChange={(e) => setForm({ ...form, dataRealFim: e.target.value })}
            readOnly={locked}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Fase de testes
          </label>
          <select
            value={form.faseTestes}
            onChange={(e) => setForm({ ...form, faseTestes: e.target.value })}
            disabled={locked}
            required
            className={inputClass}
          >
            <option value="">Selecione...</option>
            <option value="Testes unitários">Testes unitários</option>
            <option value="Testes integrados">Testes integrados</option>
            <option value="Homologação">Homologação</option>
          </select>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Empresa base: Paradigma — estes dados são exibidos apenas no Dashboard.
      </p>
    </form>
  );
}
