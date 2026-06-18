import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { updateClientLogoPath } from "@/lib/actions/project-metadata";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo é obrigatório." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Apenas imagens (JPEG, PNG, GIF, WebP, SVG) são permitidas." },
        { status: 400 },
      );
    }

    const logosDir = path.join(process.cwd(), "public", "uploads", "logos");
    await mkdir(logosDir, { recursive: true });

    const ext = path.extname(file.name) || ".png";
    const filename = `client-logo-${Date.now()}${ext}`;
    const diskPath = path.join(logosDir, filename);
    const publicPath = `/uploads/logos/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(diskPath, buffer);

    await updateClientLogoPath(publicPath);

    return NextResponse.json({ path: publicPath });
  } catch (error) {
    console.error("Client logo upload error:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do logo." },
      { status: 500 },
    );
  }
}
