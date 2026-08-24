// Script to generate the comprehensive Viva Preparation Master Guide PDF for PrepLoop
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("Compiling comprehensive viva documentation HTML...");

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PrepLoop — Comprehensive JavaScript Codebase & Viva Master Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap');

    :root {
      --ink: #16211D;
      --ink-soft: #4A5B53;
      --ink-muted: #6B7C74;
      --bg: #FFFFFF;
      --surface: #F8FAF9;
      --surface-card: #FFFFFF;
      --line: #DCE3E0;
      --line-subtle: #EBEFE8;
      --teal: #24584b;
      --teal-soft: #E8F3EE;
      --slate: #2B456B;
      --slate-soft: #EBF1F8;
      --amber: #805512;
      --amber-soft: #FEF7EC;
      --purple: #5A2A94;
      --purple-soft: #F4EEFB;
      --red: #9E2A2B;
      --red-soft: #FDEDED;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: var(--ink);
      background: #FFFFFF;
      padding: 0;
    }

    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'IBM Plex Mono', monospace;
        font-size: 8.5pt;
        color: #7A8B83;
      }
      @bottom-left {
        content: "PrepLoop — Viva Master Guide (BEE Project)";
        font-family: 'Inter', sans-serif;
        font-size: 8.5pt;
        font-weight: 500;
        color: #7A8B83;
      }
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Cover Page */
    .cover {
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px 20px 20px;
      border-bottom: 3px solid var(--teal);
      margin-bottom: 40px;
    }

    .cover-badge {
      display: inline-block;
      align-self: flex-start;
      padding: 6px 14px;
      background: var(--teal-soft);
      color: var(--teal);
      border-radius: 20px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9.5pt;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 24px;
      border: 1px solid rgba(47, 111, 94, 0.2);
    }

    .cover h1 {
      font-family: 'Fraunces', serif;
      font-size: 34pt;
      line-height: 1.1;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 16px;
      letter-spacing: -1px;
    }

    .cover h1 span {
      color: var(--teal);
    }

    .cover-subtitle {
      font-size: 14.5pt;
      line-height: 1.5;
      color: var(--ink-soft);
      margin-bottom: 36px;
      max-width: 90%;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 24px;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 12px;
      margin-top: 20px;
    }

    .cover-meta-item {
      display: flex;
      flex-direction: column;
    }

    .cover-meta-item strong {
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: 'IBM Plex Mono', monospace;
      color: var(--ink-muted);
      margin-bottom: 4px;
    }

    .cover-meta-item span {
      font-size: 11pt;
      font-weight: 600;
      color: var(--ink);
    }

    /* Headings & Section Styling */
    h2.section-title {
      font-family: 'Fraunces', serif;
      font-size: 20pt;
      font-weight: 700;
      color: var(--ink);
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--teal);
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    h3.sub-title {
      font-family: 'Fraunces', serif;
      font-size: 14pt;
      font-weight: 600;
      color: var(--slate);
      margin: 22px 0 10px;
      letter-spacing: -0.3px;
    }

    h4.func-title {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11pt;
      font-weight: 700;
      color: var(--teal);
      background: var(--teal-soft);
      padding: 6px 12px;
      border-left: 4px solid var(--teal);
      border-radius: 0 6px 6px 0;
      margin: 18px 0 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    h4.func-title .func-tag {
      font-size: 8pt;
      padding: 2px 8px;
      border-radius: 4px;
      background: #FFFFFF;
      color: var(--teal);
      border: 1px solid rgba(47, 111, 94, 0.25);
      font-family: 'IBM Plex Mono', monospace;
    }

    p {
      margin-bottom: 10px;
      color: var(--ink-soft);
      text-align: justify;
    }

    p strong {
      color: var(--ink);
    }

    /* Callout Boxes */
    .callout {
      padding: 14px 16px;
      border-radius: 8px;
      margin: 14px 0;
      border-left: 4px solid;
      background: var(--surface);
    }

    .callout-viva {
      border-color: var(--amber);
      background: var(--amber-soft);
    }

    .callout-viva strong {
      color: var(--amber);
      display: block;
      margin-bottom: 4px;
      font-size: 9.5pt;
      text-transform: uppercase;
      font-family: 'IBM Plex Mono', monospace;
      letter-spacing: 0.05em;
    }

    .callout-tip {
      border-color: var(--teal);
      background: var(--teal-soft);
    }

    .callout-tip strong {
      color: var(--teal);
      display: block;
      margin-bottom: 4px;
      font-size: 9.5pt;
      text-transform: uppercase;
      font-family: 'IBM Plex Mono', monospace;
      letter-spacing: 0.05em;
    }

    .callout-math {
      border-color: var(--purple);
      background: var(--purple-soft);
    }

    .callout-math strong {
      color: var(--purple);
      display: block;
      margin-bottom: 4px;
      font-size: 9.5pt;
      text-transform: uppercase;
      font-family: 'IBM Plex Mono', monospace;
    }

    /* Code Blocks */
    pre, code {
      font-family: 'IBM Plex Mono', Consolas, monospace;
      font-size: 9pt;
    }

    code.inline {
      background: #EDF2EF;
      color: #1F4E42;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8.8pt;
      font-weight: 500;
      border: 1px solid #D5E2DC;
    }

    pre.code-block {
      background: #18221E;
      color: #E6EDE9;
      padding: 12px 14px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 10px 0 14px;
      line-height: 1.45;
      border: 1px solid #2D3D36;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 20px;
      font-size: 9.5pt;
    }

    table.data-table th, table.data-table td {
      padding: 8px 10px;
      text-align: left;
      border: 1px solid var(--line);
      vertical-align: top;
    }

    table.data-table th {
      background: var(--surface);
      color: var(--ink);
      font-family: 'IBM Plex Mono', monospace;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    table.data-table tr:nth-child(even) {
      background: #FAFCFA;
    }

    /* QA Cards */
    .qa-card {
      margin: 16px 0;
      padding: 14px 16px;
      background: #FFFFFF;
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    }

    .qa-question {
      font-size: 11pt;
      font-weight: 700;
      color: var(--slate);
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .qa-badge {
      display: inline-block;
      padding: 2px 7px;
      background: var(--slate-soft);
      color: var(--slate);
      border-radius: 4px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
    }

    .qa-answer {
      font-size: 10pt;
      color: var(--ink-soft);
      line-height: 1.55;
    }

    .qa-answer ul, .qa-answer ol {
      margin-left: 20px;
      margin-top: 6px;
      margin-bottom: 6px;
    }

    .qa-answer li {
      margin-bottom: 4px;
    }

    /* Badge Tags */
    .badge-tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 7.8pt;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-teal { background: var(--teal-soft); color: var(--teal); }
    .badge-slate { background: var(--slate-soft); color: var(--slate); }
    .badge-amber { background: var(--amber-soft); color: var(--amber); }
    .badge-purple { background: var(--purple-soft); color: var(--purple); }

    /* Key takeaways list */
    .key-points {
      margin: 8px 0 12px 18px;
    }
    .key-points li {
      margin-bottom: 6px;
      color: var(--ink-soft);
    }
  </style>
</head>
<body>

  <!-- ============================================================ -->
  <!-- COVER PAGE                                                   -->
  <!-- ============================================================ -->
  <div class="cover">
    <div class="cover-badge">Academic & Viva Examination Guide • Phase 1</div>
    <h1>PrepLoop <span>Codebase & Viva Master Manual</span></h1>
    <div class="cover-subtitle">
      A comprehensive, exhaustive technical reference manual covering every module, function, mathematical algorithm, local-first data architecture, and high-frequency JavaScript viva interview question.
    </div>

    <div class="cover-meta-grid">
      <div class="cover-meta-item">
        <strong>Project Title</strong>
        <span>PrepLoop — Interview Preparation Tracker & Peer Mock Scheduler</span>
      </div>
      <div class="cover-meta-item">
        <strong>Architecture</strong>
        <span>Local-First SPA (Zero-Backend, LocalStorage Persistent Engine)</span>
      </div>
      <div class="cover-meta-item">
        <strong>Core Technology Stack</strong>
        <span>Vanilla JavaScript (ES6+), HTML5, CSS3, SVG APIs, SM-2 Engine</span>
      </div>
      <div class="cover-meta-item">
        <strong>Repository Modules</strong>
        <span>sm2.js, scheduler.js, storage.js, cs_sheets_data.js, app.js</span>
      </div>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- TABLE OF CONTENTS / OVERVIEW                                 -->
  <!-- ============================================================ -->
  <h2 class="section-title">Table of Contents</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Section</th>
        <th style="width: 55%;">Coverage Summary</th>
        <th style="width: 20%;">Key Objective</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Architecture & Design</strong></td>
        <td>Local-First principles, IIFE Module Pattern, State Synchronization across tabs, Reactive DOM Rendering.</td>
        <td>Understand high-level system design</td>
      </tr>
      <tr>
        <td><strong>2. sm2.js Deep Dive</strong></td>
        <td>SuperMemo-2 Algorithm mathematical formulation, Ease Factor (EF), Interval growth, review scheduling.</td>
        <td>Master Spaced Repetition engine</td>
      </tr>
      <tr>
        <td><strong>3. scheduler.js Deep Dive</strong></td>
        <td>Bi-directional peer mock scheduling, 4-state slot matrix, conflict resolution, real-time conclusion locks.</td>
        <td>Master Scheduling & Conflict Logic</td>
      </tr>
      <tr>
        <td><strong>4. storage.js Deep Dive</strong></td>
        <td>Fault-tolerant JSON read/write, user-scoped keys, LeetCode/GFG caches, CS Core progress serialization.</td>
        <td>Master Persistence Layer</td>
      </tr>
      <tr>
        <td><strong>5. cs_sheets_data.js</strong></td>
        <td>Striver's TakeUforward dataset structure, OS/DBMS/CN topic metadata, subject filtering, SM-2 synchronization.</td>
        <td>Master Core CS Dataset Architecture</td>
      </tr>
      <tr>
        <td><strong>6. app.js Controller Deep Dive</strong></td>
        <td>Complete function-by-function analysis of all 49 controller functions (UI rendering, Event delegation, APIs, SVG heatmap).</td>
        <td>Master Frontend Controller & Flows</td>
      </tr>
      <tr>
        <td><strong>7. General JS Viva Questions</strong></td>
        <td>Event Loop, Microtasks vs Macrotasks, Closures, Hoisting, Scope, Prototypes, this, async/await, DOM delegation, Security (XSS).</td>
        <td>Ace Core JavaScript Viva Q&A</td>
      </tr>
      <tr>
        <td><strong>8. Project Specific Viva Questions</strong></td>
        <td>20+ high-probability questions directly on PrepLoop's algorithms, race conditions, edge cases, and architectural choices.</td>
        <td>Defend project implementation</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ============================================================ -->
  <!-- SECTION 1: ARCHITECTURE & DESIGN PHILOSOPHY                  -->
  <!-- ============================================================ -->
  <h2 class="section-title">1. High-Level Architecture & Design Philosophy</h2>
  
  <p>
    <strong>PrepLoop</strong> is built as a <strong>Local-First Single Page Application (SPA)</strong>. It requires zero server setup, runs instantly in any modern browser, and operates completely offline while maintaining persistent state using the browser's <code>localStorage</code> API.
  </p>

  <h3 class="sub-title">1.1 The IIFE Module Pattern (Immediately Invoked Function Expressions)</h3>
  <p>
    Rather than polluting the global <code>window</code> scope with loose functions and variables, PrepLoop isolates core domains into self-contained modules using the <strong>IIFE Module Pattern</strong>:
  </p>
  <pre class="code-block">const SM2 = (function () {
  // Private variables and helper functions (inaccessible from outside)
  function formatDate(date) { ... }
  
  // Public API exposed via returned object
  return {
    today: today,
    recalculate: recalculate,
    newQuestion: newQuestion
  };
})();</pre>
  <div class="callout callout-tip">
    <strong>Why use IIFE Module Pattern instead of plain global functions?</strong>
    <ul class="key-points">
      <li><strong>Encapsulation:</strong> Private variables and internal helper methods cannot be tampered with from the browser console.</li>
      <li><strong>Namespace Protection:</strong> Avoids identifier collisions with third-party scripts or other modules.</li>
      <li><strong>Zero Build Dependency:</strong> Enables modular, clean, scalable code without requiring Node/Webpack/Vite bundlers.</li>
    </ul>
  </div>

  <h3 class="sub-title">1.2 Screen Flow Hierarchy</h3>
  <p>
    The application follows a strictly guarded, intuitive screen progression:
  </p>
  <ol class="key-points">
    <li><strong>Landing Page (<code>#landing-screen</code>):</strong> Public entry point displaying the product value proposition, interactive workspace preview, 4 feature pillars (SM-2, Conflict-Free Mocks, Platform Heatmaps, Evaluation Rubrics), and "How It Works" workflow.</li>
    <li><strong>Authentication Screen (<code>#auth-screen</code>):</strong> Modal-based local account creation (Sign up) and credential verification (Login) with mandatory university/course/year details and optional LeetCode/GFG handles. Includes a <code>&larr; Back to Home</code> action.</li>
    <li><strong>Application Workspace (<code>#app-page</code>):</strong> Main authenticated shell comprising the Topbar (Identity, Dark/Light Theme toggle, Logout), Tab Navigation (Dashboard, Questions, Core CS Sheets, Schedule), and interactive workspaces.</li>
  </ol>

  <h3 class="sub-title">1.3 Cross-Tab Synchronization</h3>
  <p>
    Because <code>localStorage</code> triggers a <code>window.addEventListener("storage", ...)</code> event in all other open tabs on the same origin whenever a key changes, PrepLoop automatically synchronizes bookings, questions, and profile edits across multiple browser tabs in real-time without WebSockets!
  </p>

  <div class="page-break"></div>

  <!-- ============================================================ -->
  <!-- SECTION 2: SM2.JS DEEP DIVE                                  -->
  <!-- ============================================================ -->
  <h2 class="section-title">2. sm2.js — Spaced Repetition Engine</h2>
  <p>
    <strong>File Path:</strong> <code>sm2.js</code> &bull; <strong>Size:</strong> ~2.7 KB &bull; <strong>Lines:</strong> 99 lines<br>
    <strong>Domain:</strong> Implements a calibrated adaptation of the <strong>SuperMemo-2 (SM-2) Spaced Repetition Algorithm</strong> to calculate optimal review intervals for technical interview questions.
  </p>

  <div class="callout callout-math">
    <strong>SM-2 Mathematical Formulation in PrepLoop</strong>
    <p>Every time a user reviews or attempts a question, the algorithm updates three key variables:</p>
    <ol style="margin-left: 20px; margin-top: 6px;">
      <li><strong>Ease Factor ($EF$):</strong> Measures topic difficulty (Initial: $2.5$, Minimum bound: $1.3$).
        $$\text{Correct: } EF' = \max(1.3, EF + 0.1) \quad | \quad \text{Missed: } EF' = \max(1.3, EF - 0.2)$$
      </li>
      <li><strong>Repetition Interval ($I$ in days):</strong>
        $$I = \begin{cases} 1 & \text{if attempt is Missed (failed)} \\ 1 & \text{if Correct and } I_{prev} = 0 \text{ (first attempt)} \\ \text{round}(I_{prev} \times EF') & \text{if Correct and } I_{prev} > 0 \end{cases}$$
      </li>
      <li><strong>Next Review Date:</strong>
        $$\text{NextReviewDate} = \text{AttemptDate} + I \text{ days}$$
      </li>
    </ol>
  </div>

  <h3 class="sub-title">Function Breakdown in sm2.js</h3>

  <div class="avoid-break">
    <h4 class="func-title">1. formatDate(date) <span class="func-tag">Helper (Private)</span></h4>
    <p><strong>Signature:</strong> <code>formatDate(date: Date): string</code></p>
    <p><strong>What it does:</strong> Converts a native JavaScript <code>Date</code> object into a standardized ISO date string <code>YYYY-MM-DD</code> with zero-padded month and day.</p>
    <p><strong>How it works:</strong> Uses <code>date.getFullYear()</code>, <code>String(date.getMonth() + 1).padStart(2, "0")</code> (since JS months are 0-indexed: January is 0), and <code>String(date.getDate()).padStart(2, "0")</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">2. today() <span class="func-tag">Public API</span></h4>
    <p><strong>Signature:</strong> <code>today(): string</code></p>
    <p><strong>What it does:</strong> Returns the current system date as a formatted <code>YYYY-MM-DD</code> string.</p>
    <p><strong>How it works:</strong> Calls <code>formatDate(new Date())</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">3. addDays(dateString, days) <span class="func-tag">Public API</span></h4>
    <p><strong>Signature:</strong> <code>addDays(dateString: string, days: number): string</code></p>
    <p><strong>What it does:</strong> Calculates a future date by adding a given number of integer days to a base date string.</p>
    <p><strong>How it works:</strong> Parses <code>dateString + "T00:00:00"</code> (specifying midnight local time to avoid daylight saving/time zone rollover glitches), invokes <code>date.setDate(date.getDate() + days)</code>, and formats back via <code>formatDate(date)</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">4. recalculate(question, correct, timeTaken, attemptDate) <span class="func-tag">Core Algorithm</span></h4>
    <p><strong>Signature:</strong> <code>recalculate(question: Object, correct: boolean, timeTaken: number, attemptDate?: string): Object</code></p>
    <p><strong>What it does:</strong> Recalculates Ease Factor, Interval, and Next Review Date when a user logs an attempt on an existing question, and appends the attempt to the question's immutable history ledger.</p>
    <p><strong>How it works:</strong></p>
    <ol class="key-points">
      <li>Reads previous <code>easeFactor</code> (defaults to 2.5) and <code>interval</code> (defaults to 0).</li>
      <li>If <code>correct === true</code>, increases ease by <code>+0.1</code>; if <code>false</code> (missed), decreases ease by <code>-0.2</code>. Clamps with <code>Math.max(1.3, newEase)</code> so the interval can never shrink exponentially below 1.3.</li>
      <li>Calculates new interval: if missed, resets interval to <code>1</code> day (forcing immediate repetition). If correct on first attempt, interval is <code>1</code> day; on subsequent successful repetitions, interval expands to <code>Math.round(oldInterval * easeFactor)</code>.</li>
      <li>Adds interval days to <code>attemptDate</code> to establish <code>nextReviewDate</code>.</li>
      <li>Clones existing history array via spread operator <code>[...question.history]</code> (preserving immutability) and pushes <code>{ date, correct, timeTaken }</code>.</li>
    </ol>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">5. newQuestion(params) <span class="func-tag">Public API</span></h4>
    <p><strong>Signature:</strong> <code>newQuestion(params: Object): Object</code></p>
    <p><strong>What it does:</strong> Instantiates and calibrates a newly created question entry for the review queue.</p>
    <p><strong>How it works:</strong> Creates an initial baseline question object with <code>easeFactor: 2.5</code>, <code>interval: 0</code>, <code>tag: params.tag || "DSA"</code>, and immediately runs <code>recalculate(...)</code> with the first attempt parameters so the initial interval and next review date are calculated accurately.</p>
  </div>

  <div class="page-break"></div>

  <!-- ============================================================ -->
  <!-- SECTION 3: SCHEDULER.JS DEEP DIVE                            -->
  <!-- ============================================================ -->
  <h2 class="section-title">3. scheduler.js — Peer Mock Scheduling & Conflict Engine</h2>
  <p>
    <strong>File Path:</strong> <code>scheduler.js</code> &bull; <strong>Size:</strong> ~6.25 KB &bull; <strong>Lines:</strong> 180 lines<br>
    <strong>Domain:</strong> Manages peer-to-peer interview slot creation, booking workflows, conflict detection, time parsing, and conclusion guards.
  </p>

  <h3 class="sub-title">Data Models in Scheduler</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>Entity</th>
        <th>Fields & Types</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Slot</strong></td>
        <td><code>id, hostName, day, time, topic, durationMinutes, createdAt</code></td>
        <td>An availability window offered by a host user (e.g., "Mon 09:00").</td>
      </tr>
      <tr>
        <td><strong>Booking</strong></td>
        <td><code>id, slotId, requesterName, status, feedback, bookedAt</code></td>
        <td>A scheduled interview session requested by a peer (Status: <code>confirmed</code>, <code>done</code>, <code>cancelled</code>).</td>
      </tr>
    </tbody>
  </table>

  <h3 class="sub-title">Function Breakdown in scheduler.js</h3>

  <div class="avoid-break">
    <h4 class="func-title">1. timeToMinutes(timeStr) <span class="func-tag">Time Parsing</span></h4>
    <p><strong>Signature:</strong> <code>timeToMinutes(timeStr: string): number</code></p>
    <p><strong>What it does:</strong> Converts any 12-hour or 24-hour time string (e.g., <code>"9:00"</code>, <code>"09:30"</code>, <code>"14:15"</code>, <code>"2:30 PM"</code>) into integer minutes elapsed from midnight ($0 \dots 1439$).</p>
    <p><strong>How it works:</strong> Detects AM/PM flags using regex <code>/pm/i.test(s)</code> and <code>/am/i.test(s)</code>. Strips non-digit characters, splits on <code>:</code>, parses hours and minutes. If PM and hours &lt; 12, adds 12 hours. If 12 AM, sets hours to 0. Clamps to $[0, 1439]$.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">2. normalizeTime(timeStr) & formatDisplayTime(timeStr) <span class="func-tag">Formatting</span></h4>
    <p><strong>Signature:</strong> <code>normalizeTime(timeStr: string): string</code> & <code>formatDisplayTime(timeStr: string): string</code></p>
    <p><strong>What they do:</strong> <code>normalizeTime</code> formats any time to standard 24h <code>HH:MM</code> for database comparisons. <code>formatDisplayTime</code> formats <code>"14:30"</code> &rarr; <code>"2:30 PM"</code> for presentation.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">3. getAllScheduleTimes(slots) <span class="func-tag">Grid Row Builder</span></h4>
    <p><strong>Signature:</strong> <code>getAllScheduleTimes(slots: Array): Array&lt;string&gt;</code></p>
    <p><strong>What it does:</strong> Dynamically extracts all unique time rows needed to render the weekly calendar grid.</p>
    <p><strong>How it works:</strong> Seeds a JavaScript <code>Set</code> with <code>DEFAULT_TIMES</code> (<code>09:00, 11:00, 13:00, 15:00, 17:00, 19:00</code>), iterates through all custom slots in <code>slots</code> to add their normalized times, and sorts the resulting array chronologically using <code>timeToMinutes(a) - timeToMinutes(b)</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">4. personHasConflict(data, personName, day, time) <span class="func-tag">Conflict Detection Algorithm</span></h4>
    <p><strong>Signature:</strong> <code>personHasConflict(data: Object, personName: string, day: string, time: string): boolean</code></p>
    <p><strong>What it does:</strong> Prevents double-booking. Verifies whether a given user already has an active meeting (either as Host OR as Requester) at the exact same day and time.</p>
    <p><strong>How it works:</strong> Iterates through all active bookings (<code>status !== "cancelled"</code>), retrieves the associated slot, and returns <code>true</code> if <code>slot.day === day</code> and <code>normalizeTime(slot.time) === targetTime</code> and the user is either <code>slot.hostName</code> or <code>booking.requesterName</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">5. hasOfferedSlot(slots, hostName, day, time) <span class="func-tag">Validation</span></h4>
    <p><strong>Signature:</strong> <code>hasOfferedSlot(slots: Array, hostName: string, day: string, time: string): boolean</code></p>
    <p><strong>What it does:</strong> Checks if the host has already offered an existing slot at that exact day and time to prevent duplicate listings.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">6. isSessionPast(day, timeStr, durationMinutes) <span class="func-tag">Meeting Conclusion Guard</span></h4>
    <p><strong>Signature:</strong> <code>isSessionPast(day: string, timeStr: string, durationMinutes: number): boolean</code></p>
    <p><strong>What it does:</strong> Enforces that a host can only mark a session "Done" and submit evaluation ratings <strong>after the meeting has actually finished in real time</strong>.</p>
    <p><strong>How it works:</strong> Maps days of week to indices (Mon=0, Tue=1 ... Sun=6). Compares current day index with slot day index. If on the same day, compares current real time in minutes with <code>startMinutes + durationMinutes</code>. Returns <code>true</code> only once the clock exceeds the meeting end time.</p>
  </div>

  <div class="page-break"></div>

  <!-- ============================================================ -->
  <!-- SECTION 4: STORAGE.JS DEEP DIVE                              -->
  <!-- ============================================================ -->
  <h2 class="section-title">4. storage.js — Local-First Storage & Persistence Layer</h2>
  <p>
    <strong>File Path:</strong> <code>storage.js</code> &bull; <strong>Size:</strong> ~8.55 KB &bull; <strong>Lines:</strong> 287 lines<br>
    <strong>Domain:</strong> Centralized persistence engine providing safe JSON serialization, error recovery, user-scoped progress mapping, and cryptographic ID generation.
  </p>

  <h3 class="sub-title">LocalStorage Keys Catalog (KEYS)</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>Key Constant</th>
        <th>Storage Key String</th>
        <th>Stored Data Structure</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>KEYS.questions</code></td>
        <td><code>"prepLoop.questions"</code></td>
        <td>Array of SM-2 question objects with history logs.</td>
      </tr>
      <tr>
        <td><code>KEYS.slots</code></td>
        <td><code>"prepLoop.slots"</code></td>
        <td>Array of available mock interview slot offers.</td>
      </tr>
      <tr>
        <td><code>KEYS.bookings</code></td>
        <td><code>"prepLoop.bookings"</code></td>
        <td>Array of confirmed/done/cancelled peer interview bookings.</td>
      </tr>
      <tr>
        <td><code>KEYS.users</code></td>
        <td><code>"prepLoop.users"</code></td>
        <td>Array of registered local user accounts.</td>
      </tr>
      <tr>
        <td><code>KEYS.currentUser</code></td>
        <td><code>"prepLoop.currentUser"</code></td>
        <td>Active logged-in user account object.</td>
      </tr>
      <tr>
        <td><code>KEYS.csCoreProgress</code></td>
        <td><code>"prepLoop.csCoreProgress"</code></td>
        <td>User-scoped dictionary of completed topics, bookmarks, and notes.</td>
      </tr>
      <tr>
        <td><code>KEYS.gfgCache</code></td>
        <td><code>"prepLoop.gfgCache"</code></td>
        <td>Cached GFG stats and heatmap payload to minimize API calls.</td>
      </tr>
    </tbody>
  </table>

  <h3 class="sub-title">Function Breakdown in storage.js</h3>

  <div class="avoid-break">
    <h4 class="func-title">1. readJSON(key, fallback) & writeJSON(key, value) <span class="func-tag">Core Persistence</span></h4>
    <p><strong>Signature:</strong> <code>readJSON(key: string, fallback: any): any</code> & <code>writeJSON(key: string, value: any): void</code></p>
    <p><strong>What they do:</strong> <code>readJSON</code> safely reads and parses data from <code>localStorage</code> wrapped in a <code>try...catch</code> block to prevent application crashes if stored data is corrupted or invalid JSON. <code>writeJSON</code> serializes objects with <code>JSON.stringify</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">2. readArray(key) & writeArray(key, value) <span class="func-tag">Array Safety</span></h4>
    <p><strong>Signature:</strong> <code>readArray(key: string): Array</code> & <code>writeArray(key: string, value: Array): void</code></p>
    <p><strong>What they do:</strong> Guarantees that array-based data (questions, slots, bookings) always returns a valid JavaScript Array instance via <code>Array.isArray(value)</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">3. Core CS Progress Methods <span class="func-tag">User Scoping</span></h4>
    <p>
      <code>getCsUserKey()</code> dynamically resolves an isolation key for the current user (using account ID, email, or guest handle).
      Methods <code>getCsCoreProgress()</code>, <code>setCsCoreProgress()</code>, <code>toggleCsTopicComplete()</code>, <code>toggleCsTopicBookmark()</code>, and <code>saveCsTopicNotes()</code> ensure that each user's Striver's sheet checklist, bookmarks, and rich notes are stored independently without overwriting other accounts.
    </p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">4. uid() <span class="func-tag">Unique Identifier Generator</span></h4>
    <p><strong>Signature:</strong> <code>uid(): string</code></p>
    <p><strong>What it does:</strong> Generates RFC4122-compliant UUIDs for questions, slots, bookings, and user accounts.</p>
    <p><strong>How it works:</strong> Prioritizes the native browser Web Crypto API <code>crypto.randomUUID()</code>; falls back gracefully to <code>Date.now() + "-" + Math.random().toString(36).slice(2)</code> on legacy environments.</p>
  </div>

  <div class="page-break"></div>

  <!-- ============================================================ -->
  <!-- SECTION 5: CS_SHEETS_DATA.JS DEEP DIVE                       -->
  <!-- ============================================================ -->
  <h2 class="section-title">5. cs_sheets_data.js — Curated Core CS Dataset Module</h2>
  <p>
    <strong>File Path:</strong> <code>cs_sheets_data.js</code> &bull; <strong>Size:</strong> ~21.5 KB &bull; <strong>Lines:</strong> 403 lines<br>
    <strong>Domain:</strong> Complete repository of high-yield interview topics modeled after Striver's (takeUforward) Core CS sheets for Operating Systems, Database Management Systems, and Computer Networks.
  </p>

  <h3 class="sub-title">Topic Object Schema</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Example / Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>id</code></td>
        <td><code>string</code></td>
        <td><code>"os_cpu_scheduling"</code>, <code>"dbms_acid_properties"</code>, <code>"cn_tcp_vs_udp"</code></td>
      </tr>
      <tr>
        <td><code>subject</code></td>
        <td><code>string</code></td>
        <td><code>"os"</code> | <code>"dbms"</code> | <code>"cn"</code></td>
      </tr>
      <tr>
        <td><code>category</code></td>
        <td><code>string</code></td>
        <td>Grouping within subject (e.g. "Concurrency Control", "Transport Layer", "Memory Management").</td>
      </tr>
      <tr>
        <td><code>title</code></td>
        <td><code>string</code></td>
        <td>Topic name (e.g. "TCP 3-Way Handshake & Connection Teardown").</td>
      </tr>
      <tr>
        <td><code>difficulty</code></td>
        <td><code>string</code></td>
        <td><code>"easy"</code> | <code>"medium"</code> | <code>"hard"</code></td>
      </tr>
      <tr>
        <td><code>isHighFrequency</code></td>
        <td><code>boolean</code></td>
        <td>Flag indicating if frequently asked in Tier-1 tech interviews (shows 🔥 badge).</td>
      </tr>
      <tr>
        <td><code>keyTakeaways</code></td>
        <td><code>string</code></td>
        <td>High-yield bullet points for quick revision before interviews.</td>
      </tr>
      <tr>
        <td><code>link</code></td>
        <td><code>string</code></td>
        <td>Direct link to takeUforward comprehensive article/video.</td>
      </tr>
    </tbody>
  </table>

  <h3 class="sub-title">Function Breakdown in cs_sheets_data.js</h3>
  <ul class="key-points">
    <li><strong><code>getSubjects()</code>:</strong> Returns the array of registered subjects (OS, DBMS, CN) with associated UI color tokens and emoji icons.</li>
    <li><strong><code>getAllTopics()</code>:</strong> Returns the complete array of all curated topics across all subjects.</li>
    <li><strong><code>getTopicsBySubject(subjectId)</code>:</strong> Filters the database by subject (e.g., <code>"os"</code>) or returns all topics if <code>subjectId === "all"</code>.</li>
    <li><strong><code>getTopicById(id)</code>:</strong> Performs $O(N)$ lookup using <code>Array.prototype.find</code> to retrieve a specific topic object by its unique ID.</li>
  </ul>

  <div class="page-break"></div>

  <!-- ============================================================ -->
  <!-- SECTION 6: APP.JS CONTROLLER DEEP DIVE                       -->
  <!-- ============================================================ -->
  <h2 class="section-title">6. app.js — Main UI Controller & Flow Engine</h2>
  <p>
    <strong>File Path:</strong> <code>app.js</code> &bull; <strong>Size:</strong> ~82.5 KB &bull; <strong>Lines:</strong> 2,235 lines<br>
    <strong>Domain:</strong> Central controller managing event delegation, UI rendering, API integrations, theme switching, modal dialogs, and user interaction.
  </p>

  <h3 class="sub-title">Exhaustive Breakdown of All Controller Functions</h3>

  <div class="avoid-break">
    <h4 class="func-title">1. applyTheme(theme) & toggleTheme() <span class="func-tag">Theme Controller</span></h4>
    <p><strong>What they do:</strong> <code>applyTheme</code> adds or removes the <code>theme-dark</code> CSS class on <code>document.body</code> and synchronizes the emoji icon (🌙 / ☀️) on both topbar and landing page theme buttons. <code>toggleTheme</code> inverts the theme in <code>PrepStorage</code> and calls <code>applyTheme</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">2. escapeHtml(text) <span class="func-tag">Security & Sanitization</span></h4>
    <p><strong>What it does:</strong> Prevents <strong>Cross-Site Scripting (XSS)</strong> attacks. Sanitizes user input before rendering inside template strings by replacing <code>&amp;</code> &rarr; <code>&amp;amp;</code>, <code>&lt;</code> &rarr; <code>&amp;lt;</code>, <code>&gt;</code> &rarr; <code>&amp;gt;</code>, <code>"</code> &rarr; <code>&amp;quot;</code>, <code>'</code> &rarr; <code>&amp;#039;</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">3. showToast(message) <span class="func-tag">UI Feedback</span></h4>
    <p><strong>What it does:</strong> Displays a non-blocking toast notification at the bottom of the screen. Manages a timer with <code>clearTimeout(toastTimer)</code> and <code>setTimeout</code> to automatically dismiss after 3.5 seconds.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">4. getTagPill(tag) & getDifficultyPill(difficulty) <span class="func-tag">Badge Generators</span></h4>
    <p><strong>What they do:</strong> Generates semantic, color-coded HTML pill badges for question tags (<strong>DSA</strong>, <strong>DBMS</strong>, <strong>CN</strong>, <strong>OS</strong>) and difficulty levels (<strong>Easy</strong>, <strong>Medium</strong>, <strong>Hard</strong>).</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">5. showLandingScreen(), showAuthScreen(mode), showAppScreen() <span class="func-tag">Screen State Switcher</span></h4>
    <p><strong>What they do:</strong> Toggles the <code>hidden</code> attribute on <code>#landing-screen</code>, <code>#auth-screen</code>, and <code>#app-page</code>. <code>showLandingScreen</code> dynamically updates the CTA button to say <em>"Go to Dashboard (Name) &rarr;"</em> if a user is already logged in. <code>showAppScreen</code> sets the identity and triggers <code>renderAll()</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">6. handleLogin(event), handleSignup(event), handleLogout() <span class="func-tag">Authentication Handlers</span></h4>
    <p><strong>What they do:</strong></p>
    <ul class="key-points">
      <li><code>handleLogin</code>: Validates entered email/password against stored accounts in <code>PrepStorage.getUsers()</code>, sets current user, and transitions to workspace.</li>
      <li><code>handleSignup</code>: Validates mandatory fields (Name, Email, Password, University, Course, Year) and optional handles (LeetCode, GFG). Creates user object, stores it in <code>PrepStorage</code>, sets as active session, and redirects to dashboard.</li>
      <li><code>handleLogout</code>: Clears session, resets input forms, clears platform caches, and returns user to <code>#landing-screen</code>.</li>
    </ul>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">7. renderProfileCard(questions, bookings, slots) & openProfileEditor() <span class="func-tag">Profile Management</span></h4>
    <p><strong>What they do:</strong> Renders the user's avatar, academic profile details, LeetCode/GFG handles, and computes real-time statistics (total questions logged, reviews due today, slots hosted, sessions attended). <code>openProfileEditor</code> opens a <code>&lt;dialog&gt;</code> modal to edit photo, handles, and bio.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">8. saveProfile(event) & finishSave(profilePhoto) <span class="func-tag">FileReader & Async Upload</span></h4>
    <p><strong>What they do:</strong> Handles profile form submission. If the user selected a new profile picture, it uses the <strong>HTML5 <code>FileReader</code> API</strong> (<code>readAsDataURL</code>) to convert the image file asynchronously into a Base64 encoded string before saving to <code>localStorage</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">9. renderLeetCodeProgress() & refreshLeetCodeProgress() <span class="func-tag">LeetCode Integration</span></h4>
    <p><strong>What they do:</strong> Fetches and embeds a live SVG statistical card from <code>https://leetcode-stats-api.herokuapp.com/</code>. Appends a timestamp query string (<code>?v=Date.now()</code>) for cache-busting on manual refresh.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">10. fetchGfgEndpoint(path), fetchGfgUser(username), loadGfgProgress() <span class="func-tag">GFG Heatmap Pipeline</span></h4>
    <p><strong>What they do:</strong> Multi-proxy resilient data fetcher for GeeksforGeeks. Tries primary and mirror endpoints (<code>https://gfg-stats-api.vercel.app</code> and <code>https://gfg-stats.tashif.codes</code>). Implements in-memory/localStorage caching via <code>getGfgCache</code> to avoid rate limiting.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">11. generateGfgHeatmapSvg(username, stats, heatmap) <span class="func-tag">Client-Side SVG Engine</span></h4>
    <p><strong>What it does:</strong> Dynamically generates a complete 52-week vector SVG contribution heatmap (365 days &times; 7 rows) in pure JavaScript without any external charting library! Calculates box coordinates, scales contribution counts, and maps color intensities accurately.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">12. renderDashboardCsProgress() & renderCsCore() <span class="func-tag">Striver's Sheets Controller</span></h4>
    <p><strong>What they do:</strong> <code>renderDashboardCsProgress</code> calculates percentage readiness across OS, DBMS, and CN to render the dashboard progress score. <code>renderCsCore</code> renders the full interactive checklist with subject tabs, difficulty filters, search bar, completion toggles, bookmarks, and collapsible notes drawer.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">13. addCsTopicToSm2(topicId) <span class="func-tag">Cross-Module Integration</span></h4>
    <p><strong>What it does:</strong> Allows 1-click synchronization of any CS sheet concept into the Spaced Repetition review loop. Automatically tags the question with the respective subject (<code>OS</code>, <code>DBMS</code>, <code>CN</code>) and links it via <code>PrepStorage.linkCsTopicToSm2</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">14. renderQuestions() & onQuestionSubmit(event) <span class="func-tag">Questions Tab</span></h4>
    <p><strong>What they do:</strong> <code>renderQuestions</code> renders the Spaced Repetition review queue table, displaying Topic, Tag, Difficulty, Ease Factor, Interval, Next Review Date (with <code>due</code> highlight), and Attempt count. <code>onQuestionSubmit</code> deduplicates topics case-insensitively and triggers <code>SM2.recalculate()</code>.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">15. getGridCell(...) & renderSchedule() <span class="func-tag">Calendar Grid Matrix</span></h4>
    <p><strong>What they do:</strong> Renders the 7-day weekly schedule grid. For every cell (Day &times; Time), <code>getGridCell</code> determines one of 4 mutually exclusive states:</p>
    <ol class="key-points">
      <li><strong>Empty:</strong> Slot available for host to offer (click cell to prefill offer form).</li>
      <li><strong>Open:</strong> Offered by another user &rarr; shows <code>Book</code> button.</li>
      <li><strong>Mine:</strong> Offered by current user &rarr; shows <code>Hosting</code> badge and <code>Remove</code> button.</li>
      <li><strong>Booked:</strong> Confirmed peer session &rarr; shows participants and confirmed status.</li>
    </ol>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">16. tryBooking(slotId), markDone(id), openFeedback(id), saveFeedback(event) <span class="func-tag">Mock Workflow</span></h4>
    <p><strong>What they do:</strong> <code>tryBooking</code> executes double-booking and self-booking verification before confirming. <code>markDone</code> guards session completion with <code>Scheduler.isSessionPast()</code>. <code>openFeedback</code> and <code>saveFeedback</code> manage the peer rubric modal with interactive range sliders for 5 scoring criteria.</p>
  </div>

  <div class="avoid-break">
    <h4 class="func-title">17. switchTab(tabName), renderAll(), initialize() <span class="func-tag">Lifecycle & Bootstrap</span></h4>
    <p><strong>What they do:</strong> <code>switchTab</code> handles tab navigation and ARIA attributes. <code>renderAll</code> triggers a complete reactive update across all active panels. <code>initialize</code> registers global event delegation listeners and displays the landing screen.</p>
  </div>

  <div class="page-break"></div>

  <!-- ============================================================ -->
  <!-- SECTION 7: GENERAL JS VIVA QUESTIONS                         -->
  <!-- ============================================================ -->
  <h2 class="section-title">7. General JavaScript Viva Questions & Answers</h2>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge">Core Engine</span> Q1: Explain the JavaScript Event Loop. What is the difference between Microtasks and Macrotasks?</div>
    <div class="qa-answer">
      <p>JavaScript is <strong>single-threaded</strong> and uses an event-driven concurrency model composed of:</p>
      <ul>
        <li><strong>Call Stack:</strong> Executes synchronous function calls in LIFO order.</li>
        <li><strong>Web APIs:</strong> Browser background threads handling timers (<code>setTimeout</code>), network requests (<code>fetch</code>), and DOM events.</li>
        <li><strong>Microtask Queue:</strong> High-priority queue for <code>Promise.then()</code>, <code>async/await</code> continuations, and <code>queueMicrotask</code>.</li>
        <li><strong>Macrotask Queue (Task Queue):</strong> Standard queue for <code>setTimeout</code>, <code>setInterval</code>, and DOM event callbacks.</li>
      </ul>
      <p><strong>Execution Rule:</strong> When the Call Stack becomes empty, the Event Loop empties the <em>entire</em> Microtask Queue before picking the next single Macrotask.</p>
    </div>
  </div>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge">Closures</span> Q2: What is a Closure in JavaScript and how is it used in PrepLoop?</div>
    <div class="qa-answer">
      <p>A <strong>closure</strong> is the combination of a function bundled together with references to its surrounding lexical environment. A closure gives an inner function access to an outer function's scope even after the outer function has finished executing.</p>
      <p><strong>Usage in PrepLoop:</strong> The IIFE Module Pattern in <code>sm2.js</code>, <code>scheduler.js</code>, and <code>storage.js</code> uses closures to keep internal helper functions (e.g., <code>readJSON</code>, <code>formatDate</code>, <code>timeToMinutes</code>) private while exposing only a clean public interface.</p>
    </div>
  </div>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge">Scope</span> Q3: What are the differences between <code>var</code>, <code>let</code>, and <code>const</code>? What is the Temporal Dead Zone (TDZ)?</div>
    <div class="qa-answer">
      <ul>
        <li><code>var</code> is function-scoped, can be re-declared, and is hoisted with an initial value of <code>undefined</code>.</li>
        <li><code>let</code> and <code>const</code> are block-scoped (enclosed within <code>{ ... }</code>) and cannot be re-declared in the same scope.</li>
        <li><strong>Temporal Dead Zone (TDZ):</strong> The time span between entering the block scope and the variable declaration being evaluated. Accessing a <code>let</code> or <code>const</code> variable in the TDZ throws a <code>ReferenceError</code>.</li>
      </ul>
    </div>
  </div>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge">DOM</span> Q4: What is Event Delegation and why is it superior to attaching event listeners to every element?</div>
    <div class="qa-answer">
      <p><strong>Event Delegation</strong> is a technique where a single event listener is attached to a parent container rather than attaching individual listeners to multiple child elements. It relies on <strong>Event Bubbling</strong> (events propagating upwards through the DOM hierarchy).</p>
      <p><strong>Why PrepLoop uses it:</strong> For dynamic elements like the 52-week heatmap, schedule cells, and question table rows, attaching hundreds of listeners causes memory overhead. In <code>app.js</code>, we attach one listener to <code>#schedule-grid</code> and use <code>event.target.closest("[data-book-slot]")</code> to handle clicks efficiently.</p>
    </div>
  </div>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge">Async</span> Q5: What is the difference between Promises and <code>async/await</code>? How does error handling work?</div>
    <div class="qa-answer">
      <p><code>async/await</code> is syntactic sugar built on top of native JavaScript Promises. An <code>async</code> function always returns a Promise. The <code>await</code> operator pauses the execution of the async function non-blockingly until the Promise settles.</p>
      <p><strong>Error Handling:</strong> With <code>async/await</code>, synchronous and asynchronous errors are caught uniformly using standard <code>try...catch</code> blocks (as implemented in <code>fetchGfgEndpoint()</code> and <code>loadGfgProgress()</code>).</p>
    </div>
  </div>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge">Security</span> Q6: What is Cross-Site Scripting (XSS) and how does PrepLoop prevent it?</div>
    <div class="qa-answer">
      <p><strong>XSS (Cross-Site Scripting)</strong> occurs when malicious user-supplied scripts (e.g. <code>&lt;script&gt;stealData()&lt;/script&gt;</code>) are injected into the DOM and executed in other users' browsers.</p>
      <p><strong>Prevention in PrepLoop:</strong> All user-supplied text strings (topics, handles, names, notes) are sanitized through the <code>escapeHtml()</code> utility function before being injected into HTML template literals.</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ============================================================ -->
  <!-- SECTION 8: PROJECT SPECIFIC VIVA QUESTIONS                   -->
  <!-- ============================================================ -->
  <h2 class="section-title">8. Project-Specific Viva Questions on PrepLoop</h2>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge badge-teal">Algorithm</span> Q1: Why did you choose the SuperMemo-2 (SM-2) algorithm and how is it simplified?</div>
    <div class="qa-answer">
      <p>Standard flashcard systems use fixed intervals (e.g. 3 days), which lead to over-reviewing easy topics or forgetting hard ones. SM-2 models human memory decay (the Ebbinghaus Forgetting Curve).</p>
      <p>In our simplified implementation, binary feedback (Solved / Missed) adjusts the Ease Factor ($+0.1$ / $-0.2$), guaranteeing that well-understood topics exponentially space out (e.g. 1d &rarr; 3d &rarr; 7d &rarr; 18d) while failed topics reset immediately to 1 day.</p>
    </div>
  </div>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge badge-slate">Architecture</span> Q2: What are the advantages and limitations of a Local-First architecture?</div>
    <div class="qa-answer">
      <p><strong>Advantages:</strong></p>
      <ul>
        <li><strong>Zero Latency:</strong> All reads and writes occur directly in local memory.</li>
        <li><strong>Offline-First:</strong> Works without an active internet connection.</li>
        <li><strong>Privacy:</strong> User credentials, notes, and schedules remain on the user's device.</li>
      </ul>
      <p><strong>Limitations & Mitigations:</strong> <code>localStorage</code> has a ~5MB quota per origin and is limited to string data. We mitigate this by keeping data models lean and serializing only essential metadata.</p>
    </div>
  </div>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge badge-amber">Scheduling</span> Q3: How does the Conflict Resolution Algorithm prevent double booking in the peer mock scheduler?</div>
    <div class="qa-answer">
      <p>In <code>scheduler.js</code>, <code>personHasConflict(data, personName, day, time)</code> performs a bi-directional check:</p>
      <ol>
        <li>It checks whether the user is already hosting a confirmed session at that day/time.</li>
        <li>It checks whether the user is already booked as a guest requester at that day/time.</li>
      </ol>
      <p>If either condition is met, <code>tryBooking()</code> aborts and displays a warning toast, guaranteeing zero schedule overlaps.</p>
    </div>
  </div>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge badge-purple">Graphic Engine</span> Q4: How does the dynamic GeeksforGeeks SVG Heatmap generator work without external libraries?</div>
    <div class="qa-answer">
      <p>In <code>generateGfgHeatmapSvg()</code>, we programmatically construct an SVG XML string:</p>
      <ul>
        <li>Calculates a 52-column grid representing the 52 weeks of the year ($x = \text{week} \times 14$).</li>
        <li>Calculates 7 rows representing days of the week ($y = \text{day} \times 14$).</li>
        <li>Normalizes the daily submission count to select an appropriate green hue class (<code>#1E4033</code> &rarr; <code>#68C49A</code>).</li>
        <li>Wraps the SVG in an accessible container with title tooltips and summary metrics.</li>
      </ul>
    </div>
  </div>

  <div class="qa-card avoid-break">
    <div class="qa-question"><span class="qa-badge badge-teal">Meeting Guard</span> Q5: Why can't a host mark a session "Done" before the meeting concludes?</div>
    <div class="qa-answer">
      <p>To ensure academic evaluation integrity, <code>Scheduler.isSessionPast(day, timeStr, durationMinutes)</code> checks whether the current clock time has exceeded the session start time plus duration. If the session is still upcoming or ongoing, the "Mark Done" button is locked and displays <code>Mark done (Pending)</code> with a tooltip explaining that feedback can only be submitted post-meeting.</p>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SECTION 9: VIVA CHEAT SHEET                                  -->
  <!-- ============================================================ -->
  <div class="page-break"></div>
  <h2 class="section-title">9. Viva Quick-Reference Cheat Sheet</h2>

  <table class="data-table">
    <thead>
      <tr>
        <th>Module / Concept</th>
        <th>Key Functions / APIs</th>
        <th>One-Liner Explanation for Examiner</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>SM-2 Engine</strong></td>
        <td><code>recalculate()</code>, <code>newQuestion()</code></td>
        <td>Calculates spaced repetition review dates by dynamically updating Ease Factor and expanding day intervals.</td>
      </tr>
      <tr>
        <td><strong>Mock Scheduler</strong></td>
        <td><code>personHasConflict()</code>, <code>isSessionPast()</code></td>
        <td>Conflict-free weekly peer mock scheduler with bidirectional overlap prevention and post-meeting evaluation locks.</td>
      </tr>
      <tr>
        <td><strong>Storage Layer</strong></td>
        <td><code>readJSON()</code>, <code>writeJSON()</code>, <code>uid()</code></td>
        <td>Fault-tolerant LocalStorage wrapper with user-scoped isolation keys and crypto-secure UUID generation.</td>
      </tr>
      <tr>
        <td><strong>CS Sheets Data</strong></td>
        <td><code>getTopicsBySubject()</code>, <code>getTopicById()</code></td>
        <td>Curated Striver's TakeUforward interview question dataset for OS, DBMS, and CN with 1-click SM-2 sync.</td>
      </tr>
      <tr>
        <td><strong>UI Controller</strong></td>
        <td><code>renderAll()</code>, <code>switchTab()</code>, <code>showToast()</code></td>
        <td>Single-page application coordinator using Event Delegation, XSS sanitization, and reactive DOM updates.</td>
      </tr>
      <tr>
        <td><strong>GFG Heatmap</strong></td>
        <td><code>generateGfgHeatmapSvg()</code></td>
        <td>Client-side pure JavaScript vector SVG generator rendering a 52-week Git-style contribution heatmap.</td>
      </tr>
      <tr>
        <td><strong>Profile System</strong></td>
        <td><code>saveProfile()</code>, <code>FileReader</code></td>
        <td>Local user profiles with Base64 asynchronous photo encoding and academic credential synchronization.</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 30px; padding: 16px; background: var(--teal-soft); border-radius: 8px; text-align: center; border: 1px solid rgba(47,111,94,0.2);">
    <strong style="color: var(--teal); font-size: 11pt; font-family: 'Fraunces', serif;">Best of Luck with Your Viva Examination!</strong>
    <p style="font-size: 9.5pt; color: var(--ink-soft); margin-top: 4px;">PrepLoop is a fully realized, production-quality local-first engineering project. Answer with confidence!</p>
  </div>

</body>
</html>`;

const htmlPath = path.join(__dirname, 'viva_guide.html');
const pdfPath = path.join(__dirname, 'PrepLoop_Comprehensive_Viva_Guide.pdf');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Saved HTML to ' + htmlPath);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (fs.existsSync(chromePath)) {
  console.log('Rendering PDF via Headless Chrome...');
  try {
    const cmd = `"${chromePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\\\/g, '/')}"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log('Successfully generated: ' + pdfPath);
  } catch (err) {
    console.error('Error generating PDF:', err);
  }
} else {
  console.log('Chrome not found at expected path.');
}

