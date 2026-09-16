import { Activity } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YEARS, type PowertrainFilter, type Year } from "@/lib/ev-data";
import { useEvFilters } from "@/lib/ev-store";

export function FilterBar() {
  const { year, setYear, powertrain, setPowertrain } = useEvFilters();

  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground sm:flex">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
        LIVE
      </span>

      <Select value={String(year)} onValueChange={(v) => setYear(Number(v) as Year)}>
        <SelectTrigger className="h-9 w-[104px] border-border bg-card text-xs tnum">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)} className="text-xs tnum">
              FY {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={powertrain} onValueChange={(v) => setPowertrain(v as PowertrainFilter)}>
        <SelectTrigger className="h-9 w-[112px] border-border bg-card text-xs">
          <Activity className="size-3.5 text-primary" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(["All", "BEV", "PHEV"] as const).map((p) => (
            <SelectItem key={p} value={p} className="text-xs">
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
