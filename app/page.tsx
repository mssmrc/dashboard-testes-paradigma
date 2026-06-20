import { AppHeader } from "@/components/AppHeader";
import { ModuleGrid } from "@/components/ModuleGrid";
import { CsvImportButton } from "@/components/CsvImportButton";
import { ClearScenariosButton } from "@/components/ClearScenariosButton";
import { GlobalReportLinkButton } from "@/components/GlobalReportLinkButton";
import { ProjectMetadataPanel } from "@/components/ProjectMetadataPanel";
import ProjectReports from "@/components/ProjectReports";
import { ScenarioTable } from "@/components/ScenarioTable";
import {
  getAllScenarios,
  getDistinctModules,
} from "@/lib/actions/scenarios";
import { getProjectMetadata } from "@/lib/actions/project-metadata";

export default async function HomePage() {
  const [
    allScenarios,
    modules,
    projectMetadata,
  ] = await Promise.all([
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
        {/* 1º: ProjectMetadataPanel (Dados do Projeto) */}
        <ProjectMetadataPanel initialData={projectMetadata} />

        {/* 2º: Botões de navegação/seleção dos módulos (A área de Operação) */}
        <div className="mb-8 flex flex-wrap items-start gap-3">
          <CsvImportButton />
          <GlobalReportLinkButton disabled={allScenarios.length === 0} />
          <ClearScenariosButton />
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Módulos</h2>
          <ModuleGrid modules={modules} />
        </section>

        {/* 3º: ProjectReports (A área de Análise) */}
        <section className="mb-10">
          <ProjectReports />
        </section>

        {/* 4º: ScenarioTable (A tabela de cenários) */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Todos os Cenários</h2>
          <ScenarioTable moduleName="" scenarios={allScenarios} />
        </section>
      </main>
    </div>
  );
}
