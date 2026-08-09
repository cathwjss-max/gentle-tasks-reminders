import { Link, useRouterState } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  label,
  title,
  actions,
  children,
}: {
  label: string;
  title: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="mb-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <h1 className="mt-2 text-3xl font-medium leading-tight tracking-[-0.03em]">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {actions}
          <Link
            to="/settings"
            aria-label="Settings"
            className={`flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${
              pathname === "/settings" ? "bg-secondary text-foreground" : ""
            }`}
          >
            <Settings className="size-[18px]" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
      {children}
    </header>
  );
}