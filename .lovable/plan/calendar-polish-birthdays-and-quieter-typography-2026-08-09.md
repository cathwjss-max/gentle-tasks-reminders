# Calendar polish, birthdays, and quieter typography

## 1. Fix the selected-day circle

The day cell stacks the number and a row of dots inside one square, so the filled circle sits high and looks off-centre and can crowd neighbouring days.

- Make each day a square grid cell with a fixed-size circle centred inside it.
- Move the activity dots into their own reserved row below the circle, with height reserved even when empty so rows stay evenly spaced.
- Slightly reduce the circle size relative to the cell so adjacent days never touch.

## 2. Header overlap on Calendar and Space

The settings gear is absolutely positioned on every page, so it sits on top of the month arrows on Calendar and crowds the heading on Space.

- Move the gear out of absolute positioning into a shared page header row so it always has its own slot.
- Calendar header: title block on the left; month arrows and gear grouped on the right with consistent gaps.
- Tasks and Space use the same header row, so top spacing is identical across pages.
- Audit vertical rhythm on all three pages so section gaps match.

## 3. Typography

Replace DM Mono with Inconsolata everywhere, and pull the monospace back to a supporting role since it reads less easily than the sans.

- Swap the mono family to Inconsolata (loaded alongside DM Sans in the root head, mapped to the mono token).
- DM Sans becomes the default for anything read or typed: calendar date numbers, the task input, notes, email/password and name fields, buttons, nav labels, settings fields, tag chips, and all sentence-length text.
- Inconsolata is kept only for small uppercase supporting labels (section headers, weekday initials) and countdown numbers — quiet, secondary detail.

## 4. Add items from the Calendar

The calendar is read-only today.

- Add an "Add" control in the calendar's day panel that opens the same composer used on Tasks, pre-filled with the selected date.
- The composer offers three types — Task, Birthday, Event — chosen with the existing pill style.
- New items appear immediately on the grid and in the day list.

## 5. Birthdays (recurring every year)

- Birthday entry asks for day + month only, with an optional year used just to show age.
- Stored as a reminder of kind `birthday`; grid and list matching is by month-day, so it repeats every year automatically.
- Day list shows a cake icon, the name, and "turns 30" when a year was given; the Tasks page upcoming section shows "in N days".
- Events keep a full date and do not repeat.
- Birthdays and events can be deleted from the day panel, matching task row interactions.

## Technical notes

- `reminders.date` is non-null, so birthdays without a known year store a sentinel year (1900); `nextOccurrence` already ignores years below 1900 for age. No migration needed.
- Extract the composer from `src/routes/index.tsx` into `src/components/Composer.tsx`, used by both Tasks and Calendar so behaviour and styling stay identical.
- Extract a `src/components/PageHeader.tsx` (label, title, right-hand actions slot) and remove the absolutely positioned gear from `AppShell`.
- No schema or backend changes required.