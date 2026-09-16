import type { ReactNode } from "react";

export function TooltipShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-[168px] rounded-md border border-border bg-popover/95 px-3 py-2 shadow-terminal backdrop-blur">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function TooltipRow({
  color,
  label,
  value,
}: {
  color?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {color && <span className="size-2 rounded-sm" style={{ background: color }} />}
        {label}
      </span>
      <span className="font-medium tnum">{value}</span>
    </div>
  );
}
