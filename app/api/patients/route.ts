import { NextResponse } from "next/server";
import { groupByPatient, loadCsv, type VitalRecord } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const records = loadCsv();
    const byPatient = groupByPatient(records);
    const entries = Array.from(byPatient.entries()) as [string, VitalRecord[]][];
    const result = entries.map(([id, arr]) => {
      const last = arr[arr.length - 1];
      return {
        id,
        latest: {
          timestamp: last.timestamp,
          hr: last.hr ?? null,
          spo2: last.spo2 ?? null,
          sbp: last.sbp ?? null,
          dbp: last.dbp ?? null,
          rr: last.rr ?? null,
          temp: last.temp ?? null,
        },
      };
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
