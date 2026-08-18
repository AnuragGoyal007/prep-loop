// ============================================================
// LocalStorage Persistence Layer for Prep Loop
// ============================================================

const PrepStorage = (function () {
  const KEYS = {
    questions: "prepLoop.questions",
    slots: "prepLoop.slots",
    bookings: "prepLoop.bookings",
    whoami: "prepLoop.whoami",
    users: "prepLoop.users",
    currentUser: "prepLoop.currentUser",
    leetCodeProfiles: "prepLoop.leetCodeProfiles",
    gfgProfiles: "prepLoop.gfgProfiles",
    gfgCache: "prepLoop.gfgCache"
  };

  // Helper to safely read JSON from localStorage
  function readJSON(key, fallback) {
    if (fallback === undefined) {
      fallback = [];
    }
    try {
      let value = JSON.parse(localStorage.getItem(key));
      return value === null ? fallback : value;
    } catch (err) {
      return fallback;
    }
  }

  // Helper to write JSON to localStorage
  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Helper to read an array from localStorage
  function readArray(key) {
    let value = readJSON(key, []);
    return Array.isArray(value) ? value : [];
  }

  // Helper to write an array to localStorage
  function writeArray(key, value) {
    writeJSON(key, value);
  }

  // Questions
  function getQuestions() {
    return readArray(KEYS.questions);
  }

  function setQuestions(value) {
    writeArray(KEYS.questions, value);
  }

  // Slots
  function getSlots() {
    return readArray(KEYS.slots);
  }

  function setSlots(value) {
    writeArray(KEYS.slots, value);
  }

  // Bookings
  function getBookings() {
    return readArray(KEYS.bookings);
  }

  function setBookings(value) {
    writeArray(KEYS.bookings, value);
  }

  // Whoami (guest user display name)
  function getWhoami() {
    return localStorage.getItem(KEYS.whoami) || "";
  }

  function setWhoami(value) {
    localStorage.setItem(KEYS.whoami, value);
  }

  // User Accounts
  function getUsers() {
    let value = readJSON(KEYS.users, []);
    return Array.isArray(value) ? value : [];
  }

  function setUsers(value) {
    writeJSON(KEYS.users, value);
  }

  // Current Logged-in User
  function getCurrentUser() {
    try {
      let value = JSON.parse(localStorage.getItem(KEYS.currentUser));
      return value && typeof value === "object" ? value : null;
    } catch (err) {
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

  // LeetCode Username
  function getLeetCodeUsername() {
    let account = getCurrentUser();
    if (!account || !account.id) return "";
    let profiles = readJSON(KEYS.leetCodeProfiles, {});
    let saved = profiles && typeof profiles === "object" ? profiles[account.id] : "";
    return typeof saved === "object" ? String(saved.username || "") : String(saved || "");
  }

  function setLeetCodeUsername(value) {
    let account = getCurrentUser();
    if (!account || !account.id) return;
    let profiles = readJSON(KEYS.leetCodeProfiles, {});
    let nextProfiles = profiles && typeof profiles === "object" ? profiles : {};
    nextProfiles[account.id] = String(value || "").trim();
    writeJSON(KEYS.leetCodeProfiles, nextProfiles);
  }

  // GeeksforGeeks Username
  function getGfgUsername() {
    let account = getCurrentUser();
    if (!account || !account.id) return "";
    let profiles = readJSON(KEYS.gfgProfiles, {});
    let saved = profiles && typeof profiles === "object" ? profiles[account.id] : "";
    return typeof saved === "object" ? String(saved.username || "") : String(saved || "");
  }

  function setGfgUsername(value) {
    let account = getCurrentUser();
    if (!account || !account.id) return;
    let profiles = readJSON(KEYS.gfgProfiles, {});
    let nextProfiles = profiles && typeof profiles === "object" ? profiles : {};
    nextProfiles[account.id] = String(value || "").trim();
    writeJSON(KEYS.gfgProfiles, nextProfiles);
  }

  // GeeksforGeeks Cached Data
  function getGfgCache(username) {
    if (!username) return null;
    let cache = readJSON(KEYS.gfgCache, {});
    let key = String(username).trim().toLowerCase();
    return cache && typeof cache === "object" ? cache[key] || null : null;
  }

  function setGfgCache(username, data) {
    if (!username || !data) return;
    let cache = readJSON(KEYS.gfgCache, {});
    let nextCache = cache && typeof cache === "object" ? cache : {};
    let key = String(username).trim().toLowerCase();
    nextCache[key] = data;
    writeJSON(KEYS.gfgCache, nextCache);
  }

  // Generate Unique ID
  function uid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  return {
    getQuestions: getQuestions,
    setQuestions: setQuestions,
    getSlots: getSlots,
    setSlots: setSlots,
    getBookings: getBookings,
    setBookings: setBookings,
    getWhoami: getWhoami,
    setWhoami: setWhoami,
    getUsers: getUsers,
    setUsers: setUsers,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    getLeetCodeUsername: getLeetCodeUsername,
    setLeetCodeUsername: setLeetCodeUsername,
    getGfgUsername: getGfgUsername,
    setGfgUsername: setGfgUsername,
    getGfgCache: getGfgCache,
    setGfgCache: setGfgCache,
    uid: uid
  };
})();
