import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/Wordmark";
import { DEFAULT_ROLE, ROLE_OPTIONS, homePathFor, type Role } from "@/lib/roles";

/** Reads `profiles.role` (not auth metadata) and returns this build's landing page for it. */
async function landingFor(userId: string): Promise<string> {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return homePathFor(data?.role);
}

export default function LoginPage() {
  usePageTitle("Sign in or sign up — Barberly");
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          // The confirmation link lands on the page for the role picked here (profiles.role
          // is created from this same value by the handle_new_user trigger).
          options: { emailRedirectTo: window.location.origin + homePathFor(role), data: { role } },
        });
        if (error) return setError(error.message);
        if (!data.session)
          return setNotice("Check your email to confirm your account, then sign in.");
        return navigate(await landingFor(data.session.user.id), { replace: true });
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setError(error.message);
      navigate(await landingFor(data.user.id), { replace: true });
    } finally {
      setBusy(false);
    }
  }

  const input =
    "h-12 w-full rounded-full border border-white/80 bg-white/85 px-5 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-7xl px-5 py-5 md:px-8">
        <Wordmark />
      </header>
      <main className="flex justify-center px-5 pb-20 pt-6">
        <div className="animate-fade-up cloud-panel w-full max-w-md rounded-[2.5rem] p-8">
          <h1 className="text-center text-4xl font-medium">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to book your next look."
              : "Join Barberly in a few seconds."}
          </p>

          {mode === "signup" && (
            <div
              role="tablist"
              aria-label="Account type"
              className="mt-6 grid grid-cols-2 rounded-full bg-balloon-blue/70 p-1"
            >
              {ROLE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="tab"
                  aria-selected={role === o.value}
                  onClick={() => setRole(o.value)}
                  className={`rounded-full py-2 text-sm font-medium transition-colors ${
                    role === o.value
                      ? "glossy bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              className={input}
              type="email"
              required
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={input}
              type="password"
              required
              minLength={6}
              placeholder="Password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
            <Button type="submit" variant="pill" className="h-12 w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Barberly?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
