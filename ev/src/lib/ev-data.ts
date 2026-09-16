export type Powertrain = "BEV" | "PHEV";
export type PowertrainFilter = "All" | Powertrain;

export interface Vehicle {
  make: string;
  model: string;
  msrp: number;
  range: number;
  type: Powertrain;
  year: number;
}

export interface County {
  name: string;
  lat: number;
  lng: number;
  evCount: number;
  publicPorts: number;
  ratio: number;
}

export const YEARS = [2022, 2023, 2024, 2025, 2026] as const;
export type Year = (typeof YEARS)[number];

export const OEM_COLORS: Record<string, string> = {
  Tesla: "#10b981",
  Ford: "#3b82f6",
  Hyundai: "#f59e0b",
  GM: "#a78bfa",
  Rivian: "#f43f5e",
  Other: "#64748b",
};

export const SERIES_COLORS = {
  BEV: "#10b981",
  PHEV: "#3b82f6",
  ICE: "#64748b",
  warning: "#f59e0b",
  critical: "#ef4444",
  grid: "#334155",
  axis: "#94a3b8",
};

const RAW: Array<[string, string, number, number, Powertrain]> = [
  ["Tesla", "Model 3 RWD", 38990, 272, "BEV"],
  ["Tesla", "Model 3 LR", 47490, 341, "BEV"],
  ["Tesla", "Model Y LR", 48990, 320, "BEV"],
  ["Tesla", "Model S", 74990, 405, "BEV"],
  ["Tesla", "Model X", 79990, 335, "BEV"],
  ["Tesla", "Cybertruck AWD", 79990, 325, "BEV"],
  ["Ford", "Mustang Mach-E SR", 39995, 250, "BEV"],
  ["Ford", "Mustang Mach-E ER", 47995, 320, "BEV"],
  ["Ford", "F-150 Lightning Pro", 54995, 240, "BEV"],
  ["Ford", "F-150 Lightning ER", 77495, 320, "BEV"],
  ["Ford", "Escape PHEV", 40500, 37, "PHEV"],
  ["Ford", "E-Transit", 51000, 159, "BEV"],
  ["Hyundai", "IONIQ 5 SE", 41800, 303, "BEV"],
  ["Hyundai", "IONIQ 5 Limited", 54200, 269, "BEV"],
  ["Hyundai", "IONIQ 6 SE", 42450, 361, "BEV"],
  ["Hyundai", "Kona Electric", 34050, 261, "BEV"],
  ["Hyundai", "Tucson PHEV", 39800, 33, "PHEV"],
  ["Hyundai", "Santa Fe PHEV", 47300, 31, "PHEV"],
  ["GM", "Chevy Bolt EUV", 28795, 247, "BEV"],
  ["GM", "Chevy Equinox EV", 34995, 319, "BEV"],
  ["GM", "Chevy Blazer EV", 50195, 279, "BEV"],
  ["GM", "Chevy Silverado EV", 74800, 440, "BEV"],
  ["GM", "Cadillac LYRIQ", 58590, 314, "BEV"],
  ["GM", "GMC Hummer EV", 96550, 314, "BEV"],
  ["Rivian", "R1T Dual", 71700, 352, "BEV"],
  ["Rivian", "R1S Dual", 76700, 321, "BEV"],
  ["Rivian", "R1T Max Pack", 89700, 410, "BEV"],
  ["Rivian", "R2", 45000, 300, "BEV"],
  ["Rivian", "EDV 700", 83000, 161, "BEV"],
  ["Other", "Nissan Ariya", 39590, 289, "BEV"],
  ["Other", "Kia EV6 Wind", 48700, 282, "BEV"],
  ["Other", "Kia EV9 Land", 63900, 280, "BEV"],
  ["Other", "VW ID.4 Pro", 45095, 291, "BEV"],
  ["Other", "Toyota RAV4 Prime", 44265, 42, "PHEV"],
  ["Other", "Toyota bZ4X", 43070, 252, "BEV"],
  ["Other", "BMW i4 eDrive40", 52200, 301, "BEV"],
  ["Other", "BMW iX xDrive50", 87250, 324, "BEV"],
  ["Other", "Volvo XC60 Recharge", 57700, 35, "PHEV"],
  ["Other", "Polestar 2 LR", 51300, 320, "BEV"],
  ["Other", "Jeep Wrangler 4xe", 51890, 21, "PHEV"],
  ["Other", "Chrysler Pacifica Hybrid", 51095, 32, "PHEV"],
  ["Other", "Lucid Air Pure", 69900, 420, "BEV"],
  ["Other", "Mercedes EQE 350", 76050, 305, "BEV"],
  ["Other", "Subaru Solterra", 44995, 227, "BEV"],
  ["Other", "Mazda CX-90 PHEV", 49945, 26, "PHEV"],
];

