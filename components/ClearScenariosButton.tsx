"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ClearScenariosButton() {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);

  async function handleClear() {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir TODOS os cenários? Esta ação é irreversível e removerá também todas as evidências associadas.",
    );
    if (!confirmed) return;

    setClearing(true);
    try {
      const res = await fetch("/api/scenarios/clear", { method: "DELETE" });
      if (!res.ok) {
        alert("Erro ao limpar cenários.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erro ao limpar cenários.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <button
      onClick={handleClear}
      disabled={clearing}
      className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      {clearing ? "Limpando..." : "Limpar Todos os Cenários"}
    </button>
  );
}
