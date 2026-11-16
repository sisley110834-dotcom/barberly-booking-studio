import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/Wordmark";
import { DEFAULT_ROLE, ROLE_OPTIONS, type Role } from "@/lib/roles";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in or sign up — Barberly" },
      { name: "description", content: "Sign in to Barberly or create a customer or barber account." },
      { property: "og:title", content: "Sign in or sign up — Barberly" },
      { property: "og:description", content: "Create a customer or barber account on Barberly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin, data: { role } },
          })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    navigate({ to: "/barbers" });
  }

  const input = "h-12 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen bg-beige">
      <header className="mx-auto max-w-7xl px-5 py-5 md:px-8"><Wordmark /></header>
      <main className="flex justify-center px-5 pb-20 pt-6">
        <div className="animate-fade-up w-full max-w-md rounded-[2rem] bg-card p-8 shadow-lift">
          <h1 className="text-center text-4xl font-medium">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to book your next look." : "Join Barberly in a few seconds."}
          </p>

          {mode === "signup" && (
            <div role="tablist" aria-label="Account type" className="mt-6 grid grid-cols-2 rounded-full bg-muted p-1">
              {ROLE_OPTIONS.map((o) => (
                <button key={o.value} type="button" role="tab" aria-selected={role === o.value}
                  onClick={() => setRole(o.value)}
                  className={`rounded-full py-2 text-sm font-medium transition-colors ${
                    role === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input className={input} type="email" required placeholder="Email" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={input} type="password" required minLength={6} placeholder="Password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="pill" className="h-12 w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Barberly?" : "Already have an account?"}{" "}
            <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}>
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
