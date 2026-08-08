# Build Prompt — Prep Loop (Phase 1)

Copy everything below into your agent-based IDE (Cursor, Claude Code, etc.) as the task description.

---

## What to build

Build **Prep Loop**, a Phase 1 (vanilla JS, no framework, no build step) web app for engineering students preparing for technical interviews. It has two independent modules that share one dashboard:

1. **Question tracker** — logs DSA/aptitude question attempts and schedules when to review each one again, using a simplified SM-2 spaced-repetition algorithm.
2. **Mock interview scheduler** — a weekly availability grid where students offer time slots and book slots with peers, with overlap checking so nobody double-books themselves.

This is a course project (Backend Engineering, 5th semester) whose Phase 2 will rebuild it in the MERN stack. Phase 1's job is to prove the two algorithms (SM-2 recalculation, interval-overlap detection) work correctly, entirely client-side, with zero backend and zero auth. Keep that framing in mind: favor clarity and correctness of the algorithms over polish elsewhere, but the UI should still look like a real, coherent product — not a bare-bones form dump.

## Hard constraints

- **No frameworks, no build tools, no npm.** Plain HTML/CSS/JS only, runnable by opening `index.html` directly in a browser or serving it statically.
- **No backend, no network calls.** All persistence is `localStorage`. Do not integrate any external API (LeetCode, Codeforces, or otherwise) — profile syncing from coding platforms is a planned Phase 2 feature (server-side, cached) and is explicitly out of scope here.
- **No authentication.** Identity is just a typed name string, stored in `localStorage` under `prepLoop.whoami`, used to distinguish "your" bookings from others.
- Use Google Fonts via `<link>` tags (no local font files needed): **Fraunces** (display/headings), **IBM Plex Sans** (body), **IBM Plex Mono** (data, dates, numbers, badges).
- File structure, exactly:
  ```
  index.html
  style.css
  storage.js   (LocalStorage helpers)
  sm2.js       (spaced repetition engine)
  scheduler.js (availability + overlap-safe booking)
  app.js       (DOM wiring — tabs, forms, rendering)
  ```
  Keep the algorithmic logic (`sm2.js`, `scheduler.js`) free of any DOM code — they should be pure functions that `app.js` calls. This separation matters because Phase 2 reuses this logic almost as-is inside Express route handlers.

## Design direction

This is a functional tool for CS students, not a marketing page. Avoid generic "AI app" aesthetics (no near-black-with-neon-accent, no cream-background-with-terracotta-accent, no default Bootstrap look).

**Palette:**
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#EEF1EE` | page background, pale sage-gray |
| `--surface` | `#FFFFFF` | cards |
| `--ink` | `#16211D` | primary text, deep forest-black |
| `--ink-soft` | `#4B5750` | secondary text |
| `--line` | `#DCE1DB` | borders/hairlines |
| `--amber` | `#C98A1F` | "due today" / urgency accent |
| `--amber-soft` | `#F6E6C8` | amber background tint |
| `--teal` | `#2F6F5E` | mastered / confirmed / positive |
| `--teal-soft` | `#DCEAE4` | teal background tint |
| `--slate` | `#3C5A8A` | scheduling / booking actions |
| `--slate-soft` | `#DDE5F1` | slate background tint |
| `--red` | `#B4472F` | hard difficulty tag |

**Typography:** Fraunces (weights 500/600/700) for all headings and the brand mark, at a noticeably larger, more characterful size than body text. IBM Plex Sans for body copy, labels, buttons. IBM Plex Mono for anything data-like: dates, ease-factor numbers, intervals, day/time in the schedule grid, table cell values.

**Layout:** A top bar with a brand mark, a pill-shaped tab switcher (Dashboard / Questions / Schedule), and a "You are [name]" identity input on the right. Below it, one of three panels shows at a time (simple show/hide, not routing).

**Signature element:** On the Dashboard, a horizontal 7-day "review horizon" strip — one bar per upcoming day showing how many questions become due that day, tallest bars = busiest review days, today's column visually marked (thicker border). This is the one visually distinctive element on the page; keep everything else quiet and restrained around it. Build it as bar-chart columns with the count printed above each bar and the day-of-week/"Today" label below.

**Motion:** minimal — hover states on buttons/tabs/slots, a smooth height transition on the horizon bars when they first render. Respect `prefers-reduced-motion`. No page-load animation sequences.

**Accessibility floor:** visible focus outlines on all inputs (use an outline in `--slate`), responsive down to mobile (single-column form grid, stacked due-columns under ~720px), labeled form fields.

## Data models (localStorage, JSON arrays)

```js
// key: prepLoop.questions
{
  id: string,               // uid()
  topic: string,
  difficulty: "easy" | "medium" | "hard",
  easeFactor: number,       // starts 2.5, floored at 1.3
  interval: number,         // days
  nextReviewDate: string,   // "YYYY-MM-DD"
  history: [
    { date: string, correct: boolean, timeTaken: number }
  ]
}

// key: prepLoop.slots  (offered availability)
{
  id: string,
  day: "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun",
  time: string,              // one of "9:00","11:00","13:00","15:00","17:00","19:00"
  hostName: string
}

// key: prepLoop.bookings
{
  id: string,
  slotId: string,            // -> slots[].id
  requesterName: string,
  status: "confirmed" | "done" | "cancelled",
  feedback: null | {
    communication: number,   // 1-5
    problemSolving: number,  // 1-5
    codeQuality: number,     // 1-5
    comment: string
  }
}

// key: prepLoop.whoami -> plain string, the current user's typed name
```

