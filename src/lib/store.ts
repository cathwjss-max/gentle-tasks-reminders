import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  focus: boolean;
  due?: string | null;
  tag?: string | null;
  time?: string | null;
  note?: string | null;
  createdAt: number;
};

export type Reminder = {
  id: string;
  title: string;
  kind: "birthday" | "event";
  date: string; // yyyy-mm-dd
  note?: string | null;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  position: number;
};

export const SWATCHES = [
  { label: "clay", value: "oklch(0.76 0.045 45)" },
  { label: "sage", value: "oklch(0.78 0.035 145)" },
  { label: "mist", value: "oklch(0.79 0.03 240)" },
  { label: "sand", value: "oklch(0.88 0.03 85)" },
  { label: "blush", value: "oklch(0.82 0.04 20)" },
  { label: "stone", value: "oklch(0.72 0.012 80)" },
] as const;

export function useTags() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["tags", user?.id];

  const { data, isFetched } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async (): Promise<Tag[]> => {
      const { data, error } = await supabase
        .from("tags")
        .select("id,name,color,position")
        .order("position", { ascending: true });
      if (error) throw error;
      return data as Tag[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const addTag = useMutation({
    mutationFn: async (t: { name: string; color: string }) => {
      const { error } = await supabase
        .from("tags")
        .insert({ user_id: user!.id, name: t.name, color: t.color, position: (data?.length ?? 0) });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateTag = useMutation({
    mutationFn: async (t: { id: string; name?: string; color?: string }) => {
      const patch: { name?: string; color?: string } = {};
      if (t.name !== undefined) patch.name = t.name;
      if (t.color !== undefined) patch.color = t.color;
      const { error } = await supabase.from("tags").update(patch).eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    tags: data ?? [],
    ready: isFetched,
    addTag: (name: string, color: string) => addTag.mutate({ name, color }),
    updateTag: (id: string, patch: { name?: string; color?: string }) =>
      updateTag.mutate({ id, ...patch }),
    removeTag: (id: string) => removeTag.mutate(id),
  };
}

export function tagColorOf(tags: Tag[], name?: string | null) {
  return tags.find((t) => t.name === name)?.color ?? "var(--muted-foreground)";
}

export function useTasks() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["tasks", user?.id];

  const { data, isFetched } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id,title,done,focus,due,tag,time,note,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        done: r.done,
        focus: r.focus,
        due: r.due,
        tag: r.tag,
        time: r.time,
        note: r.note,
        createdAt: new Date(r.created_at).getTime(),
      }));
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: async (payload: {
      title: string;
      due?: string | undefined;
      tag?: string | undefined;
      time?: string | undefined;
      note?: string | undefined;
    }) => {
      const { error } = await supabase.from("tasks").insert({
        user_id: user!.id,
        title: payload.title,
        due: payload.due ?? null,
        tag: payload.tag ?? null,
        time: payload.time ?? null,
        note: payload.note ?? null,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const patch = useMutation({
    mutationFn: async (p: { id: string; values: { done?: boolean; focus?: boolean } }) => {
      const { error } = await supabase.from("tasks").update(p.values).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const clear = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").delete().eq("done", true);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const tasks = data ?? [];

  return {
    tasks,
    ready: isFetched,
    addTask: (
      title: string,
      extra: {
        due?: string | undefined;
        tag?: string | undefined;
        time?: string | undefined;
        note?: string | undefined;
      } = {},
    ) => add.mutate({ title, ...extra }),
    toggleTask: (id: string) => {
      const t = tasks.find((x) => x.id === id);
      patch.mutate({ id, values: { done: !t?.done } });
    },
    toggleFocus: (id: string) => {
      const t = tasks.find((x) => x.id === id);
      patch.mutate({ id, values: { focus: !t?.focus } });
    },
    removeTask: (id: string) => remove.mutate(id),
    clearDone: () => clear.mutate(),
  };
}

export function useReminders() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["reminders", user?.id];

  const { data, isFetched } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async (): Promise<Reminder[]> => {
      const { data, error } = await supabase
        .from("reminders")
        .select("id,title,kind,date,note")
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Reminder[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: async (r: Omit<Reminder, "id">) => {
      const { error } = await supabase.from("reminders").insert({ ...r, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    reminders: data ?? [],
    ready: isFetched,
    addReminder: (r: Omit<Reminder, "id">) => add.mutate(r),
    removeReminder: (id: string) => remove.mutate(id),
  };
}

export function useProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["profile", user?.id];

  const { data } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,display_name")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async (displayName: string) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user!.id, display_name: displayName });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    profile: data ?? null,
    email: user?.email ?? "",
    setDisplayName: (name: string) => update.mutate(name),
  };
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
  if (h < 5) return "Still Up";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 22) return "Good Evening";
  return "Good Night";
}

export function toKey(date: Date) {
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/** One-time import of anything the user created before they had an account. */
export function useLocalImport() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const run = async () => {
      const rawTasks = window.localStorage.getItem("margin.tasks");
      const rawReminders = window.localStorage.getItem("margin.reminders");
      if (!rawTasks && !rawReminders) return;
      try {
        if (rawTasks) {
          const parsed = JSON.parse(rawTasks) as Task[];
          if (parsed.length) {
            await supabase.from("tasks").insert(
              parsed.map((t) => ({
                user_id: user.id,
                title: t.title,
                done: t.done,
                focus: t.focus,
                due: t.due ?? null,
                tag: t.tag ?? null,
                time: t.time ?? null,
                note: t.note ?? null,
              })),
            );
          }
        }
        if (rawReminders) {
          const parsed = JSON.parse(rawReminders) as Reminder[];
          if (parsed.length) {
            await supabase.from("reminders").insert(
              parsed.map((r) => ({
                user_id: user.id,
                title: r.title,
                kind: r.kind,
                date: r.date,
                note: r.note ?? null,
              })),
            );
          }
        }
      } catch {
        /* ignore */
      } finally {
        window.localStorage.removeItem("margin.tasks");
        window.localStorage.removeItem("margin.reminders");
        qc.invalidateQueries();
      }
    };
    void run();
  }, [user, qc]);
}
