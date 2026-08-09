import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, LogOut, Monitor, Moon, Plus, Sun, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useTags, SWATCHES } from "@/lib/store";
import { useTheme, type ThemeMode } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — your profile, theme & tags in Margin" },
      {
        name: "description",
        content:
          "Manage your Margin profile, switch between light, dark and system appearance, and shape your own tags.",
      },
      { property: "og:title", content: "Settings — your profile, theme & tags in Margin" },
      {
        property: "og:description",
        content: "Profile, appearance and tags — the few settings Margin keeps.",
      },
    ],
  }),
  component: SettingsPage,
});

function Section({
  title,
  hint,
  children,
  collapsible = false,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <section className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </span>
          {hint && <span className="mt-1 block text-[13px] text-muted-foreground">{hint}</span>}
        </span>
        {collapsible && (
          <ChevronDown
            className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        )}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function SettingsPage() {
  const { profile, email, setDisplayName } = useProfile();
  const { tags, addTag, updateTag, removeTag } = useTags();
  const { mode, setMode } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  useEffect(() => setName(profile?.display_name ?? ""), [profile?.display_name]);

  const [newTag, setNewTag] = useState("");
  const [newColor, setNewColor] = useState<string>(SWATCHES[0].value);
  const [editing, setEditing] = useState<string | null>(null);

  const initial = (profile?.display_name || email || "?").trim().charAt(0).toUpperCase();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <AppShell>
      <PageHeader label="Settings" title="Your margins" />

      <div className="rounded-3xl border border-border bg-card px-5 py-2 sm:px-6">
        <Section title="You">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-lg text-foreground">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => name.trim() && name !== profile?.display_name && setDisplayName(name.trim())}
                placeholder="Your name"
                aria-label="Your name"
                className="w-full bg-transparent text-[15px] focus:outline-none"
              />
              <p className="truncate text-[12px] text-muted-foreground">{email}</p>
            </div>
          </div>
        </Section>

        <Section title="Appearance" hint="Light, dark, or follow your device.">
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] transition-colors ${
                  mode === m.value
                    ? "border-transparent bg-foreground text-background"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                <m.icon className="size-3.5" strokeWidth={1.5} />
                {m.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Tags" hint="A handful is plenty." collapsible>
          <ul className="space-y-2">
            {tags.map((t) => (
              <li key={t.id} className="rounded-2xl bg-secondary/50 px-3 py-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditing(editing === t.id ? null : t.id)}
                    aria-label={`Change colour of ${t.name}`}
                    className="size-4 shrink-0 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                  <input
                    defaultValue={t.name}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== t.name) updateTag(t.id, { name: v });
                    }}
                    aria-label={`Tag name ${t.name}`}
                    className="min-w-0 flex-1 bg-transparent text-[14px] focus:outline-none"
                  />
                  <button
                    onClick={() => removeTag(t.id)}
                    aria-label={`Delete ${t.name}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
                {editing === t.id && (
                  <div className="mt-2 flex flex-wrap gap-2 pl-7">
                    {SWATCHES.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => {
                          updateTag(t.id, { color: s.value });
                          setEditing(null);
                        }}
                        aria-label={s.label}
                        className={`size-5 rounded-full transition-transform hover:scale-110 ${
                          t.color === s.value ? "ring-1 ring-foreground ring-offset-2 ring-offset-card" : ""
                        }`}
                        style={{ backgroundColor: s.value }}
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = newTag.trim();
              if (!v) return;
              addTag(v, newColor);
              setNewTag("");
            }}
            className="mt-3 flex items-center gap-3 rounded-2xl border border-border px-3 py-2"
          >
            <Plus className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag"
              aria-label="New tag"
              className="min-w-0 flex-1 bg-transparent text-[14px] placeholder:text-muted-foreground focus:outline-none"
            />
            <span className="flex shrink-0 gap-1.5">
              {SWATCHES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setNewColor(s.value)}
                  aria-label={s.label}
                  className={`size-4 rounded-full transition-transform hover:scale-110 ${
                    newColor === s.value ? "ring-1 ring-foreground ring-offset-2 ring-offset-card" : ""
                  }`}
                  style={{ backgroundColor: s.value }}
                />
              ))}
            </span>
          </form>
        </Section>

        <Section title="Account" collapsible>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-3.5" strokeWidth={1.5} />
            Log out
          </button>
        </Section>
      </div>
    </AppShell>
  );
}
