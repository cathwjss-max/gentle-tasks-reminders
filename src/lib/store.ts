import { useCallback, useEffect, useState } from "react";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  focus: boolean;
  due?: string;
  tag?: string;
  createdAt: number;
};

export type Reminder = {
  id: string;
  title: string;
  kind: "birthday" | "event";
  date: string; // yyyy-mm-dd
  note?: string;
};

const KEYS = { tasks: "margin.tasks", reminders: "margin.reminders" } as const;

const seedTasks: Task[] = [
  { id: "t1", title: "Write three lines of the proposal", done: false, focus: true, createdAt: 1 },
  { id: "t2", title: "Walk without headphones", done: false, focus: false, createdAt: 2 },
  { id: "t3", title: "Reply to Mira", done: true, focus: false, createdAt: 3 },
];

const seedReminders: Reminder[] = [
  { id: "r1", title: "Mum", kind: "birthday", date: "1962-09-12", note: "Call in the morning" },
  { id: "r2", title: "Dentist", kind: "event", date: "2026-08-19" },
  { id: "r3", title: "Noor", kind: "birthday", date: "1994-12-03" },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useLocal<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* ignore */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, ready] as const;
}

export function useTasks() {
  const [tasks, setTasks, ready] = useLocal<Task[]>(KEYS.tasks, seedTasks);

  const addTask = (title: string, due?: string, tag?: string) =>
    setTasks((prev) => {
      const task: Task = {
        id: crypto.randomUUID(),
        title,
        done: false,
        focus: false,
        createdAt: Date.now(),
        ...(due ? { due } : {}),
        ...(tag ? { tag } : {}),
      };
      return [task, ...prev];
    });
  const toggleTask = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const toggleFocus = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, focus: !t.focus } : t)));
  const removeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const clearDone = () => setTasks((prev) => prev.filter((t) => !t.done));

  return { tasks, ready, addTask, toggleTask, toggleFocus, removeTask, clearDone };
}

export function useReminders() {
  const [reminders, setReminders, ready] = useLocal<Reminder[]>(KEYS.reminders, seedReminders);

  const addReminder = (r: Omit<Reminder, "id">) =>
    setReminders((prev) => [...prev, { ...r, id: crypto.randomUUID() }]);
  const removeReminder = (id: string) => setReminders((prev) => prev.filter((r) => r.id !== id));

  return { reminders, ready, addReminder, removeReminder };
}

export function nextOccurrence(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), (m ?? 1) - 1, d ?? 1);
  if (next < today) next = new Date(today.getFullYear() + 1, (m ?? 1) - 1, d ?? 1);
  const days = Math.round((next.getTime() - today.getTime()) / 86400000);
  const age = y && y > 1900 ? next.getFullYear() - y : undefined;
  return { next, days, age };
}

export function formatDay(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good night";
}

export function toKey(date: Date) {
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}
