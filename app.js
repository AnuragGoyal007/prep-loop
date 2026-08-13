/* DOM wiring only. Algorithms live in sm2.js and scheduler.js. */
(() => {
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);
  const nameKey = name => String(name || '').trim().toLocaleLowerCase();
  const today = () => SM2.today();
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

  function renderDashboard() {
    const { questions, slots, bookings } = state(); const date = today(); const due = questions.filter(question => question.nextReviewDate <= date).sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
    $('#due-count').textContent = due.length; renderHorizon(questions);
    $('#due-list').innerHTML = due.length ? due.map(question => `<div class="list-row"><div class="list-primary"><span>${escapeHtml(question.topic)}</span><div class="list-meta">EF ${Number(question.easeFactor).toFixed(2)} · ${escapeHtml(question.difficulty)}</div></div>${difficultyPill(question.difficulty)}</div>`).join('') : emptyState('Nothing due — you’re caught up.');
    const user = currentUser(); const currentDay = Scheduler.weekdayShort();
    const sessions = user ? bookings.filter(booking => booking.status !== 'cancelled').map(booking => ({ booking, slot: slots.find(slot => slot.id === booking.slotId) })).filter(item => item.slot && item.slot.day === currentDay && (Scheduler.samePerson(item.slot.hostName, user) || Scheduler.samePerson(item.booking.requesterName, user))) : [];
    $('#sessions-count').textContent = sessions.length;
    $('#sessions-list').innerHTML = sessions.length ? sessions.sort((a, b) => Scheduler.TIMES.indexOf(a.slot.time) - Scheduler.TIMES.indexOf(b.slot.time)).map(({ booking, slot }) => { const hosting = Scheduler.samePerson(slot.hostName, user); const other = hosting ? booking.requesterName : slot.hostName; return `<div class="list-row"><div class="list-primary"><span>${escapeHtml(slot.time)} with ${escapeHtml(other)}</span><div class="list-meta">${hosting ? 'hosting' : 'attending'}</div></div><span class="status-word">${hosting ? 'host' : 'guest'}</span></div>`; }).join('') : emptyState(user ? 'No sessions today. Book one from the Schedule tab.' : 'Add your name above to see your sessions.');
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
    } else {
      showAuthScreen();
      switchAuthMode('login');
    }

    renderAll();
  }
  initialize();
})();