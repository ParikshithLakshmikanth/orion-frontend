import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Settings as SettingsIcon } from "lucide-react";
import { PageHeader, Panel } from "@/components/orion/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBaseUrl, setBaseUrl } from "@/lib/orion-api";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ORION" },
      { name: "description", content: "Configure the ORION operator console: backend base URL and session preferences." },
      { property: "og:title", content: "Settings — ORION" },
      { property: "og:description", content: "Console configuration for ORION." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [base, setBase] = useState("");
  useEffect(() => { setBase(getBaseUrl()); }, []);

  return (
    <div>
      <PageHeader icon={SettingsIcon} title="Settings" description="Point the console at the ORION FastAPI backend." />
      <Panel title="Backend gateway" className="max-w-xl">
        <div className="space-y-2">
          <Label>Base URL</Label>
          <Input value={base} onChange={(e) => setBase(e.target.value)} placeholder="http://localhost:8000" />
          <p className="text-xs text-muted-foreground">
            The FastAPI server exposing <code>/auth/token</code>, <code>/phantom</code>, <code>/mosaic</code>, etc.
          </p>
        </div>
        <div className="mt-4">
          <Button
            className="gap-2"
            onClick={() => { setBaseUrl(base); toast.success("Backend URL updated"); }}
          >
            <Check className="size-4" /> Save
          </Button>
        </div>
      </Panel>
    </div>
  );
}
