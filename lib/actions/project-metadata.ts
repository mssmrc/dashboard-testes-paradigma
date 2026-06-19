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
  clientLogoPath: string;
  dataInicioTestes: string;
  dataPrevistaFim: string;
  dataRealFim: string;
  faseTestes: string;
};

const DEFAULT_METADATA: ProjectMetadataFields = {
  clientName: "",
  projectName: "",
  analystName: "",
  pmName: "",
  clientLogoPath: "",
  dataInicioTestes: "",
  dataPrevistaFim: "",
  dataRealFim: "",
  faseTestes: "",
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
    clientLogoPath: row.clientLogoPath ?? "",
    dataInicioTestes: row.dataInicioTestes ?? "",
    dataPrevistaFim: row.dataPrevistaFim ?? "",
    dataRealFim: row.dataRealFim ?? "",
    faseTestes: row.faseTestes ?? "",
  };
}

export async function saveProjectMetadata(
  data: ProjectMetadataFields,
) {
  await db
    .insert(projectMetadata)
    .values({
      id: 1,
      clientName: data.clientName,
      projectName: data.projectName,
      analystName: data.analystName,
      pmName: data.pmName,
      clientLogoPath: data.clientLogoPath,
      dataInicioTestes: data.dataInicioTestes,
      dataPrevistaFim: data.dataPrevistaFim,
      dataRealFim: data.dataRealFim,
      faseTestes: data.faseTestes,
    })
    .onConflictDoUpdate({
      target: projectMetadata.id,
      set: {
        clientName: data.clientName,
        projectName: data.projectName,
        analystName: data.analystName,
        pmName: data.pmName,
        clientLogoPath: data.clientLogoPath,
        dataInicioTestes: data.dataInicioTestes,
        dataPrevistaFim: data.dataPrevistaFim,
        dataRealFim: data.dataRealFim,
        faseTestes: data.faseTestes,
      },
    });

  revalidatePath("/");
  revalidatePath("/relatorio");
  revalidatePath("/relatorio/[module]", "page");
  return { success: true };
}

export async function updateClientLogoPath(logoPath: string) {
  const [existing] = await db
    .select()
    .from(projectMetadata)
    .where(eq(projectMetadata.id, 1));

  if (existing) {
    await db
      .update(projectMetadata)
      .set({ clientLogoPath: logoPath || "" })
      .where(eq(projectMetadata.id, 1));
  } else {
    await db.insert(projectMetadata).values({
      id: 1,
      clientName: "",
      projectName: "",
      analystName: "",
      pmName: "",
      clientLogoPath: logoPath || "",
      dataInicioTestes: "",
      dataPrevistaFim: "",
      dataRealFim: "",
      faseTestes: "",
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
    .set({ clientLogoPath: "" })
    .where(eq(projectMetadata.id, 1));

  revalidatePath("/");
  revalidatePath("/relatorio");
  revalidatePath("/relatorio/[module]", "page");
  return { success: true };
}

export async function clearProjectMetadata() {
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
    .insert(projectMetadata)
    .values({
      id: 1,
      clientName: "",
      projectName: "",
      analystName: "",
      pmName: "",
      clientLogoPath: "",
      dataInicioTestes: "",
      dataPrevistaFim: "",
      dataRealFim: "",
      faseTestes: "",
    })
    .onConflictDoUpdate({
      target: projectMetadata.id,
      set: {
        clientName: "",
        projectName: "",
        analystName: "",
        pmName: "",
        clientLogoPath: "",
        dataInicioTestes: "",
        dataPrevistaFim: "",
        dataRealFim: "",
        faseTestes: "",
      },
    });

  revalidatePath("/");
  revalidatePath("/relatorio");
  revalidatePath("/relatorio/[module]", "page");
  return { success: true };
}
