import { NextResponse } from "next/server";
import { clearAllScenarios } from "@/lib/actions/scenarios";

export async function DELETE() {
  try {
    await clearAllScenarios();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear scenarios error:", error);
    return NextResponse.json(
      { error: "Erro ao limpar cenários." },
      { status: 500 },
    );
  }
}
