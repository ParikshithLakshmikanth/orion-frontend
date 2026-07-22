import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import { PageHeader, Panel } from "@/components/orion/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/orion-api";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — ORION" },
      { name: "description", content: "Review, correlate and file alerts and admin events for the ORION platform." },
      { property: "og:title", content: "Alerts — ORION" },
      { property: "og:description", content: "Alerts and events for ORION." },
    ],
  }),
  component: AlertsPage,
});

type Alert = { id: string; level: string; message: string };
type Event = { id: string; type: string; severity: string };
type Health = { status: string; active_alerts: number; recent_events: number };

function AlertsPage() {
  const qc = useQueryClient();
  const alerts = useQuery({ queryKey: ["admin", "alerts"], queryFn: () => api.get<{ alerts: Alert[] }>("/admin/alerts") });
  const events = useQuery({ queryKey: ["admin", "events"], queryFn: () => api.get<{ events: Event[] }>("/admin/events") });
  const health = useQuery({ queryKey: ["admin", "health"], queryFn: () => api.get<Health>("/admin/health") });

  const [level, setLevel] = useState("medium");
  const [message, setMessage] = useState("");

  const create = useMutation({
    mutationFn: () => api.post("/admin/alerts", { level, message }),
    onSuccess: () => { setMessage(""); qc.invalidateQueries({ queryKey: ["admin"] }); },
  });

  return (
    <div>
      <PageHeader icon={AlertTriangle} title="Alerts & Events" description="Real-time signals from the ORION admin backbone." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Panel title="Status"><div className="text-2xl font-semibold capitalize">{health.data?.status ?? "—"}</div></Panel>
        <Panel title="Active alerts"><div className="text-2xl font-semibold">{health.data?.active_alerts ?? 0}</div></Panel>
        <Panel title="Recent events"><div className="text-2xl font-semibold">{health.data?.recent_events ?? 0}</div></Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="File an alert">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "critical"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Message</Label><Input value={message} onChange={(e) => setMessage(e.target.value)} /></div>
            <Button onClick={() => create.mutate()} disabled={!message || create.isPending} className="gap-2">
              {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} File alert
            </Button>
          </div>
        </Panel>

        <Panel title="Alerts" className="lg:col-span-2">
          {alerts.data?.alerts?.length ? (
            <ul className="divide-y divide-border">
              {alerts.data.alerts.map(a => (
                <li key={a.id} className="py-3 flex items-start gap-3">
                  <AlertTriangle className={`size-4 mt-0.5 ${a.level === "high" || a.level === "critical" ? "text-destructive" : "text-warning"}`} />
                  <div className="flex-1">
                    <div className="text-sm">{a.message}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{a.id} · {a.level}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No alerts.</p>}
        </Panel>

        <Panel title="Events" className="lg:col-span-3">
          {events.data?.events?.length ? (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr>{["ID", "Type", "Severity"].map(h => <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.data.events.map(e => (
                  <tr key={e.id}>
                    <td className="py-2 pr-4 font-mono text-xs">{e.id}</td>
                    <td className="py-2 pr-4">{e.type}</td>
                    <td className="py-2 pr-4 capitalize text-muted-foreground">{e.severity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-muted-foreground">No events.</p>}
        </Panel>
      </div>
    </div>
  );
}
