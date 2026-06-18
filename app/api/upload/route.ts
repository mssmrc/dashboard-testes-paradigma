import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { addEvidence, getEvidenceCount } from "@/lib/actions/scenarios";

const MAX_EVIDENCES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const scenarioId = Number(formData.get("scenarioId"));
    const file = formData.get("file") as File | null;

    if (!scenarioId || !file) {
      return NextResponse.json(
        { error: "Cenário e arquivo são obrigatórios." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Apenas imagens (JPEG, PNG, GIF, WebP) são permitidas." },
        { status: 400 },
      );
    }

    const count = await getEvidenceCount(scenarioId);
    if (count >= MAX_EVIDENCES) {
      return NextResponse.json(
        { error: "Limite de 5 evidências por cenário atingido." },
        { status: 400 },
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".png";
    const filename = `${scenarioId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const evidence = await addEvidence(scenarioId, `/uploads/${filename}`);

    return NextResponse.json({ evidence });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo." },
      { status: 500 },
    );
  }
}
