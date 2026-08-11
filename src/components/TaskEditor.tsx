import { useState } from "react";
import { CalendarDays, Clock, Hash, StickyNote, Trash2 } from "lucide-react";
import { MiniCalendar } from "@/components/MiniCalendar";
import { formatDay, tagColorOf, useTags, useTasks, type Task } from "@/lib/store";

type Panel = "tag" | "date" | "time" | "note" | null;

export function TaskEditor({ task, onClose }: { task: Task; onClose: () => void }) {
  const { updateTask, removeTask } = useTasks();
  const { tags: tagList } = useTags();

  const [title, setTitle] = useState(task.title);
  const [due, setDue] = useState<string | undefined>(task.due ?? undefined);
  const [tag, setTag] = useState<string | undefined>(task.tag ?? undefined);
  const [time, setTime] = useState(task.time ?? "");
  const [note, setNote] = useState(task.note ?? "");
  const [panel, setPanel] = useState<Panel>(null);

  const pill = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-all duration-200 ${
      active
        ? "border-transparent bg-secondary text-foreground"
        : "border-border text-muted-foreground hover:bg-secondary/60"
    }`;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    updateTask(task.id, {
      title: value,
      due: due ?? null,
      tag: tag ?? null,
      time: time || null,
      note: note.trim() || null,
    });
    onClose();
  };

  return (
    <form
      onSubmit={save}
      className="space-y-3 rounded-2xl border border-border bg-card px-4 py-3"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Task title"
        autoFocus
        className="w-full bg-transparent text-[15px] text-foreground focus:outline-none"
      />

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
        <div className="flex flex-wrap gap-2">
          {tagList.length === 0 && (
            <p className="text-[12px] text-muted-foreground">No tags yet — add some in settings.</p>
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

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            removeTask(task.id);
            onClose();
          }}
          aria-label="Delete task"
          className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary"
        >
          <Trash2 className="size-3.5" strokeWidth={1.5} />
          Delete
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-foreground px-4 py-1.5 text-[12px] text-background transition-opacity hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
