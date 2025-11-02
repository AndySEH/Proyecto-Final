import PatientCharts, { type SeriesRecord } from "@/components/PatientCharts";
import { groupByPatient, loadCsv } from "@/lib/csv";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PatientDetail({ params }: { params: { id: string } }) {
  const records = loadCsv();
  const byPatient = groupByPatient(records);
  const arr = byPatient.get(params.id) as SeriesRecord[] | undefined;
  if (!arr || arr.length === 0) {
    notFound();
  }
  const data = { id: params.id, records: arr };
  return (
    <div className="space-y-6">
      <div>
        <a className="text-blue-600 underline" href="/">← Volver</a>
        <h2 className="text-lg font-semibold mt-2">Paciente: {data.id}</h2>
        <p className="text-sm text-gray-500">Serie temporal de signos vitales</p>
      </div>
      <PatientCharts data={data.records} />
    </div>
  );
}
