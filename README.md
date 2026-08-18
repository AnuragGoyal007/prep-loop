# Prep Loop

Prep Loop is a comprehensive interview-preparation tracker for engineering students. It combines a question-review queue based on simplified SM-2 spaced repetition, a peer mock-interview scheduler with overlap protection, and live progress dashboards for LeetCode and GeeksforGeeks.

This version is built as a responsive, client-side application using vanilla HTML, CSS, and JavaScript with local persistence.

---

## Key Features

- **Authentication & User Profiles**:
  - Local account registration and login (Email & Password).
  - Multi-user support with account-specific data isolation and profile tracking.
  - Quick logout and session persistence.
- **Spaced Repetition Question Tracker (SM-2)**:
  - Log DSA/aptitude question attempts by topic, difficulty, outcome, and time taken.
  - Automatic topic deduplication: repeated attempts update the existing question record.
  - SM-2 spaced-repetition algorithm recalculates ease factors, review intervals, and due dates.
  - Interactive 7-day Review Horizon bar chart and "Due for Review" queue.
- **Live Coding Platform Cards**:
  - **LeetCode**: Live accepted-question totals by difficulty and activity heatmap via `leetcard.jacoblin.cool`.
  - **GeeksforGeeks (GFG)**: Real-time dynamic stats, difficulty breakdown (Easy, Medium, Hard, Basic), live streaks, active days, and a 52-week activity calendar heatmap via the GFG Stats API.
  - Account-level profile syncing and local caching for instantaneous loading.
- **Peer Mock Interview Scheduler**:
  - Weekly 7-day availability grid for offering and booking interview slots.
  - Built-in conflict prevention: prevents self-booking, double-booking, and overlapping sessions.
  - Role-based workflow: hosts can confirm, complete, or reject bookings; requesters can cancel requests.
  - Post-session rating & feedback system (Communication, Problem Solving, Code Quality, Comments).

---

## Run Locally

No build steps, package installations, or external servers are required.

1. Clone this repository:
   ```bash
   git clone https://github.com/AnuragGoyal007/prep-loop.git
   cd prep-loop
   ```
2. Open [`index.html`](index.html) directly in any modern browser, or serve it using any static file server:
   ```bash
   # Using Python 3
   python -m http.server 3000

   # Or using Node (npx)
   npx serve .
   ```

---

## Coding Platform Integration

### 1. LeetCode Progress
On the Dashboard, enter your public LeetCode username and click **Refresh card**. Prep Loop dynamically loads your accepted problems card and activity heatmap from `leetcard.jacoblin.cool`.

### 2. GeeksforGeeks (GFG) Progress
Enter your public GeeksforGeeks handle and click **Refresh card**. Prep Loop fetches live data from the GFG API (`https://gfg-stats-api.vercel.app` with fallback to `https://gfg-stats.tashif.codes`) and dynamically renders:
- Total problems solved with a circular progress ring.
- Category-wise breakdown (`Easy`, `Medium`, `Hard`, `Basic`).
- Real 52-week submission calendar with date tooltips and activity grading.
- Live current streak, longest streak, and total active days.
- Local profile caching for offline resilience and fast reloads.

---

## Project Structure

```text
├── index.html       # App layout, authentication modal, and tab panels
├── style.css        # Responsive styles, design system tokens, and animations
├── storage.js       # LocalStorage managers, cache helpers, and UID generators
├── sm2.js           # Pure spaced-repetition SM-2 algorithm
├── scheduler.js     # Pure scheduling and slot-conflict validation logic
└── app.js           # DOM wiring, API integrations, and reactive rendering
```

---

## Local Storage Architecture

All data persists directly in the browser's `localStorage` across the following keys:

| Key | Description |
|---|---|
| `prepLoop.users` | Registered user credentials and profile records |
| `prepLoop.currentUser` | Currently authenticated user session |
| `prepLoop.whoami` | Active display name / identity |
| `prepLoop.questions` | Logged question attempts with SM-2 state & history |
| `prepLoop.slots` | Offered interview availability slots |
| `prepLoop.bookings` | Booked mock interview sessions and feedback |
| `prepLoop.leetCodeProfiles` | LeetCode handles mapped per user ID |
| `prepLoop.gfgProfiles` | GeeksforGeeks handles mapped per user ID |
| `prepLoop.gfgCache` | Cached GFG stats & heatmap payload per username |

---

## Tech Stack

- **Frontend**: Semantic HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 (Custom Properties / Flexbox / CSS Grid)
- **Typography**: Google Fonts ([Fraunces](https://fonts.google.com/specimen/Fraunces), [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans), [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono))
- **APIs**:
  - LeetCode Card API (`leetcard.jacoblin.cool`)
  - GeeksforGeeks REST Stats API (`gfg-stats-api.vercel.app` / `gfg-stats.tashif.codes`)
- **Algorithms**: SM-2 Spaced Repetition, Interval Overlap Checking
- **Storage**: Browser LocalStorage with fallback safety

---

## Phase 2 Roadmap

Future iterations can transition this prototype into a full-stack MERN application:
- Express / Node.js backend with JWT authentication.
- MongoDB database for cross-device synchronization and persistent booking rooms.
- WebSockets for real-time peer slot updates and instant notifications.
- In-browser code editor and video call integration for live mock interviews.
