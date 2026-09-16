import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { PowertrainFilter, Year } from "./ev-data";

interface EvFilters {
  year: Year;
  setYear: (y: Year) => void;
  powertrain: PowertrainFilter;
  setPowertrain: (p: PowertrainFilter) => void;
  presentation: boolean;
  setPresentation: (v: boolean) => void;
}

const Ctx = createContext<EvFilters | null>(null);

export function EvProvider({ children }: { children: ReactNode }) {
  const [year, setYear] = useState<Year>(2026);
  const [powertrain, setPowertrain] = useState<PowertrainFilter>("All");
  const [presentation, setPresentation] = useState(false);

  const value = useMemo(
    () => ({ year, setYear, powertrain, setPowertrain, presentation, setPresentation }),
    [year, powertrain, presentation],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEvFilters() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEvFilters must be used inside EvProvider");
  return ctx;
}
