import { createFileRoute } from "@tanstack/react-router";
import { CarFront, CircleDashed, Gauge, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { AppShell } from "@/components/ev/AppShell";
import { Panel } from "@/components/ev/Panel";
import { TooltipRow, TooltipShell } from "@/components/ev/ChartTooltip";
import { SERIES_COLORS, VEHICLES, type PowertrainFilter } from "@/lib/ev-data";
import { useEvFilters } from "@/lib/ev-store";
import { formatNumber } from "@/lib/utils";

export const Route = createFileRoute("/trends")({
  head: () => ({
    meta: [
      { title: "Market Trends — EV-Pulse Analytics" },
      {
        name: "description",
        content:
          "Price-to-range EV market analysis, powertrain trends, and OEM performance across model years.",
      },
      { property: "og:title", content: "Market Trends — EV-Pulse Analytics" },
      {
        property: "og:description",
        content: "Price-to-range scatter plot and trend analysis for EV portfolios.",
      },
    ],
  }),
  component: TrendsPage,
});

const OEM_KEYS = ["Tesla", "Ford", "Hyundai", "GM", "Rivian"] as const;

function getVehicleScatterData(powertrain: PowertrainFilter) {
  const data = VEHICLES.filter(
    (v) => (powertrain === "All" || v.type === powertrain) && v.msrp >= 20000 && v.msrp <= 100000,
  );

  const visible = new Set(OEM_KEYS);
  return data
    .filter((v) => visible.has(v.make))
    .map((v) => ({
      x: v.msrp,
      y: v.range,
      z: Math.max(30, v.range * 0.9),
      make: v.make,
      model: v.model,
      type: v.type,
    }));
}

function TrendsPage() {
  const { year, powertrain } = useEvFilters();
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  const scatterData = useMemo(() => getVehicleScatterData(powertrain), [powertrain]);

  const filteredScatter = useMemo(() => {
    if (!activeBrand) return scatterData;
    return scatterData.filter((entry) => entry.make === activeBrand);
  }, [activeBrand, scatterData]);

  const lineData = useMemo(() => {
    const years = [2022, 2023, 2024, 2025, 2026];
    return years.map((y) => {
      const values = VEHICLES.filter((v) => v.year === y && (powertrain === "All" || v.type === powertrain));
      const avgRange = values.length
        ? values.reduce((sum, item) => sum + item.range, 0) / values.length
        : 0;
      const avgMsrp = values.length
        ? values.reduce((sum, item) => sum + item.msrp, 0) / values.length
        : 0;
      return { year: y, avgRange: Number(avgRange.toFixed(1)), avgMsrp: Number(avgMsrp.toFixed(0)) };
    });
  }, [powertrain]);

  const highlightSet = new Set(activeBrand ? [activeBrand] : OEM_KEYS);

  return (
    <AppShell
      title="Market Trends"
      subtitle={`Price-to-range performance and longitudinal EV adoption · FY ${year} · ${powertrain}`}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Price-to-Range Efficiency"
          hint="MSRP vs EPA range for top EV brands · click a legend item to isolate the brand"
          actions={
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              {OEM_KEYS.map((brand) => {
                const active = activeBrand === null || activeBrand === brand;
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setActiveBrand((current) => (current === brand ? null : brand))}
                    className="flex items-center gap-1.5 transition-opacity duration-200"
                    style={{ opacity: active ? 1 : 0.35 }}
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: SERIES_COLORS[brand as keyof typeof SERIES_COLORS] ?? "#94a3b8" }}
                    />
                    {brand}
                  </button>
                );
              })}
            </div>
          }
        >
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 12, left: 2, bottom: 12 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[20000, 100000]}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[100, 450]}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  label={{ value: "EPA Range (mi)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <ReferenceLine
                  x={45000}
                  stroke="#94a3b8"
                  strokeDasharray="6 6"
                  strokeOpacity={0.8}
                />
                <ReferenceLine
                  y={250}
                  stroke="#94a3b8"
                  strokeDasharray="6 6"
                  strokeOpacity={0.8}
                />
                <Tooltip
                  cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0].payload as {
                      make?: string;
                      model?: string;
                      x?: number;
                      y?: number;
                    };
                    if (!point) return null;
                    return (
                      <TooltipShell title={point.make ?? "EV Model"}>
                        <TooltipRow label={point.model ?? "Vehicle"} value="" />
                        <TooltipRow label="MSRP" value={`$${formatNumber(Number(point.x ?? 0))}`} />
                        <TooltipRow label="Range" value={`${Number(point.y ?? 0).toFixed(0)} mi`} />
                      </TooltipShell>
                    );
                  }}
                />
                <Scatter
                  data={filteredScatter}
                  fill="#10b981"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const color = payload?.make === "Tesla"
                      ? "#10b981"
                      : payload?.make === "Ford"
                        ? "#3b82f6"
                        : payload?.make === "Hyundai"
                          ? "#f59e0b"
                          : payload?.make === "GM"
                            ? "#a78bfa"
                            : payload?.make === "Rivian"
                              ? "#f43f5e"
                              : "#94a3b8";
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={color}
                        fillOpacity={activeBrand ? 1 : 0.85}
                        stroke="#e2e8f0"
                        strokeWidth={1}
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Adoption Momentum" hint="Average range by model year and powertrain mix">
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 12, right: 12, left: 0, bottom: 12 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <TooltipShell title={`FY ${label}`}>
                        {payload.map((point) => (
                          <TooltipRow
                            key={String(point.dataKey)}
                            color={String(point.color)}
                            label={String(point.dataKey).replace(/([A-Z])/g, " $1").trim()}
                            value={point.dataKey === "avgRange" ? `${Number(point.value).toFixed(0)} mi` : `$${formatNumber(Number(point.value))}`}
                          />
                        ))}
                      </TooltipShell>
                    );
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="avgRange" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} name="Avg range (mi)" />
                <Line type="monotone" dataKey="avgMsrp" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3 }} name="Avg MSRP ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel className="h-full" title="Efficiency Signal" hint="Relative value per dollar spent">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/12 text-primary">
              <Gauge className="size-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Efficiency score</p>
              <p className="mt-1 text-2xl font-semibold tnum">89.4</p>
            </div>
          </div>
        </Panel>

        <Panel className="h-full" title="Portfolio Mix" hint="Top performing architecture">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-500/10 text-sky-400">
              <CarFront className="size-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Lead powertrain</p>
              <p className="mt-1 text-2xl font-semibold">BEV</p>
            </div>
          </div>
        </Panel>

        <Panel className="h-full" title="Market Signal" hint="Demand slope">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Momentum</p>
              <p className="mt-1 text-2xl font-semibold tnum">+18.6%</p>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
