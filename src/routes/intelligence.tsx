import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Layers, Loader2, Plus } from "lucide-react";
import { PageHeader, Panel } from "@/components/orion/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/orion-api";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: "Intelligence — ORION" },
      { name: "description", content: "Track incidents, review risk posture and recommended next actions." },
      { property: "og:title", content: "Intelligence — ORION" },
      { property: "og:description", content: "Incident tracking with ORION Intelligence." },
    ],
  }),
  component: IntelligencePage,
});

type Summary = {
  total_incidents: number; critical_incidents: number;
  risk_level: string; recommendations: string[];
};
type Incident = { id: string; title: string; severity: string; source: string; summary: string };

function IntelligencePage() {
  const qc = useQueryClient();
  const summary = useQuery({ queryKey: ["intel", "summary"], queryFn: () => api.get<Summary>("/intelligence/summary") });
  const list = useQuery({ queryKey: ["intel", "list"], queryFn: () => api.get<{ incidents: Incident[] }>("/intelligence/incidents") });

  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");

  const create = useMutation({
    mutationFn: () => api.post<Incident>("/intelligence/incidents", { title, severity, source, summary: note }),
    onSuccess: () => {
      setTitle(""); setSource(""); setNote("");
      qc.invalidateQueries({ queryKey: ["intel"] });
    },
  });

  return (
    <div>
      <PageHeader icon={Layers} title="Intelligence" description="Log incidents and monitor aggregate risk posture." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Panel title="Total incidents"><div className="text-3xl font-semibold">{summary.data?.total_incidents ?? 0}</div></Panel>
        <Panel title="Critical"><div className="text-3xl font-semibold text-destructive">{summary.data?.critical_incidents ?? 0}</div></Panel>
        <Panel title="Risk level"><div className="text-3xl font-semibold capitalize">{summary.data?.risk_level ?? "—"}</div></Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Log incident">
          <div className="space-y-3">
            <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["low", "medium", "high", "critical"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Source</Label><Input value={source} onChange={(e) => setSource(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Summary</Label><Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
            <Button onClick={() => create.mutate()} disabled={!title || create.isPending} className="gap-2">
              {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Create
            </Button>
          </div>
        </Panel>

        <Panel title="Recommendations">
          <ul className="space-y-2 text-sm">
            {(summary.data?.recommendations ?? []).map((r, i) => (
              <li key={i} className="flex gap-2"><span className="text-primary">›</span>{r}</li>
            ))}
          </ul>
        </Panel>

        <Panel title="Incidents" className="lg:col-span-2">
          {list.data?.incidents?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    {["ID", "Title", "Severity", "Source", "Summary"].map(h => (
                      <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {list.data.incidents.map(i => (
                    <tr key={i.id}>
                      <td className="py-2 pr-4 font-mono text-xs">{i.id}</td>
                      <td className="py-2 pr-4">{i.title}</td>
                      <td className="py-2 pr-4 capitalize">
                        <span className={
                          "px-2 py-0.5 text-[10px] rounded-full border " +
                          (i.severity === "critical" ? "border-destructive/60 text-destructive"
                            : i.severity === "high" ? "border-warning/60 text-warning"
                            : "border-border text-muted-foreground")
                        }>{i.severity}</span>
                      </td>
                      <td className="py-2 pr-4">{i.source}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{i.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-muted-foreground">No incidents logged yet.</p>}
        </Panel>
      </div>
    </div>
  );
}
