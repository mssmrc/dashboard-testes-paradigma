"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, Layers, Calendar } from "lucide-react";
import { getAllScenarios, type ScenarioWithEvidences } from "@/lib/actions/scenarios";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthIdx = parseInt(month, 10) - 1;
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${day}/${months[monthIdx]}`;
  }
  return dateStr;
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md">
        <p className="font-semibold text-slate-800">{data.name}</p>
        <p className="text-sm text-blue-600 font-medium">
          {data.percentual}% ({data.executados}/{data.total})
        </p>
      </div>
    );
  }
  return null;
};

export default function ProjectReports() {
  const [mounted, setMounted] = useState(false);
  const [scenarios, setScenarios] = useState<ScenarioWithEvidences[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch scenarios and handle mounting state
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllScenarios();
        setScenarios(data);
      } catch (err) {
        console.error("Erro ao carregar cenários para os relatórios:", err);
      } finally {
        setLoading(false);
      }
    }
    setMounted(true);
    fetchData();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <p className="text-slate-500 animate-pulse">Carregando painel de relatórios...</p>
      </div>
    );
  }

  // If there are no scenarios in the database
  if (scenarios.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <BarChart3 className="mb-3 h-12 w-12 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-800">Nenhum dado disponível</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm">
          Importe ou crie cenários de teste nos módulos para visualizar os gráficos e relatórios consolidados.
        </p>
      </div>
    );
  }

  // 1. Progresso Esperado x Realizado por Módulo (Seção 1)
  const modulesMap = new Map<string, { total: number; completed: number }>();
  scenarios.forEach((s) => {
    const stats = modulesMap.get(s.module) || { total: 0, completed: 0 };
    stats.total += 1;
    if (s.status === "Concluído") {
      stats.completed += 1;
    }
    modulesMap.set(s.module, stats);
  });

  const progressData = Array.from(modulesMap.entries())
    .map(([name, stats]) => ({
      name,
      realizado: Math.round((stats.completed / stats.total) * 100),
      esperado: 100 // Meta é sempre 100%
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // 2. Divisão por Módulos (Dados Mestres vs Movimentações) (Seção 2)
  let masterExecutados = 0;
  let masterRestantes = 0;
  let transactionExecutados = 0;
  let transactionRestantes = 0;

  scenarios.forEach((s) => {
    const isMaster =
      s.module.trim().toLowerCase() === "dados mestres" ||
      s.module.trim().toLowerCase() === "dados-mestres" ||
      s.module.trim().toLowerCase() === "dados_mestres";
    const isCompleted = s.status === "Concluído";

    if (isMaster) {
      if (isCompleted) {
        masterExecutados += 1;
      } else {
        masterRestantes += 1;
      }
    } else {
      if (isCompleted) {
        transactionExecutados += 1;
      } else {
        transactionRestantes += 1;
      }
    }
  });

  const masterTotal = masterExecutados + masterRestantes;
  const masterPercent = masterTotal > 0 ? Math.round((masterExecutados / masterTotal) * 100) : 0;

  const transactionTotal = transactionExecutados + transactionRestantes;
  const transactionPercent = transactionTotal > 0 ? Math.round((transactionExecutados / transactionTotal) * 100) : 0;

  const moduleDivisionData = [
    {
      name: "Dados Mestres",
      percentual: masterPercent,
      executados: masterExecutados,
      total: masterTotal,
    },
    {
      name: "Movimentações",
      percentual: transactionPercent,
      executados: transactionExecutados,
      total: transactionTotal,
    }
  ];

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, height, index } = props;
    const item = moduleDivisionData[index];
    if (!item) return null;

    if (height <= 0) return null;

    const labelText = `${item.percentual}% (${item.executados}/${item.total})`;
    const isSmall = height < 25;
    const textY = isSmall ? y - 8 : y + height / 2;
    const textColor = isSmall ? "#1e293b" : "#ffffff";

    return (
      <text
        x={x + width / 2}
        y={textY}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight="semibold"
      >
        {labelText}
      </text>
    );
  };

  // 3. Status de Execução Geral (Seção 3 - Pizza)
  let completedCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;

  scenarios.forEach((s) => {
    if (s.status === "Concluído") {
      completedCount += 1;
    } else if (s.status === "Em andamento") {
      inProgressCount += 1;
    } else if (s.status === "Não iniciado") {
      notStartedCount += 1;
    }
  });

  const totalScenarios = completedCount + inProgressCount + notStartedCount;

  const completionData = [
    { name: "Concluído", value: totalScenarios > 0 ? Math.round((completedCount / totalScenarios) * 100) : 0, color: "#22c55e" },
    { name: "Em andamento", value: totalScenarios > 0 ? Math.round((inProgressCount / totalScenarios) * 100) : 0, color: "#f59e0b" },
    { name: "Não iniciado", value: totalScenarios > 0 ? Math.round((notStartedCount / totalScenarios) * 100) : 0, color: "#94a3b8" }
  ];

  // 4. Cenários Concluídos por Dia (Seção 3 - Linha)
  const dailyMap = new Map<string, number>();
  scenarios.forEach((s) => {
    if (s.status === "Concluído" && s.executionDate) {
      dailyMap.set(s.executionDate, (dailyMap.get(s.executionDate) || 0) + 1);
    }
  });

  const dailyCountData = Array.from(dailyMap.entries())
    .map(([date, count]) => ({
      rawDate: date,
      date: formatDate(date),
      count
    }))
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate));

  return (
    <div className="space-y-8">
      {/* Seção 1: Progresso Esperado x Real (Horizontal Bar Chart) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Progresso Esperado x Realizado por Módulo
            </h2>
            <p className="text-sm text-slate-500">
              Comparativo entre o avanço esperado e o realizado em cada módulo do projeto.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <span>Meta: 100%</span>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={progressData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12, fill: "#475569" }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: "#475569" }} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Tooltip formatter={(value: any) => [`${value}%`]} />
              <Legend />
              <Bar dataKey="realizado" name="Realizado" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="esperado" name="Esperado" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seção 2: Divisão por Módulos (Master vs Transaction) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Layers className="h-5 w-5 text-blue-600" />
            Divisão por Módulos: Dados Mestres vs Movimentações
          </h2>
          <p className="text-sm text-slate-500">
            Comparativo entre cenários de configuração/dados cadastrais estáveis e fluxos de transações operacionais dinâmicas.
          </p>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={moduleDivisionData}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#475569" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="percentual"
                name="Progresso"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                label={renderCustomBarLabel}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seção 3: Relatórios de Módulo (Pie and Line charts) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Pie Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <PieChartIcon className="h-5 w-5 text-blue-600" />
              Status de Execução Geral
            </h2>
            <p className="text-sm text-slate-500">
              Distribuição atual do status dos cenários de teste mapeados.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(value: any) => [`${value}%`, "Proporção"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Stats */}
            <div className="mt-4 grid w-full grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
              {completionData.map((entry, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </div>
                  <span className="mt-1 text-lg font-bold text-slate-800">
                    {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Calendar className="h-5 w-5 text-blue-600" />
              Cenários Concluídos por Dia
            </h2>
            <p className="text-sm text-slate-500">
              Histórico diário de conclusão de novos cenários de testes no projeto.
            </p>
          </div>

          {dailyCountData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-slate-400">
              Nenhum cenário concluído com data registrada
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyCountData}
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#475569" }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Cenários Concluídos"
                    stroke="#2563eb"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
