import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Banknote, Building2, CarFront } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/ev/AppShell";
import { Panel } from "@/components/ev/Panel";
import { TooltipRow, TooltipShell } from "@/components/ev/ChartTooltip";
import { COUNTIES, COST_PER_DCFC, ratioColor } from "@/lib/ev-data";
import { useEvFilters } from "@/lib/ev-store";
import { formatNumber } from "@/lib/utils";

export const Route = createFileRoute("/deficit")({
  head: () => ({
    meta: [
      { title: "Infrastructure Deficit — EV-Pulse Analytics" },
      {
        name: "description",
        content:
          "Infrastructure gap analysis for EV charging demand across Washington counties and capital planning scenarios.",
      },
      { property: "og:title", content: "Infrastructure Deficit — EV-Pulse Analytics" },
      {
        property: "og:description",
        content: "Charging demand shortages and planned capital expenditure by county.",
      },
    ],
  }),
  component: DeficitPage,
});

function DeficitPage() {
  const { year } = useEvFilters();

  const countyGap = useMemo(() => {
    return COUNTIES.map((county) => {
      const projected = county.evCount * (1 + (year - 2022) * 0.16);
      const requiredPorts = Math.ceil(projected / 15);
      const gap = Math.max(0, requiredPorts - county.publicPorts);
      return {
        name: county.name,
        evs: Math.round(projected),
        ports: county.publicPorts,
        requiredPorts,
        gap,
        ratio: county.ratio,
        color: ratioColor(county.ratio),
      };
    }).sort((a, b) => b.gap - a.gap);
  }, [year]);

  const totalGap = countyGap.reduce((sum, item) => sum + item.gap, 0);
  const totalCapex = totalGap * COST_PER_DCFC;
  const topCounty = countyGap[0];

  return (
    <AppShell
      title="Infrastructure Deficit"
      subtitle={`Charging coverage and required capital deployment · FY ${year}`}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="County Need Index"
          hint="Projected EVs versus public charging ports, sorted by largest shortfall"
        >
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countyGap.slice(0, 8)} margin={{ top: 8, right: 12, left: -8, bottom: 12 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as {
                      name?: string;
                      gap?: number;
                      requiredPorts?: number;
                      ports?: number;
                    };
                    return (
                      <TooltipShell title={row.name ?? "County"}>
                        <TooltipRow label="Gap" value={`${formatNumber(row.gap ?? 0)} ports`} />
                        <TooltipRow label="Required" value={formatNumber(row.requiredPorts ?? 0)} />
                        <TooltipRow label="Existing" value={formatNumber(row.ports ?? 0)} />
                      </TooltipShell>
                    );
                  }}
                />
                <Legend />
                <Bar dataKey="gap" name="Port gap" radius={[6, 6, 0, 0]} fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="grid gap-4">
          <Panel title="Capital Planning Snapshot" hint="Projected investment required to satisfy target ratio">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-3">
                  <Banknote className="size-4 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">Capex</p>
                    <p className="text-xl font-semibold tnum">${(totalCapex / 1e6).toFixed(1)}M</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[ ["Gap ports", formatNumber(totalGap)], ["Top county", topCounty?.name ?? "-"], ["Ratio", `${topCounty?.ratio ?? 0}:1`], ["Need", topCounty?.gap ? "Critical" : "Stable"] ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-border bg-secondary/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                    <p className="mt-1 font-semibold tnum">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Priority zones" hint="Where strategic allocation is needed the most">
            <div className="space-y-3">
              {countyGap.slice(0, 4).map((county) => (
                <div key={county.name} className="flex items-center justify-between rounded-md border border-border bg-secondary/20 p-3">
                  <div className="flex items-center gap-3">
                    <span className="size-2.5 rounded-full" style={{ background: county.color }} />
                    <div>
                      <p className="font-medium">{county.name}</p>
                      <p className="text-[11px] text-muted-foreground">{county.gap} port gap</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold tnum">{county.ratio}:1</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel title="Public charger coverage" hint="Current baseline">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
              <CarFront className="size-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Ports in service</p>
              <p className="mt-1 text-2xl font-semibold tnum">{formatNumber(COUNTIES.reduce((sum, item) => sum + item.publicPorts, 0))}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Projected demand" hint="Statewide EV forecast">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-500/10 text-sky-400">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Forecasted EVs</p>
              <p className="mt-1 text-2xl font-semibold tnum">{formatNumber(Math.round(COUNTIES.reduce((sum, item) => sum + item.evCount, 0) * (1 + (year - 2022) * 0.16)))}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Status" hint="Current infrastructure readiness">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Portfolio rating</p>
              <p className="mt-1 text-2xl font-semibold">Watchlist</p>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
