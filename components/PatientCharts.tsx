"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SeriesRecord = {
  timestamp: string;
  hr?: number | null;
  spo2?: number | null;
  sbp?: number | null;
  dbp?: number | null;
  rr?: number | null;
  temp?: number | null;
};

type Metric = "hr" | "spo2" | "bp" | "temp";

const TITLES: Record<Metric, string> = {
  hr: "Frecuencia Cardíaca (últimas 24 horas)",
  spo2: "Saturación O₂ (últimas 24 horas)",
  bp: "Presión Arterial (últimas 24 horas)",
  temp: "Temperatura (últimas 24 horas)",
};

function formatTime(v: string) {
  const d = new Date(v);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Tabs({ value, onChange }: { value: Metric; onChange: (m: Metric) => void }) {
  const items: { key: Metric; label: string }[] = [
    { key: "hr", label: "Frecuencia Cardíaca" },
    { key: "spo2", label: "Saturación O₂" },
    { key: "bp", label: "Presión Arterial" },
    { key: "temp", label: "Temperatura" },
  ];
  return (
    <div className="flex flex-wrap gap-2 p-3">
      {items.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            value === t.key ? "bg-white shadow-sm border-gray-300" : "bg-gray-100 border-transparent hover:bg-gray-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function CustomTooltip({ active, payload, label, metric }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  let line = "";
  if (metric === "hr") line = `${Math.round(p.value)} bpm`;
  else if (metric === "spo2") line = `${Math.round(p.value)} %`;
  else if (metric === "temp") line = `${p.value?.toFixed?.(1) ?? p.value} °C`;
  return (
    <div className="rounded-md border bg-white/95 p-2 shadow-sm text-sm">
      <div className="font-medium">{formatTime(label)}</div>
      {metric === "bp" ? (
        <div className="text-gray-700">{`${payload[0]?.value ?? "-"}/${payload[1]?.value ?? "-"} mmHg`}</div>
      ) : (
        <div className="text-gray-700">{line}</div>
      )}
    </div>
  );
}

export default function PatientCharts({ data }: { data: SeriesRecord[] }) {
  const [metric, setMetric] = useState<Metric>("hr");

  const domains = useMemo(() => {
    const vals = (k: keyof SeriesRecord) => data.map((d) => (d[k] ?? null) as number | null).filter((x): x is number => x != null);
    return {
      hr: [Math.min(50, ...(vals("hr").length ? [Math.min(...vals("hr"))] : [60])), Math.max(130, ...(vals("hr").length ? [Math.max(...vals("hr"))] : [100]))],
      spo2: [88, 100] as [number, number],
      temp: [35, 40] as [number, number],
      sbp: undefined as any,
    };
  }, [data]);

  return (
    <div className="rounded-2xl border border-gray-200">
      <Tabs value={metric} onChange={setMetric} />
      <div className="px-5 pb-4">
        <h3 className="mb-3 text-xl font-semibold">{TITLES[metric]}</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer>
            {metric === "bp" ? (
              <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(v) => formatTime(String(v))} minTickGap={32} />
                <YAxis />
                <Tooltip content={<CustomTooltip metric={metric} />} labelFormatter={(v) => String(v)} />
                <Legend />
                <Line type="monotone" dataKey="sbp" stroke="#7c3aed" dot={false} name="SBP" strokeWidth={2} />
                <Line type="monotone" dataKey="dbp" stroke="#60a5fa" dot={false} name="DBP" strokeWidth={2} />
              </LineChart>
            ) : (
              <AreaChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <defs>
                  <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(v) => formatTime(String(v))} minTickGap={32} />
                <YAxis domain={metric === "hr" ? domains.hr : metric === "spo2" ? domains.spo2 : domains.temp} />
                <Tooltip content={<CustomTooltip metric={metric} />} labelFormatter={(v) => String(v)} />
                {metric === "hr" && (
                  <Area type="monotone" dataKey="hr" stroke="#ef4444" fill="url(#gradRed)" name="HR" strokeWidth={2} />
                )}
                {metric === "spo2" && (
                  <Area type="monotone" dataKey="spo2" stroke="#3b82f6" fill="url(#gradBlue)" name="SpO2" strokeWidth={2} />
                )}
                {metric === "temp" && (
                  <Area type="monotone" dataKey="temp" stroke="#f59e0b" fill="url(#gradAmber)" name="Temp" strokeWidth={2} />
                )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
