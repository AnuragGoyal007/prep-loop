/* LocalStorage helpers. All reads degrade safely when storage is empty or malformed. */
const PrepStorage = (() => {
  const KEYS = { questions: 'prepLoop.questions', slots: 'prepLoop.slots', bookings: 'prepLoop.bookings', whoami: 'prepLoop.whoami' };
  function readArray(key) { try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : []; } catch { return []; } }
  function writeArray(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function getQuestions() { return readArray(KEYS.questions); }
  function setQuestions(value) { writeArray(KEYS.questions, value); }
  function getSlots() { return readArray(KEYS.slots); }
  function setSlots(value) { writeArray(KEYS.slots, value); }
  function getBookings() { return readArray(KEYS.bookings); }
  function setBookings(value) { writeArray(KEYS.bookings, value); }
  function getWhoami() { return localStorage.getItem(KEYS.whoami) || ''; }
  function setWhoami(value) { localStorage.setItem(KEYS.whoami, value); }
  function uid() { return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  return { getQuestions, setQuestions, getSlots, setSlots, getBookings, setBookings, getWhoami, setWhoami, uid };
})();
