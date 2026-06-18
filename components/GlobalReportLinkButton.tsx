import Link from "next/link";
import { FileDown } from "lucide-react";

type GlobalReportLinkButtonProps = {
  disabled?: boolean;
};

export function GlobalReportLinkButton({ disabled }: GlobalReportLinkButtonProps) {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-400 opacity-50 cursor-default">
        <FileDown className="h-4 w-4" />
        Gerar Relatório Geral (PDF)
      </span>
    );
  }

  return (
    <Link
      href="/relatorio"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      <FileDown className="h-4 w-4" />
      Gerar Relatório Geral (PDF)
    </Link>
  );
}
