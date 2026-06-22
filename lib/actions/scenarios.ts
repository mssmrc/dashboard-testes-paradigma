"use server";

import { db } from "@/lib/db";
import { evidences, scenarios } from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ScenarioStatus } from "@/lib/constants";

export type ScenarioWithEvidences = {
  id: number;
  module: string;
  functionality: string;
  name: string;
  expectedResult: string;
  status: ScenarioStatus;
  executionDate: string | null;
  executor: string | null;
  observations: string | null;
  evidences: { id: number; filePath: string }[];
};

function mapScenario(row: typeof scenarios.$inferSelect, evidenceRows: { id: number; filePath: string }[]): ScenarioWithEvidences {
  return {
    id: row.id,
    module: row.module,
    functionality: row.functionality,
    name: row.name,
    expectedResult: row.expectedResult,
    status: row.status as ScenarioStatus,
    executionDate: row.executionDate,
    executor: row.executor,
    observations: row.observations,
    evidences: evidenceRows,
  };
}

export async function getScenariosByModule(module: string) {
  const rows = await db
    .select()
    .from(scenarios)
    .where(eq(scenarios.module, module))
    .orderBy(scenarios.id);

  const result: ScenarioWithEvidences[] = [];

  for (const row of rows) {
    const evidenceRows = await db
      .select({ id: evidences.id, filePath: evidences.filePath })
      .from(evidences)
      .where(eq(evidences.scenarioId, row.id));
    result.push(mapScenario(row, evidenceRows));
  }

  return result;
}

export async function getAllScenarios() {
  const rows = await db.select().from(scenarios).orderBy(scenarios.id);
  const result: ScenarioWithEvidences[] = [];

  for (const row of rows) {
    const evidenceRows = await db
      .select({ id: evidences.id, filePath: evidences.filePath })
      .from(evidences)
      .where(eq(evidences.scenarioId, row.id));
    result.push(mapScenario(row, evidenceRows));
  }

  return result;
}

export async function getScenarioById(id: number) {
  const [row] = await db.select().from(scenarios).where(eq(scenarios.id, id));
  if (!row) return null;

  const evidenceRows = await db
    .select({ id: evidences.id, filePath: evidences.filePath })
    .from(evidences)
    .where(eq(evidences.scenarioId, id));

  return mapScenario(row, evidenceRows);
}

export async function getDistinctModules(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ module: scenarios.module })
    .from(scenarios)
    .orderBy(scenarios.module);

  return rows.map((r) => r.module);
}

export async function moduleExists(moduleName: string): Promise<boolean> {
  const [row] = await db
    .select({ module: scenarios.module })
    .from(scenarios)
    .where(eq(scenarios.module, moduleName))
    .limit(1);

  return !!row;
}

