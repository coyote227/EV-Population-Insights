import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({
  title,
  hint,
  actions,
  className,
  children,
}: {
  title: string;
  hint?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "panel flex min-w-0 flex-col transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_0_2px_oklch(0.696_0.17_162.48_/_20%),_0_0_32px_-8px_oklch(0.696_0.17_162.48_/_60%)]",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight">{title}</h2>
          {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        {actions}
      </header>
      <div className="min-w-0 flex-1 p-4">{children}</div>
    </section>
  );
}
