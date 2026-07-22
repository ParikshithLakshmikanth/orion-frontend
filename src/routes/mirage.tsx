import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/orion/AppShell";
import { RunPanel } from "@/components/orion/RunPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/orion-api";

export const Route = createFileRoute("/mirage")({
  head: () => ({
    meta: [
      { title: "Mirage — ORION" },
      { name: "description", content: "Predict adversary responses and infrastructure migration paths for an active case." },
      { property: "og:title", content: "Mirage — ORION" },
      { property: "og:description", content: "Adversary response prediction with ORION Mirage." },
    ],
  }),
  component: MiragePage,
});

function MiragePage() {
  const [caseId, setCaseId] = useState("CASE-1042");
  const [factors, setFactors] = useState<{ id: string; k: string; v: string }[]>([
    { id: crypto.randomUUID(), k: "region", v: "APAC" },
  ]);

  return (
    <div>
      <PageHeader icon={Sparkles} title="Mirage" description="Predict the adversary's next move given case factors." />
      <RunPanel
        title="Predict"
        actionLabel="Predict"
        run={() => {
          const dict: Record<string, string> = {};
          for (const f of factors) if (f.k.trim()) dict[f.k.trim()] = f.v;
          return api.post("/mirage/predict", { case_id: caseId, factors: dict });
        }}
      >
        <div className="space-y-2">
          <Label>Case ID</Label>
          <Input value={caseId} onChange={(e) => setCaseId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Factors</Label>
          {factors.map((f, i) => (
            <div key={f.id} className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <Input placeholder="key" value={f.k} onChange={(e) => setFactors(p => p.map((x, idx) => idx === i ? { ...x, k: e.target.value } : x))} />
              <Input placeholder="value" value={f.v} onChange={(e) => setFactors(p => p.map((x, idx) => idx === i ? { ...x, v: e.target.value } : x))} />
              <Button variant="ghost" size="icon" onClick={() => setFactors(p => p.filter((_, idx) => idx !== i))}>
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="secondary" size="sm" className="gap-1"
            onClick={() => setFactors(p => [...p, { id: crypto.randomUUID(), k: "", v: "" }])}>
            <Plus className="size-4" /> Add factor
          </Button>
        </div>
      </RunPanel>
    </div>
  );
}
