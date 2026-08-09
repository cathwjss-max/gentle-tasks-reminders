import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Margin — tasks, birthdays & events" },
      {
        name: "description",
        content:
          "Sign in or create a Margin account to keep your tasks, birthdays and events in one calm place across devices.",
      },
      { property: "og:title", content: "Sign in to Margin" },
      {
        property: "og:description",
        content: "Keep your tasks, birthdays and events in one calm place across devices.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in didn't work. Try again.");
      return;
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-baseline gap-2">
          <span className="text-3xl font-medium tracking-[-0.03em]">Margin</span>
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        </div>
        {sent ? (
          <>
            <h1 className="text-2xl font-medium tracking-[-0.03em]">Check your inbox</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to {email}. Open it, and your space is ready.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setMode("in");
              }}
              className="mt-8 w-full text-[13px] text-muted-foreground underline-offset-4 hover:underline"
            >
              Back to sign in
            </button>
          </>
        ) : (
        <>
        <h1 className="text-2xl font-medium tracking-[-0.03em]">
          {mode === "in" ? "Welcome back" : "Make some space"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "in"
            ? "Your tasks and dates are waiting, quietly."
            : "One account. Tasks, birthdays and events in one place."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3">
          {mode === "up" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              aria-label="Name"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            aria-label="Email"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {error && <p className="text-[13px] text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={google}
          className="mt-3 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-secondary"
        >
          Continue with Google
        </button>

        <button
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError("");
          }}
          className="mt-6 w-full text-[13px] text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "in" ? "No account yet? Create one" : "Already have an account? Sign in"}
        </button>
        </>
        )}
      </div>
    </main>
  );
}
