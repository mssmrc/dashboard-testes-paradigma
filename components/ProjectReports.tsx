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
import { BarChart3, PieChart as PieChartIcon, Layers, Calendar, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react";

// Mock Data
const progressData = [
  { name: "Cadastro de Clientes", progress: 85 },
  { name: "Regras de Impostos", progress: 60 },
  { name: "Movimentação de Estoque", progress: 42 },
  { name: "Faturamento e NFe", progress: 90 },
  { name: "Integração Bancária", progress: 30 },
  { name: "Relatórios Gerenciais", progress: 15 }
];

const moduleDivisionData = [
  { name: "Cadastros", master: 25, transaction: 5 },
  { name: "Impostos", master: 18, transaction: 12 },
  { name: "Estoque", master: 8, transaction: 28 },
  { name: "Faturamento", master: 6, transaction: 32 },
  { name: "Financeiro", master: 10, transaction: 22 },
  { name: "Relatórios", master: 4, transaction: 15 }
];

const completionData = [
  { name: "Sucesso", value: 65, color: "#10B981" }, // Emerald 500
  { name: "Pendente", value: 20, color: "#F59E0B" }, // Amber 500
  { name: "Falha", value: 15, color: "#EF4444" }    // Red 500
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
      <div className="flex h-96 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Carregando painel de relatórios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards (KPIs) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Progresso Geral
              </p>
              <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">65%</h3>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">+5%</span>
            <span className="ml-1">desde o último relatório</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Dados Mestres
              </p>
              <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">71</h3>
            </div>
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">38.5%</span>
            <span className="ml-1">do total de cenários</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Movimentações
              </p>
              <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">114</h3>
            </div>
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <PlayCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-purple-600 dark:text-purple-400">61.5%</span>
            <span className="ml-1">do total de cenários</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Avisos / Falhas
              </p>
              <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">15%</h3>
            </div>
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-red-600 dark:text-red-400">15 cenários</span>
            <span className="ml-1">com falha</span>
          </div>
        </div>
      </div>

      {/* Seção 1: Visão de Progresso (Horizontal Bar Chart) */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Visão de Progresso por Área
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Percentual de conclusão dos testes por módulo do projeto.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <span>Meta: 100%</span>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={progressData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value) => [`${value}%`, "Progresso"]} />
              <Bar dataKey="progress" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seção 2: Divisão por Módulos (Master vs Transaction) */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Layers className="h-5 w-5 text-indigo-500" />
            Divisão por Módulos: Dados Mestres vs Movimentações
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Comparativo entre cenários de configuração/dados cadastrais estáveis e fluxos de transações operacionais dinâmicas.
          </p>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={moduleDivisionData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
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
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs lg:col-span-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <PieChartIcon className="h-5 w-5 text-indigo-500" />
              Status de Execução Geral
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
            <div className="mt-4 grid w-full grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center dark:border-gray-800">
              {completionData.map((entry, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </div>
                  <span className="mt-1 text-lg font-bold text-gray-800 dark:text-gray-200">
                    {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs lg:col-span-7 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Cenários Concluídos por Dia
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Histórico diário de conclusão de novos cenários de testes no projeto.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyCountData}
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Cenários Concluídos"
                  stroke="#4F46E5"
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
