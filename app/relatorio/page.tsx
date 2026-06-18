import { ReportView } from "@/components/ReportView";
import { getAllScenarios } from "@/lib/actions/scenarios";
import { getProjectMetadata } from "@/lib/actions/project-metadata";
import { groupScenariosByModule } from "@/lib/report-utils";

export default async function GeneralReportPage() {
  const [scenarios, metadata] = await Promise.all([
    getAllScenarios(),
    getProjectMetadata(),
  ]);

  const grouped = groupScenariosByModule(scenarios);

  return (
    <ReportView
      metadata={metadata}
      groupedScenarios={grouped}
      title="Relatório Geral de Testes"
    />
  );
}
