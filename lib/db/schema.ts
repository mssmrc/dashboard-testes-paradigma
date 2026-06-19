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
  clientName: text("client_name").notNull(),
  projectName: text("project_name").notNull(),
  analystName: text("analyst_name").notNull(),
  pmName: text("pm_name").notNull(),
  clientLogoPath: text("client_logo_path").notNull(),
  dataInicioTestes: text("data_inicio_testes").notNull(),
  dataPrevistaFim: text("data_prevista_fim").notNull(),
  dataRealFim: text("data_real_fim"),
  faseTestes: text("fase_testes").notNull(),
});

export type Scenario = typeof scenarios.$inferSelect;
export type NewScenario = typeof scenarios.$inferInsert;
export type Evidence = typeof evidences.$inferSelect;
export type ProjectMetadata = typeof projectMetadata.$inferSelect;
