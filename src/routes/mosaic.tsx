import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Network, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/orion/AppShell";
import { RunPanel } from "@/components/orion/RunPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/orion-api";

export const Route = createFileRoute("/mosaic")({
  head: () => ({
    meta: [
      { title: "Mosaic — ORION" },
      { name: "description", content: "Assemble entities into a graph and surface hidden relationships across investigations." },
      { property: "og:title", content: "Mosaic — ORION" },
      { property: "og:description", content: "Graph assembly with ORION Mosaic." },
    ],
  }),
  component: MosaicPage,
});

type Row = { id: string; type: string; value: string };

function MosaicPage() {
  const [rows, setRows] = useState<Row[]>([
    { id: crypto.randomUUID(), type: "person", value: "alice" },
    { id: crypto.randomUUID(), type: "wallet", value: "0xabc" },
  ]);

  return (
    <div>
      <PageHeader icon={Network} title="Mosaic" description="Build a knowledge graph from your entity list and reveal cross-case links." />
      <RunPanel
        title="Graph builder"
        actionLabel="Build graph"
        run={() => api.post("/mosaic/build", {
          entities: rows.filter(r => r.value.trim()).map(({ type, value }) => ({ type, value })),
        })}
      >
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.id} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
              <div className="space-y-1">
                {i === 0 && <Label className="text-xs">Type</Label>}
                <Input value={r.type} onChange={(e) => update(i, { type: e.target.value })} />
              </div>
              <div className="space-y-1">
                {i === 0 && <Label className="text-xs">Value</Label>}
                <Input value={r.value} onChange={(e) => update(i, { value: e.target.value })} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(i)}>
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={add} className="gap-1">
            <Plus className="size-4" /> Add entity
          </Button>
        </div>
      </RunPanel>
    </div>
  );

  function update(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function add() { setRows((p) => [...p, { id: crypto.randomUUID(), type: "", value: "" }]); }
  function remove(i: number) { setRows((p) => p.filter((_, idx) => idx !== i)); }
}
