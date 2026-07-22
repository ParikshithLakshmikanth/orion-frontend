import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Database, Loader2, Upload } from "lucide-react";
import { PageHeader, Panel, JsonView } from "@/components/orion/AppShell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/orion-api";

export const Route = createFileRoute("/dataset")({
  head: () => ({
    meta: [
      { title: "Dataset — ORION" },
      { name: "description", content: "Ingest .xlsx datasets into ORION and receive summary statistics, trend and anomaly insights." },
      { property: "og:title", content: "Dataset — ORION" },
      { property: "og:description", content: "Dataset ingestion for ORION." },
    ],
  }),
  component: DatasetPage,
});

function DatasetPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  const upload = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      setResult(await api.postForm("/dataset/ingest", fd));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader icon={Database} title="Dataset ingest" description="Upload an .xlsx dataset for automated statistical profiling." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Upload">
          <label className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-lg p-8 cursor-pointer hover:bg-accent/30 transition">
            <Upload className="size-6 text-primary" />
            <span className="text-sm">{file ? file.name : "Click to select an .xlsx file"}</span>
            <input type="file" accept=".xlsx" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={upload} disabled={!file || loading} className="gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Ingest
            </Button>
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>
        </Panel>

        <Panel title="Insights">
          <motion.div key={result ? "r" : "e"} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <JsonView data={result} />
          </motion.div>
        </Panel>
      </div>
    </div>
  );
}
