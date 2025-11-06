import { loadCsv, getCsvStats } from "@/lib/csv";
import { buildLatestByPatient } from "@/lib/patients";
import PatientCharts from "@/components/PatientCharts";

type PatientLatest = ReturnType<typeof buildLatestByPatient>[number];

type EventItem = { type: "alert" | "info"; text: string; time: string };
function generateEvents(p: PatientLatest): EventItem[] {
  const items: EventItem[] = [];
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (p.latest.hr != null && (p.latest.hr > 100 || p.latest.hr < 50)) {
    items.push({ type: "alert", text: `Frecuencia cardiaca fuera de rango (${p.latest.hr} bpm)`, time: fmt(now) });
  }
  if (p.latest.spo2 != null && p.latest.spo2 < 94) {
    items.push({ type: "alert", text: `Saturación O₂ baja (${p.latest.spo2}%)`, time: fmt(new Date(now.getTime() - 2 * 60 * 1000)) });
  }
  if (p.latest.sbp != null && p.latest.dbp != null && (p.latest.sbp >= 140 || p.latest.dbp >= 90)) {
    items.push({ type: "info", text: `Presión arterial elevada (${p.latest.sbp}/${p.latest.dbp} mmHg)`, time: fmt(new Date(now.getTime() - 10 * 60 * 1000)) });
  }
  if (items.length === 0) {
    items.push({ type: "info", text: "Signos vitales dentro de rangos normales", time: fmt(now) });
  }
  return items;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Severity = "normal" | "warning" | "critical" | "unknown";

function vitalSeverity(v: PatientLatest["latest"]): Severity {
  let level: Severity = "normal";
  const raise = (s: Severity) => {
    const order = ["normal", "warning", "critical"] as const;
    if (s === "unknown") return;
    if (level === "unknown") level = s;
    else if (order.indexOf(s) > order.indexOf(level as any)) level = s;
  };
  const anyMissing = v.hr == null && v.spo2 == null && v.sbp == null && v.dbp == null && v.temp == null && v.rr == null;
  if (anyMissing) return "unknown";

  // HR
  if (v.hr != null) {
    if (v.hr < 40 || v.hr > 130) raise("critical");
    else if (v.hr < 50 || v.hr > 100) raise("warning");
  }
  // SpO2
  if (v.spo2 != null) {
    if (v.spo2 < 90) raise("critical");
    else if (v.spo2 < 94) raise("warning");
  }
  // Blood Pressure (simple rules)
  if (v.sbp != null || v.dbp != null) {
    const sbp = v.sbp ?? 0;
    const dbp = v.dbp ?? 0;
    if (sbp > 180 || dbp > 120 || sbp < 85) raise("critical");
    else if (sbp >= 140 || dbp >= 90 || sbp < 90) raise("warning");
  }
  // Temperature
  if (v.temp != null) {
    if (v.temp > 39.5 || v.temp < 35) raise("critical");
    else if (v.temp >= 38 || v.temp < 36) raise("warning");
  }
  // Respiratory rate
  if (v.rr != null) {
    if (v.rr < 8 || v.rr > 30) raise("critical");
    else if (v.rr < 12 || v.rr > 20) raise("warning");
  }
  return level;
}

function severityBadge(sev: Severity) {
  const map: Record<Severity, { text: string; cls: string }> = {
    normal: { text: "Estable", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
    warning: { text: "Vigilar", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
    critical: { text: "Crítico", cls: "bg-red-50 text-red-700 ring-red-600/20" },
    unknown: { text: "Sin datos", cls: "bg-gray-50 text-gray-600 ring-gray-500/20" },
  };
  const { text, cls } = map[sev];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        sev === "critical" ? "bg-red-500" : sev === "warning" ? "bg-amber-500" : sev === "normal" ? "bg-emerald-500" : "bg-gray-400"
      }`} />
      {text}
    </span>
  );
}

function colorize(value: number | null | undefined, type: "hr" | "spo2" | "temp" | "sbpdbp" | "rr") {
  if (value == null) return "text-gray-500";
  switch (type) {
    case "hr":
      if (value < 40 || value > 130) return "text-red-600 font-semibold";
      if (value < 50 || value > 100) return "text-amber-600 font-medium";
      return "text-emerald-700";
    case "spo2":
      if (value < 90) return "text-red-600 font-semibold";
      if (value < 94) return "text-amber-600 font-medium";
      return "text-emerald-700";
    case "temp":
      if (value > 39.5 || value < 35) return "text-red-600 font-semibold";
      if (value >= 38 || value < 36) return "text-amber-600 font-medium";
      return "text-emerald-700";
    case "sbpdbp":
      if (value > 180 || value < 85) return "text-red-600 font-semibold";
      if (value >= 140 || value < 90) return "text-amber-600 font-medium";
      return "text-emerald-700";
    case "rr":
      if (value < 8 || value > 30) return "text-red-600 font-semibold";
      if (value < 12 || value > 20) return "text-amber-600 font-medium";
      return "text-emerald-700";
  }
}

function ecgRhythm(hr: number | null) {
  if (hr == null) return { text: "Sin señal", cls: "bg-gray-50 text-gray-600 ring-gray-500/20" };
  if (hr < 50) return { text: "Bradicardia", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" };
  if (hr > 100) return { text: "Taquicardia", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" };
  return { text: "Ritmo sinusal", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" };
}

export default async function Page({ searchParams }: { searchParams?: { q?: string; id?: string } }) {
  const records = loadCsv();
  let patients: PatientLatest[] = buildLatestByPatient(records);

  // Filter by query if provided
  const q = (searchParams?.q ?? "").toLowerCase().trim();
  if (q) {
    patients = patients.filter((p) => p.id.toLowerCase().includes(q));
  }

  const stats = getCsvStats(records);

  // Counters by severity
  const counts = patients.reduce(
    (acc, p) => {
      const s = vitalSeverity(p.latest);
      acc.total += 1;
      if (s === "normal") acc.stable += 1;
      else if (s === "warning") acc.observe += 1;
      else if (s === "critical") acc.critical += 1;
      return acc;
    },
    { total: 0, stable: 0, observe: 0, critical: 0 }
  );

  // Selected patient (from id query or first)
  const selectedId = searchParams?.id && patients.find((p) => p.id === searchParams!.id) ? searchParams!.id : patients[0]?.id;
  const selected = patients.find((p) => p.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sistema de Monitoreo UCI</h1>
          <p className="text-sm text-gray-500">Unidad de Cuidados Intensivos</p>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-sm font-medium">Dr. Juan Pérez</div>
          <div className="text-xs text-gray-500">Turno: 08:00 - 16:00</div>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Total Pacientes</div>
          <div className="mt-1 text-2xl font-semibold">{counts.total}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Estables</div>
          <div className="mt-1 text-2xl font-semibold">{counts.stable}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">En Observación</div>
          <div className="mt-1 text-2xl font-semibold">{counts.observe}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">Críticos</div>
          <div className="mt-1 text-2xl font-semibold">{counts.critical}</div>
        </div>
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Patients list */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col h-[560px] lg:h-[720px]">
          <div className="px-4 py-3 border-b border-gray-200 font-medium">Pacientes</div>
          <div className="flex-1 overflow-y-auto">
            {patients.map((p) => {
              const sev = vitalSeverity(p.latest);
              const rhythm = ecgRhythm(p.latest.hr);
              const selectedRow = p.id === selectedId;
              return (
                <a key={p.id} href={`/?id=${encodeURIComponent(p.id)}`} className={`flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-200 hover:bg-sky-50 ${selectedRow ? "bg-sky-50" : ""}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{p.meta?.name ?? p.id}</div>
                      {severityBadge(sev)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{p.meta?.unit ?? "UCI"} • {p.meta?.age ? `${p.meta.age} años` : ""}</div>
                    <div className="mt-1 flex items-center gap-4 text-xs">
                      <div className={colorize(p.latest.hr, "hr")}>{p.latest.hr ?? "-"} bpm</div>
                      <div className={colorize(p.latest.spo2, "spo2")}>{p.latest.spo2 ?? "-"} %</div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Right pane detail */}
        <div className="lg:col-span-2 space-y-6">
          {selected && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="p-4 flex items-start justify-between">
                <div>
                  <div className="text-lg font-medium">{selected.meta?.name ?? selected.id}</div>
                  <div className="text-sm text-gray-500 flex gap-3 flex-wrap">
                    <span>{selected.meta?.age ? `${selected.meta.age} años` : ""}</span>
                    <span>• {selected.meta?.unit ?? "UCI"}</span>
                    {selected.meta?.admission && <span>• Ingreso: {new Date(selected.meta.admission).toLocaleDateString()}</span>}
                  </div>
                </div>
                {severityBadge(vitalSeverity(selected.latest))}
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 p-4 bg-rose-50">
                  <div className="text-sm text-gray-700">Frecuencia Cardíaca</div>
                  <div className={`mt-1 text-xl ${colorize(selected.latest.hr, "hr")}`}>{selected.latest.hr ?? "-"} bpm</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-sky-50">
                  <div className="text-sm text-gray-700">Saturación O₂</div>
                  <div className={`mt-1 text-xl ${colorize(selected.latest.spo2, "spo2")}`}>{selected.latest.spo2 ?? "-"} %</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-violet-50">
                  <div className="text-sm text-gray-700">Presión Arterial</div>
                  <div className={`mt-1 text-xl ${colorize(selected.latest.sbp ?? null, "sbpdbp")}`}>{selected.latest.sbp ?? "-"}/{selected.latest.dbp ?? "-"} mmHg</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-amber-50">
                  <div className="text-sm text-gray-700">Temperatura</div>
                  <div className={`mt-1 text-xl ${colorize(selected.latest.temp, "temp")}`}>{selected.latest.temp ?? "-"} °C</div>
                </div>
              </div>
            </div>
          )}

          {/* Charts and events */}
          {selected && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <PatientCharts data={records.filter((r) => r.patient_id === selected.id)} />
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="font-medium mb-3">Registro de Eventos</div>
                <ul className="space-y-2 text-sm">
                  {generateEvents(selected).map((e, i) => (
                    <li key={i} className={`rounded-md border p-3 ${e.type === "alert" ? "bg-amber-50 border-amber-200" : "bg-white"}`}>
                      <div className="flex items-center justify-between">
                        <div>{e.text}</div>
                        <div className="text-xs text-gray-500">{e.time}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
