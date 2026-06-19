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

// Mock Data
const progressData = [
  { name: "Catálogo", realizado: 85, esperado: 90 },
  { name: "Contrato", realizado: 60, esperado: 75 },
  { name: "SLA", realizado: 42, esperado: 50 },
  { name: "Core", realizado: 90, esperado: 95 },
  { name: "Integração", realizado: 30, esperado: 45 },
  { name: "Relatórios", realizado: 15, esperado: 30 }
];

const moduleDivisionData = [
  { name: "Catálogo", master: 25, transaction: 5 },
  { name: "Contrato", master: 18, transaction: 12 },
  { name: "SLA", master: 8, transaction: 28 },
  { name: "Core", master: 30, transaction: 32 },
  { name: "Integração", master: 10, transaction: 22 },
  { name: "Relatórios", master: 4, transaction: 15 }
];

const completionData = [
  { name: "Concluído", value: 65, color: "#22c55e" },      // Green 500
  { name: "Em andamento", value: 20, color: "#f59e0b" },  // Amber 500
  { name: "Não iniciado", value: 15, color: "#94a3b8" }  // Slate 400
];

const dailyCountData = [
  { date: "12/Jun", count: 8 },
  { date: "13/Jun", count: 14 },
  { date: "14/Jun", count: 21 },
  { date: "15/Jun", count: 18 },
  { date: "16/Jun", count: 29 },
  { date: "17/Jun", count: 35 },
  { date: "18/Jun", count: 22 }
];

export default function ProjectReports() {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration issues by rendering charts only on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <p className="text-slate-500">Carregando painel de relatórios...</p>
      </div>
    );
  }

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
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: "#475569" }} />
              <Tooltip formatter={(value) => [`${value}%`]} />
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
              <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="master" name="Dados Mestres" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="transaction" name="Movimentações" fill="#A855F7" radius={[4, 4, 0, 0]} />
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
                  <Tooltip formatter={(value) => [`${value}%`, "Proporção"]} />
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

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyCountData}
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#475569" }} />
                <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
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
        </div>
      </div>
    </div>
  );
}
