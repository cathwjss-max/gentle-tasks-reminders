import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Plus, Star, Tag, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useTasks, useReminders, nextOccurrence, formatDay, greeting } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Margin — A clutter-free to-do list & reminders app" },
      {
        name: "description",
        content:
          "Margin keeps tasks, birthdays and events in one calm place. Minimal, science-backed focus without feature overload.",
      },
      { property: "og:title", content: "Margin — A clutter-free to-do list & reminders app" },
      {
        property: "og:description",
        content: "Tasks, birthdays and events in one calm place. No feature overload.",
      },
    ],
  }),
  component: Today,
});

function Today() {
  const { tasks, addTask, toggleTask, toggleFocus, removeTask, clearDone } = useTasks();
  const { reminders } = useReminders();
  const [draft, setDraft] = useState("");
  const [due, setDue] = useState("");
  const [tag, setTag] = useState("");
  const [details, setDetails] = useState(false);

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const focus = open.filter((t) => t.focus);

  const soon = useMemo(
    () =>
      reminders
        .map((r) => ({ r, ...nextOccurrence(r.date) }))
        .filter((x) => x.days <= 14)
        .sort((a, b) => a.days - b.days)
        .slice(0, 2),
    [reminders],
  );

  const today = new Date();
  const hello = greeting(today);

  return (
    <AppShell>
      <header className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">{hello}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {open.length === 0
            ? "All done — you cleared everything. Enjoy the empty space."
            : `${open.length} ${open.length === 1 ? "task" : "tasks"} remaining`}
        </p>
        {open.length > 0 && focus.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            One thing first — <span className="text-foreground">{focus[0]?.title}</span>
          </p>
        )}
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = draft.trim();
          if (!value) return;
          addTask(value, due || undefined, tag.trim() || undefined);
          setDraft("");
          setDue("");
          setTag("");
          setDetails(false);
        }}
        className="mb-8 rounded-2xl border border-border bg-card px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <Plus className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add one task"
            aria-label="Add one task"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setDetails((v) => !v)}
            aria-label="Add tag or date"
            className={`rounded-md p-1.5 transition-colors ${
              details || due || tag ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Tag className="size-4" strokeWidth={1.5} />
          </button>
        </div>
        {details && (
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-3">
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="tag (optional)"
              aria-label="Tag"
              className="min-w-0 bg-transparent font-mono text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" strokeWidth={1.5} />
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                aria-label="Due date"
                className="bg-transparent font-mono text-sm focus:outline-none"
              />
            </div>
          </div>
        )}
      </form>

      <ul className="space-y-1">
        {open.map((t) => (
          <li
            key={t.id}
            className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-secondary/60"
          >
            <button
              onClick={() => toggleTask(t.id)}
              aria-label={`Complete ${t.title}`}
              className="size-4 shrink-0 rounded-full border border-ring transition-colors hover:bg-sage"
            />
            <button onClick={() => toggleFocus(t.id)} className="min-w-0 text-left">
              <span className="block truncate text-[15px]">{t.title}</span>
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {t.focus && <span>focus</span>}
                {t.tag && <span className="normal-case tracking-normal">#{t.tag}</span>}
                {t.due && (
                  <span className="normal-case tracking-normal">
                    {formatDay(new Date(t.due))}
                  </span>
                )}
              </span>
            </button>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => toggleFocus(t.id)}
                aria-label="Mark as focus"
                className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                <Star
                  className="size-4"
                  strokeWidth={1.5}
                  fill={t.focus ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={() => removeTask(t.id)}
                aria-label={`Remove ${t.title}`}
                className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <section className="mt-10">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Done · {done.length}
            </h2>
            <button
              onClick={clearDone}
              className="font-mono text-[11px] text-muted-foreground underline-offset-4 hover:underline"
            >
              clear
            </button>
          </div>
          <ul className="space-y-1">
            {done.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-2 py-2">
                <button
                  onClick={() => toggleTask(t.id)}
                  aria-label={`Reopen ${t.title}`}
                  className="size-4 shrink-0 rounded-full bg-sage"
                />
                <span className="min-w-0 truncate text-[15px] text-muted-foreground line-through">
                  {t.title}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {soon.length > 0 && (
        <section className="mt-12 border-t border-border pt-6">
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Coming up
          </h2>
          <ul className="space-y-2">
            {soon.map(({ r, next, days }) => (
              <li key={r.id} className="flex items-center justify-between gap-4">
                <span className="min-w-0 truncate text-[15px]">
                  {r.title}
                  <span className="ml-2 text-muted-foreground">
                    {r.kind === "birthday" ? "birthday" : "event"}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[12px] text-muted-foreground">
                  {days === 0 ? "today" : `${formatDay(next)} · ${days}d`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
