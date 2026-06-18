import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const scenarios = sqliteTable("scenarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  module: text("module").notNull(),
  functionality: text("functionality").notNull(),
  name: text("name").notNull(),
  expectedResult: text("expected_result").notNull(),
  status: text("status", {
    enum: ["Não iniciado", "Em andamento", "Concluído"],
  })
    .notNull()
    .default("Não iniciado"),
  executionDate: text("execution_date"),
  executor: text("executor"),
  observations: text("observations"),
});

export const evidences = sqliteTable("evidences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scenarioId: integer("scenario_id")
    .notNull()
    .references(() => scenarios.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
});

export const scenariosRelations = relations(scenarios, ({ many }) => ({
  evidences: many(evidences),
}));

export const evidencesRelations = relations(evidences, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [evidences.scenarioId],
    references: [scenarios.id],
  }),
}));

export const projectMetadata = sqliteTable("project_metadata", {
  id: integer("id").primaryKey(),
  clientName: text("client_name"),
  projectName: text("project_name"),
  analystName: text("analyst_name"),
  pmName: text("pm_name"),
  clientLogoPath: text("client_logo_path"),
  dataInicioTestes: text("data_inicio_testes"),
  dataPrevistaFim: text("data_prevista_fim"),
  dataRealFim: text("data_real_fim"),
  faseTestes: text("fase_testes"),
});

export type Scenario = typeof scenarios.$inferSelect;
export type NewScenario = typeof scenarios.$inferInsert;
export type Evidence = typeof evidences.$inferSelect;
export type ProjectMetadata = typeof projectMetadata.$inferSelect;
