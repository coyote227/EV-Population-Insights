import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronsLeft,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useEvFilters } from "@/lib/ev-store";
import { FilterBar } from "./FilterBar";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "Geospatial Map", icon: MapIcon },
  { to: "/trends", label: "Market Trends", icon: TrendingUp },
  { to: "/deficit", label: "Infrastructure Deficit", icon: AlertTriangle },
] as const;

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: (() => void) | undefined;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-secondary text-foreground shadow-terminal"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <span
              className={cn(
                "absolute left-0 h-6 w-0.5 rounded-r bg-primary transition-opacity duration-200",
                active ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle?: (() => void) | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  const { presentation, setPresentation } = useEvFilters();

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div
        className={cn(
          "flex h-16 items-center gap-2.5 border-b border-border px-5",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
          <Zap className="size-4 text-primary" />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">EV-Pulse</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Analytics
            </p>
          </div>
        )}
      </div>

      <div className="py-4">
        <NavList collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      <div className="mt-auto space-y-3 border-t border-border p-3">
        {!collapsed && (
          <div className="rounded-xl border border-border/80 bg-gradient-to-br from-slate-700/70 via-slate-800 to-slate-900 p-3 shadow-[0_8px_24px_-18px_rgba(16,185,129,0.8)]">
            <div className="flex items-center gap-3">
              <Avatar className="size-9 border border-primary/30 bg-primary/10 ring-1 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-[10px] font-bold text-slate-950">
                  SP
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[11px] font-semibold tracking-[0.12em] text-emerald-300 uppercase">
                  Team Panel
                </p>
                <p className="truncate text-sm font-semibold text-emerald-300">Sameer Sharma</p>
                <p className="truncate text-sm font-semibold text-cyan-300">Kanishka Patil</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-700/80 pt-2 text-[10px] text-slate-300">
              <span className="font-medium tracking-[0.12em] uppercase">TY BTech CSE</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                Panel E
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center">
            <Avatar className="size-9 border border-primary/30 bg-primary/10 ring-1 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-[10px] font-bold text-slate-950">
                SP
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {!collapsed && (
          <label className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
            Presentation Mode
            <Switch checked={presentation} onCheckedChange={setPresentation} />
          </label>
        )}

        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn("w-full text-muted-foreground", collapsed && "px-0")}
          >
            <ChevronsLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span className="ml-1">Collapse</span>}
          </Button>
        )}
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { presentation } = useEvFilters();

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="hidden shrink-0 transition-[width] duration-300 ease-out lg:block"
        style={{ width: collapsed ? 80 : 250 }}
      >
        <div
          className="fixed inset-y-0 left-0 transition-[width] duration-300 ease-out"
          style={{ width: collapsed ? 80 : 250 }}
        >
          <SidebarBody collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] border-border bg-card p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1
                className={cn(
                  "truncate font-semibold tracking-tight transition-all",
                  presentation ? "text-2xl md:text-3xl" : "text-lg md:text-xl",
                )}
              >
                {title}
              </h1>
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            </div>

            <FilterBar />
          </div>
        </header>

        <main
          className={cn(
            "grid-backdrop min-w-0 flex-1 px-4 py-5 md:px-6 md:py-6",
            presentation && "md:px-10 md:py-9",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
