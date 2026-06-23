import { ReportView } from "@/components/ReportView";
import { getAllScenarios, getDashboardStats } from "@/lib/actions/scenarios";
import { getProjectMetadata } from "@/lib/actions/project-metadata";
import { groupScenariosByModule } from "@/lib/report-utils";

export const dynamic = "force-dynamic";

export default async function GeneralReportPage() {
  const [scenarios, metadata, stats] = await Promise.all([
    getAllScenarios(),
    getProjectMetadata(),
    getDashboardStats(),
  ]);

  const grouped = groupScenariosByModule(scenarios);

  return (
    <ReportView
      metadata={metadata}
      groupedScenarios={grouped}
      title="Relatório Geral de Testes"
      stats={stats}
    />
  );
}
