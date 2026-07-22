import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, Boxes, Compass, Database, Gauge,
  Ghost, Layers, LogOut, Network, Settings, Sparkles, Telescope,
} from "lucide-react";
import type { ReactNode } from "react";
import { clearToken } from "@/lib/orion-api";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
};

const nav: NavItem[] = [
  { to: "/", label: "Overview", icon: Gauge },
  { to: "/phantom", label: "Phantom", icon: Ghost, hint: "Entity analysis" },
  { to: "/mosaic", label: "Mosaic", icon: Network, hint: "Graph builder" },
  { to: "/mirage", label: "Mirage", icon: Sparkles, hint: "Prediction" },
  { to: "/eclipse", label: "Eclipse", icon: Telescope, hint: "Explainability" },
  { to: "/constellation", label: "Constellation", icon: Compass, hint: "Trust scoring" },
  { to: "/intelligence", label: "Intelligence", icon: Layers },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/dataset", label: "Dataset", icon: Database },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const logout = () => {
    clearToken();
    router.navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex text-foreground">
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar/80 backdrop-blur-sm flex flex-col">
        <div className="px-5 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-primary/15 grid place-items-center glow">
              <Activity className="size-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-widest text-primary">ORION</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Intelligence Platform
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {nav.map(({ to, label, icon: Icon, hint }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                ].join(" ")}
              >
                <Icon className={`size-4 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className="flex-1">{label}</span>
                {hint && <span className="text-[10px] text-muted-foreground/70 group-hover:text-muted-foreground">{hint}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  title, description, icon: Icon, actions,
}: {
  title: string; description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="size-11 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
            <Icon className="size-5 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title, children, className = "", actions,
}: {
  title?: string; children: ReactNode; className?: string; actions?: ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card/60 backdrop-blur-sm ${className}`}>
      {title && (
        <header className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">{title}</h2>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function JsonView({ data }: { data: unknown }) {
  if (data == null) return <p className="text-sm text-muted-foreground">No output yet.</p>;
  return (
    <pre className="text-xs leading-relaxed text-foreground/90 bg-background/60 border border-border rounded-md p-4 overflow-auto max-h-[420px]">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
