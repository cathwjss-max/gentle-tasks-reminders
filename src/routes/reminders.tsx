import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Cake, CalendarDays, Plus, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useReminders, nextOccurrence, formatDay } from "@/lib/store";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Dates — Birthdays & events in Margin" },
      {
        name: "description",
        content:
          "Every birthday and event you care about, kept in one quiet list with days remaining at a glance.",
      },
      { property: "og:title", content: "Dates — Birthdays & events in Margin" },
      {
        property: "og:description",
        content: "Birthdays and events in one quiet list, with days remaining at a glance.",
      },
    ],
  }),
  component: Reminders,
});

function Reminders() {
  const { reminders, addReminder, removeReminder } = useReminders();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<"birthday" | "event">("birthday");

  const sorted = useMemo(
    () =>
      reminders
        .map((r) => ({ r, ...nextOccurrence(r.date) }))
        .sort((a, b) => a.days - b.days),
    [reminders],
  );

  return (
    <AppShell>
      <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Dates
          </p>
          <h1 className="mt-2 truncate text-3xl font-medium tracking-[-0.03em]">
            People and moments
          </h1>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Add a date"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
        >
          <Plus className="size-4" strokeWidth={1.5} />
        </button>
      </header>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !date) return;
            addReminder({ title: title.trim(), date, kind });
            setTitle("");
            setDate("");
            setOpen(false);
          }}
          className="mb-8 space-y-3 rounded-2xl border border-border bg-card p-4"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Whose day is it?"
            aria-label="Title"
            className="w-full bg-transparent font-mono text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Date"
              className="min-w-0 bg-transparent font-mono text-sm text-muted-foreground focus:outline-none"
            />
            <div className="flex shrink-0 gap-1 rounded-full bg-secondary p-1">
              {(["birthday", "event"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-full px-3 py-1 font-mono text-[11px] transition-colors ${
                    kind === k ? "bg-background text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-primary-foreground"
          >
            Remember it
          </button>
        </form>
      )}

      <ul className="divide-y divide-border">
        {sorted.map(({ r, next, days, age }) => (
          <li key={r.id} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-4">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                r.kind === "birthday" ? "bg-blush" : "bg-mist"
              }`}
            >
              {r.kind === "birthday" ? (
                <Cake className="size-4" strokeWidth={1.5} />
              ) : (
                <CalendarDays className="size-4" strokeWidth={1.5} />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px]">{r.title}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">
                {formatDay(next)}
                {age !== undefined ? ` · turns ${age}` : ""}
                {r.note ? ` · ${r.note}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-[12px] text-muted-foreground">
                {days === 0 ? "today" : `${days}d`}
              </span>
              <button
                onClick={() => removeReminder(r.id)}
                aria-label={`Remove ${r.title}`}
                className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
