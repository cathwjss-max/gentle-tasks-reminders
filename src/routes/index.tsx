import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Star, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { PageHeader } from "@/components/PageHeader";
import {
  useTasks,
  useReminders,
  nextOccurrence,
  formatDay,
  greeting,
  useTags,
  tagColorOf,
} from "@/lib/store";

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
  const { tasks, toggleTask, toggleFocus, removeTask, clearDone } = useTasks();
  const { reminders } = useReminders();
  const { tags: tagList } = useTags();

  const [hello, setHello] = useState("Hello");
  useEffect(() => setHello(greeting()), []);

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const progress = tasks.length === 0 ? 0 : Math.round((done.length / tasks.length) * 100);
  const complete = tasks.length > 0 && open.length === 0;

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

  return (
    <AppShell>
      <PageHeader
        label={today.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        title={hello}
      >
        <p className="mt-2 text-sm text-muted-foreground">
          {tasks.length === 0
            ? "A blank page. Add one thing."
            : complete
              ? "Everything closed. Enjoy the empty space."
              : `${open.length} ${open.length === 1 ? "task" : "tasks"} remaining`}
        </p>

        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-[width,background-color] duration-700 ease-in-out"
            style={{
              width: `${progress}%`,
              backgroundColor: complete
                ? "var(--sage)"
                : `color-mix(in oklab, var(--sage) ${progress}%, var(--clay))`,
            }}
          />
        </div>
      </PageHeader>

      <div className="mb-8">
        <Composer />
      </div>

      <ul className="space-y-1">
        {open.map((t) => (
          <li
            key={t.id}
            className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-secondary/60"
          >
            <button
              onClick={() => toggleTask(t.id)}
              aria-label={`Complete ${t.title}`}
              className="size-4 shrink-0 rounded-full border border-ring transition-colors hover:bg-secondary"
            />
            <button onClick={() => toggleFocus(t.id)} className="min-w-0 text-left">
              <span className="block truncate text-[15px]">{t.title}</span>
              <span className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {t.focus && <span>focus</span>}
                {t.tag && (
                  <span className="flex items-center gap-1 normal-case tracking-normal">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: tagColorOf(tagList, t.tag) }}
                    />
                    {t.tag}
                  </span>
                )}
                {t.due && (
                  <span className="normal-case tracking-normal">{formatDay(new Date(t.due))}</span>
                )}
                {t.time && <span className="normal-case tracking-normal">{t.time}</span>}
                {t.note && <span className="normal-case tracking-normal">note</span>}
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
                  className="size-4 shrink-0 rounded-full bg-muted-foreground/40"
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
