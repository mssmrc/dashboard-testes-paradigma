import { notFound } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import {
  getScenariosByModule,
  moduleExists,
} from "@/lib/actions/scenarios";
import { getProjectMetadata } from "@/lib/actions/project-metadata";
import { slugToModule } from "@/lib/module-slug";

type PageProps = {
  params: Promise<{ module: string }>;
};

export default async function ModuleReportPage({ params }: PageProps) {
  const { module: slug } = await params;
  const moduleName = slugToModule(slug);

  const exists = await moduleExists(moduleName);
  if (!exists) {
    notFound();
  }

  const [scenarios, metadata] = await Promise.all([
    getScenariosByModule(moduleName),
    getProjectMetadata(),
  ]);

  return (
    <ReportView
      metadata={metadata}
      groupedScenarios={[{ module: moduleName, scenarios }]}
      title={`Relatório — ${moduleName}`}
    />
  );
}
