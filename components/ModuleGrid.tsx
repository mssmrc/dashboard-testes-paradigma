import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { moduleToSlug } from "@/lib/module-slug";

type ModuleGridProps = {
  modules: string[];
};

export function ModuleGrid({ modules }: ModuleGridProps) {
  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
        <p className="text-slate-500">
          Nenhum módulo encontrado. Importe um CSV para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {modules.map((name) => (
        <Link
          key={name}
          href={`/modulo/${moduleToSlug(name)}`}
          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 transition group-hover:bg-blue-200">
            <FolderOpen className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-slate-700 group-hover:text-blue-800">
            {name}
          </span>
        </Link>
      ))}
    </div>
  );
}
