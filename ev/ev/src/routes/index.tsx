import { createFileRoute } from "@tanstack/react-router";
import { BatteryCharging, DollarSign, Gauge, Plug, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/ev/AppShell";
import { KpiCard } from "@/components/ev/KpiCard";
import { Panel } from "@/components/ev/Panel";
import { TooltipRow, TooltipShell } from "@/components/ev/ChartTooltip";
import { SERIES_COLORS, computeKpis, oemShare, shareSeries } from "@/lib/ev-data";
import { useEvFilters } from "@/lib/ev-store";
import { formatNumber } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Overview — EV-Pulse Analytics" },
      {
        name: "description",
        content:
          "Real-time executive overview of EV adoption: registrations, charger ratio, range and MSRP benchmarks across the 2022-2026 horizon.",
      },
      { property: "og:title", content: "Executive Overview — EV-Pulse Analytics" },
      {
        property: "og:description",
        content: "Registrations, charger ratio, range and MSRP benchmarks for the EV transition.",
      },
    ],
  }),
  component: DashboardPage,
});

function nf(n: number, digits = 2) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(digits)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(0);
}

function DashboardPage() {
  const { year, powertrain } = useEvFilters();

  const kpis = useMemo(() => computeKpis(year, powertrain), [year, powertrain]);
  const share = useMemo(() => shareSeries(year, powertrain), [year, powertrain]);
  const oems = useMemo(() => oemShare(year, powertrain), [year, powertrain]);
  const [activeOem, setActiveOem] = useState<number | null>(null);

  const oemTotal = oems.reduce((s, o) => s + o.value, 0);
  const sparkEv = share.map((r) => r.BEV + r.PHEV);

  return (
    <AppShell
      title="Executive Overview"
      subtitle={`Washington State fleet electrification · FY ${year} · ${powertrain} powertrains`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total EVs Registered"
          value={nf(kpis.totalEvs)}
          icon={Zap}
          delta={kpis.yoy}
          deltaLabel="YoY"
          spark={sparkEv}
        />
        <KpiCard
          label="EV-to-Charger Ratio"
          value={`${kpis.ratio.toFixed(1)}:1`}
          icon={Plug}
          badge={
            kpis.ratio > 15 ? (
              <Badge className="border-signal-warning/40 bg-signal-warning/12 text-signal-warning tnum hover:bg-signal-warning/20">
                Above 15:1 target
              </Badge>
            ) : (
              <Badge className="border-signal-positive/40 bg-signal-positive/12 text-signal-positive hover:bg-signal-positive/20">
                Within target
              </Badge>
            )
          }
        />
        <KpiCard
          label="Average Range"
          value={String(kpis.avgRange)}
          unit="mi"
          icon={Gauge}
          delta={4.2}
          deltaLabel="vs prior FY"
        />
        <KpiCard
          label="Median MSRP"
          value={`$${(kpis.medianMsrp / 1000).toFixed(1)}K`}
          icon={DollarSign}
          delta={-2.4}
          deltaLabel="price deflation"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[65fr_35fr]">
        <Panel
          title="EV Market Share Transition"
          hint="Share of new vehicle registrations by powertrain"
          actions={
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              {(["BEV", "PHEV", "ICE"] as const).map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-sm"
                    style={{ background: SERIES_COLORS[k] }}
                  />
                  {k}
                </span>
              ))}
            </div>
          }
        >
          <div className="h-[300px] w-full sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={share} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  {(["BEV", "PHEV", "ICE"] as const).map((k) => (
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SERIES_COLORS[k]} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={SERIES_COLORS[k]} stopOpacity={0.06} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke={SERIES_COLORS.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: SERIES_COLORS.axis, fontSize: 11 }}
                  axisLine={{ stroke: SERIES_COLORS.grid }}
                  tickLine={false}
                />
                <YAxis
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fill: SERIES_COLORS.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: SERIES_COLORS.axis, strokeDasharray: "4 4" }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <TooltipShell title={`Model Year ${label}`}>
                        {payload
                          .slice()
                          .reverse()
                          .map((p) => (
                            <TooltipRow
                              key={String(p.dataKey)}
                              color={p.color}
                              label={String(p.dataKey)}
                              value={`${Number(p.value).toFixed(1)}%`}
                            />
                          ))}
                      </TooltipShell>
                    ) : null
                  }
                />
                {(["ICE", "PHEV", "BEV"] as const).map((k) => (
                  <Area
                    key={k}
                    type="monotone"
                    dataKey={k}
                    stackId="1"
                    stroke={SERIES_COLORS[k]}
                    strokeWidth={2}
                    fill={`url(#g-${k})`}
                    animationDuration={650}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Market Share by OEM" hint="Top 5 manufacturers by registered volume">
          <div className="h-[300px] w-full sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={oems}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={3}
                  stroke="none"
                  animationDuration={650}
                  onMouseEnter={(_, i) => setActiveOem(i)}
                  onMouseLeave={() => setActiveOem(null)}
                >
                  {oems.map((o, i) => (
                    <Cell
                      key={o.name}
                      fill={o.color}
                      opacity={activeOem === null || activeOem === i ? 1 : 0.35}
                      style={{ transition: "opacity 200ms ease" }}
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0];
                    if (!p) return null;
                    const value = Number(p.value);
                    return (
                      <TooltipShell title={String(p.name)}>
                        <TooltipRow
                          color={String(p.payload?.color)}
                          label="Units"
                          value={formatNumber(value)}
                        />
                        <TooltipRow
                          label="Share"
                          value={`${((value / oemTotal) * 100).toFixed(1)}%`}
                        />
                      </TooltipShell>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <BatteryCharging className="size-3.5 text-primary" />
            Tracked volume
            <span className="font-semibold tnum text-foreground">
              {formatNumber(oemTotal)}
            </span>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
