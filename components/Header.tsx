import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { ParadigmaLogo, ClientLogo } from "./BrandLogos";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  clientLogoPath?: string | null;
};

export function Header({ title, subtitle, clientLogoPath }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-4">
            <ParadigmaLogo />
            {clientLogoPath && <ClientLogo src={clientLogoPath} />}
          </Link>
          {title && (
            <div className="hidden border-l border-slate-200 pl-4 sm:block">
              <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
          )}
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </header>
  );
}
