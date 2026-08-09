# Settings page, accounts, and a quieter palette

## What you'll get

A small settings icon in the top-right of every screen, opening a full `/settings` page, plus a calmer, mostly monochrome look where Morandi colour appears only in the progress bar and tags.

## Settings page

Sections, in Margin's voice:

- **You** — name, email, avatar initial. Always visible (not collapsed).
- **Appearance** — Light / Dark / System as three quiet pills. Always visible.
- **Tags** (collapsible) — list of your tags; rename, recolour from the Morandi swatch set, delete, add new ones. Changes flow through to task pills and the add-task menu.
- **Account** (collapsible) — log out.

Collapsible sections use a soft chevron row consistent with the rest of the app.

## Accounts

Enable Lovable Cloud for real accounts:

- Email + password sign up / sign in at `/auth`, with an auto-created profile (display name, avatar initial).
- Tasks, reminders and tags move to the cloud so they follow you across devices, each row private to its owner.
- Existing on-device data is migrated into your account the first time you sign in.
- Log out returns you to `/auth`.

## Colour direction

- Base becomes a monochrome beige-to-charcoal scale: light beige/white surfaces, warm grey borders, charcoal text. Dark mode is the same scale inverted (charcoal surfaces, warm off-white text) — not blue-grey like today.
- Morandi colour is reserved for exactly two things: the task progress bar (clay to sage) and tag dots/pills.
- Calendar goes fully monochrome: selected day = charcoal fill with light text, today = subtle ring, hover = soft beige tint. Task / birthday / event dots become three tones of grey with a small legend instead of sage / blush / mist.
- All button and nav hover states use the same beige-tint treatment.

## Technical notes

- Lovable Cloud: `profiles`, `tasks`, `reminders`, `tags` tables with RLS scoped to `auth.uid()` plus grants; a trigger seeds a profile and the five default tags on sign-up.
- Theme: small theme provider storing `light`/`dark`/`system` in localStorage and toggling `.dark` on `<html>`, applied after hydration to avoid mismatch.
- `src/styles.css`: rewrite `:root` and `.dark` tokens to the neutral warm scale; keep `--clay/--sage/--mist/--sand/--blush` for progress and tags only.
- New `src/routes/settings.tsx` and `src/routes/auth.tsx`; settings icon added to `AppShell`; `src/lib/store.ts` swapped from localStorage hooks to cloud-backed queries.