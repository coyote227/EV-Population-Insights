import { createFileRoute } from "@tanstack/react-router";
import { Banknote, Plug, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type * as LeafletReact from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { AppShell } from "@/components/ev/AppShell";
import { Panel } from "@/components/ev/Panel";
import { COST_PER_DCFC, COUNTIES, ratioColor } from "@/lib/ev-data";
import { useEvFilters } from "@/lib/ev-store";
import { formatNumber } from "@/lib/utils";

const WA_CENTER: [number, number] = [47.75, -120.74];

function RealMapPanel({ counties }: { counties: Array<{ name: string; lat: number; lng: number; evCount: number; publicPorts: number; ratio: number }> }) {
  const [leaflet, setLeaflet] = useState<typeof LeafletReact | null>(null);

  useEffect(() => {
    let active = true;

    void import("react-leaflet").then((module) => {
      if (active) {
        setLeaflet(module);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (!leaflet) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center rounded-md border border-border bg-slate-950/50 text-sm text-muted-foreground sm:h-[460px]">
        Loading Washington EV map...
      </div>
    );
  }

  const { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } = leaflet;

  return (
    <div className="h-[320px] w-full overflow-hidden rounded-md border border-border bg-slate-950 sm:h-[460px]">
      <MapContainer
        center={WA_CENTER}
        zoom={7}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {counties.map((county) => {
          const color = ratioColor(county.ratio);
          const radius = 7 + Math.sqrt(county.evCount / Math.max(...counties.map((c) => c.evCount))) * 18;

          return (
            <CircleMarker
              key={county.name}
              center={[county.lat, county.lng]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.7,
                weight: 1.6,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <div className="text-xs">
                  <div className="font-semibold">{county.name}</div>
                  <div>EVs: {formatNumber(county.evCount)}</div>
                  <div>Ports: {formatNumber(county.publicPorts)}</div>
                  <div>Ratio: {county.ratio}:1</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold">{county.name}</div>
                  <div>Registered EVs: {formatNumber(county.evCount)}</div>
                  <div>Public ports: {formatNumber(county.publicPorts)}</div>
                  <div>EV-to-charger ratio: {county.ratio}:1</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function MapPageComponent() {
  const { year, powertrain } = useEvFilters();
  const mix = powertrain === "All" ? 1 : powertrain === "BEV" ? 0.83 : 0.17;
  const growthFactor = 1 + (year - 2022) * 0.28;

  const counties = useMemo(
    () =>
      COUNTIES.map((c) => {
        const evCount = Math.round(c.evCount * growthFactor * mix);
        const ports = Math.round(c.publicPorts * (1 + (year - 2022) * 0.19));
        return { ...c, evCount, publicPorts: ports, ratio: +(evCount / ports).toFixed(1) };
      }),
    [growthFactor, mix, year],
  );

  const maxEv = Math.max(...counties.map((c) => c.evCount));
  const [hover, setHover] = useState<string | null>(null);

  const [growth, setGrowth] = useState(45);
  const [target, setTarget] = useState(12);

  const sim = useMemo(() => {
    const futureEvs = counties.reduce((s, c) => s + c.evCount, 0) * (1 + growth / 100);
    const existing = counties.reduce((s, c) => s + c.publicPorts, 0);
    const required = Math.ceil(futureEvs / target);
    const gap = Math.max(0, required - existing);
    return { futureEvs, existing, required, gap, capex: gap * COST_PER_DCFC };
  }, [counties, growth, target]);

  const hovered = counties.find((c) => c.name === hover);

  return (
    <AppShell
      title="Geospatial Map & Deficit Simulator"
      subtitle={`County-level EV density vs. public charging capacity · FY ${year}`}
    >
      <div className="grid grid-cols-1 gap-4">
        <Panel
          title="Washington State — EV Density & Charging Adequacy"
          hint="Bubble size = registered EVs · color = EV-to-charger ratio"
          actions={
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-signal-positive" /> &lt; 15:1
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-signal-warning" /> 15–25:1
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-signal-critical" /> &gt; 25:1
              </span>
            </div>
          }
        >
          <div className="relative overflow-hidden rounded-md border border-border bg-background/60">
            <RealMapPanel counties={counties} />

            {hovered && (
              <div className="pointer-events-none absolute right-3 top-3 w-[230px] rounded-md border border-border bg-popover/95 p-3 shadow-terminal backdrop-blur">
                <p className="text-sm font-semibold">{hovered.name} County</p>
                <div className="mt-2 space-y-1 text-xs">
                  {[
                    ["Registered EVs", formatNumber(hovered.evCount)],
                    ["Public ports", formatNumber(hovered.publicPorts)],
                    ["EV : charger", `${hovered.ratio}:1`],
                    [
                      "Port deficit @ 15:1",
                      Math.max(
                        0,
                        Math.ceil(hovered.evCount / 15) - hovered.publicPorts,
                      ).toString(),
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium tnum">{v}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-2 h-1 w-full rounded"
                  style={{ background: ratioColor(hovered.ratio) }}
                />
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title="Infrastructure Deficit Calculator"
          hint={`DCFC unit cost assumption: $${formatNumber(COST_PER_DCFC)} per port`}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-7 pt-2">
              <div>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="size-4 text-primary" /> Expected EV Growth
                  </span>
                  <span className="font-semibold tnum">{growth}%</span>
                </div>
                <Slider
                  value={[growth]}
                  onValueChange={([v]) => setGrowth(v ?? 0)}
                  min={0}
                  max={200}
                  step={5}
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Plug className="size-4 text-primary" /> Target EV-to-Charger Ratio
                  </span>
                  <span className="font-semibold tnum">{target}:1</span>
                </div>
                <Slider
                  value={[target]}
                  onValueChange={([v]) => setTarget(v ?? 1)}
                  min={5}
                  max={40}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Projected EVs", formatNumber(Math.round(sim.futureEvs))],
                  ["Existing ports", formatNumber(sim.existing)],
                  ["Ports required", formatNumber(sim.required)],
                  ["Port deficit", formatNumber(sim.gap)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-md border border-border bg-secondary/40 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {k}
                    </p>
                    <p className="mt-1 text-base font-semibold tnum">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-lg border border-primary/25 bg-primary/8 p-6 shadow-glow">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <Banknote className="size-4 text-primary" /> Required Capital Expenditure
              </div>
              <p className="mt-3 text-4xl font-semibold tnum text-primary">
                ${(sim.capex / 1e6).toFixed(1)}M
              </p>
              <p className="mt-1 text-xs tnum text-muted-foreground">
                ${formatNumber(sim.capex)} across {formatNumber(sim.gap)} new DCFC ports
              </p>
              <Badge
                className={
                  sim.gap > 0
                    ? "mt-4 w-fit border-signal-warning/40 bg-signal-warning/12 text-signal-warning hover:bg-signal-warning/20"
                    : "mt-4 w-fit border-signal-positive/40 bg-signal-positive/12 text-signal-positive hover:bg-signal-positive/20"
                }
              >
                {sim.gap > 0 ? "Build-out required" : "Target already met"}
              </Badge>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Geospatial Map — EV-Pulse Analytics" },
      {
        name: "description",
        content:
          "County-level EV density and charging-port coverage across Washington State with an interactive infrastructure deficit simulator.",
      },
      { property: "og:title", content: "Geospatial Map — EV-Pulse Analytics" },
      {
        property: "og:description",
        content: "County EV density, charger coverage and capital expenditure simulation.",
      },
    ],
  }),
  component: MapPageComponent,
});


