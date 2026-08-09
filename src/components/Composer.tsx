import { useState } from "react";
import { Cake, CalendarDays, Clock, Hash, Plus, SlidersHorizontal, StickyNote } from "lucide-react";
import { MiniCalendar } from "@/components/MiniCalendar";
import { formatDay, tagColorOf, useReminders, useTags, useTasks } from "@/lib/store";

type Kind = "task" | "birthday" | "event";
type Panel = "tag" | "date" | "time" | "note" | "year" | null;

const KINDS: { value: Kind; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "birthday", label: "Birthday" },
  { value: "event", label: "Event" },
];

export function Composer({
  defaultDate,
  autoFocus = false,
  onAdded,
}: {
  defaultDate?: string | undefined;
  autoFocus?: boolean;
  onAdded?: () => void;
}) {
  const { addTask } = useTasks();
  const { addReminder } = useReminders();
  const { tags: tagList } = useTags();

  const [kind, setKind] = useState<Kind>("task");
  const [draft, setDraft] = useState("");
  const [due, setDue] = useState<string | undefined>(defaultDate);
  const [tag, setTag] = useState<string | undefined>();
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [year, setYear] = useState("");
  const [options, setOptions] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  const reset = () => {
    setDraft("");
    setDue(defaultDate);
    setTag(undefined);
    setTime("");
    setNote("");
    setYear("");
    setOptions(false);
    setPanel(null);
    setKind("task");
  };

  const pill = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-all duration-200 ${
      active
        ? "border-transparent bg-secondary text-foreground"
        : "border-border text-muted-foreground hover:bg-secondary/60"
    }`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value) return;

    if (kind === "task") {
      addTask(value, { due, tag, time: time || undefined, note: note.trim() || undefined });
    } else {
      const base = due ?? defaultDate;
      if (!base) {
        setOptions(true);
        setPanel("date");
        return;
      }
      const md = base.slice(5);
      const y = kind === "birthday" ? (/^\d{4}$/.test(year) ? year : "1900") : base.slice(0, 4);
      addReminder({
        title: value,
        kind: kind === "birthday" ? "birthday" : "event",
        date: `${y}-${md}`,
        note: note.trim() || null,
      });
    }
    reset();
    onAdded?.();
  };

  const placeholder =
    kind === "task" ? "Add one task" : kind === "birthday" ? "Whose birthday?" : "What's happening?";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        {kind === "birthday" ? (
          <Cake className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        ) : kind === "event" ? (
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        ) : (
          <Plus className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        )}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
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
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                onClick={() => {
                  setKind(k.value);
                  setPanel(null);
                }}
                className={`rounded-full px-3 py-1.5 text-[12px] transition-all duration-200 ${
                  kind === k.value
                    ? "bg-foreground text-background"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {kind === "task" && (
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
            )}
            <button
              type="button"
              onClick={() => setPanel(panel === "date" ? null : "date")}
              className={pill(!!due || panel === "date")}
            >
              <CalendarDays className="size-3.5" strokeWidth={1.5} />
              {due ? formatDay(new Date(due)) : kind === "birthday" ? "Day & month" : "Date"}
            </button>
            {kind === "birthday" && (
              <button
                type="button"
                onClick={() => setPanel(panel === "year" ? null : "year")}
                className={pill(!!year || panel === "year")}
              >
                <Cake className="size-3.5" strokeWidth={1.5} />
                {year || "Birth year"}
              </button>
            )}
            {kind !== "birthday" && (
              <button
                type="button"
                onClick={() => setPanel(panel === "time" ? null : "time")}
                className={pill(!!time || panel === "time")}
              >
                <Clock className="size-3.5" strokeWidth={1.5} />
                {time || "Time"}
              </button>
            )}
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
            <div className="flex flex-wrap gap-2">
              {tagList.length === 0 && (
                <p className="text-[12px] text-muted-foreground">
                  No tags yet — add some in settings.
                </p>
              )}
              {tagList.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTag(tag === t.name ? undefined : t.name)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-all duration-200 ${
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

          {panel === "date" && <MiniCalendar value={due} onSelect={setDue} />}

          {panel === "year" && (
            <div className="rounded-2xl bg-secondary/60 px-4 py-3">
              <input
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Birth year — optional, for age"
                aria-label="Birth year"
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          )}

          {panel === "time" && (
            <div className="rounded-2xl bg-secondary/60 px-4 py-3">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-label="Time"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          )}

          {panel === "note" && (
            <div className="rounded-2xl bg-secondary/60 px-4 py-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="a short note"
                aria-label="Note"
                className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </form>
  );
}