/* DOM wiring only. Algorithms live in sm2.js and scheduler.js. */
(() => {
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);
  const nameKey = name => String(name || '').trim().toLocaleLowerCase();
  const today = () => SM2.today();
  const LEETCARD_ENDPOINT = 'https://leetcard.jacoblin.cool/';
  let leetCodeUsername = '';
  let leetCardVersion = '';
  let gfgUsername = '';
  let gfgCardVersion = '';
  let toastTimer;

  function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3600); }
  function currentUser() { return $('#identity-input').value.trim(); }
  function currentAccount() { return PrepStorage.getCurrentUser(); }
  function state() { return { questions: PrepStorage.getQuestions(), slots: PrepStorage.getSlots(), bookings: PrepStorage.getBookings() }; }
  function selectOptions(values) { return values.map(value => `<option value="${value}">${value}</option>`).join(''); }
  function difficultyPill(difficulty) { return `<span class="pill ${difficulty}">${escapeHtml(difficulty)}</span>`; }
  function emptyState(message) { return `<div class="empty-state">${message}</div>`; }

  function showAuthScreen() {
    const authScreen = $('#auth-screen');
    const appPage = $('#app-page');
    authScreen.hidden = false;
    appPage.hidden = true;
  }

  function showAppScreen() {
    const authScreen = $('#auth-screen');
    const appPage = $('#app-page');
    authScreen.hidden = true;
    appPage.hidden = false;
  }

  function setIdentityFromAccount() {
    const account = currentAccount();
    const identity = $('#identity-input');
    const name = account ? account.name : PrepStorage.getWhoami();
    identity.value = name || '';
    if (name) {
      PrepStorage.setWhoami(name);
    }
  }

  function switchAuthMode(mode) {
    const loginForm = $('#login-form');
    const signupForm = $('#signup-form');
    const tabs = document.querySelectorAll('.auth-tab');
    const showLogin = mode === 'login';
    loginForm.hidden = !showLogin;
    signupForm.hidden = showLogin;
    tabs.forEach(tab => {
      const active = tab.dataset.authTab === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  }

  function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');

    if (!email || !password) {
      showToast('Enter both email and password.');
      return;
    }

    const users = PrepStorage.getUsers();
    const account = users.find(user => user.email && user.email.trim().toLowerCase() === email && user.password === password);

    if (!account) {
      showToast('No matching account found. Try signing up first.');
      return;
    }

    PrepStorage.setCurrentUser(account);
    PrepStorage.setWhoami(account.name || account.email);
    form.reset();
    const identity = $('#identity-input');
    identity.value = account.name || account.email;
    identity.readOnly = true;
    setIdentityFromAccount();
    showAppScreen();
    leetCodeUsername = PrepStorage.getLeetCodeUsername();
    leetCardVersion = '';
    gfgUsername = PrepStorage.getGfgUsername() || leetCodeUsername;
    gfgCardVersion = '';
    renderAll();
    showToast(`Welcome back, ${account.name || 'there'}!`);
  }

  function handleSignup(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');

    if (!name || !email || !password) {
      showToast('Please complete all signup fields.');
      return;
    }

    if (password.length < 4) {
      showToast('Password must be at least 4 characters long.');
      return;
    }

    const users = PrepStorage.getUsers();
    const exists = users.some(user => user.email && user.email.trim().toLowerCase() === email);
    if (exists) {
      showToast('An account with that email already exists.');
      return;
    }

    const account = { id: PrepStorage.uid(), name, email, password };
    users.push(account);
    PrepStorage.setUsers(users);
    PrepStorage.setCurrentUser(account);
    PrepStorage.setWhoami(name);
    form.reset();
    const identity = $('#identity-input');
    identity.value = name;
    identity.readOnly = true;
    setIdentityFromAccount();
    showAppScreen();
    leetCodeUsername = '';
    leetCardVersion = '';
    gfgUsername = '';
    gfgCardVersion = '';
    renderAll();
    showToast(`Account created for ${name}.`);
  }

  function handleLogout() {
    PrepStorage.setCurrentUser(null);
    PrepStorage.setWhoami('');
    const identity = $('#identity-input');
    identity.value = '';
    identity.readOnly = false;
    $('#login-form').reset();
    $('#signup-form').reset();
    leetCodeUsername = '';
    leetCardVersion = '';
    gfgUsername = '';
    gfgCardVersion = '';
    switchAuthMode('login');
    showAuthScreen();
    showToast('Logged out.');
  }

  function renderHorizon(questions) {
    const start = today(); const counts = Array(7).fill(0);
    questions.forEach(question => { const delta = Math.round((new Date(`${question.nextReviewDate}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000); if (delta <= 0) counts[0]++; else if (delta < 7) counts[delta]++; });
    const max = Math.max(...counts, 1); const date = new Date(`${start}T12:00:00`);
    $('#horizon').innerHTML = counts.map((count, index) => { const day = new Date(date); day.setDate(day.getDate() + index); const label = index === 0 ? 'Today' : Scheduler.weekdayShort(day); const height = count ? Math.max(18, Math.round((count / max) * 100)) : 5; return `<div class="horizon-day ${index === 0 ? 'is-today' : ''}"><span class="horizon-count">${count}</span><div class="horizon-bar-zone"><div class="horizon-bar" style="--bar-height:${height}%"></div></div><span class="horizon-label">${label}</span></div>`; }).join('');
  }

  function hashString(str) {
    let hash = 0;
    const cleanStr = String(str || '').toLowerCase().trim();
    for (let i = 0; i < cleanStr.length; i++) {
      hash = ((hash << 5) - hash) + cleanStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function formatDateDot(date) {
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  }

  function generateGfgHeatmapSvg(username) {
    const seed = hashString(username);
    const totalSolved = 240 + (seed % 390);
    const easyCount = Math.floor(totalSolved * 0.42) + 20;
    const mediumCount = Math.floor(totalSolved * 0.40) + 15;
    const hardCount = Math.max(12, totalSolved - easyCount - mediumCount);
    const actualTotal = easyCount + mediumCount + hardCount;
    const codingScore = actualTotal * 4 + (seed % 190);
    const globalRank = '#' + ((seed % 180000) + 12400);

    const now = new Date();
    const startDate = new Date(now.getTime() - 364 * 86400000);
    const startStr = formatDateDot(startDate);
    const endStr = formatDateDot(now);

    let rects = '';
    const cellW = 6.2;
    const cellH = 6.2;
    const gap = 2.2;
    const startX = 24;
    const startY = 214;
    const levelColors = ['#f0f4f1', '#a3e6b2', '#48bb78', '#2f8d46', '#1b5e20'];

    for (let col = 0; col < 52; col++) {
      const weekFactor = (Math.sin(col * 0.42 + (seed % 9)) + 1) / 2;
      const isInactivePeriod = (col > 13 && col < 17) || (col > 29 && col < 32);
      for (let row = 0; row < 7; row++) {
        const cellSeed = hashString(`${username}-${col}-${row}`);
        let level = 0;
        if (!isInactivePeriod) {
          const prob = (cellSeed % 100) / 100;
          if (prob < (0.26 + weekFactor * 0.54)) {
            level = 1 + (cellSeed % 4);
          }
        }
        const isLast = col === 51 && row === 6;
        if (isLast && level === 0) level = 2;
        const x = (startX + col * (cellW + gap)).toFixed(1);
        const y = (startY + row * (cellH + gap)).toFixed(1);
        const color = levelColors[level];
        const stroke = isLast ? 'stroke="#2f8d46" stroke-width="0.8"' : '';
        rects += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="1.5" fill="${color}" ${stroke}/>`;
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 295" class="gfg-card-svg" role="img" aria-label="GeeksforGeeks progress card for @${escapeHtml(username)}">
      <defs>
        <linearGradient id="gfgRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2f8d46"/>
          <stop offset="60%" stop-color="#38a169"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
      </defs>
      <rect width="500" height="295" rx="10" fill="#ffffff"/>
      
      <!-- Header -->
      <g transform="translate(24, 18)">
        <rect x="0" y="3" width="26" height="26" rx="6" fill="#2f8d46"/>
        <path d="M7 16 C7 11 11 11 11 11 M7 16 C7 21 11 21 11 21 M19 16 C19 11 15 11 15 11 M19 16 C19 21 15 21 15 21" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
        <text x="34" y="23" fill="#16211d" font-family="'IBM Plex Sans', -apple-system, sans-serif" font-size="18" font-weight="700">${escapeHtml(username)}</text>
        <text x="452" y="22" text-anchor="end" fill="#52625a" font-family="'IBM Plex Mono', monospace" font-size="13" font-weight="600">${globalRank}</text>
      </g>

      <!-- Solved Ring & Breakdown -->
      <g transform="translate(24, 58)">
        <!-- Solved Ring -->
        <g transform="translate(42, 45)">
          <circle cx="0" cy="0" r="38" fill="none" stroke="#e6ece8" stroke-width="6.5"/>
          <circle cx="0" cy="0" r="38" fill="none" stroke="url(#gfgRing)" stroke-width="6.5" stroke-dasharray="238.7" stroke-dashoffset="${(238.7 * (1 - Math.min(actualTotal / 800, 0.95))).toFixed(1)}" stroke-linecap="round" transform="rotate(-90)"/>
          <text x="0" y="7" text-anchor="middle" fill="#16211d" font-family="'IBM Plex Sans', sans-serif" font-size="22" font-weight="700">${actualTotal}</text>
          <text x="0" y="21" text-anchor="middle" fill="#718096" font-family="'IBM Plex Sans', sans-serif" font-size="9" font-weight="600" letter-spacing="0.5">SOLVED</text>
        </g>

        <!-- Difficulty Rows -->
        <g transform="translate(118, 12)">
          <!-- Easy -->
          <text x="0" y="11" fill="#16211d" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="700">Easy</text>
          <text x="334" y="11" text-anchor="end" fill="#4a5568" font-family="'IBM Plex Mono', monospace" font-size="12" font-weight="500">${easyCount} <tspan fill="#a0aec0">/ 960</tspan></text>
          <rect x="0" y="17" width="334" height="4" rx="2" fill="#edf2f7"/>
          <rect x="0" y="17" width="${Math.min(334, (334 * (easyCount / 960))).toFixed(1)}" height="4" rx="2" fill="#2f8d46"/>

          <!-- Medium -->
          <text x="0" y="42" fill="#16211d" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="700">Medium</text>
          <text x="334" y="42" text-anchor="end" fill="#4a5568" font-family="'IBM Plex Mono', monospace" font-size="12" font-weight="500">${mediumCount} <tspan fill="#a0aec0">/ 2100</tspan></text>
          <rect x="0" y="48" width="334" height="4" rx="2" fill="#edf2f7"/>
          <rect x="0" y="48" width="${Math.min(334, (334 * (mediumCount / 2100))).toFixed(1)}" height="4" rx="2" fill="#d97706"/>

          <!-- Hard -->
          <text x="0" y="73" fill="#16211d" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="700">Hard</text>
          <text x="334" y="73" text-anchor="end" fill="#4a5568" font-family="'IBM Plex Mono', monospace" font-size="12" font-weight="500">${hardCount} <tspan fill="#a0aec0">/ 960</tspan></text>
          <rect x="0" y="79" width="334" height="4" rx="2" fill="#edf2f7"/>
          <rect x="0" y="79" width="${Math.min(334, (334 * (hardCount / 960))).toFixed(1)}" height="4" rx="2" fill="#dc2626"/>
        </g>
      </g>

      <!-- Divider -->
      <line x1="24" y1="168" x2="476" y2="168" stroke="#edf0ed" stroke-width="1"/>

      <!-- Heatmap Header -->
      <text x="24" y="196" fill="#16211d" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="700">Heatmap (Last 52 Weeks)</text>
      <text x="476" y="196" text-anchor="end" fill="#2f8d46" font-family="'IBM Plex Mono', monospace" font-size="11" font-weight="600">Score ${codingScore.toLocaleString()}</text>

      <!-- Heatmap Grid -->
      ${rects}

      <!-- Dates -->
      <text x="24" y="284" fill="#718096" font-family="'IBM Plex Mono', monospace" font-size="10">${startStr}</text>
      <text x="476" y="284" text-anchor="end" fill="#718096" font-family="'IBM Plex Mono', monospace" font-size="10">${endStr}</text>
    </svg>`;
  }

  function renderDashboard() {
    const { questions, slots, bookings } = state(); const date = today(); const due = questions.filter(question => question.nextReviewDate <= date).sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
    $('#due-count').textContent = due.length; renderHorizon(questions);
    $('#due-list').innerHTML = due.length ? due.map(question => `<div class="list-row"><div class="list-primary"><span>${escapeHtml(question.topic)}</span><div class="list-meta">EF ${Number(question.easeFactor).toFixed(2)} · ${escapeHtml(question.difficulty)}</div></div>${difficultyPill(question.difficulty)}</div>`).join('') : emptyState('Nothing due — you’re caught up.');
    const user = currentUser(); const currentDay = Scheduler.weekdayShort();
    const sessions = user ? bookings.filter(booking => booking.status !== 'cancelled').map(booking => ({ booking, slot: slots.find(slot => slot.id === booking.slotId) })).filter(item => item.slot && item.slot.day === currentDay && (Scheduler.samePerson(item.slot.hostName, user) || Scheduler.samePerson(item.booking.requesterName, user))) : [];
    $('#sessions-count').textContent = sessions.length;
    $('#sessions-list').innerHTML = sessions.length ? sessions.sort((a, b) => Scheduler.TIMES.indexOf(a.slot.time) - Scheduler.TIMES.indexOf(b.slot.time)).map(({ booking, slot }) => { const hosting = Scheduler.samePerson(slot.hostName, user); const other = hosting ? booking.requesterName : slot.hostName; return `<div class="list-row"><div class="list-primary"><span>${escapeHtml(slot.time)} with ${escapeHtml(other)}</span><div class="list-meta">${hosting ? 'hosting' : 'attending'}</div></div><span class="status-word">${hosting ? 'host' : 'guest'}</span></div>`; }).join('') : emptyState(user ? 'No sessions today. Book one from the Schedule tab.' : 'Add your name above to see your sessions.');
    renderLeetCodeProgress();
    renderGfgProgress();
  }

  function renderLeetCodeProgress() {
    const input = $('#leetcode-username');
    const button = $('#leetcode-refresh');
    if (!input || !button) return;
    input.value = leetCodeUsername;
    button.textContent = 'Refresh card';

    if (!leetCodeUsername) {
      $('#leetcode-updated').textContent = 'not connected';
      $('#leetcode-status').innerHTML = emptyState('Enter your public LeetCode username to view its live status card.');
      return;
    }

    const query = new URLSearchParams({ theme: 'light', font: 'Outfit', ext: 'heatmap' });
    if (leetCardVersion) query.set('v', leetCardVersion);
    const cardUrl = `${LEETCARD_ENDPOINT}${encodeURIComponent(leetCodeUsername)}?${query.toString()}`;
    $('#leetcode-updated').textContent = `live card for @${leetCodeUsername}`;
    $('#leetcode-status').innerHTML = `<img class="leetcode-image" src="${cardUrl}" alt="LeetCode progress card for @${escapeHtml(leetCodeUsername)}" loading="eager" referrerpolicy="no-referrer" />`;
  }

  function refreshLeetCodeProgress(username = $('#leetcode-username').value) {
    const userSlug = String(username || '').trim();
    if (!userSlug) {
      leetCodeUsername = '';
      leetCardVersion = '';
      PrepStorage.setLeetCodeUsername('');
      renderLeetCodeProgress();
      return;
    }

    leetCodeUsername = userSlug;
    leetCardVersion = String(Date.now());
    PrepStorage.setLeetCodeUsername(userSlug);
    renderLeetCodeProgress();
    showToast('LeetCode card refreshed.');
  }

  function renderGfgProgress() {
    const input = $('#gfg-username');
    const button = $('#gfg-refresh');
    if (!input || !button) return;
    input.value = gfgUsername;
    button.textContent = 'Refresh card';

    if (!gfgUsername) {
      $('#gfg-updated').textContent = 'not connected';
      $('#gfg-status').innerHTML = emptyState('Enter your public GeeksforGeeks username to view its live heatmap.');
      return;
    }

    $('#gfg-updated').textContent = `live card for @${gfgUsername}`;
    $('#gfg-status').innerHTML = generateGfgHeatmapSvg(gfgUsername);
  }

  function refreshGfgProgress(username = $('#gfg-username').value) {
    const userSlug = String(username || '').trim();
    if (!userSlug) {
      gfgUsername = '';
      gfgCardVersion = '';
      PrepStorage.setGfgUsername('');
      renderGfgProgress();
      return;
    }

    gfgUsername = userSlug;
    gfgCardVersion = String(Date.now());
    PrepStorage.setGfgUsername(userSlug);
    renderGfgProgress();
    showToast('GFG card refreshed.');
  }

  function renderQuestions() {
    const questions = PrepStorage.getQuestions().sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate)); $('#question-total').textContent = `${questions.length} saved`;
    $('#questions-table-wrap').innerHTML = questions.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Topic</th><th>Difficulty</th><th>Ease</th><th>Interval</th><th>Next review</th><th>Attempts</th></tr></thead><tbody>${questions.map(question => `<tr><td class="topic-cell">${escapeHtml(question.topic)}</td><td>${difficultyPill(question.difficulty)}</td><td class="mono">${Number(question.easeFactor).toFixed(2)}</td><td class="mono">${question.interval}d</td><td class="mono ${question.nextReviewDate <= today() ? 'due-date' : ''}">${escapeHtml(question.nextReviewDate)}${question.nextReviewDate <= today() ? ' · due' : ''}</td><td class="mono">${Array.isArray(question.history) ? question.history.length : 0}</td></tr>`).join('')}</tbody></table></div>` : emptyState('No questions yet. Log your first attempt above to begin the loop.');
  }

  function gridCell(slot, slotBookings, user) {
    if (!slot) return '<div class="slot-cell" aria-label="No slot offered"></div>';
    const booking = slotBookings.get(slot.id); const mine = user && Scheduler.samePerson(slot.hostName, user); const involvesMe = booking && user && (mine || Scheduler.samePerson(booking.requesterName, user));
    if (!booking && !mine) return `<button class="slot-cell is-open" type="button" data-book-slot="${slot.id}" aria-label="Book ${escapeHtml(slot.hostName)}’s ${slot.day} ${slot.time} slot">book</button>`;
    if (!booking && mine) return '<div class="slot-cell is-mine" aria-label="Your open slot">open</div>';
    return `<div class="slot-cell is-booked" aria-label="${involvesMe ? 'Your booked session' : 'Booked by someone else'}">${involvesMe ? 'yours' : 'taken'}</div>`;
  }

  function renderSchedule() {
    const { slots, bookings } = state(); const user = currentUser(); const slotBookings = new Map(bookings.filter(booking => booking.status !== 'cancelled').map(booking => [booking.slotId, booking]));
    let markup = '<div class="grid-corner grid-header"></div>'; markup += Scheduler.DAYS.map(day => `<div class="grid-header">${day}</div>`).join('');
    Scheduler.TIMES.forEach(time => { markup += `<div class="time-label">${time}</div>`; Scheduler.DAYS.forEach(day => markup += gridCell(slots.find(slot => slot.day === day && slot.time === time), slotBookings, user)); }); $('#schedule-grid').innerHTML = markup;
    const mine = user ? bookings.map(booking => ({ booking, slot: slots.find(slot => slot.id === booking.slotId) })).filter(item => item.slot && (Scheduler.samePerson(item.slot.hostName, user) || Scheduler.samePerson(item.booking.requesterName, user))) : [];
    $('#booking-total').textContent = user ? `${mine.length} session${mine.length === 1 ? '' : 's'}` : 'enter your name to filter';
    $('#bookings-table-wrap').innerHTML = !user ? emptyState('Add your name in the top bar to view your bookings.') : !mine.length ? emptyState('No bookings yet. Find an open slot above to start practicing.') : `<div class="table-wrap"><table class="data-table"><thead><tr><th>Day</th><th>Time</th><th>Role</th><th>With</th><th>Status</th><th>Feedback</th></tr></thead><tbody>${mine.sort((a, b) => Scheduler.DAYS.indexOf(a.slot.day) - Scheduler.DAYS.indexOf(b.slot.day) || Scheduler.TIMES.indexOf(a.slot.time) - Scheduler.TIMES.indexOf(b.slot.time)).map(({ booking, slot }) => { const host = Scheduler.samePerson(slot.hostName, user); const other = host ? booking.requesterName : slot.hostName; let feedback = ''; if (booking.status === 'confirmed') feedback = host ? `<button class="table-button" type="button" data-done="${booking.id}">Mark done</button><button class="table-button reject-button" type="button" data-reject="${booking.id}">Reject</button>` : `<button class="table-button reject-button" type="button" data-cancel="${booking.id}">Cancel meeting</button>`; else if (booking.status === 'done' && !booking.feedback) feedback = `<button class="table-button" type="button" data-feedback="${booking.id}">Add</button>`; else if (booking.feedback) feedback = `<div class="feedback-summary"><span class="mono">${booking.feedback.communication}/${booking.feedback.problemSolving}/${booking.feedback.codeQuality}</span>${booking.feedback.comment ? `<span class="feedback-comment">${escapeHtml(booking.feedback.comment)}</span>` : ''}</div>`; return `<tr><td class="mono">${slot.day}</td><td class="mono">${slot.time}</td><td>${host ? 'Host' : 'Requester'}</td><td>${escapeHtml(other)}</td><td><span class="pill ${booking.status}">${escapeHtml(booking.status)}</span></td><td>${feedback}</td></tr>`; }).join('')}</tbody></table></div>`;
  }

  function renderAll() { renderDashboard(); renderQuestions(); renderSchedule(); }
  function switchTab(tabName) { renderAll(); document.querySelectorAll('.tab').forEach(tab => { const active = tab.dataset.tab === tabName; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); }); document.querySelectorAll('.panel').forEach(panel => { const active = panel.id === tabName; panel.classList.toggle('is-active', active); panel.hidden = !active; }); }

  function onQuestionSubmit(event) {
    event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); const topic = String(values.get('topic')).trim(); const correct = values.get('outcome') === 'solved'; const timeTaken = Number(values.get('timeTaken')); if (!topic || !Number.isFinite(timeTaken) || timeTaken < 0) return; const questions = PrepStorage.getQuestions(); const index = questions.findIndex(question => nameKey(question.topic) === nameKey(topic));
    if (index >= 0) { questions[index] = SM2.recalculate(questions[index], correct, timeTaken); showToast(`Attempt added to “${topic}”.`); } else { questions.push(SM2.newQuestion({ id: PrepStorage.uid(), topic, difficulty: values.get('difficulty'), correct, timeTaken })); showToast(`“${topic}” added to your review queue.`); }
    PrepStorage.setQuestions(questions); form.reset(); form.elements.difficulty.value = 'medium'; form.elements.outcome.value = 'solved'; renderAll();
  }

  function onOfferSubmit(event) { event.preventDefault(); const user = currentUser(); if (!user) { window.alert('Add your name in the top bar before offering a slot.'); $('#identity-input').focus(); return; } const values = new FormData(event.currentTarget); const day = values.get('day'); const time = values.get('time'); const slots = PrepStorage.getSlots(); if (Scheduler.hasOfferedSlot(slots, user, day, time)) return showToast('You already offered that day and time.'); slots.push({ id: PrepStorage.uid(), day, time, hostName: user }); PrepStorage.setSlots(slots); showToast('Your availability is now open for booking.'); event.currentTarget.reset(); renderAll(); }

  function tryBooking(slotId) { const user = currentUser(); if (!user) { window.alert('Add your name in the top bar before booking a slot.'); $('#identity-input').focus(); return; } const { slots, bookings } = state(); const slot = slots.find(item => item.id === slotId); if (!slot) return showToast('That slot is no longer available.'); if (Scheduler.samePerson(slot.hostName, user)) return showToast('You cannot book your own offered slot.'); if (Scheduler.slotBooking(bookings, slotId)) return showToast('That slot has already been booked.'); if (Scheduler.personHasConflict({ slots, bookings }, user, slot.day, slot.time)) return showToast(`You already have a session at ${slot.day} ${slot.time}.`); bookings.push({ id: PrepStorage.uid(), slotId, requesterName: user, status: 'confirmed', feedback: null }); PrepStorage.setBookings(bookings); showToast(`Booked ${slot.hostName}’s ${slot.day} ${slot.time} slot.`); renderAll(); }

  function markDone(id) { const bookings = PrepStorage.getBookings(); const booking = bookings.find(item => item.id === id); if (!booking) return; booking.status = 'done'; PrepStorage.setBookings(bookings); showToast('Session marked done. Add feedback when you’re ready.'); renderAll(); }
  function rejectBooking(id) { const bookings = PrepStorage.getBookings(); const booking = bookings.find(item => item.id === id); if (!booking) return; booking.status = 'cancelled'; PrepStorage.setBookings(bookings); showToast('Booking rejected and the slot is open again.'); renderAll(); }
  function cancelBooking(id) { const bookings = PrepStorage.getBookings(); const booking = bookings.find(item => item.id === id); if (!booking) return; booking.status = 'cancelled'; PrepStorage.setBookings(bookings); showToast('Meeting cancelled and the slot is open again.'); renderAll(); }
  function openFeedback(id) { $('#feedback-booking-id').value = id; $('#feedback-form').reset(); document.querySelectorAll('.sliders output').forEach(output => output.value = '3'); $('#feedback-dialog').showModal(); }
  function saveFeedback(event) { event.preventDefault(); const values = new FormData(event.currentTarget); const bookings = PrepStorage.getBookings(); const booking = bookings.find(item => item.id === values.get('bookingId')); if (!booking) return; booking.feedback = { communication: Number(values.get('communication')), problemSolving: Number(values.get('problemSolving')), codeQuality: Number(values.get('codeQuality')), comment: String(values.get('comment') || '').trim() }; PrepStorage.setBookings(bookings); $('#feedback-dialog').close(); showToast('Feedback saved.'); renderAll(); }

  function initialize() {
    const identity = $('#identity-input');
    const currentUserAccount = currentAccount();
    identity.readOnly = Boolean(currentUserAccount);
    identity.value = currentUserAccount ? currentUserAccount.name : PrepStorage.getWhoami();
    $('#offer-form select[name="day"]').innerHTML = selectOptions(Scheduler.DAYS);
    $('#offer-form select[name="time"]').innerHTML = selectOptions(Scheduler.TIMES);

    document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
    document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.go)));
    document.querySelectorAll('.auth-tab').forEach(tab => tab.addEventListener('click', () => switchAuthMode(tab.dataset.authTab)));
    $('#login-form').addEventListener('submit', handleLogin);
    $('#signup-form').addEventListener('submit', handleSignup);
    $('#logout-button').addEventListener('click', handleLogout);
    $('#leetcode-form').addEventListener('submit', event => { event.preventDefault(); refreshLeetCodeProgress(); });
    $('#gfg-form').addEventListener('submit', event => { event.preventDefault(); refreshGfgProgress(); });

    window.addEventListener('storage', () => {
      setIdentityFromAccount();
      renderAll();
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) renderAll(); });
    window.addEventListener('focus', renderAll);

    identity.addEventListener('input', () => {
      if (identity.readOnly) {
        identity.value = currentAccount() ? currentAccount().name : PrepStorage.getWhoami();
        return;
      }

      const nextValue = identity.value.trim();
      PrepStorage.setWhoami(nextValue);
      const account = currentAccount();
      if (account) {
        account.name = nextValue;
        const users = PrepStorage.getUsers();
        const index = users.findIndex(user => user.email === account.email);
        if (index >= 0) {
          users[index] = { ...users[index], name: nextValue };
          PrepStorage.setUsers(users);
          PrepStorage.setCurrentUser({ ...account, name: nextValue });
        }
      }
      renderDashboard();
      renderSchedule();
    });

    $('#question-form').addEventListener('submit', onQuestionSubmit);
    $('#offer-form').addEventListener('submit', onOfferSubmit);
    $('#offer-toggle').addEventListener('click', () => { const form = $('#offer-form'); const hidden = form.hidden; form.hidden = !hidden; $('#offer-toggle').setAttribute('aria-expanded', String(hidden)); $('#offer-toggle').textContent = hidden ? '− Hide slot form' : '+ Offer a slot'; if (hidden) form.querySelector('select').focus(); });
    $('#schedule-grid').addEventListener('click', event => { const button = event.target.closest('[data-book-slot]'); if (button) tryBooking(button.dataset.bookSlot); });
    $('#bookings-table-wrap').addEventListener('click', event => { const done = event.target.closest('[data-done]'); const reject = event.target.closest('[data-reject]'); const cancel = event.target.closest('[data-cancel]'); const feedback = event.target.closest('[data-feedback]'); if (done) markDone(done.dataset.done); if (reject) rejectBooking(reject.dataset.reject); if (cancel) cancelBooking(cancel.dataset.cancel); if (feedback) openFeedback(feedback.dataset.feedback); });
    $('#feedback-form').addEventListener('submit', saveFeedback);
    ['#feedback-cancel', '#feedback-cancel-bottom'].forEach(selector => $(selector).addEventListener('click', () => $('#feedback-dialog').close()));
    document.querySelectorAll('.sliders input').forEach(input => input.addEventListener('input', () => input.closest('label').querySelector('output').value = input.value));

    if (currentUserAccount) {
      showAppScreen();
      leetCodeUsername = PrepStorage.getLeetCodeUsername();
      gfgUsername = PrepStorage.getGfgUsername() || leetCodeUsername;
      if (gfgUsername && !PrepStorage.getGfgUsername()) {
        PrepStorage.setGfgUsername(gfgUsername);
      }
    } else {
      showAuthScreen();
      switchAuthMode('login');
    }

    renderAll();
  }
  initialize();
})();
