import { groupByPatient, loadCsv, getCsvHeaders, getCsvStats, resolveCsvPath } from "@/lib/csv";

type PatientLatest = {
  id: string;
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Page() {
  const records = loadCsv();
  const byPatient = groupByPatient(records);
  const patients: PatientLatest[] = Array.from(byPatient.entries()).map(([id, arr]) => {
    const last = arr[arr.length - 1]!;
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

  const { headers } = getCsvHeaders();
  const stats = getCsvStats(records);
  const activePath = resolveCsvPath();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Pacientes</h2>
        <p className="text-sm text-gray-500">Últimas lecturas por paciente</p>
      </div>
      <div className="rounded border p-3 bg-gray-50">
        <div className="flex flex-col gap-1 text-sm">
          <div>
            <span className="font-medium">Archivo activo:</span> <span className="break-all">{activePath}</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <div><span className="font-medium">Filas:</span> {stats.totalRows}</div>
            <div><span className="font-medium">Pacientes:</span> {stats.totalPatients}</div>
            <div><span className="font-medium">Rango de tiempo:</span> {stats.start ? new Date(stats.start).toLocaleString() : "-"} → {stats.end ? new Date(stats.end).toLocaleString() : "-"}</div>
          </div>
          <div>
            <span className="font-medium">Encabezados detectados:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {headers.map((h) => (
                <span key={h} className="px-2 py-0.5 rounded bg-white border text-xs">{h}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-2 border">Paciente</th>
              <th className="p-2 border">HR</th>
              <th className="p-2 border">SpO2</th>
              <th className="p-2 border">PA (SBP/DBP)</th>
              <th className="p-2 border">Temp</th>
              <th className="p-2 border">Última lectura</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 border font-medium">{p.id}</td>
                <td className="p-2 border">{p.latest.hr ?? "-"}</td>
                <td className="p-2 border">{p.latest.spo2 ?? "-"}</td>
                <td className="p-2 border">
                  {p.latest.sbp ?? "-"}/{p.latest.dbp ?? "-"}
                </td>
                <td className="p-2 border">{p.latest.temp ?? "-"}</td>
                <td className="p-2 border">{new Date(p.latest.timestamp).toLocaleString()}</td>
                <td className="p-2 border">
                  <a className="text-blue-600 underline" href={`/patient/${encodeURIComponent(p.id)}`}>Ver detalle</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Reemplaza el archivo data/sample_vitals.csv con tus datos reales.</p>
    </div>
  );
}
