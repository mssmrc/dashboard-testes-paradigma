import { AppHeader } from "@/components/AppHeader";
import { StatusPieChart, CompletedLineChart } from "@/components/DashboardCharts";
import { ModuleGrid } from "@/components/ModuleGrid";
import { CsvImportButton } from "@/components/CsvImportButton";
import { ClearScenariosButton } from "@/components/ClearScenariosButton";
import { GlobalReportLinkButton } from "@/components/GlobalReportLinkButton";
import { ProjectMetadataPanel } from "@/components/ProjectMetadataPanel";
import ProjectReports from "@/components/ProjectReports";
import {
  getDashboardStats,
  getAllScenarios,
  getDistinctModules,
} from "@/lib/actions/scenarios";
import { getProjectMetadata } from "@/lib/actions/project-metadata";
import { BarChart3, TrendingUp } from "lucide-react";

export default async function HomePage() {
  const [
    { statusCounts, completedByDate },
    allScenarios,
    modules,
    projectMetadata,
  ] = await Promise.all([
    getDashboardStats(),
    getAllScenarios(),
    getDistinctModules(),
    getProjectMetadata(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        title="Gestão de Roteiros de Testes"
        subtitle="Dashboard geral de execução"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <ProjectMetadataPanel initialData={projectMetadata} />

        <div className="mb-8 flex flex-wrap items-start gap-3">
          <CsvImportButton />
          <GlobalReportLinkButton disabled={allScenarios.length === 0} />
          <ClearScenariosButton />
        </div>

        <section className="mb-10">
          <ProjectReports />
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-800">
                Status dos Cenários
              </h2>
            </div>
            <StatusPieChart data={statusCounts} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-800">
                Cenários Concluídos por Data
              </h2>
            </div>
            <CompletedLineChart data={completedByDate} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Módulos</h2>
          <ModuleGrid modules={modules} />
        </section>
      </main>
    </div>
  );
}
