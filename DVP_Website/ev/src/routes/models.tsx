import { createFileRoute } from "@tanstack/react-router";
import { BatteryCharging, Gauge, Search, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/ev/AppShell";
import { Panel } from "@/components/ev/Panel";
import { TooltipRow, TooltipShell } from "@/components/ev/ChartTooltip";
import { OEM_COLORS, VEHICLES } from "@/lib/ev-data";
import { useEvFilters } from "@/lib/ev-store";
import { formatNumber } from "@/lib/utils";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "Model Explorer — EV-Pulse Analytics" },
      {
        name: "description",
        content: "Compare electric vehicle models by price, range, and powertrain.",
      },
    ],
  }),
  component: ModelsPage,
});

function ModelsPage() {
  const { year, powertrain } = useEvFilters();
  const [query, setQuery] = useState("");

  const vehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return VEHICLES.filter(
      (vehicle) => vehicle.year === year && (powertrain === "All" || vehicle.type === powertrain),
    )
      .filter((vehicle) =>
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => b.range - a.range);
  }, [powertrain, query, year]);

  const oemData = useMemo(() => {
    return Object.entries(OEM_COLORS)
      .map(([make, color]) => {
        const models = vehicles.filter((vehicle) => vehicle.make === make);
        return {
          make,
          color,
          models: models.length,
          avgRange: models.length
            ? Math.round(models.reduce((sum, vehicle) => sum + vehicle.range, 0) / models.length)
            : 0,
        };
      })
      .filter((brand) => brand.models > 0);
  }, [vehicles]);

  const averageRange = vehicles.length
    ? Math.round(vehicles.reduce((sum, vehicle) => sum + vehicle.range, 0) / vehicles.length)
    : 0;
  const medianPrice = vehicles.length ? (vehicles[Math.floor(vehicles.length / 2)]?.msrp ?? 0) : 0;

  return (
    <AppShell
      title="Model Explorer"
      subtitle={`Vehicle portfolio comparison · FY ${year} · ${powertrain} powertrains`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric
          icon={BatteryCharging}
          label="Models tracked"
          value={formatNumber(vehicles.length)}
        />
        <Metric icon={Gauge} label="Average range" value={`${averageRange} mi`} />
        <Metric
          icon={WalletCards}
          label="Portfolio midpoint MSRP"
          value={`$${formatNumber(medianPrice)}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel
          title="Available models"
          hint="Sorted by electric range, with the active dashboard filters applied"
          actions={
            <label className="flex h-8 items-center gap-2 rounded-md border border-border bg-secondary/30 px-2.5 text-xs text-muted-foreground">
              <Search className="size-3.5" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search models"
                className="w-28 bg-transparent outline-none placeholder:text-muted-foreground/70 sm:w-36"
              />
            </label>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-border text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 font-medium">Model</th>
                  <th className="px-2 py-2 font-medium">Powertrain</th>
                  <th className="px-2 py-2 text-right font-medium">Range</th>
                  <th className="px-2 py-2 text-right font-medium">MSRP</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.slice(0, 12).map((vehicle) => (
                  <tr
                    key={`${vehicle.make}-${vehicle.model}`}
                    className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
                  >
                    <td className="px-2 py-3">
                      <p className="font-medium">{vehicle.model}</p>
                      <p className="text-[11px] text-muted-foreground">{vehicle.make}</p>
                    </td>
                    <td className="px-2 py-3">
                      <span className="rounded-full border border-border bg-secondary/50 px-2 py-1 text-[10px] font-medium">
                        {vehicle.type}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right font-semibold tnum">{vehicle.range} mi</td>
                    <td className="px-2 py-3 text-right tnum">${formatNumber(vehicle.msrp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!vehicles.length && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No models match this search.
              </p>
            )}
          </div>
        </Panel>

        <Panel
          title="OEM range benchmark"
          hint="Average range across each manufacturer's available models"
        >
          <div className="h-[410px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={oemData}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  unit=" mi"
                />
                <YAxis
                  type="category"
                  dataKey="make"
                  width={64}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload as {
                      make: string;
                      avgRange: number;
                      models: number;
                    };
                    return (
                      <TooltipShell title={row.make}>
                        <TooltipRow label="Average range" value={`${row.avgRange} mi`} />
                        <TooltipRow label="Models" value={String(row.models)} />
                      </TooltipShell>
                    );
                  }}
                />
                <Bar dataKey="avgRange" name="Average range" radius={[0, 5, 5, 0]}>
                  {oemData.map((brand) => (
                    <Cell key={brand.make} fill={brand.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="panel flex items-center gap-3 p-4">
      <div className="flex size-10 items-center justify-center rounded-md bg-primary/12 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold tnum">{value}</p>
      </div>
    </div>
  );
}
