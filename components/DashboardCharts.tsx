"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { STATUS_COLORS, type ScenarioStatus } from "@/lib/constants";

type StatusChartProps = {
  data: { status: string; count: number }[];
};

type CompletedChartProps = {
  data: { date: string | null; count: number }[];
};

export function StatusPieChart({ data }: StatusChartProps) {
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    color: STATUS_COLORS[item.status as ScenarioStatus] ?? "#64748b",
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Nenhum cenário cadastrado
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) =>
            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CompletedLineChart({ data }: CompletedChartProps) {
  const chartData = data
    .filter((item) => item.date)
    .map((item) => ({
      date: item.date!,
      count: item.count,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Nenhum cenário concluído com data registrada
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          name="Concluídos"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: "#2563eb", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
