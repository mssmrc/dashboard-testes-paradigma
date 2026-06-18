export const SCENARIO_STATUSES = [
  "Não iniciado",
  "Em andamento",
  "Concluído",
] as const;

export type ScenarioStatus = (typeof SCENARIO_STATUSES)[number];

export const STATUS_COLORS: Record<ScenarioStatus, string> = {
  "Não iniciado": "#94a3b8",
  "Em andamento": "#f59e0b",
  Concluído: "#22c55e",
};
