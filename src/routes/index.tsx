import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Activity, AlertTriangle, GitBranch, Gauge, ShieldCheck, Sigma } from "lucide-react";
import { PageHeader, Panel } from "@/components/orion/AppShell";
import { api } from "@/lib/orion-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — ORION" },
      { name: "description", content: "Live overview of ORION investigations, threat index, service health and graph metrics." },
      { property: "og:title", content: "Overview — ORION" },
      { property: "og:description", content: "Operator overview for ORION intelligence." },
    ],
  }),
  component: Overview,
});

type Stats = { active_investigations: number; threat_index: number };
type Graph = { nodes: number; edges: number };
type Reports = { reports_generated: number; latest_report: string };
type Analytics = {
  status: string;
  service_health: Record<string, string>;
  summary_score: number;
  last_updated: string;
};
type Alerts = { alerts: { id: string; level: string; message: string }[] };

function Stat({ icon: Icon, label, value, sub }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </motion.div>
  );
}

function Overview() {
  const stats = useQuery({ queryKey: ["dashboard"], queryFn: () => api.get<Stats>("/dashboard/stats") });
  const graph = useQuery({ queryKey: ["graph"], queryFn: () => api.get<Graph>("/graph/overview") });
  const reports = useQuery({ queryKey: ["reports"], queryFn: () => api.get<Reports>("/reports/summary") });
  const analytics = useQuery({ queryKey: ["analytics"], queryFn: () => api.get<Analytics>("/analytics/overview") });
  const alerts = useQuery({ queryKey: ["alerts"], queryFn: () => api.get<Alerts>("/admin/alerts") });

  return (
    <div>
      <PageHeader
        icon={Gauge}
        title="Operations Overview"
        description="Live posture across ORION services, active investigations and admin signals."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat icon={Activity} label="Active investigations" value={stats.data?.active_investigations ?? "—"} sub="Open cases across teams" />
        <Stat icon={ShieldCheck} label="Threat index" value={stats.data?.threat_index ?? "—"} sub="Composite risk score" />
        <Stat icon={GitBranch} label="Graph size" value={graph.data ? `${graph.data.nodes} / ${graph.data.edges}` : "—"} sub="nodes / edges" />
        <Stat icon={Sigma} label="Summary score" value={analytics.data?.summary_score?.toFixed(1) ?? "—"} sub={`Status: ${analytics.data?.status ?? "…"}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <Panel title="Service health" className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {analytics.data
              ? Object.entries(analytics.data.service_health).map(([svc, state]) => (
                  <li key={svc} className="flex items-center justify-between py-3">
                    <span className="capitalize font-medium">{svc}</span>
                    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`size-2 rounded-full ${state === "stable" ? "bg-[oklch(0.72_0.16_155)]" : "bg-warning"}`} />
                      {state}
                    </span>
                  </li>
                ))
              : <li className="py-3 text-sm text-muted-foreground">Loading…</li>}
          </ul>
          <div className="mt-4 text-xs text-muted-foreground">
            Last updated {analytics.data?.last_updated ?? "—"}
          </div>
        </Panel>

        <Panel title="Live alerts">
          {alerts.data?.alerts?.length ? (
            <ul className="space-y-3">
              {alerts.data.alerts.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <AlertTriangle className={`size-4 mt-0.5 ${a.level === "high" ? "text-destructive" : "text-warning"}`} />
                  <div>
                    <div className="text-sm">{a.message}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {a.id} · {a.level}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No alerts.</p>
          )}
        </Panel>

        <Panel title="Reports" className="lg:col-span-3">
          <div className="flex flex-wrap items-baseline gap-6">
            <div>
              <div className="text-3xl font-semibold">{reports.data?.reports_generated ?? "—"}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Generated</div>
            </div>
            <div>
              <div className="text-sm">{reports.data?.latest_report ?? "—"}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Latest report</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
