import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Compass } from "lucide-react";
import { PageHeader } from "@/components/orion/AppShell";
import { RunPanel } from "@/components/orion/RunPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/orion-api";

export const Route = createFileRoute("/constellation")({
  head: () => ({
    meta: [
      { title: "Constellation — ORION" },
      { name: "description", content: "Score identity trust and threat level from behavioural signals." },
      { property: "og:title", content: "Constellation — ORION" },
      { property: "og:description", content: "Identity trust scoring with ORION Constellation." },
    ],
  }),
  component: ConstellationPage,
});

function ConstellationPage() {
  const [id, setId] = useState("USR-2201");
  const [signals, setSignals] = useState("login_success\ndevice_new\ngeo_anomaly");

  return (
    <div>
      <PageHeader icon={Compass} title="Constellation" description="Compute trust, threat level and risk category for an identity." />
      <RunPanel
        title="Score identity"
        actionLabel="Score"
        run={() => api.post("/constellation/score", {
          identity_id: id,
          signals: signals.split(/[\n,]+/).map(s => s.trim()).filter(Boolean),
        })}
      >
        <div className="space-y-2">
          <Label>Identity ID</Label>
          <Input value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Signals</Label>
          <Textarea rows={5} value={signals} onChange={(e) => setSignals(e.target.value)} />
        </div>
      </RunPanel>
    </div>
  );
}
