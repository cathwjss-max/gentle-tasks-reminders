import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CheckCircle2, CalendarDays, Leaf } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useLocalImport } from "@/lib/store";

const nav = [
  { to: "/", label: "Tasks", icon: CheckCircle2 },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/space", label: "Space", icon: Leaf },
] as const;

function Wordmark() {
  return (
    <Link to="/" className="flex items-baseline gap-2">
      <span className="text-2xl font-medium tracking-[-0.03em] text-foreground">Margin</span>
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useLocalImport();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col sm:flex-row">
        <aside className="hidden shrink-0 flex-col gap-10 border-r border-border px-8 py-10 sm:flex lg:w-60">
          <Wordmark />
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] tracking-tight transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-4 shrink-0" strokeWidth={1.5} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <p className="mt-auto max-w-[14rem] text-[12px] leading-relaxed text-muted-foreground">
            Leave margin. The page is easier to read.
          </p>
        </aside>

        <main className="flex-1 px-6 pt-8 pb-28 sm:px-10 sm:pb-14">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur sm:hidden">
        <div className="grid grid-cols-3">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] tracking-tight transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="size-5" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
