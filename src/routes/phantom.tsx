import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Ghost } from "lucide-react";
import { PageHeader } from "@/components/orion/AppShell";
import { RunPanel } from "@/components/orion/RunPanel";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/orion-api";

export const Route = createFileRoute("/phantom")({
  head: () => ({
    meta: [
      { title: "Phantom — ORION" },
      { name: "description", content: "Entity DNA fingerprinting and similarity analysis across phone numbers, domains, IPs and financial identifiers." },
      { property: "og:title", content: "Phantom — ORION" },
      { property: "og:description", content: "Entity DNA fingerprinting with ORION Phantom." },
    ],
  }),
  component: PhantomPage,
});

const toList = (s: string) => s.split(/[\n,]+/).map((v) => v.trim()).filter(Boolean);

function PhantomPage() {
  const [phones, setPhones] = useState("+1-202-555-0140");
  const [domains, setDomains] = useState("darkops.example");
  const [ips, setIps] = useState("198.51.100.24");
  const [sims, setSims] = useState("");
  const [banks, setBanks] = useState("");

  return (
    <div>
      <PageHeader icon={Ghost} title="Phantom" description="Correlate entities into a DNA fingerprint and score the organisation risk." />
      <RunPanel
        title="Analyze entities"
        actionLabel="Analyze"
        run={() => api.post("/phantom/analyze", {
          phone_numbers: toList(phones),
          domains: toList(domains),
          ips: toList(ips),
          sim_ids: toList(sims),
          bank_accounts: toList(banks),
        })}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Phone numbers" v={phones} onChange={setPhones} />
          <Field label="Domains" v={domains} onChange={setDomains} />
          <Field label="IPs" v={ips} onChange={setIps} />
          <Field label="SIM IDs" v={sims} onChange={setSims} />
          <Field label="Bank accounts" v={banks} onChange={setBanks} className="md:col-span-2" />
        </div>
      </RunPanel>
    </div>
  );
}

function Field({ label, v, onChange, className = "" }: {
  label: string; v: string; onChange: (v: string) => void; className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <Textarea rows={2} value={v} onChange={(e) => onChange(e.target.value)} placeholder="Comma or newline separated" />
    </div>
  );
}
