# Prep Loop

Prep Loop is a Phase 1 interview-preparation tracker for engineering students. It combines a question-review queue based on simplified SM-2 spaced repetition with a mock-interview scheduler that prevents overlapping sessions.

This version is intentionally a client-side prototype: it uses plain HTML, CSS, and JavaScript with no backend, framework, build step, or authentication.

## Features

- Log DSA or aptitude attempts by topic, difficulty, outcome, and time taken.
- Repeated attempts for the same topic update one question record instead of creating duplicates.
- Simplified SM-2 scheduling recalculates ease factor, review interval, and next review date.
- Dashboard with a seven-day review horizon, questions due today, and today's mock sessions.
- Weekly availability grid for offering and booking mock-interview slots.
- Duplicate-offer, self-booking, already-booked, and double-booking checks.
- Role-aware booking actions: hosts can mark a session done or reject it; requesters can cancel it.
- Feedback scores and written comments shared with both participants.
- Responsive layout and visible keyboard focus styles.

## Run locally

No installation is needed.

1. Clone or download this repository.
2. Open [index.html](index.html) in a modern browser.

You can also serve the folder with any static-file server if preferred.

## How to try the booking flow

Phase 1 uses the **You are** field as a lightweight local identity. To demonstrate bookings on one browser:

1. Enter `Alice` as your name and offer a slot in the Schedule tab.
2. Change the name to `Bob`.
3. Book Alice's open slot.
4. Switch between `Alice` and `Bob` to view the same session from each role.

All data is shared only within that browser's local storage. A different browser or device starts with separate data.

## Project structure

```text
index.html    App structure and UI elements
style.css     Responsive styling and design tokens
storage.js    Safe localStorage helpers
sm2.js        Pure spaced-repetition functions
scheduler.js  Pure availability and conflict-checking functions
app.js        Form events and localStorage-driven rendering
```

## Local storage

Prep Loop saves only in the current browser using these keys:

```text
prepLoop.questions
prepLoop.slots
prepLoop.bookings
prepLoop.whoami
```

Clearing this site's browser data resets the app. No data is sent to a server or to GitHub.

## Phase 2 direction

The next version can move this into a MERN stack with user authentication, MongoDB persistence, shared bookings across devices, protected APIs, and server-side ownership checks. The pure scheduling and SM-2 logic in this project is structured to be reusable in Express route handlers.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser localStorage
- Google Fonts: Fraunces, IBM Plex Sans, and IBM Plex Mono
