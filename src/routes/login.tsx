import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/orion-api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ORION" },
      { name: "description", content: "Sign in to the ORION intelligence operator console." },
      { property: "og:title", content: "Sign in — ORION" },
      { property: "og:description", content: "Operator authentication for ORION." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await login(username, password);
      router.navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card/70 backdrop-blur-md p-8 glow"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-lg bg-primary/15 grid place-items-center">
            <Activity className="size-5 text-primary" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Access</div>
            <div className="text-lg font-semibold tracking-widest text-primary">ORION</div>
          </div>
        </div>

        <h1 className="text-xl font-semibold">Operator sign-in</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Authenticate against the ORION backend gateway.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="u">Username</Label>
            <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p">Password</Label>
            <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <div className="text-sm text-destructive border border-destructive/40 bg-destructive/10 rounded-md px-3 py-2">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading && <Loader2 className="size-4 animate-spin" />} Sign in
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed">
          Default dev credentials: <span className="text-foreground/80">admin / password</span>.
          Configure the backend base URL under Settings after signing in.
        </p>
      </motion.div>
    </div>
  );
}