## Module 1 — Question tracker (SM-2)

**Form fields:** topic (text, required), difficulty (select: easy/medium/hard, default medium), time taken in minutes (number, required), outcome (radio: Solved / Missed, default Solved).

**On submit:**
- If a question with the same topic (case-insensitive) already exists, treat this as a new attempt on that question (append to its `history`, recalculate ease/interval) instead of creating a duplicate row.
- Otherwise create a new question starting at `easeFactor = 2.5`, `interval = 0`.

**SM-2 recalculation, exactly:**
```
if (correct) {
  easeFactor = max(1.3, easeFactor + 0.1)
  interval = (interval === 0) ? 1 : round(interval * easeFactor)
} else {
  easeFactor = max(1.3, easeFactor - 0.2)
  interval = 1
}
nextReviewDate = today + interval days
```
Round `easeFactor` to 2 decimal places for display/storage.

**Question table:** columns Topic, Difficulty (colored pill: teal=easy, amber=medium, red=hard), Ease, Interval (e.g. "3d"), Next review (append " · due" if `nextReviewDate <= today`), Attempts (`history.length`). Sort by `nextReviewDate` ascending. Show an empty-state message when there are no questions yet.

## Module 2 — Mock interview scheduler

**Offering a slot:** a collapsible "Offer a slot" form (day select + time select) inside the Schedule tab. Requires the identity field to be filled in first (alert if not). Prevent a host from offering the exact same day+time twice.

**Weekly grid:** 7 columns (Mon–Sun) × 6 rows (9:00, 11:00, 13:00, 15:00, 17:00, 19:00), plus a header row and a time-label column. Each cell is one of:
- **empty** — no slot offered, plain background
- **open** (`is-open`) — someone else offered this slot and it's unbooked; clickable, shows "book"
- **mine** (`is-mine`) — you offered this slot and nobody's booked it yet; shows "open" (visual only, not clickable)
- **booked, involves you** (`is-booked`) — shows "yours"
- **booked, involves others** (`is-booked`) — shows "taken"

**Booking flow (click an open cell):**
1. Require the identity field to be filled in (alert if not).
2. Reject if the slot's host is the current user (can't book your own slot).
3. Reject if the slot is already booked by anyone (race-condition guard).
4. **Overlap check** — reject if the current user already has *any* other confirmed booking or hosted-and-booked slot at that same day+time, whether as host or requester. This is the core "anti-cheat" algorithmic piece — implement it as a pure function `personHasConflict({slots, bookings}, personName, day, time)` that scans both collections.
5. On success, create a `booking` with `status: "confirmed"`.

**My bookings table:** shows only bookings where the current user is the host or the requester. Columns: Day, Time, Role (Host/Requester), With (the other person's name), Status (pill), Feedback column that shows:
- a "Mark done" button if status is `confirmed`
- an "Add" (feedback) button if status is `done` and no feedback yet
- the three numeric scores (e.g. `4/5/3`) if feedback exists

**Feedback modal:** a native `<dialog>` triggered by "Add" — three range sliders (1–5, default 3) for Communication, Problem-solving, Code quality, each showing its live numeric value next to the label, plus an optional comment textarea. Submitting attaches the feedback object to that booking and closes the modal.

## Dashboard (combines both modules)

- **Review horizon strip** (see Design direction above) computed from all questions' `nextReviewDate`s across the next 7 days, folding anything already overdue into "today."
- **Due for review** column: every question where `nextReviewDate <= today`, sorted soonest-first, each row showing topic + ease factor + difficulty. Empty state: "Nothing due — you're caught up."
- **Sessions today** column: bookings (status ≠ cancelled) whose slot's day matches today's weekday, filtered to ones involving the current user, each row showing time + the other person's name + "hosting"/"attending". Empty state prompting the user to book one from the Schedule tab.
- Both columns show a small count badge in their heading.

## General behavior notes

- All rendering functions should re-read from `localStorage` and redraw their section rather than mutating the DOM incrementally — keep it simple for Phase 1.
- Escape all user-entered strings before injecting into `innerHTML` (topic names, host/requester names, comments) to avoid trivial HTML injection via the text fields.
- Changing the identity field should immediately re-filter the Schedule grid and Dashboard "sessions today" list without a page reload.
- The app should work correctly with zero prior data (all three localStorage keys absent) — treat missing/unparsable JSON as an empty array rather than throwing.

## Acceptance checklist

- [ ] Logging a new question creates it with ease 2.5, and a next review date of tomorrow if solved on the first try, or today+1 if missed.
- [ ] Logging a second attempt on the *same topic* updates the existing row instead of creating a duplicate.
- [ ] Three wrong answers in a row keep `easeFactor` at the 1.3 floor, never lower.
- [ ] Offering a slot you've already offered at the same day/time is blocked with a message.
- [ ] Booking a slot that would overlap with another session you're already in (as host or requester) is blocked with a message explaining why.
- [ ] Booking your own offered slot is blocked.
- [ ] The Dashboard's due-questions list and horizon strip stay in sync immediately after logging an attempt, with no page reload.
- [ ] The whole app is a static site — opening `index.html` directly (or via any static file server) works with no console errors, no external JS dependencies besides the Google Fonts stylesheet.