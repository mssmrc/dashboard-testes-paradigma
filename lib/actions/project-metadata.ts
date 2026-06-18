"use server";

import { db } from "@/lib/db";
import { projectMetadata } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";

export type ProjectMetadataFields = {
  clientName: string;
  projectName: string;
  analystName: string;
  pmName: string;
  clientLogoPath: string | null;
};

const DEFAULT_METADATA: ProjectMetadataFields = {
  clientName: "",
  projectName: "",
  analystName: "",
  pmName: "",
  clientLogoPath: null,
};

export async function getProjectMetadata(): Promise<ProjectMetadataFields> {
  const [row] = await db
    .select()
    .from(projectMetadata)
    .where(eq(projectMetadata.id, 1));

  if (!row) return DEFAULT_METADATA;

  return {
    clientName: row.clientName ?? "",
    projectName: row.projectName ?? "",
    analystName: row.analystName ?? "",
    pmName: row.pmName ?? "",
    clientLogoPath: row.clientLogoPath ?? null,
  };
}

export async function saveProjectMetadata(
  data: Omit<ProjectMetadataFields, "clientLogoPath"> & {
    clientLogoPath?: string | null;
  },
) {
  const [existing] = await db
    .select()
    .from(projectMetadata)
    .where(eq(projectMetadata.id, 1));

  await db
    .insert(projectMetadata)
    .values({
      id: 1,
      clientName: data.clientName || null,
      projectName: data.projectName || null,
      analystName: data.analystName || null,
      pmName: data.pmName || null,
      clientLogoPath:
        data.clientLogoPath !== undefined
          ? data.clientLogoPath
          : (existing?.clientLogoPath ?? null),
    })
    .onConflictDoUpdate({
      target: projectMetadata.id,
      set: {
        clientName: data.clientName || null,
        projectName: data.projectName || null,
        analystName: data.analystName || null,
        pmName: data.pmName || null,
        ...(data.clientLogoPath !== undefined
          ? { clientLogoPath: data.clientLogoPath }
          : {}),
      },
    });

  revalidatePath("/");
  revalidatePath("/relatorio");
  revalidatePath("/relatorio/[module]", "page");
  return { success: true };
}

export async function updateClientLogoPath(path: string | null) {
  const [existing] = await db
    .select()
    .from(projectMetadata)
    .where(eq(projectMetadata.id, 1));

  if (existing) {
    await db
      .update(projectMetadata)
      .set({ clientLogoPath: path })
      .where(eq(projectMetadata.id, 1));
  } else {
    await db.insert(projectMetadata).values({
      id: 1,
      clientName: null,
      projectName: null,
      analystName: null,
      pmName: null,
      clientLogoPath: path,
    });
  }

  revalidatePath("/");
  revalidatePath("/relatorio");
  revalidatePath("/relatorio/[module]", "page");
  return { success: true };
}

export async function clearClientLogo() {
  const [row] = await db
    .select()
    .from(projectMetadata)
    .where(eq(projectMetadata.id, 1));

  if (row && row.clientLogoPath) {
    try {
      const diskPath = path.join(process.cwd(), "public", row.clientLogoPath);
      await unlink(diskPath);
    } catch (e) {
      console.error("Could not delete physical logo file:", e);
    }
  }

  await db
    .update(projectMetadata)
    .set({ clientLogoPath: null })
    .where(eq(projectMetadata.id, 1));

  revalidatePath("/");
  revalidatePath("/relatorio");
  revalidatePath("/relatorio/[module]", "page");
  return { success: true };
}

export async function clearProjectMetadata() {
  await db
    .insert(projectMetadata)
    .values({
      id: 1,
      clientName: null,
      projectName: null,
      analystName: null,
      pmName: null,
    })
    .onConflictDoUpdate({
      target: projectMetadata.id,
      set: {
        clientName: null,
        projectName: null,
        analystName: null,
        pmName: null,
      },
    });

  revalidatePath("/");
  revalidatePath("/relatorio");
  revalidatePath("/relatorio/[module]", "page");
  return { success: true };
}
