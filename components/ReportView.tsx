import type { ScenarioWithEvidences } from "@/lib/actions/scenarios";
import type { ProjectMetadataFields } from "@/lib/actions/project-metadata";
import { ParadigmaLogo, ClientLogo } from "@/components/BrandLogos";
import { PrintTrigger } from "@/components/PrintTrigger";
import { StatusPieChart, CompletedLineChart } from "@/components/DashboardCharts";
import { BarChart3, TrendingUp } from "lucide-react";
import "./report.css";

type ReportViewProps = {
  metadata: ProjectMetadataFields;
  groupedScenarios: { module: string; scenarios: ScenarioWithEvidences[] }[];
  title: string;
  stats?: {
    statusCounts: { status: string; count: number }[];
    completedByDate: { date: string | null; count: number }[];
  };
};

function ScenarioBlock({ scenario }: { scenario: ScenarioWithEvidences }) {
  return (
    <article className="report-scenario mb-6 rounded-lg border border-slate-200 p-4">
      <h3 className="text-base font-semibold text-slate-900">{scenario.name}</h3>
      <dl className="mt-2 grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-slate-500">Status: </dt>
          <dd className="inline">{scenario.status}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-500">Executado por: </dt>
          <dd className="inline">{scenario.executor ?? "—"}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-500">Data de Conclusão: </dt>
          <dd className="inline">{scenario.executionDate ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="inline font-medium text-slate-500">Resultado Esperado: </dt>
          <dd className="inline whitespace-normal break-words">{scenario.expectedResult}</dd>
        </div>
      </dl>

      {scenario.evidences.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 print:flex print:flex-wrap print:gap-4">
          {scenario.evidences.map((ev) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={ev.id}
              src={ev.filePath}
              alt="Evidência"
              data-report-image
              className="h-32 w-full rounded border border-slate-200 object-cover print:h-auto print:max-h-[400px] print:w-auto print:object-contain"
            />
          ))}
        </div>
      )}
    </article>
  );
}

export function ReportView({
  metadata,
  groupedScenarios,
  title,
  stats,
}: ReportViewProps) {
  const generatedAt = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="report-page min-h-screen bg-white text-slate-900">
      <PrintTrigger />

      <header className="report-header border-b border-slate-200 px-8 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 print:flex print:flex-row print:justify-between print:items-center">
          <ParadigmaLogo className="h-[50px] print:h-[50px] print:w-auto shrink-0" />
          {metadata.clientLogoPath && (
            <ClientLogo
              src={metadata.clientLogoPath}
              className="print:max-h-[50px] print:max-w-[180px] print:object-contain shrink-0"
            />
          )}
        </div>

        <div className="mx-auto mt-6 max-w-5xl">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">Gerado em {generatedAt}</p>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {metadata.projectName && (
              <div>
                <dt className="font-medium text-slate-500">Projeto</dt>
                <dd>{metadata.projectName}</dd>
              </div>
            )}
            {metadata.clientName && (
              <div>
                <dt className="font-medium text-slate-500">Cliente</dt>
                <dd>{metadata.clientName}</dd>
              </div>
            )}
            {metadata.pmName && (
              <div>
                <dt className="font-medium text-slate-500">Gerente de Projetos</dt>
                <dd>{metadata.pmName}</dd>
              </div>
            )}
            {metadata.analystName && (
              <div>
                <dt className="font-medium text-slate-500">Analista de Testes</dt>
                <dd>{metadata.analystName}</dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-8">
        {stats && (
          <section className="mb-10 grid gap-6 md:grid-cols-2 print:grid-cols-2 print:gap-6 print:break-inside-avoid">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:shadow-none">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800">
                  Status de execução geral
                </h2>
              </div>
              <StatusPieChart data={stats.statusCounts} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:shadow-none">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800">
                  Cenários concluídos por dia
                </h2>
              </div>
              <CompletedLineChart data={stats.completedByDate} />
            </div>
          </section>
        )}

        {groupedScenarios.map((group, index) => (
          <section
            key={group.module}
            className={`report-module-section ${index > 0 ? "report-module-break" : ""}`}
          >
            <h2 className="mb-4 border-b border-slate-300 pb-2 text-xl font-bold text-blue-900">
              {group.module}
            </h2>
            {group.scenarios.map((scenario) => (
              <ScenarioBlock key={scenario.id} scenario={scenario} />
            ))}
          </section>
        ))}
      </main>

      <footer className="report-footer px-8 py-4 text-center text-xs text-slate-400">
        Paradigma — Sistema de Gestão de Roteiros de Testes
      </footer>
    </div>
  );
}