export async function getDashboardStats() {
  const statusCounts = await db
    .select({
      status: scenarios.status,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(scenarios)
    .groupBy(scenarios.status);

  const completedByDate = await db
    .select({
      date: scenarios.executionDate,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(scenarios)
    .where(eq(scenarios.status, "Concluído"))
    .groupBy(scenarios.executionDate)
    .orderBy(scenarios.executionDate);

  return { statusCounts, completedByDate };
}

export async function createScenario(data: {
  module: string;
  functionality: string;
  name: string;
  expectedResult: string;
  status?: ScenarioStatus;
  executionDate?: string | null;
  executor?: string | null;
  observations?: string | null;
}) {
  const [created] = await db
    .insert(scenarios)
    .values({
      module: data.module,
      functionality: data.functionality,
      name: data.name,
      expectedResult: data.expectedResult,
      status: data.status ?? "Não iniciado",
      executionDate: data.executionDate ?? null,
      executor: data.executor ?? null,
      observations: data.observations ?? null,
    })
    .returning();

  revalidatePath("/");
  revalidatePath("/modulo/[slug]", "page");
  return created;
}

export async function updateScenario(
  id: number,
  data: {
    functionality?: string;
    name?: string;
    expectedResult?: string;
    status?: ScenarioStatus;
    executionDate?: string | null;
    executor?: string | null;
    observations?: string | null;
  },
) {
  const [updated] = await db
    .update(scenarios)
    .set(data)
    .where(eq(scenarios.id, id))
    .returning();

  revalidatePath("/");
  revalidatePath("/modulo/[slug]", "page");
  return updated;
}

export async function deleteScenario(id: number) {
  await db.delete(scenarios).where(eq(scenarios.id, id));
  revalidatePath("/");
  revalidatePath("/modulo/[slug]", "page");
}

export async function addEvidence(scenarioId: number, filePath: string) {
  const [created] = await db
    .insert(evidences)
    .values({ scenarioId, filePath })
    .returning();

  return created;
}

export async function deleteEvidence(id: number) {
  await db.delete(evidences).where(eq(evidences.id, id));
  revalidatePath("/modulo/[slug]", "page");
}

export async function getEvidenceCount(scenarioId: number) {
  const [result] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(evidences)
    .where(eq(evidences.scenarioId, scenarioId));
  return result?.count ?? 0;
}

export type BulkImportRow = {
  name: string;
  module: string;
  functionality: string;
  expectedResult: string;
  status?: ScenarioStatus;
  executionDate?: string | null;
  executor?: string | null;
  observations?: string | null;
};

export async function bulkImportScenarios(rows: BulkImportRow[]) {
  if (rows.length === 0) {
    return { inserted: 0 };
  }

  const sanitizedRows = rows.map((row) => {
    const trimmed = row.module.trim();
    const sanitizedModule = trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : "";
    return {
      module: sanitizedModule,
      functionality: row.functionality,
      name: row.name,
      expectedResult: row.expectedResult,
      status: row.status ?? "Não iniciado",
      executionDate: row.executionDate ?? null,
      executor: row.executor ?? null,
      observations: row.observations ?? null,
    };
  });

  await db
    .insert(scenarios)
    .values(sanitizedRows)
    .onConflictDoUpdate({
      target: scenarios.name,
      set: {
        status: sql`excluded.status`,
        module: sql`excluded.module`,
      },
    });

  revalidatePath("/");
  revalidatePath("/modulo/[slug]", "page");

  return { inserted: rows.length };
}

export type BatchUpdateRow = {
  id: number;
  status: ScenarioStatus;
  executionDate: string | null;
  executor: string | null;
  observations: string | null;
};

export async function bulkUpdateScenarios(updates: BatchUpdateRow[]) {
  if (updates.length === 0) return { updated: 0 };

  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx
        .update(scenarios)
        .set({
          status: update.status,
          executionDate: update.executionDate,
          executor: update.executor,
          observations: update.observations,
        })
        .where(eq(scenarios.id, update.id));
    }
  });

  revalidatePath("/");
  revalidatePath("/modulo/[slug]", "page");

  return { updated: updates.length };
}

export async function clearAllScenarios() {
  await db.delete(scenarios);
  revalidatePath("/");
  revalidatePath("/modulo/[slug]", "page");
  return { success: true };
}

export async function bulkUpdateFields(
  ids: number[],
  data: {
    status?: ScenarioStatus;
    executionDate?: string | null;
    executor?: string | null;
    observations?: string | null;
  },
) {
  if (ids.length === 0) return { updated: 0 };

  const setClause: Record<string, any> = {};
  if (data.status !== undefined) setClause.status = data.status;
  if (data.executionDate !== undefined) setClause.executionDate = data.executionDate;
  if (data.executor !== undefined) setClause.executor = data.executor;
  if (data.observations !== undefined) setClause.observations = data.observations;

  if (Object.keys(setClause).length === 0) return { updated: 0 };

  await db
    .update(scenarios)
    .set(setClause)
    .where(inArray(scenarios.id, ids));

  revalidatePath("/");
  revalidatePath("/modulo/[slug]", "page");

  return { updated: ids.length };
}
