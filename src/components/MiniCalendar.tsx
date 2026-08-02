import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toKey } from "@/lib/store";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function MiniCalendar({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (key: string | undefined) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => {
    const base = value ? new Date(value) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from(
      { length: total },
      (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1),
    ),
  ];

  return (
    <div className="rounded-2xl bg-secondary/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background"
        >
          <ChevronLeft className="size-3.5" strokeWidth={1.5} />
        </button>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background"
        >
          <ChevronRight className="size-3.5" strokeWidth={1.5} />
        </button>
      </div>
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((d, i) => (
          <span
            key={i}
            className="pb-1 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) =>
          !date ? (
            <span key={`e${i}`} />
          ) : (
            <button
              key={toKey(date)}
              type="button"
              onClick={() => onSelect(toKey(date) === value ? undefined : toKey(date))}
              className={`flex aspect-square items-center justify-center rounded-full font-mono text-[12px] transition-all duration-200 ${
                toKey(date) === value
                  ? "bg-clay text-foreground"
                  : toKey(date) === toKey(today)
                    ? "text-foreground underline underline-offset-4 hover:bg-background"
                    : "text-muted-foreground hover:bg-background"
              }`}
            >
              {date.getDate()}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
