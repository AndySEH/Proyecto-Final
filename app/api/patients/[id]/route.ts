import { NextResponse } from "next/server";
import { groupByPatient, loadCsv } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const records = loadCsv();
    const byPatient = groupByPatient(records);
    const arr = byPatient.get(params.id);
    if (!arr || arr.length === 0) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ id: params.id, records: arr });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
