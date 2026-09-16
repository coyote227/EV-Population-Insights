import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Battery, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/ev/AppShell";
import { KpiCard } from "@/components/ev/KpiCard";
import { Panel } from "@/components/ev/Panel";
import { TooltipRow, TooltipShell } from "@/components/ev/ChartTooltip";
import { SERIES_COLORS, shareSeries } from "@/lib/ev-data";
import { useEvFilters } from "@/lib/ev-store";

export const Route = createFileRoute("/outlook")({
  head: () => ({
    meta: [
      { title: "Adoption Outlook — EV-Pulse Analytics" },
      {
        name: "description",
        content: "Explore the electric vehicle adoption curve and powertrain mix through 2026.",
      },
    ],
  }),
  component: OutlookPage,
});

function OutlookPage() {
  const { year, powertrain } = useEvFilters();
  const series = useMemo(() => shareSeries(year, powertrain), [powertrain, year]);
  const current = series.at(-1) ?? { BEV: 0, PHEV: 0, ICE: 0, year };
  const first = series[0] ?? current;
  const evShare = current.BEV + current.PHEV;
  const growth = evShare - (first.BEV + first.PHEV);

  return (
    <AppShell
      title="Adoption Outlook"
      subtitle={`Powertrain transition and fleet mix · through FY ${year} · ${powertrain}`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Electrified share"
          value={`${evShare.toFixed(1)}%`}
          icon={Battery}
          delta={growth}
          deltaLabel="since 2018"
          spark={series.map((item) => item.BEV + item.PHEV)}
        />
        <KpiCard
          label="BEV share"
          value={`${current.BEV.toFixed(1)}%`}
          icon={TrendingUp}
          delta={current.BEV - first.BEV}
          deltaLabel="since 2018"
        />
        <KpiCard
          label="Latest momentum"
          value={`${(current.BEV - (series.at(-2)?.BEV ?? current.BEV)).toFixed(1)} pts`}
          icon={ArrowUpRight}
          delta={4.8}
          deltaLabel="vs prior year"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel
          title="The electrification curve"
          hint="Share of new vehicle registrations by powertrain"
        >
          <div className="h-[390px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 12, right: 12, left: -12, bottom: 4 }}>
                <defs>
                  {(["BEV", "PHEV", "ICE"] as const).map((key) => (
                    <linearGradient key={key} id={`outlook-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SERIES_COLORS[key]} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={SERIES_COLORS[key]} stopOpacity={0.04} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />
                <YAxis
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <TooltipShell title={`FY ${label}`}>
                        {payload
                          .slice()
                          .reverse()
                          .map((point) => (
                            <TooltipRow
                              key={String(point.dataKey)}
                              color={String(point.color)}
                              label={String(point.dataKey)}
                              value={`${Number(point.value).toFixed(1)}%`}
                            />
                          ))}
                      </TooltipShell>
                    ) : null
                  }
                />
                {(["ICE", "PHEV", "BEV"] as const).map((key) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="mix"
                    stroke={SERIES_COLORS[key]}
                    strokeWidth={2}
                    fill={`url(#outlook-${key})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Readout" hint="What the current trajectory says">
          <div className="space-y-5">
            <Insight
              label="BEV leadership"
              value={`${current.BEV.toFixed(1)}%`}
              detail="Battery-electric vehicles are the main source of mix expansion."
              color="bg-emerald-400"
            />
            <Insight
              label="PHEV contribution"
              value={`${current.PHEV.toFixed(1)}%`}
              detail="Plug-in hybrids remain a smaller bridge technology."
              color="bg-blue-400"
            />
            <Insight
              label="ICE remaining"
              value={`${current.ICE.toFixed(1)}%`}
              detail="Conventional powertrains still represent the majority of registrations."
              color="bg-slate-400"
            />
          </div>
          <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
            The outlook is modeled from the population trend series used throughout EV-Pulse.
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function Insight({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="flex gap-3">
      <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${color}`} />
      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-lg font-semibold tnum">{value}</p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
