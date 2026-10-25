// frontend/storage.js - Pure In-Memory Runtime Store (Only JWT Token & Theme in localStorage)
const PrepStorage = (function () {
  const THEME_KEY = "prepLoop.theme";

  // Automatically purge legacy Phase 1 mock database keys from localStorage
  const LEGACY_KEYS = [
    "prepLoop.questions",
    "prepLoop.slots",
    "prepLoop.bookings",
    "prepLoop.whoami",
    "prepLoop.users",
    "prepLoop.currentUser",
    "prepLoop.leetCodeProfiles",
    "prepLoop.gfgProfiles",
    "prepLoop.gfgCache",
    "prepLoop.githubProfiles",
    "prepLoop.googleClientId",
    "prepLoop.csCoreProgress"
  ];
  try {
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
  } catch (e) {}

  // In-memory runtime state for active session (sourced 100% from MongoDB Atlas)
  let _currentUser = null;
  let _questions = [];
  let _slots = [];
  let _bookings = [];
  let _whoami = "";
  let _leetCodeUsername = "";
  let _gfgUsername = "";
  let _githubUsername = "";
  let _gfgCache = {};
  let _csCoreProgress = {};

  // Theme Persistence (Allowed in localStorage)
  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }

  function setTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value === "dark" ? "dark" : "light");
    } catch (e) {}
  }

  // Active User session (In-memory, validated via JWT on backend)
  function getCurrentUser() {
    return _currentUser;
  }

  function setCurrentUser(user) {
    _currentUser = user;
    if (user) {
      _whoami = user.name || user.email || "";
      _leetCodeUsername = user.leetcode || "";
      _gfgUsername = user.gfg || "";
      _githubUsername = (user.github || "").replace(/^@/, "");
    } else {
      _whoami = "";
      _leetCodeUsername = "";
      _gfgUsername = "";
      _githubUsername = "";
      _questions = [];
    }
  }

  function getWhoami() {
    return _whoami;
  }

  function setWhoami(val) {
    _whoami = String(val || "");
  }

  // Legacy mock users array - always empty since all users live exclusively in MongoDB Atlas
  function getUsers() {
    return [];
  }

  function setUsers() {
    // No-op: all users live exclusively in Atlas
  }

  // Questions (In-memory cache from Atlas API)
  function getQuestions() {
    return Array.isArray(_questions) ? _questions : [];
  }

  function setQuestions(list) {
    _questions = Array.isArray(list) ? list : [];
  }

  // Scheduler Slots (In-memory cache from Atlas API)
  function getSlots() {
    return Array.isArray(_slots) ? _slots : [];
  }

  function setSlots(list) {
    _slots = Array.isArray(list) ? list : [];
  }

  // Bookings (In-memory cache from Atlas API)
  function getBookings() {
    return Array.isArray(_bookings) ? _bookings : [];
  }

  function setBookings(list) {
    _bookings = Array.isArray(list) ? list : [];
  }

  // Coding Handles (In-memory, sourced from user profile)
  function getLeetCodeUsername() {
    return _leetCodeUsername || (_currentUser ? _currentUser.leetcode : "") || "";
  }

  function setLeetCodeUsername(val) {
    _leetCodeUsername = String(val || "").trim();
    if (_currentUser) _currentUser.leetcode = _leetCodeUsername;
  }

  function getGfgUsername() {
    return _gfgUsername || (_currentUser ? _currentUser.gfg : "") || "";
  }

  function setGfgUsername(val) {
    _gfgUsername = String(val || "").trim();
    if (_currentUser) _currentUser.gfg = _gfgUsername;
  }

  function getGithubUsername() {
    return _githubUsername || (_currentUser ? (_currentUser.github || _currentUser.githubUsername) : "") || "";
  }

  function setGithubUsername(val) {
    _githubUsername = String(val || "").replace(/^@/, "").trim();
    if (_currentUser) _currentUser.github = _githubUsername;
  }

  function getGfgCache(username) {
    if (!username) return null;
    return _gfgCache[String(username).toLowerCase()] || null;
  }

  function setGfgCache(username, data) {
    if (!username || !data) return;
    _gfgCache[String(username).toLowerCase()] = data;
  }

  function getGoogleClientId() {
    return "";
  }

  function setGoogleClientId() {}

  // CS Core Progress (In-memory runtime tracking)
  function getCsCoreProgress() {
    return _csCoreProgress;
  }

  function setCsCoreProgress(map) {
    _csCoreProgress = map || {};
  }

  function toggleCsTopicComplete(topicId) {
    let current = _csCoreProgress[topicId] || {};
    let isCompleted = !current.completed;
    _csCoreProgress[topicId] = {
      ...current,
      completed: isCompleted,
      completedAt: isCompleted ? Date.now() : null
    };
    return isCompleted;
  }

  function toggleCsTopicBookmark(topicId) {
    let current = _csCoreProgress[topicId] || {};
    let isBookmarked = !current.bookmarked;
    _csCoreProgress[topicId] = {
      ...current,
      bookmarked: isBookmarked
    };
    return isBookmarked;
  }

  function saveCsTopicNotes(topicId, notes) {
    let current = _csCoreProgress[topicId] || {};
    _csCoreProgress[topicId] = {
      ...current,
      notes: String(notes || "")
    };
  }

  function linkCsTopicToSm2(topicId, sm2QuestionId) {
    let current = _csCoreProgress[topicId] || {};
    _csCoreProgress[topicId] = {
      ...current,
      sm2Id: sm2QuestionId,
      lastReviewed: new Date().toISOString().split("T")[0]
    };
  }

  function uid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    getTheme,
    setTheme,
    getLeetCodeUsername,
    setLeetCodeUsername,
    getGfgUsername,
    setGfgUsername,
    getGfgCache,
    setGfgCache,
    getGithubUsername,
    setGithubUsername,
    getGoogleClientId,
    setGoogleClientId,
    getCsCoreProgress,
    setCsCoreProgress,
    toggleCsTopicComplete,
    toggleCsTopicBookmark,
    saveCsTopicNotes,
    linkCsTopicToSm2,
    uid
  };
})();

if (typeof window !== "undefined") {
  window.PrepStorage = PrepStorage;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = PrepStorage;
}
