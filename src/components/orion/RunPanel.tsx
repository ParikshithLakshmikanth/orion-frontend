import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, JsonView } from "./AppShell";

type Props<T> = {
  title: string;
  description?: string;
  actionLabel?: string;
  run: () => Promise<T>;
  children?: React.ReactNode; // form inputs
};

export function RunPanel<T = unknown>({
  title, description, actionLabel = "Run", run, children,
}: Props<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);

  const onRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await run();
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Panel title={title}>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        <div className="space-y-4">{children}</div>
        <div className="mt-6">
          <Button onClick={onRun} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {actionLabel}
          </Button>
        </div>
      </Panel>

      <Panel title="Response">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 text-sm text-destructive border border-destructive/40 bg-destructive/10 rounded-md px-3 py-2"
          >
            {error}
          </motion.div>
        )}
        <motion.div key={result ? "r" : "e"} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <JsonView data={result} />
        </motion.div>
      </Panel>
    </div>
  );
}
