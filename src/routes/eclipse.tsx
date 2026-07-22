import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Telescope } from "lucide-react";
import { PageHeader } from "@/components/orion/AppShell";
import { RunPanel } from "@/components/orion/RunPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/orion-api";

export const Route = createFileRoute("/eclipse")({
  head: () => ({
    meta: [
      { title: "Eclipse — ORION" },
      { name: "description", content: "Explain a prediction: confidence, ranked evidence and investigator recommendations." },
      { property: "og:title", content: "Eclipse — ORION" },
      { property: "og:description", content: "Explainability with ORION Eclipse." },
    ],
  }),
  component: EclipsePage,
});

function EclipsePage() {
  const [pid, setPid] = useState("PRED-8891");
  const [evidence, setEvidence] = useState("login_burst\ngeo_mismatch");

  return (
    <div>
      <PageHeader icon={Telescope} title="Eclipse" description="Understand why the model reached a verdict, and what evidence is missing." />
      <RunPanel
        title="Explain a prediction"
        actionLabel="Explain"
        run={() => api.post("/eclipse/explain", {
          prediction_id: pid,
          evidence: evidence.split(/[\n,]+/).map(s => s.trim()).filter(Boolean),
        })}
      >
        <div className="space-y-2">
          <Label>Prediction ID</Label>
          <Input value={pid} onChange={(e) => setPid(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Known evidence</Label>
          <Textarea rows={4} value={evidence} onChange={(e) => setEvidence(e.target.value)} />
        </div>
      </RunPanel>
    </div>
  );
}
