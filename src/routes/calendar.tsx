import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Cake, CalendarDays, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useReminders, useTasks, toKey } from "@/lib/store";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Tasks, birthdays & events in Margin" },
      {
        name: "description",
        content:
          "A quiet monthly view of Margin: tasks with dates, birthdays and events together on one calm grid.",
      },
      { property: "og:title", content: "Calendar — Tasks, birthdays & events in Margin" },
      {
        property: "og:description",
        content: "One calm monthly grid for tasks, birthdays and events.",
      },
    ],
  }),
  component: CalendarPage,
});

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function CalendarPage() {
  const { tasks } = useTasks();
  const { reminders } = useReminders();
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(toKey(today));

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= total; d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    return cells;
  }, [cursor]);

  const itemsFor = (key: string) => {
    const [, mm, dd] = key.split("-");
    return {
      tasks: tasks.filter((t) => t.due === key),
      birthdays: reminders.filter(
        (r) => r.kind === "birthday" && r.date.slice(5) === `${mm}-${dd}`,
      ),
      events: reminders.filter((r) => r.kind === "event" && r.date === key),
    };
  };

  const selectedItems = itemsFor(selected);
  const selectedDate = new Date(selected);

  return (
    <AppShell>
      <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Calendar
          </p>
          <h1 className="mt-2 truncate text-3xl font-medium tracking-[-0.03em]">
            {cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </h1>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary"
          >
            <ChevronLeft className="size-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            aria-label="Next month"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary"
          >
            <ChevronRight className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="rounded-3xl border border-border bg-card p-4 sm:p-5">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((d, i) => (
            <span
              key={i}
              className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            if (!date) return <span key={`e${i}`} />;
            const key = toKey(date);
            const items = itemsFor(key);
            const isToday = key === toKey(today);
            const isSelected = key === selected;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-full text-[13px] transition-all duration-300 ease-out ${
                  isSelected
                    ? "bg-foreground text-background shadow-[0_6px_16px_-10px_var(--foreground)]"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span
                  className={`font-mono ${isToday && !isSelected ? "text-foreground underline underline-offset-4" : ""}`}
                >
                  {date.getDate()}
                </span>
                <span className="flex h-1.5 items-center gap-0.5">
                  {items.tasks.length > 0 && <span className="size-1.5 rounded-full bg-foreground/70" />}
                  {items.birthdays.length > 0 && <span className="size-1.5 rounded-full bg-muted-foreground/60" />}
                  {items.events.length > 0 && <span className="size-1.5 rounded-full bg-muted-foreground/30" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {selectedDate.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h2>
        {selectedItems.tasks.length + selectedItems.birthdays.length + selectedItems.events.length ===
        0 ? (
          <p className="text-[15px] text-muted-foreground">Nothing planned. Good.</p>
        ) : (
          <ul className="divide-y divide-border">
            {selectedItems.birthdays.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Cake className="size-4" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 truncate text-[15px]">{r.title}</span>
              </li>
            ))}
            {selectedItems.events.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <CalendarDays className="size-4" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 truncate text-[15px]">{r.title}</span>
              </li>
            ))}
            {selectedItems.tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <CheckCircle2 className="size-4" strokeWidth={1.5} />
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[15px] ${t.done ? "text-muted-foreground line-through" : ""}`}
                >
                  {t.title}
                </span>
                {t.tag && (
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {t.tag}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
