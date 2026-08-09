import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useTasks } from "@/lib/store";

export const Route = createFileRoute("/space")({
  head: () => ({
    meta: [
      { title: "Your Space — the Margin method & your quiet stats" },
      {
        name: "description",
        content:
          "Three science-backed habits behind Margin: one focus task, closing the loop, and leaving white space in your day.",
      },
      { property: "og:title", content: "Your Space — the Margin method" },
      {
        property: "og:description",
        content: "One focus task, closing open loops, and leaving white space in your day.",
      },
    ],
  }),
  component: SpacePage,
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

function SpacePage() {
  const { tasks } = useTasks();
  const done = tasks.filter((t) => t.done).length;

  return (
    <AppShell>
      <PageHeader label="Your space" title="A clutter-free mind needs a clutter-free page.">
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Margin holds tasks, birthdays and events — and nothing else. Everything removed was
          removed on purpose.
        </p>
      </PageHeader>

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
