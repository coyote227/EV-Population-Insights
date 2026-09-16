import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  delta,
  deltaLabel,
  badge,
  spark,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  delta?: number;
  deltaLabel?: string;
  badge?: ReactNode;
  spark?: number[];
}) {
  const positive = (delta ?? 0) >= 0;
  const Trend = positive ? ArrowUpRight : ArrowDownRight;

  const path = spark?.length
    ? spark
        .map((v, i) => {
          const min = Math.min(...spark);
          const max = Math.max(...spark);
          const x = (i / (spark.length - 1)) * 100;
          const y = 28 - ((v - min) / (max - min || 1)) * 24;
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ")
    : null;

  return (
    <div className="group relative kpi-card-wrapper">
      <Card className="gap-0 border-border bg-card p-5 shadow-terminal transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/60 group-hover:shadow-[0_0_0_2px_oklch(0.696_0.17_162.48_/_20%),_0_0_32px_-8px_oklch(0.696_0.17_162.48_/_60%)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <Icon className="size-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
      </div>

      <div className="mt-3 flex items-end gap-1.5">
        <span className="text-3xl font-semibold tnum leading-none">{value}</span>
        {unit && <span className="pb-0.5 text-xs text-muted-foreground">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold tnum",
                positive
                  ? "bg-signal-positive/12 text-signal-positive"
                  : "bg-signal-critical/12 text-signal-critical",
              )}
            >
              <Trend className="size-3" />
              {positive ? "+" : ""}
              {delta.toFixed(1)}%
            </span>
          )}
          {badge}
          {deltaLabel && <span className="text-[11px] text-muted-foreground">{deltaLabel}</span>}
        </div>

        {path && (
          <svg viewBox="0 0 100 30" className="h-6 w-16 overflow-visible" preserveAspectRatio="none">
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              className={positive ? "text-signal-positive" : "text-signal-critical"}
            />
          </svg>
        )}
      </div>
    </Card>
    </div>
  );
}
