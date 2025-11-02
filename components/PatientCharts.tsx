"use client";

import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

export type SeriesRecord = {
  timestamp: string;
  hr?: number | null;
  spo2?: number | null;
  sbp?: number | null;
  dbp?: number | null;
  rr?: number | null;
  temp?: number | null;
};

export default function PatientCharts({ data }: { data: SeriesRecord[] }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-medium mb-2">Frecuencia cardiaca (HR)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(v) => new Date(v).toLocaleTimeString()} minTickGap={32} />
              <YAxis />
              <Tooltip labelFormatter={(v) => new Date(v as string).toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="hr" stroke="#ef4444" dot={false} name="HR" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Saturación (SpO2)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(v) => new Date(v).toLocaleTimeString()} minTickGap={32} />
              <YAxis domain={[80, 100]} />
              <Tooltip labelFormatter={(v) => new Date(v as string).toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="spo2" stroke="#3b82f6" dot={false} name="SpO2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Presión arterial (SBP/DBP)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(v) => new Date(v).toLocaleTimeString()} minTickGap={32} />
              <YAxis />
              <Tooltip labelFormatter={(v) => new Date(v as string).toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="sbp" stroke="#10b981" dot={false} name="SBP" />
              <Line type="monotone" dataKey="dbp" stroke="#0ea5e9" dot={false} name="DBP" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