// PHEV electric-only ranges are normalized onto a comparable blended axis so
// they plot meaningfully against BEVs on the price-to-range chart.
export const VEHICLES: Vehicle[] = RAW.flatMap(([make, model, msrp, range, type], i) =>
  YEARS.map((year, y) => ({
    make,
    model,
    type,
    year,
    // gentle price deflation + range improvement year over year
    msrp: Math.round((msrp * (1 - y * 0.018) + ((i % 7) - 3) * 120) / 5) * 5,
    range: Math.round(
      (type === "PHEV" ? range * 3.2 + 95 : range) * (1 + y * 0.035) + ((i % 5) - 2) * 3,
    ),
  })),
);

export const COUNTIES: County[] = [
  { name: "King", lat: 47.49, lng: -121.83, evCount: 96500, publicPorts: 5400 },
  { name: "Snohomish", lat: 48.05, lng: -121.72, evCount: 31200, publicPorts: 1180 },
  { name: "Pierce", lat: 47.04, lng: -122.14, evCount: 24800, publicPorts: 860 },
  { name: "Clark", lat: 45.78, lng: -122.48, evCount: 16400, publicPorts: 590 },
  { name: "Thurston", lat: 46.93, lng: -122.83, evCount: 9800, publicPorts: 410 },
  { name: "Kitsap", lat: 47.64, lng: -122.65, evCount: 8900, publicPorts: 300 },
  { name: "Whatcom", lat: 48.83, lng: -121.98, evCount: 7100, publicPorts: 310 },
  { name: "Spokane", lat: 47.62, lng: -117.4, evCount: 8600, publicPorts: 245 },
  { name: "Benton", lat: 46.24, lng: -119.5, evCount: 4200, publicPorts: 120 },
  { name: "Yakima", lat: 46.46, lng: -120.74, evCount: 3100, publicPorts: 92 },
  { name: "Skagit", lat: 48.48, lng: -121.75, evCount: 3600, publicPorts: 135 },
  { name: "Island", lat: 48.16, lng: -122.57, evCount: 3050, publicPorts: 96 },
  { name: "Chelan", lat: 47.86, lng: -120.62, evCount: 2400, publicPorts: 130 },
  { name: "Grant", lat: 47.2, lng: -119.45, evCount: 1750, publicPorts: 48 },
  { name: "Cowlitz", lat: 46.19, lng: -122.68, evCount: 1900, publicPorts: 52 },
  { name: "Grays Harbor", lat: 47.14, lng: -123.83, evCount: 1250, publicPorts: 38 },
  { name: "Walla Walla", lat: 46.23, lng: -118.48, evCount: 1180, publicPorts: 55 },
  { name: "Okanogan", lat: 48.55, lng: -119.74, evCount: 780, publicPorts: 21 },
  { name: "Stevens", lat: 48.4, lng: -117.85, evCount: 640, publicPorts: 14 },
  { name: "Clallam", lat: 48.05, lng: -123.93, evCount: 2100, publicPorts: 88 },
].map((c) => ({ ...c, ratio: +(c.evCount / c.publicPorts).toFixed(1) }));

