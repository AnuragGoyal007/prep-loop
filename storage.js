const PrepStorage = (function () {
  const KEYS = {
    questions: "prepLoop.questions",
    slots: "prepLoop.slots",
    bookings: "prepLoop.bookings",
    whoami: "prepLoop.whoami",
    users: "prepLoop.users",
    currentUser: "prepLoop.currentUser",
    theme: "prepLoop.theme",
    leetCodeProfiles: "prepLoop.leetCodeProfiles",
    gfgProfiles: "prepLoop.gfgProfiles",
    gfgCache: "prepLoop.gfgCache",
    csCoreProgress: "prepLoop.csCoreProgress"
  };

  // Safely parses and returns JSON from localStorage with a fallback
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

  // Serializes and writes a value to localStorage
  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Reads an array from localStorage
  function readArray(key) {
    let value = readJSON(key, []);
    return Array.isArray(value) ? value : [];
  }

  // Writes an array to localStorage
  function writeArray(key, value) {
    writeJSON(key, value);
  }

  // Resolves the unique storage namespace key for the active user
  function getUserStorageKey() {
    let account = getCurrentUser();
    if (account && (account.id || account.email)) {
      return String(account.id || account.email);
    }
    let who = getWhoami();
    return who ? `whoami_${who}` : "guest_user";
  }

  // Retrieves all logged questions for the active user
  function getQuestions() {
    let userKey = getUserStorageKey();
    let allQuestions = readJSON(KEYS.questions, {});
    if (allQuestions && typeof allQuestions === "object" && !Array.isArray(allQuestions)) {
      let userList = allQuestions[userKey];
      return Array.isArray(userList) ? userList : [];
    }
    return [];
  }

  // Saves questions array for the active user
  function setQuestions(value) {
    let userKey = getUserStorageKey();
    let allQuestions = readJSON(KEYS.questions, {});
    let nextQuestions = allQuestions && typeof allQuestions === "object" && !Array.isArray(allQuestions)
      ? allQuestions
      : {};
    nextQuestions[userKey] = Array.isArray(value) ? value : [];
    writeJSON(KEYS.questions, nextQuestions);
  }

  // Returns all shared mock interview slots
  function getSlots() {
    return readArray(KEYS.slots);
  }

  // Saves the shared mock interview slots array
  function setSlots(value) {
    writeArray(KEYS.slots, value);
  }

  // Returns all mock interview bookings
  function getBookings() {
    return readArray(KEYS.bookings);
  }

  // Saves mock interview bookings array
  function setBookings(value) {
    writeArray(KEYS.bookings, value);
  }

  // Returns display name for unauthenticated guest sessions
  function getWhoami() {
    return localStorage.getItem(KEYS.whoami) || "";
  }

  // Updates display name for guest sessions
  function setWhoami(value) {
    localStorage.setItem(KEYS.whoami, value);
  }

  // Returns list of registered user accounts
  function getUsers() {
    let value = readJSON(KEYS.users, []);
    return Array.isArray(value) ? value : [];
  }

  // Saves registered user accounts array
  function setUsers(value) {
    writeJSON(KEYS.users, value);
  }

  // Retrieves the currently authenticated user object
  function getCurrentUser() {
    try {
      let value = JSON.parse(localStorage.getItem(KEYS.currentUser));
      return value && typeof value === "object" ? value : null;
    } catch (err) {
      return null;
    }
  }

  // Updates or clears the currently authenticated user session
  function setCurrentUser(value) {
    if (!value) {
      localStorage.removeItem(KEYS.currentUser);
      return;
    }
    localStorage.setItem(KEYS.currentUser, JSON.stringify(value));
  }

  // Reads the saved theme preference ('light' or 'dark')
  function getTheme() {
    let value = localStorage.getItem(KEYS.theme);
    return value === "dark" ? "dark" : "light";
  }

  // Saves the theme preference to localStorage
  function setTheme(value) {
    localStorage.setItem(KEYS.theme, value === "dark" ? "dark" : "light");
  }

  // Gets the saved LeetCode username for the active user
  function getLeetCodeUsername() {
    let account = getCurrentUser();
    if (!account || !account.id) return "";
    let profiles = readJSON(KEYS.leetCodeProfiles, {});
    let saved = profiles && typeof profiles === "object" ? profiles[account.id] : "";
    return typeof saved === "object" ? String(saved.username || "") : String(saved || "");
  }

  // Saves the LeetCode username for the active user
  function setLeetCodeUsername(value) {
    let account = getCurrentUser();
    if (!account || !account.id) return;
    let profiles = readJSON(KEYS.leetCodeProfiles, {});
    let nextProfiles = profiles && typeof profiles === "object" ? profiles : {};
    nextProfiles[account.id] = String(value || "").trim();
    writeJSON(KEYS.leetCodeProfiles, nextProfiles);
  }

  // Gets the saved GeeksforGeeks handle for the active user
  function getGfgUsername() {
    let account = getCurrentUser();
    if (!account || !account.id) return "";
    let profiles = readJSON(KEYS.gfgProfiles, {});
    let saved = profiles && typeof profiles === "object" ? profiles[account.id] : "";
    return typeof saved === "object" ? String(saved.username || "") : String(saved || "");
  }

  // Saves the GeeksforGeeks handle for the active user
  function setGfgUsername(value) {
    let account = getCurrentUser();
    if (!account || !account.id) return;
    let profiles = readJSON(KEYS.gfgProfiles, {});
    let nextProfiles = profiles && typeof profiles === "object" ? profiles : {};
    nextProfiles[account.id] = String(value || "").trim();
    writeJSON(KEYS.gfgProfiles, nextProfiles);
  }

  // Retrieves cached GFG stats and heatmap payload for a username
  function getGfgCache(username) {
    if (!username) return null;
    let cache = readJSON(KEYS.gfgCache, {});
    let key = String(username).trim().toLowerCase();
    return cache && typeof cache === "object" ? cache[key] || null : null;
  }

  // Caches GFG stats and heatmap payload for a username
  function setGfgCache(username, data) {
    if (!username || !data) return;
    let cache = readJSON(KEYS.gfgCache, {});
    let nextCache = cache && typeof cache === "object" ? cache : {};
    let key = String(username).trim().toLowerCase();
    nextCache[key] = data;
    writeJSON(KEYS.gfgCache, nextCache);
  }

  // Helper resolving storage key for CS Core sheets progress
  function getCsUserKey() {
    return getUserStorageKey();
  }

  // Retrieves CS Core sheets completion and bookmarks map for the active user
  function getCsCoreProgress() {
    let userKey = getCsUserKey();
    let allProgress = readJSON(KEYS.csCoreProgress, {});
    return allProgress && typeof allProgress === "object" && allProgress[userKey]
      ? allProgress[userKey]
      : {};
  }

  // Saves CS Core sheets progress map for the active user
  function setCsCoreProgress(progressMap) {
    let userKey = getCsUserKey();
    let allProgress = readJSON(KEYS.csCoreProgress, {});
    let nextProgress = allProgress && typeof allProgress === "object" ? allProgress : {};
    nextProgress[userKey] = progressMap || {};
    writeJSON(KEYS.csCoreProgress, nextProgress);
  }

  // Toggles the completed status of a CS Core sheet topic
  function toggleCsTopicComplete(topicId) {
    let progress = getCsCoreProgress();
    let current = progress[topicId] || {};
    let isCompleted = !current.completed;
    progress[topicId] = {
      ...current,
      completed: isCompleted,
      completedAt: isCompleted ? Date.now() : null
    };
    setCsCoreProgress(progress);
    return isCompleted;
  }

  // Toggles bookmark status on a CS Core sheet topic
  function toggleCsTopicBookmark(topicId) {
    let progress = getCsCoreProgress();
    let current = progress[topicId] || {};
    let isBookmarked = !current.bookmarked;
    progress[topicId] = {
      ...current,
      bookmarked: isBookmarked
    };
    setCsCoreProgress(progress);
    return isBookmarked;
  }

  // Saves user revision notes for a specific CS Core sheet topic
  function saveCsTopicNotes(topicId, notes) {
    let progress = getCsCoreProgress();
    let current = progress[topicId] || {};
    progress[topicId] = {
      ...current,
      notes: String(notes || "")
    };
    setCsCoreProgress(progress);
  }

  // Links a CS Core sheet topic to an SM-2 spaced repetition question record
  function linkCsTopicToSm2(topicId, sm2QuestionId) {
    let progress = getCsCoreProgress();
    let current = progress[topicId] || {};
    progress[topicId] = {
      ...current,
      sm2Id: sm2QuestionId,
      lastReviewed: new Date().toISOString().split("T")[0]
    };
    setCsCoreProgress(progress);
  }

  // Generates a unique identifier string
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
    getTheme: getTheme,
    setTheme: setTheme,
    getLeetCodeUsername: getLeetCodeUsername,
    setLeetCodeUsername: setLeetCodeUsername,
    getGfgUsername: getGfgUsername,
    setGfgUsername: setGfgUsername,
    getGfgCache: getGfgCache,
    setGfgCache: setGfgCache,
    getCsCoreProgress: getCsCoreProgress,
    setCsCoreProgress: setCsCoreProgress,
    toggleCsTopicComplete: toggleCsTopicComplete,
    toggleCsTopicBookmark: toggleCsTopicBookmark,
    saveCsTopicNotes: saveCsTopicNotes,
    linkCsTopicToSm2: linkCsTopicToSm2,
    uid: uid
  };
})();

if (typeof window !== "undefined") {
  window.PrepStorage = PrepStorage;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = PrepStorage;
}
