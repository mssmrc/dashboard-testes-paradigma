import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ScenarioTable } from "@/components/ScenarioTable";
import {
  getScenariosByModule,
  moduleExists,
} from "@/lib/actions/scenarios";
import { slugToModule } from "@/lib/module-slug";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params;
  const moduleName = slugToModule(slug);

  const exists = await moduleExists(moduleName);
  if (!exists) {
    notFound();
  }

  const scenarios = await getScenariosByModule(moduleName);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader title={moduleName} subtitle="Cenários de teste do módulo" />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <ScenarioTable moduleName={moduleName} scenarios={scenarios} />
      </main>
    </div>
  );
}