export function ratioColor(ratio: number) {
  if (ratio < 15) return SERIES_COLORS.BEV;
  if (ratio <= 25) return SERIES_COLORS.warning;
  return SERIES_COLORS.critical;
}

export interface ShareRow {
  year: number;
  BEV: number;
  PHEV: number;
  ICE: number;
}

const BASE_SHARE: ShareRow[] = [
  { year: 2018, BEV: 2.1, PHEV: 1.4, ICE: 96.5 },
  { year: 2019, BEV: 3.0, PHEV: 1.8, ICE: 95.2 },
  { year: 2020, BEV: 4.4, PHEV: 2.3, ICE: 93.3 },
  { year: 2021, BEV: 7.2, PHEV: 3.1, ICE: 89.7 },
  { year: 2022, BEV: 11.4, PHEV: 4.0, ICE: 84.6 },
  { year: 2023, BEV: 16.8, PHEV: 5.2, ICE: 78.0 },
  { year: 2024, BEV: 22.9, PHEV: 6.1, ICE: 71.0 },
  { year: 2025, BEV: 29.6, PHEV: 6.8, ICE: 63.6 },
  { year: 2026, BEV: 36.4, PHEV: 7.3, ICE: 56.3 },
];

export function shareSeries(year: number, powertrain: PowertrainFilter): ShareRow[] {
  return BASE_SHARE.filter((r) => r.year <= year).map((r) => ({
    year: r.year,
    BEV: powertrain === "PHEV" ? 0 : r.BEV,
    PHEV: powertrain === "BEV" ? 0 : r.PHEV,
    ICE: +(100 - (powertrain === "PHEV" ? 0 : r.BEV) - (powertrain === "BEV" ? 0 : r.PHEV)).toFixed(
      1,
    ),
  }));
}

const OEM_BASE: Record<string, number> = {
  Tesla: 208000,
  Ford: 71000,
  Hyundai: 58000,
  GM: 52000,
  Rivian: 24000,
};

export function oemShare(year: number, powertrain: PowertrainFilter) {
  const growth = 1 + (year - 2022) * 0.24;
  const mix = powertrain === "PHEV" ? 0.18 : powertrain === "BEV" ? 0.82 : 1;
  return Object.entries(OEM_BASE).map(([name, base]) => ({
    name,
    value: Math.round((base ?? 0) * growth * mix * (name === "Tesla" && powertrain === "PHEV" ? 0.05 : 1)),
    color: OEM_COLORS[name],
  }));
}

export interface Kpis {
  totalEvs: number;
  yoy: number;
  ratio: number;
  avgRange: number;
  medianMsrp: number;
}

export function computeKpis(year: number, powertrain: PowertrainFilter): Kpis {
  const pool = VEHICLES.filter(
    (v) => v.year === year && (powertrain === "All" || v.type === powertrain),
  );
  const msrps = pool.map((v) => v.msrp).sort((a, b) => a - b);
  const median = msrps.length
    ? msrps.length % 2
      ? (msrps[(msrps.length - 1) / 2] ?? 0)
      : ((msrps[msrps.length / 2 - 1] ?? 0) + (msrps[msrps.length / 2] ?? 0)) / 2
    : 0;
  const avgRange = pool.length ? pool.reduce((s, v) => s + v.range, 0) / pool.length : 0;

  const growth = 1 + (year - 2022) * 0.28;
  const mix = powertrain === "All" ? 1 : powertrain === "BEV" ? 0.83 : 0.17;
  const totalEvs = 2.35e6 * growth * mix;
  const ports = COUNTIES.reduce((s, c) => s + c.publicPorts, 0) * (1 + (year - 2022) * 0.19);
  const stateEvs = COUNTIES.reduce((s, c) => s + c.evCount, 0) * growth * mix;

  return {
    totalEvs,
    yoy: 28 - (year - 2022) * 1.6,
    ratio: +(stateEvs / ports).toFixed(1),
    avgRange: Math.round(avgRange),
    medianMsrp: Math.round(median),
  };
}

export const COST_PER_DCFC = 50000;
