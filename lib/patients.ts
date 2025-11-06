import { groupByPatient, type VitalRecord } from "@/lib/csv";

export type PatientMeta = {
  id: string;
  name?: string;
  age?: number;
  unit?: string; // e.g., UCI-101
  admission?: string; // ISO date
};

export type PatientLatestView = {
  id: string;
  meta?: PatientMeta;
  latest: {
    timestamp: string;
    hr: number | null;
    spo2: number | null;
    sbp: number | null;
    dbp: number | null;
    rr: number | null;
    temp: number | null;
  };
};

export function buildLatestByPatient(records: VitalRecord[]): PatientLatestView[] {
  const byPatient = groupByPatient(records);
  return Array.from(byPatient.entries()).map(([id, arr]) => {
    const last = arr[arr.length - 1]!;
    const first = arr[0]!;
    const meta: PatientMeta = {
      id,
      name: first.name ?? undefined,
      age: (first.age ?? undefined) as number | undefined,
      unit: first.unit ?? undefined,
      admission: first.admission ?? undefined,
    };
    return {
      id,
      meta,
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
}
