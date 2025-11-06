import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

export type VitalRecord = {
  patient_id: string;
  timestamp: string; // ISO string or parseable
  hr?: number | null; // heart rate
  spo2?: number | null;
  sbp?: number | null; // systolic blood pressure
  dbp?: number | null; // diastolic blood pressure
  rr?: number | null; // respiratory rate
  temp?: number | null; // temperature
  // Optional patient metadata when provided in the same CSV
  name?: string; // patient full name
  age?: number | null; // patient age in years
  unit?: string; // e.g., UCI-101 / bed
  admission?: string; // ISO date string
};

type Cache = { filePath: string; mtimeMs: number; data: VitalRecord[] } | null;
let cache: Cache = null;

export function resolveCsvPath(defaultRelPath = "data/sample_vitals.csv"): string {
  const envPath = process.env.VITALS_CSV_PATH;
  if (envPath) {
    return path.isAbsolute(envPath) ? envPath : path.join(process.cwd(), envPath);
  }
  // Always use the provided default (sample_vitals.csv) unless overridden by env var
  return path.isAbsolute(defaultRelPath)
    ? defaultRelPath
    : path.join(process.cwd(), defaultRelPath);
}

export function loadCsv(fileRelPath = "data/sample_vitals.csv"): VitalRecord[] {
  const filePath = resolveCsvPath(fileRelPath);

  const stat = fs.statSync(filePath);
  if (cache && cache.filePath === filePath && cache.mtimeMs === stat.mtimeMs) {
    return cache.data;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const data = rows.map(normalizeRow).filter((r): r is VitalRecord => !!r.patient_id && !!r.timestamp);
  cache = { filePath, mtimeMs: stat.mtimeMs, data };
  return data;
}

export function groupByPatient(records: VitalRecord[]): Map<string, VitalRecord[]> {
  const map = new Map<string, VitalRecord[]>();
  for (const rec of records) {
    const arr = map.get(rec.patient_id) ?? [];
    arr.push(rec);
    map.set(rec.patient_id, arr);
  }
  // sort each by timestamp asc
  for (const [k, arr] of map.entries()) {
    arr.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    map.set(k, arr);
  }
  return map;
}

function numOrNull(v?: string): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeRow(row: Record<string, string>): VitalRecord {
  const get = (keys: string[]): string | undefined => {
    for (const k of keys) if (row[k] !== undefined) return row[k];
    // case-insensitive fallback
    const lowerMap: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) lowerMap[k.toLowerCase()] = v;
    for (const k of keys) {
      const v = lowerMap[k.toLowerCase()];
      if (v !== undefined) return v;
    }
    return undefined;
  };

  const patient_id = get(["patient_id", "Patient ID", "PatientID", "patient id"]);
  const timestamp = get(["timestamp", "Timestamp", "time", "datetime", "Date", "date"]);
  const hr = numOrNull(get(["hr", "Heart Rate", "heart rate"])) as number | null;
  const rr = numOrNull(get(["rr", "Respiratory Rate", "respiratory rate"])) as number | null;
  const temp = numOrNull(get(["temp", "Body Temperature", "body temperature"])) as number | null;
  const spo2 = numOrNull(get(["spo2", "Oxygen Saturation", "oxygen saturation", "SpO2"])) as number | null;
  const sbp = numOrNull(
    get(["sbp", "Systolic Blood Pressure", "systolic blood pressure", "Systolic"])
  ) as number | null;
  const dbp = numOrNull(
    get(["dbp", "Diastolic Blood Pressure", "diastolic blood pressure", "Diastolic"])
  ) as number | null;

  // Optional metadata if included in the same CSV
  const name = get(["name", "Nombre", "patient_name", "Paciente"]);
  const age = numOrNull(get(["age", "Edad"])) as number | null;
  const unit = get(["unit", "Unidad", "ward", "UCI", "uci", "Bed", "bed"]);
  const admission = get([
    "admission",
    "admission_date",
    "admit_date",
    "ingreso",
    "Ingreso",
    "fecha ingreso",
    "Fecha ingreso",
    "date_admission",
  ]);

  return {
    patient_id: patient_id ?? "",
    timestamp: timestamp ?? "",
    hr,
    spo2,
    sbp,
    dbp,
    rr,
    temp,
    name: name ?? undefined,
    age: age ?? undefined,
    unit: unit ?? undefined,
    admission: admission ?? undefined,
  };
}

export function getCsvHeaders(fileRelPath = "data/sample_vitals.csv"): { filePath: string; headers: string[] } {
  const filePath = resolveCsvPath(fileRelPath);
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];
  const first = rows[0] ?? {};
  return { filePath, headers: Object.keys(first) };
}

export function getCsvStats(records: VitalRecord[]): { totalRows: number; totalPatients: number; start?: string; end?: string } {
  const totalRows = records.length;
  const byPatient = groupByPatient(records);
  let start: number | undefined;
  let end: number | undefined;
  for (const arr of byPatient.values()) {
    if (arr.length === 0) continue;
    const firstTs = new Date(arr[0].timestamp).getTime();
    const lastTs = new Date(arr[arr.length - 1].timestamp).getTime();
    start = start === undefined ? firstTs : Math.min(start, firstTs);
    end = end === undefined ? lastTs : Math.max(end, lastTs);
  }
  return {
    totalRows,
    totalPatients: byPatient.size,
    start: start ? new Date(start).toISOString() : undefined,
    end: end ? new Date(end).toISOString() : undefined,
  };
}
