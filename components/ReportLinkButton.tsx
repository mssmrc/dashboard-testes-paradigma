import Link from "next/link";
import { FileDown } from "lucide-react";
import { moduleToSlug } from "@/lib/module-slug";

type ReportLinkButtonProps = {
  moduleName: string;
  disabled?: boolean;
};

export function ReportLinkButton({ moduleName, disabled }: ReportLinkButtonProps) {
  const href = `/relatorio/${moduleToSlug(moduleName)}`;

  if (disabled) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-400 opacity-50 cursor-default">
        <FileDown className="h-4 w-4" />
        Gerar Relatório
      </span>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      <FileDown className="h-4 w-4" />
      Gerar Relatório
    </Link>
  );
}
