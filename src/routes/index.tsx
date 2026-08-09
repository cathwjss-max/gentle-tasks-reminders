import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Hash, Plus, SlidersHorizontal, Star, StickyNote, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MiniCalendar } from "@/components/MiniCalendar";
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

type Panel = "tag" | "date" | "time" | "note" | null;

function Today() {
  const { tasks, addTask, toggleTask, toggleFocus, removeTask, clearDone } = useTasks();
  const { reminders } = useReminders();
  const { tags: tagList } = useTags();
  const [draft, setDraft] = useState("");
  const [due, setDue] = useState<string | undefined>();
  const [tag, setTag] = useState<string | undefined>();
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [options, setOptions] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

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
  const reset = () => {
    setDraft("");
    setDue(undefined);
    setTag(undefined);
    setTime("");
    setNote("");
    setOptions(false);
    setPanel(null);
  };

  const pill = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] transition-all duration-200 ${
      active
        ? "border-transparent bg-secondary text-foreground"
        : "border-border text-muted-foreground hover:bg-secondary/60"
    }`;

  return (
    <AppShell>
      <header className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">{hello}</h1>
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
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = draft.trim();
          if (!value) return;
          addTask(value, { due, tag, time: time || undefined, note: note.trim() || undefined });
          reset();
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
            onClick={() => {
              setOptions((v) => !v);
              setPanel(null);
            }}
            aria-label="More options"
            className={`rounded-full p-1.5 transition-colors ${
              options ? "bg-secondary text-foreground" : "text-muted-foreground"
            }`}
          >
            <SlidersHorizontal className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        {options && (
          <div className="mt-3 border-t border-border pt-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPanel(panel === "tag" ? null : "tag")}
                className={pill(!!tag || panel === "tag")}
              >
                {tag ? (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: tagColorOf(tagList, tag) }}
                  />
                ) : (
                  <Hash className="size-3.5" strokeWidth={1.5} />
                )}
                {tag ?? "Tag"}
              </button>
              <button
                type="button"
                onClick={() => setPanel(panel === "date" ? null : "date")}
                className={pill(!!due || panel === "date")}
              >
                <CalendarDays className="size-3.5" strokeWidth={1.5} />
                {due ? formatDay(new Date(due)) : "Date"}
              </button>
              <button
                type="button"
                onClick={() => setPanel(panel === "time" ? null : "time")}
                className={pill(!!time || panel === "time")}
              >
                <Clock className="size-3.5" strokeWidth={1.5} />
                {time || "Time"}
              </button>
              <button
                type="button"
                onClick={() => setPanel(panel === "note" ? null : "note")}
                className={pill(!!note || panel === "note")}
              >
                <StickyNote className="size-3.5" strokeWidth={1.5} />
                Note
              </button>
            </div>

            {panel === "tag" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tagList.length === 0 && (
                  <p className="font-mono text-[11px] text-muted-foreground">
                    No tags yet — add some in settings.
                  </p>
                )}
                {tagList.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTag(tag === t.name ? undefined : t.name)}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] transition-all duration-200 ${
                      tag === t.name
                        ? "bg-secondary text-foreground"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="size-2 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </button>
                ))}
              </div>
            )}

            {panel === "date" && (
              <div className="mt-3">
                <MiniCalendar value={due} onSelect={setDue} />
              </div>
            )}

            {panel === "time" && (
              <div className="mt-3 rounded-2xl bg-secondary/60 px-4 py-3">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  aria-label="Time"
                  className="w-full bg-transparent font-mono text-sm focus:outline-none"
                />
              </div>
            )}

            {panel === "note" && (
              <div className="mt-3 rounded-2xl bg-secondary/60 px-4 py-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="a short note"
                  aria-label="Note"
                  className="w-full resize-none bg-transparent font-mono text-sm placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            )}
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
