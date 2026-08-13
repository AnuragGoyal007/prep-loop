/* LocalStorage helpers. All reads degrade safely when storage is empty or malformed. */
const PrepStorage = (() => {
  const KEYS = {
    questions: 'prepLoop.questions',
    slots: 'prepLoop.slots',
    bookings: 'prepLoop.bookings',
    whoami: 'prepLoop.whoami',
    users: 'prepLoop.users',
    currentUser: 'prepLoop.currentUser'
  };

  function readJSON(key, fallback = []) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readArray(key) {
    const value = readJSON(key, []);
    return Array.isArray(value) ? value : [];
  }

  function writeArray(key, value) {
    writeJSON(key, value);
  }

  function getQuestions() { return readArray(KEYS.questions); }
  function setQuestions(value) { writeArray(KEYS.questions, value); }
  function getSlots() { return readArray(KEYS.slots); }
  function setSlots(value) { writeArray(KEYS.slots, value); }
  function getBookings() { return readArray(KEYS.bookings); }
  function setBookings(value) { writeArray(KEYS.bookings, value); }
  function getWhoami() { return localStorage.getItem(KEYS.whoami) || ''; }
  function setWhoami(value) { localStorage.setItem(KEYS.whoami, value); }
  function getUsers() { const value = readJSON(KEYS.users, []); return Array.isArray(value) ? value : []; }
  function setUsers(value) { writeJSON(KEYS.users, value); }

  function getCurrentUser() {
    try {
      const value = JSON.parse(localStorage.getItem(KEYS.currentUser));
      return value && typeof value === 'object' ? value : null;
    } catch {
      return null;
    }
  }

  function setCurrentUser(value) {
    if (!value) {
      localStorage.removeItem(KEYS.currentUser);
      return;
    }
    localStorage.setItem(KEYS.currentUser, JSON.stringify(value));
  }

  function uid() {
    return (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  return {
    getQuestions,
    setQuestions,
    getSlots,
    setSlots,
    getBookings,
    setBookings,
    getWhoami,
    setWhoami,
    getUsers,
    setUsers,
    getCurrentUser,
    setCurrentUser,
    uid
  };
})();
