import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useTasks } from "@/lib/store";

export const Route = createFileRoute("/margin")({
  head: () => ({
    meta: [
      { title: "The Margin method — why less is more productive" },
      {
        name: "description",
        content:
          "Three science-backed habits behind Margin: one focus task, closing the loop, and leaving white space in your day.",
      },
      { property: "og:title", content: "The Margin method — why less is more productive" },
      {
        property: "og:description",
        content: "One focus task, closing open loops, and leaving white space in your day.",
      },
    ],
  }),
  component: MarginPage,
});

const principles = [
  {
    tone: "bg-sand",
    label: "01",
    title: "One thing, starred",
    body: "Attention is single-channel. Naming a single focus task lowers switching cost and the anxiety of an undifferentiated list.",
  },
  {
    tone: "bg-sage",
    label: "02",
    title: "Close the loop",
    body: "Unfinished tasks stay active in memory — the Zeigarnik effect. Writing one down, or finishing it, releases the loop.",
  },
  {
    tone: "bg-mist",
    label: "03",
    title: "Keep the white space",
    body: "Fewer choices, fewer decisions. Margin hides settings, tags, priorities and streaks so the page stays quiet.",
  },
];

function MarginPage() {
  const { tasks } = useTasks();
  const done = tasks.filter((t) => t.done).length;

  return (
    <AppShell>
      <header className="mb-10 max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          The method
        </p>
        <h1 className="mt-2 text-3xl font-medium leading-tight tracking-[-0.03em]">
          A clutter-free mind needs a clutter-free page.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Margin holds tasks, birthdays and events — and nothing else. Everything removed was
          removed on purpose.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {principles.map((p) => (
          <article key={p.label} className="rounded-2xl border border-border bg-card p-5">
            <span
              className={`mb-4 flex size-8 items-center justify-center rounded-full font-mono text-[11px] ${p.tone}`}
            >
              {p.label}
            </span>
            <h2 className="text-[15px] font-medium">{p.title}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p>
          </article>
        ))}
      </div>

      <section className="mt-10 rounded-2xl bg-secondary p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          So far
        </p>
        <p className="mt-2 text-2xl font-medium tracking-[-0.02em]">
          {done} loop{done === 1 ? "" : "s"} closed
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          No streaks, no badges. Just the count, then back to the page.
        </p>
      </section>
    </AppShell>
  );
}
