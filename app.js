// ============================================================
// Prep Loop - Main Application Logic
// ============================================================

// Global variables
let leetCodeUsername = "";
let leetCardVersion = "";
let gfgUsername = "";
let gfgCardVersion = "";
let toastTimer = null;
let gfgFetchSeq = 0;

const LEETCARD_ENDPOINT = "https://leetcard.jacoblin.cool/";
const GFG_API_ENDPOINTS = [
  "https://gfg-stats-api.vercel.app",
  "https://gfg-stats.tashif.codes"
];

// Helper function to escape HTML special characters
function escapeHtml(text) {
  if (text === null || text === undefined) {
    return "";
  }
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Show a temporary popup notification message
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 3500);
}

// Helper to get current username
function getCurrentUserName() {
  let identityInput = document.getElementById("identity-input");
  return identityInput ? identityInput.value.trim() : "";
}

// Helper to get current user account object
function getCurrentAccount() {
  return PrepStorage.getCurrentUser();
}

// Helper to create empty state box
function getEmptyState(message) {
  return `<div class="empty-state">${message}</div>`;
}

// Helper to render difficulty badge
function getDifficultyPill(difficulty) {
  return `<span class="pill ${difficulty}">${escapeHtml(difficulty)}</span>`;
}

// Helper to format date as YYYY.M.D
function formatDateDot(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  return `${year}.${month}.${day}`;
}

// Screen display helpers
function showAuthScreen() {
  document.getElementById("auth-screen").hidden = false;
  document.getElementById("app-page").hidden = true;
}

function showAppScreen() {
  document.getElementById("auth-screen").hidden = true;
  document.getElementById("app-page").hidden = false;
}

// Set user identity field from logged-in account
function setIdentityFromAccount() {
  let account = getCurrentAccount();
  let identityInput = document.getElementById("identity-input");
  if (!identityInput) return;

  let name = account ? account.name : PrepStorage.getWhoami();
  identityInput.value = name || "";
  if (name) {
    PrepStorage.setWhoami(name);
  }
}

// Switch between Login and Signup tabs
function switchAuthMode(mode) {
  let loginForm = document.getElementById("login-form");
  let signupForm = document.getElementById("signup-form");
  let authTabs = document.querySelectorAll(".auth-tab");

  if (mode === "login") {
    loginForm.hidden = false;
    signupForm.hidden = true;
  } else {
    loginForm.hidden = true;
    signupForm.hidden = false;
  }

  authTabs.forEach(function (tab) {
    let isActive = tab.getAttribute("data-auth-tab") === mode;
    if (isActive) {
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
    } else {
      tab.classList.remove("is-active");
      tab.setAttribute("aria-selected", "false");
    }
  });
}

// Handle login submit
function handleLogin(event) {
  event.preventDefault();

  let form = event.target;
  let email = form.elements["email"].value.trim().toLowerCase();
  let password = form.elements["password"].value;

  if (!email || !password) {
    showToast("Please enter both email and password.");
    return;
  }

  let users = PrepStorage.getUsers();
  let foundUser = users.find(function (user) {
    return user.email && user.email.trim().toLowerCase() === email && user.password === password;
  });

  if (!foundUser) {
    showToast("Invalid credentials or no account found. Please sign up.");
    return;
  }

  PrepStorage.setCurrentUser(foundUser);
  PrepStorage.setWhoami(foundUser.name || foundUser.email);

  form.reset();

  let identityInput = document.getElementById("identity-input");
  identityInput.value = foundUser.name || foundUser.email;
  identityInput.readOnly = true;

  setIdentityFromAccount();
  showAppScreen();

  leetCodeUsername = PrepStorage.getLeetCodeUsername();
  leetCardVersion = "";
  gfgUsername = PrepStorage.getGfgUsername() || leetCodeUsername;
  gfgCardVersion = "";

  renderAll();
  showToast(`Welcome back, ${foundUser.name || "there"}!`);
}

// Handle sign up submit
function handleSignup(event) {
  event.preventDefault();

  let form = event.target;
  let name = form.elements["name"].value.trim();
  let email = form.elements["email"].value.trim().toLowerCase();
  let password = form.elements["password"].value;

  if (!name || !email || !password) {
    showToast("Please fill in all fields.");
    return;
  }

  if (password.length < 4) {
    showToast("Password must be at least 4 characters long.");
    return;
  }

  let users = PrepStorage.getUsers();
  let emailExists = users.some(function (user) {
    return user.email && user.email.trim().toLowerCase() === email;
  });

  if (emailExists) {
    showToast("An account with this email already exists.");
    return;
  }

  let newUser = {
    id: PrepStorage.uid(),
    name: name,
    email: email,
    password: password
  };

  users.push(newUser);
  PrepStorage.setUsers(users);
  PrepStorage.setCurrentUser(newUser);
  PrepStorage.setWhoami(name);

  form.reset();

  let identityInput = document.getElementById("identity-input");
  identityInput.value = name;
  identityInput.readOnly = true;

  setIdentityFromAccount();
  showAppScreen();

  leetCodeUsername = "";
  leetCardVersion = "";
  gfgUsername = "";
  gfgCardVersion = "";

  renderAll();
  showToast(`Account created for ${name}!`);
}

// Handle logout
function handleLogout() {
  PrepStorage.setCurrentUser(null);
  PrepStorage.setWhoami("");

  let identityInput = document.getElementById("identity-input");
  identityInput.value = "";
  identityInput.readOnly = false;

  document.getElementById("login-form").reset();
  document.getElementById("signup-form").reset();

  leetCodeUsername = "";
  leetCardVersion = "";
  gfgUsername = "";
  gfgCardVersion = "";

  switchAuthMode("login");
  showAuthScreen();
  showToast("Logged out successfully.");
}

// Render the active account profile and live dashboard statistics
function renderProfileCard(questions, bookings, slots) {
  let profileCard = document.getElementById("profile-card");
  if (!profileCard) return;

  let account = getCurrentAccount();
  if (!account) {
    profileCard.innerHTML = getEmptyState("Log in to view your profile.");
    return;
  }

  let todayDate = SM2.today();
  let currentUser = account.name || account.email || "";
  let dueCount = questions.filter(function (question) {
    return question.nextReviewDate <= todayDate;
  }).length;
  let sessionCount = bookings.filter(function (booking) {
    if (booking.status === "cancelled") return false;
    let slot = slots.find(function (item) { return item.id === booking.slotId; });
    return slot && (Scheduler.samePerson(slot.hostName, currentUser) || Scheduler.samePerson(booking.requesterName, currentUser));
  }).length;
  let connectedPlatforms = (PrepStorage.getLeetCodeUsername() ? 1 : 0) + (PrepStorage.getGfgUsername() ? 1 : 0);
  let photo = account.avatar || account.photo || account.profilePhoto || account.avatarUrl || "";
  let initials = String(currentUser || "?").trim().split(/\s+/).map(function (part) { return part.charAt(0); }).join("").slice(0, 2).toUpperCase();
  let displayValue = function (keys) {
    for (let i = 0; i < keys.length; i++) {
      if (account[keys[i]] !== undefined && account[keys[i]] !== null && String(account[keys[i]]).trim()) {
        return escapeHtml(account[keys[i]]);
      }
    }
    return "Not provided";
  };
  let avatarHtml = photo
    ? `<img src="${escapeHtml(photo)}" alt="Profile photo for ${escapeHtml(currentUser)}" onerror="this.hidden=true;this.nextElementSibling.hidden=false" /><span class="profile-initials" hidden>${escapeHtml(initials)}</span>`
    : `<span class="profile-initials">${escapeHtml(initials)}</span>`;

  profileCard.innerHTML = `
    <div class="profile-heading">
      <div class="profile-identity">
        <div class="profile-avatar" aria-hidden="true">${avatarHtml}</div>
        <div>
          <p class="eyebrow">Your profile</p>
          <h2 id="profile-title">${escapeHtml(currentUser)}</h2>
          <p class="profile-email">${escapeHtml(account.email || "Not provided")}</p>
        </div>
      </div>
      <div class="profile-card-actions"><span class="profile-status">Active account</span><button class="text-action" type="button" data-edit-profile>Edit Profile</button></div>
    </div>
    <div class="profile-details">
      <div><span class="profile-label">Course / role</span><strong>${displayValue(["course", "role", "courseRole"])}</strong></div>
      <div><span class="profile-label">University</span><strong>${displayValue(["university", "college", "institution"])}</strong></div>
      <div><span class="profile-label">Year</span><strong>${displayValue(["year", "studyYear", "graduationYear"])}</strong></div>
    </div>
    <div class="profile-stats" aria-label="Profile statistics">
      <div><strong>${questions.length}</strong><span>Questions</span></div>
      <div><strong>${dueCount}</strong><span>Due now</span></div>
      <div><strong>${sessionCount}</strong><span>Sessions</span></div>
      <div><strong>${connectedPlatforms}/2</strong><span>Platforms</span></div>
    </div>
  `;
}

function getAccountProfileValue(account, keys) {
  for (let i = 0; i < keys.length; i++) {
    if (account[keys[i]] !== undefined && account[keys[i]] !== null && String(account[keys[i]]).trim()) {
      return String(account[keys[i]]);
    }
  }
  return "";
}

function getProfileAvatarMarkup(account) {
  let name = account ? (account.name || account.email || "?") : "?";
  let photo = account && (account.avatar || account.photo || account.profilePhoto || account.avatarUrl);
  let initials = String(name).trim().split(/\s+/).map(function (part) { return part.charAt(0); }).join("").slice(0, 2).toUpperCase();

  if (photo) {
    return `<img src="${escapeHtml(photo)}" alt="Profile photo preview" /><span class="profile-initials" hidden>${escapeHtml(initials)}</span>`;
  }
  return `<span class="profile-initials">${escapeHtml(initials)}</span>`;
}

function openProfileEditor() {
  let account = getCurrentAccount();
  let dialog = document.getElementById("profile-dialog");
  let form = document.getElementById("profile-form");
  let preview = document.getElementById("profile-photo-preview");
  if (!account || !dialog || !form || !preview) return;

  form.elements["university"].value = getAccountProfileValue(account, ["university", "college", "institution"]);
  form.elements["year"].value = getAccountProfileValue(account, ["year", "studyYear", "graduationYear"]);
  form.elements["courseRole"].value = getAccountProfileValue(account, ["course", "role", "courseRole"]);
  form.elements["photo"].value = "";
  preview.innerHTML = getProfileAvatarMarkup(account);
  dialog.showModal();
}

function saveProfile(event) {
  event.preventDefault();

  let account = getCurrentAccount();
  let form = event.target;
  if (!account) return;

  let updatedAccount = {
    ...account,
    university: form.elements["university"].value.trim(),
    year: form.elements["year"].value.trim(),
    courseRole: form.elements["courseRole"].value.trim()
  };
  let photoFile = form.elements["photo"].files[0];

  let finishSave = function (profilePhoto) {
    if (profilePhoto !== undefined) {
      updatedAccount.profilePhoto = profilePhoto;
    }

    let users = PrepStorage.getUsers();
    let userIndex = users.findIndex(function (user) {
      return user.id === account.id || user.email === account.email;
    });
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], ...updatedAccount };
      PrepStorage.setUsers(users);
    }
    PrepStorage.setCurrentUser(updatedAccount);
    document.getElementById("profile-dialog").close();
    renderAll();
    showToast("Profile updated successfully.");
  };

  if (!photoFile) {
    finishSave();
    return;
  }

  if (!photoFile.type.startsWith("image/")) {
    showToast("Please choose an image file.");
    return;
  }

  let reader = new FileReader();
  reader.addEventListener("load", function () {
    finishSave(String(reader.result || ""));
  });
  reader.addEventListener("error", function () {
    showToast("That photo could not be read. Please try another file.");
  });
  reader.readAsDataURL(photoFile);
}

// Render LeetCode card
function renderLeetCodeProgress() {
  let usernameInput = document.getElementById("leetcode-username");
  let refreshButton = document.getElementById("leetcode-refresh");
  let statusDiv = document.getElementById("leetcode-status");
  let updatedNote = document.getElementById("leetcode-updated");

  if (!usernameInput || !refreshButton || !statusDiv) return;

  usernameInput.value = leetCodeUsername;
  refreshButton.textContent = "Refresh card";

  if (!leetCodeUsername) {
    updatedNote.textContent = "not connected";
    statusDiv.innerHTML = getEmptyState("Enter your public LeetCode username to view its live status card.");
    return;
  }

  let query = new URLSearchParams({
    theme: "light",
    font: "Outfit",
    ext: "heatmap"
  });

  if (leetCardVersion) {
    query.set("v", leetCardVersion);
  }

  let cardUrl = `${LEETCARD_ENDPOINT}${encodeURIComponent(leetCodeUsername)}?${query.toString()}`;
  updatedNote.textContent = `live card for @${leetCodeUsername}`;
  let currentImage = statusDiv.querySelector(".leetcode-image");
  if (currentImage && currentImage.getAttribute("src") === cardUrl) {
    return;
  }
  statusDiv.innerHTML = `<img class="leetcode-image" src="${cardUrl}" alt="LeetCode progress card for @${escapeHtml(leetCodeUsername)}" loading="eager" referrerpolicy="no-referrer" />`;
}

// Refresh LeetCode card
function refreshLeetCodeProgress(username) {
  if (username === undefined) {
    let input = document.getElementById("leetcode-username");
    username = input ? input.value : "";
  }

  let cleanUsername = String(username || "").trim();

  if (!cleanUsername) {
    leetCodeUsername = "";
    leetCardVersion = "";
    PrepStorage.setLeetCodeUsername("");
    renderLeetCodeProgress();
    return;
  }

  leetCodeUsername = cleanUsername;
  leetCardVersion = String(Date.now());
  PrepStorage.setLeetCodeUsername(cleanUsername);
  renderLeetCodeProgress();
  showToast("LeetCode card refreshed.");
}

// Fetch GeeksforGeeks endpoint helper
async function fetchGfgEndpoint(path) {
  for (let i = 0; i < GFG_API_ENDPOINTS.length; i++) {
    let baseUrl = GFG_API_ENDPOINTS[i];
    try {
      let controller = new AbortController();
      let timeoutId = setTimeout(() => controller.abort(), 9000);

      let response = await fetch(`${baseUrl}${path}`, {
        signal: controller.signal,
        headers: { "Accept": "application/json" }
      });
      clearTimeout(timeoutId);

      if (response.status === 404) {
        return { notFound: true };
      }

      if (response.ok) {
        let result = await response.json();
        if (result && (result.status === "success" || result.totalProblemsSolved !== undefined || result.data)) {
          return { ok: true, data: result.data || result };
        }
      }
    } catch (err) {
      // Try next endpoint if available
    }
  }
  return { ok: false };
}

// Fetch user data from GeeksforGeeks APIs
async function fetchGfgUser(username) {
  let userHandle = encodeURIComponent(String(username || "").trim());

  let statsPromise = fetchGfgEndpoint(`/${userHandle}/stats`);
  let heatmapPromise = fetchGfgEndpoint(`/${userHandle}/heatmap`);

  let [statsRes, heatmapRes] = await Promise.all([statsPromise, heatmapPromise]);

  if ((statsRes && statsRes.notFound) || (heatmapRes && heatmapRes.notFound)) {
    return { notFound: true };
  }

  if (!statsRes?.ok && !heatmapRes?.ok) {
    return { ok: false };
  }

  return {
    ok: true,
    stats: statsRes?.ok ? statsRes.data : null,
    heatmap: heatmapRes?.ok ? heatmapRes.data : null
  };
}

// Generate GeeksforGeeks SVG Card with 52-week heatmap
function generateGfgHeatmapSvg(username, stats, heatmap) {
  let easyCount = Number(stats?.byDifficulty?.easy) || 0;
  let mediumCount = Number(stats?.byDifficulty?.medium) || 0;
  let hardCount = Number(stats?.byDifficulty?.hard) || 0;
  let basicCount = Number(stats?.byDifficulty?.basic) || 0;
  let schoolCount = Number(stats?.byDifficulty?.school) || 0;

  let directTotal = Number(stats?.totalSolved);
  let calculatedTotal = easyCount + mediumCount + hardCount + basicCount + schoolCount;
  let actualTotal = (!isNaN(directTotal) && directTotal > 0) ? directTotal : calculatedTotal;

  let totalSubmissions = Number(heatmap?.totalSubmissions) || actualTotal;
  let totalActiveDays = Number(heatmap?.totalActiveDays) || (actualTotal > 0 ? 1 : 0);
  let currentStreak = Number(heatmap?.currentStreak) || 0;
  let longestStreak = Number(heatmap?.longestStreak) || 0;

  let now = new Date();
  let startDate = new Date(now.getTime() - 364 * 24 * 60 * 60 * 1000);
  let startStr = formatDateDot(startDate);
  let endStr = formatDateDot(now);

  // Map contributions by date
  let dateMap = new Map();
  if (heatmap && Array.isArray(heatmap.dailyContributions)) {
    for (let i = 0; i < heatmap.dailyContributions.length; i++) {
      let item = heatmap.dailyContributions[i];
      if (item && item.date) {
        dateMap.set(item.date, item);
      }
    }
  }

  let cellW = 6.2;
  let cellH = 6.2;
  let gap = 2.2;
  let startX = 24;
  let startY = 214;
  let levelColors = ["#f0f4f1", "#a3e6b2", "#48bb78", "#2f8d46", "#1b5e20"];
  let rectsHtml = "";

  for (let col = 0; col < 52; col++) {
    for (let row = 0; row < 7; row++) {
      let daysAgo = (51 - col) * 7 + (6 - row);
      let cellDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      let yyyy = cellDate.getFullYear();
      let mm = String(cellDate.getMonth() + 1).padStart(2, "0");
      let dd = String(cellDate.getDate()).padStart(2, "0");
      let dateKey = `${yyyy}-${mm}-${dd}`;

      let entry = dateMap.get(dateKey);
      let level = entry ? Math.max(1, Math.min(4, entry.level || entry.count || 1)) : 0;
      let count = entry ? (entry.count || 1) : 0;
      let isToday = (col === 51 && row === 6);

      let x = (startX + col * (cellW + gap)).toFixed(1);
      let y = (startY + row * (cellH + gap)).toFixed(1);
      let color = levelColors[level];
      let stroke = isToday ? 'stroke="#2f8d46" stroke-width="0.8"' : '';
      let titleText = count > 0 ? `${dateKey}: ${count} submissions` : `${dateKey}: No submissions`;

      rectsHtml += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="1.5" fill="${color}" ${stroke}><title>${titleText}</title></rect>`;
    }
  }

  let maxProblemsScale = Math.max(actualTotal * 1.25, 400);
  let ringOffset = (238.7 * (1 - Math.min(actualTotal / maxProblemsScale, 0.96))).toFixed(1);

  let easyWidth = actualTotal > 0 ? Math.min(334, Math.max(8, (easyCount / actualTotal) * 334)).toFixed(1) : "0";
  let mediumWidth = actualTotal > 0 ? Math.min(334, Math.max(8, (mediumCount / actualTotal) * 334)).toFixed(1) : "0";
  let hardWidth = actualTotal > 0 ? Math.min(334, Math.max(8, (hardCount / actualTotal) * 334)).toFixed(1) : "0";

  let streakLabel = "";
  if (currentStreak > 0) {
    streakLabel = `Streak: ${currentStreak}d (Max ${longestStreak}d)`;
  } else if (longestStreak > 0) {
    streakLabel = `Max Streak: ${longestStreak}d`;
  } else {
    streakLabel = `${totalActiveDays} Active Days`;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 295" class="gfg-card-svg" role="img" aria-label="GeeksforGeeks live progress card for @${escapeHtml(username)}">
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
        <text x="452" y="22" text-anchor="end" fill="#2f8d46" font-family="'IBM Plex Mono', monospace" font-size="12" font-weight="600">${escapeHtml(streakLabel)}</text>
      </g>

      <!-- Solved Ring & Breakdown -->
      <g transform="translate(24, 58)">
        <!-- Solved Ring -->
        <g transform="translate(42, 45)">
          <circle cx="0" cy="0" r="38" fill="none" stroke="#e6ece8" stroke-width="6.5"/>
          <circle cx="0" cy="0" r="38" fill="none" stroke="url(#gfgRing)" stroke-width="6.5" stroke-dasharray="238.7" stroke-dashoffset="${ringOffset}" stroke-linecap="round" transform="rotate(-90)"/>
          <text x="0" y="7" text-anchor="middle" fill="#16211d" font-family="'IBM Plex Sans', sans-serif" font-size="22" font-weight="700">${actualTotal}</text>
          <text x="0" y="21" text-anchor="middle" fill="#718096" font-family="'IBM Plex Sans', sans-serif" font-size="9" font-weight="600" letter-spacing="0.5">SOLVED</text>
        </g>

        <!-- Difficulty Rows -->
        <g transform="translate(118, 12)">
          <!-- Easy -->
          <text x="0" y="11" fill="#16211d" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="700">Easy</text>
          <text x="334" y="11" text-anchor="end" fill="#4a5568" font-family="'IBM Plex Mono', monospace" font-size="12" font-weight="500">${easyCount} <tspan fill="#a0aec0">${basicCount ? `(+${basicCount} basic)` : ""}</tspan></text>
          <rect x="0" y="17" width="334" height="4" rx="2" fill="#edf2f7"/>
          <rect x="0" y="17" width="${easyWidth}" height="4" rx="2" fill="#2f8d46"/>

          <!-- Medium -->
          <text x="0" y="42" fill="#16211d" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="700">Medium</text>
          <text x="334" y="42" text-anchor="end" fill="#4a5568" font-family="'IBM Plex Mono', monospace" font-size="12" font-weight="500">${mediumCount}</text>
          <rect x="0" y="48" width="334" height="4" rx="2" fill="#edf2f7"/>
          <rect x="0" y="48" width="${mediumWidth}" height="4" rx="2" fill="#d97706"/>

          <!-- Hard -->
          <text x="0" y="73" fill="#16211d" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="700">Hard</text>
          <text x="334" y="73" text-anchor="end" fill="#4a5568" font-family="'IBM Plex Mono', monospace" font-size="12" font-weight="500">${hardCount}</text>
          <rect x="0" y="79" width="334" height="4" rx="2" fill="#edf2f7"/>
          <rect x="0" y="79" width="${hardWidth}" height="4" rx="2" fill="#dc2626"/>
        </g>
      </g>

      <!-- Divider -->
      <line x1="24" y1="168" x2="476" y2="168" stroke="#edf0ed" stroke-width="1"/>

      <!-- Heatmap Header -->
      <text x="24" y="196" fill="#16211d" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="700">Live Activity Heatmap (52 Weeks)</text>
      <text x="476" y="196" text-anchor="end" fill="#2f8d46" font-family="'IBM Plex Mono', monospace" font-size="11" font-weight="600">${totalSubmissions} Submissions · ${totalActiveDays} Active Days</text>

      <!-- Heatmap Grid -->
      ${rectsHtml}

      <!-- Dates -->
      <text x="24" y="284" fill="#718096" font-family="'IBM Plex Mono', monospace" font-size="10">${startStr}</text>
      <text x="476" y="284" text-anchor="end" fill="#718096" font-family="'IBM Plex Mono', monospace" font-size="10">${endStr}</text>
    </svg>
  `;
}

// Load and render GFG card
async function loadGfgProgress(username, forceRefresh) {
  let userSlug = String(username || "").trim();
  let updatedNote = document.getElementById("gfg-updated");
  let statusDiv = document.getElementById("gfg-status");

  if (!userSlug) {
    updatedNote.textContent = "not connected";
    statusDiv.innerHTML = getEmptyState("Enter your public GeeksforGeeks username to view its live heatmap.");
    return;
  }

  let cachedData = !forceRefresh ? PrepStorage.getGfgCache(userSlug) : null;
  if (cachedData && cachedData.stats) {
    updatedNote.textContent = `live card for @${userSlug}`;
    statusDiv.innerHTML = generateGfgHeatmapSvg(userSlug, cachedData.stats, cachedData.heatmap);
  } else {
    updatedNote.textContent = "syncing with GFG...";
    statusDiv.innerHTML = `<div class="empty-state">Fetching live GeeksforGeeks data for @${escapeHtml(userSlug)}...</div>`;
  }

  let currentFetchId = ++gfgFetchSeq;
  let result = await fetchGfgUser(userSlug);

  if (currentFetchId !== gfgFetchSeq || gfgUsername !== userSlug) {
    return;
  }

  if (result.notFound) {
    updatedNote.textContent = "user not found";
    statusDiv.innerHTML = `<div class="empty-state">No public profile found for <strong>@${escapeHtml(userSlug)}</strong> on GeeksforGeeks.</div>`;
    return;
  }

  if (result.ok && result.stats) {
    PrepStorage.setGfgCache(userSlug, {
      stats: result.stats,
      heatmap: result.heatmap,
      fetchedAt: Date.now()
    });
    updatedNote.textContent = `live card for @${userSlug}`;
    statusDiv.innerHTML = generateGfgHeatmapSvg(userSlug, result.stats, result.heatmap);
  } else if (!cachedData) {
    updatedNote.textContent = `live card for @${userSlug}`;
    let imgUrl = `https://gfg-stats-api.vercel.app/${encodeURIComponent(userSlug)}/stats/svg?theme=light&v=${Date.now()}`;
    statusDiv.innerHTML = `<img class="gfg-image" src="${imgUrl}" alt="GeeksforGeeks stats for @${escapeHtml(userSlug)}" onerror="this.parentElement.innerHTML='<div class=\\'empty-state\\'>Unable to load GeeksforGeeks data. Please try again.</div>'" />`;
  }
}

// Render GFG progress from state
function renderGfgProgress() {
  let input = document.getElementById("gfg-username");
  let button = document.getElementById("gfg-refresh");

  if (!input || !button) return;
  input.value = gfgUsername;
  button.textContent = "Refresh card";

  if (!gfgUsername) {
    document.getElementById("gfg-updated").textContent = "not connected";
    document.getElementById("gfg-status").innerHTML = getEmptyState("Enter your public GeeksforGeeks username to view its live heatmap.");
    return;
  }

  loadGfgProgress(gfgUsername, false);
}

// Refresh GFG card
function refreshGfgProgress(username) {
  if (username === undefined) {
    let input = document.getElementById("gfg-username");
    username = input ? input.value : "";
  }

  let cleanUsername = String(username || "").trim();

  if (!cleanUsername) {
    gfgUsername = "";
    gfgCardVersion = "";
    PrepStorage.setGfgUsername("");
    renderGfgProgress();
    return;
  }

  gfgUsername = cleanUsername;
  gfgCardVersion = String(Date.now());
  PrepStorage.setGfgUsername(cleanUsername);
  loadGfgProgress(cleanUsername, true);
  showToast("Refreshing live GFG data...");
}

// Render dashboard tab contents
function renderDashboard() {
  let questions = PrepStorage.getQuestions();
  let slots = PrepStorage.getSlots();
  let bookings = PrepStorage.getBookings();
  let todayDate = SM2.today();

  // 1. Profile card
  renderProfileCard(questions, bookings, slots);

  // 2. Due questions
  let dueQuestions = questions.filter(function (q) {
    return q.nextReviewDate <= todayDate;
  }).sort(function (a, b) {
    return a.nextReviewDate.localeCompare(b.nextReviewDate);
  });

  document.getElementById("due-count").textContent = dueQuestions.length;
  let dueListHtml = "";
  if (dueQuestions.length > 0) {
    for (let i = 0; i < dueQuestions.length; i++) {
      let item = dueQuestions[i];
      let ef = Number(item.easeFactor).toFixed(2);
      dueListHtml += `
        <div class="list-row">
          <div class="list-primary">
            <span>${escapeHtml(item.topic)}</span>
            <div class="list-meta">EF ${ef} · ${escapeHtml(item.difficulty)}</div>
          </div>
          ${getDifficultyPill(item.difficulty)}
        </div>
      `;
    }
  } else {
    dueListHtml = getEmptyState("Nothing due — you’re caught up.");
  }
  document.getElementById("due-list").innerHTML = dueListHtml;

  // 3. Today's sessions
  let currentUser = getCurrentUserName();
  let currentDay = Scheduler.weekdayShort();
  let todaySessions = [];

  if (currentUser) {
    for (let i = 0; i < bookings.length; i++) {
      let booking = bookings[i];
      if (booking.status === "cancelled") continue;

      let slot = slots.find(function (s) {
        return s.id === booking.slotId;
      });

      if (slot && slot.day === currentDay) {
        let isHost = Scheduler.samePerson(slot.hostName, currentUser);
        let isRequester = Scheduler.samePerson(booking.requesterName, currentUser);

        if (isHost || isRequester) {
          todaySessions.push({ booking: booking, slot: slot });
        }
      }
    }
  }

  document.getElementById("sessions-count").textContent = todaySessions.length;

  let sessionsListHtml = "";
  if (todaySessions.length > 0) {
    todaySessions.sort(function (a, b) {
      return Scheduler.timeToMinutes(a.slot.time) - Scheduler.timeToMinutes(b.slot.time);
    });

    for (let i = 0; i < todaySessions.length; i++) {
      let item = todaySessions[i];
      let isHost = Scheduler.samePerson(item.slot.hostName, currentUser);
      let otherPerson = isHost ? item.booking.requesterName : item.slot.hostName;
      let roleText = isHost ? "hosting" : "attending";
      let badgeText = isHost ? "host" : "guest";
      let displayTime = Scheduler.formatDisplayTime(item.slot.time);

      sessionsListHtml += `
        <div class="list-row">
          <div class="list-primary">
            <span>${escapeHtml(displayTime)} with ${escapeHtml(otherPerson)}</span>
            <div class="list-meta">${roleText}${item.slot.topic ? ` · ${escapeHtml(item.slot.topic)}` : ""}</div>
          </div>
          <span class="status-word">${badgeText}</span>
        </div>
      `;
    }
  } else {
    sessionsListHtml = getEmptyState(
      currentUser
        ? "No sessions today. Book one from the Schedule tab."
        : "Add your name above to see your sessions."
    );
  }
  document.getElementById("sessions-list").innerHTML = sessionsListHtml;

  // 4. Platform cards
  renderLeetCodeProgress();
  renderGfgProgress();
}

// Render questions table in questions tab
function renderQuestions() {
  let questions = PrepStorage.getQuestions().sort(function (a, b) {
    return a.nextReviewDate.localeCompare(b.nextReviewDate);
  });

  document.getElementById("question-total").textContent = `${questions.length} saved`;
  let tableWrap = document.getElementById("questions-table-wrap");

  if (questions.length === 0) {
    tableWrap.innerHTML = getEmptyState("No questions yet. Log your first attempt above to begin the loop.");
    return;
  }

  let todayDate = SM2.today();
  let rowsHtml = "";

  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    let ease = Number(q.easeFactor).toFixed(2);
    let isDue = q.nextReviewDate <= todayDate;
    let dueClass = isDue ? "due-date" : "";
    let dueTag = isDue ? " · due" : "";
    let attemptsCount = Array.isArray(q.history) ? q.history.length : 0;

    rowsHtml += `
      <tr>
        <td class="topic-cell">${escapeHtml(q.topic)}</td>
        <td>${getDifficultyPill(q.difficulty)}</td>
        <td class="mono">${ease}</td>
        <td class="mono">${q.interval}d</td>
        <td class="mono ${dueClass}">${escapeHtml(q.nextReviewDate)}${dueTag}</td>
        <td class="mono">${attemptsCount}</td>
      </tr>
    `;
  }

  tableWrap.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Topic</th>
            <th>Difficulty</th>
            <th>Ease</th>
            <th>Interval</th>
            <th>Next review</th>
            <th>Attempts</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

// Handle question form submit
function onQuestionSubmit(event) {
  event.preventDefault();

  let form = event.target;
  let topic = form.elements["topic"].value.trim();
  let difficulty = form.elements["difficulty"].value;
  let timeTaken = Number(form.elements["timeTaken"].value);
  let outcome = form.elements["outcome"].value;
  let isCorrect = outcome === "solved";

  if (!topic || !Number.isFinite(timeTaken) || timeTaken < 0) {
    return;
  }

  let questions = PrepStorage.getQuestions();
  let existingIndex = -1;

  for (let i = 0; i < questions.length; i++) {
    if (questions[i].topic.toLowerCase().trim() === topic.toLowerCase()) {
      existingIndex = i;
      break;
    }
  }

  if (existingIndex >= 0) {
    questions[existingIndex] = SM2.recalculate(questions[existingIndex], isCorrect, timeTaken);
    showToast(`Attempt added to “${topic}”.`);
  } else {
    let newQ = SM2.newQuestion({
      id: PrepStorage.uid(),
      topic: topic,
      difficulty: difficulty,
      correct: isCorrect,
      timeTaken: timeTaken
    });
    questions.push(newQ);
    showToast(`“${topic}” added to your review queue.`);
  }

  PrepStorage.setQuestions(questions);
  form.reset();
  form.elements["difficulty"].value = "medium";
  form.elements["outcome"].value = "solved";

  renderAll();
}

// Build a single slot grid cell
function getGridCell(slot, slotBookingsMap, currentUser, day, time) {
  let displayTime = Scheduler.formatDisplayTime(time);

  if (!slot) {
    return `<button class="slot-cell is-empty" type="button" data-offer-day="${escapeHtml(day)}" data-offer-time="${escapeHtml(time)}" aria-label="Offer slot for ${escapeHtml(day)} at ${escapeHtml(displayTime)}" title="Click to offer a slot on ${escapeHtml(day)} at ${escapeHtml(displayTime)}"><span class="empty-plus">+</span><span class="empty-hint">Offer</span></button>`;
  }

  let booking = slotBookingsMap.get(slot.id);
  let isMySlot = currentUser && Scheduler.samePerson(slot.hostName, currentUser);
  let isInvolved = booking && currentUser && (isMySlot || Scheduler.samePerson(booking.requesterName, currentUser));
  let duration = slot.duration ? `${slot.duration}m` : "60m";
  let topicBadge = slot.topic ? `<span class="slot-topic-badge" title="${escapeHtml(slot.topic)}">${escapeHtml(slot.topic)}</span>` : "";

  // 1. Open slot offered by someone else
  if (!booking && !isMySlot) {
    return `
      <div class="slot-cell is-open">
        <div class="slot-cell-header">
          <span class="slot-host" title="Host: ${escapeHtml(slot.hostName)}">${escapeHtml(slot.hostName)}</span>
          <span class="slot-duration-pill">${duration}</span>
        </div>
        ${topicBadge}
        <button class="slot-action-btn book-btn" type="button" data-book-slot="${slot.id}" aria-label="Book ${escapeHtml(slot.hostName)}’s slot at ${escapeHtml(displayTime)}">Book</button>
      </div>
    `;
  }

  // 2. Open slot offered by current user
  if (!booking && isMySlot) {
    return `
      <div class="slot-cell is-mine">
        <div class="slot-cell-header">
          <span class="slot-badge-mine">Your slot</span>
          <span class="slot-duration-pill">${duration}</span>
        </div>
        ${topicBadge}
        <button class="slot-action-btn remove-btn" type="button" data-remove-slot="${slot.id}" title="Remove your open slot" aria-label="Remove slot">Remove</button>
      </div>
    `;
  }

  // 3. Booked session involving current user
  if (booking && isInvolved) {
    let otherPerson = isMySlot ? booking.requesterName : slot.hostName;
    let roleText = isMySlot ? "Host" : "Guest";
    return `
      <div class="slot-cell is-booked-mine">
        <div class="slot-cell-header">
          <span class="slot-badge-booked">Booked</span>
          <span class="slot-duration-pill">${duration}</span>
        </div>
        <span class="slot-peer" title="With ${escapeHtml(otherPerson)}">w/ ${escapeHtml(otherPerson)}</span>
        <span class="slot-role-tag">${roleText}</span>
      </div>
    `;
  }

  // 4. Booked session between other users
  return `
    <div class="slot-cell is-booked">
      <span class="slot-taken-label">Booked</span>
      <span class="slot-duration-pill">${duration}</span>
    </div>
  `;
}

// Render schedule tab
function renderSchedule() {
  let slots = PrepStorage.getSlots();
  let bookings = PrepStorage.getBookings();
  let currentUser = getCurrentUserName();

  let activeBookings = bookings.filter(function (b) {
    return b.status !== "cancelled";
  });

  let slotBookingsMap = new Map();
  for (let i = 0; i < activeBookings.length; i++) {
    slotBookingsMap.set(activeBookings[i].slotId, activeBookings[i]);
  }

  let allTimes = Scheduler.getAllScheduleTimes(slots);

  // 1. Build weekly availability grid
  let gridHtml = '<div class="grid-corner grid-header">Time</div>';
  for (let i = 0; i < Scheduler.DAYS.length; i++) {
    gridHtml += `<div class="grid-header">${Scheduler.DAYS[i]}</div>`;
  }

  for (let t = 0; t < allTimes.length; t++) {
    let time = allTimes[t];
    let displayTime = Scheduler.formatDisplayTime(time);
    gridHtml += `<div class="time-label" title="${time}"><span class="time-display">${displayTime}</span><span class="time-24h">${time}</span></div>`;

    for (let d = 0; d < Scheduler.DAYS.length; d++) {
      let day = Scheduler.DAYS[d];
      let matchingSlot = slots.find(function (s) {
        return s.day === day && Scheduler.normalizeTime(s.time) === time;
      });
      gridHtml += getGridCell(matchingSlot, slotBookingsMap, currentUser, day, time);
    }
  }

  document.getElementById("schedule-grid").innerHTML = gridHtml;

  // 2. Build My Bookings table
  let myBookings = [];
  if (currentUser) {
    for (let i = 0; i < bookings.length; i++) {
      let booking = bookings[i];
      let slot = slots.find(function (s) {
        return s.id === booking.slotId;
      });

      if (slot) {
        let isHost = Scheduler.samePerson(slot.hostName, currentUser);
        let isRequester = Scheduler.samePerson(booking.requesterName, currentUser);

        if (isHost || isRequester) {
          myBookings.push({ booking: booking, slot: slot });
        }
      }
    }
  }

  let totalBadge = document.getElementById("booking-total");
  if (currentUser) {
    totalBadge.textContent = `${myBookings.length} session${myBookings.length === 1 ? "" : "s"}`;
  } else {
    totalBadge.textContent = "enter your name to filter";
  }

  let bookingsWrap = document.getElementById("bookings-table-wrap");
  if (!currentUser) {
    bookingsWrap.innerHTML = getEmptyState("Add your name in the top bar to view your bookings.");
    return;
  }

  if (myBookings.length === 0) {
    bookingsWrap.innerHTML = getEmptyState("No bookings yet. Find an open slot above to start practicing.");
    return;
  }

  myBookings.sort(function (a, b) {
    let dayDiff = Scheduler.DAYS.indexOf(a.slot.day) - Scheduler.DAYS.indexOf(b.slot.day);
    if (dayDiff !== 0) return dayDiff;
    return Scheduler.timeToMinutes(a.slot.time) - Scheduler.timeToMinutes(b.slot.time);
  });

  let bookingRowsHtml = "";
  for (let i = 0; i < myBookings.length; i++) {
    let item = myBookings[i];
    let isHost = Scheduler.samePerson(item.slot.hostName, currentUser);
    let otherPerson = isHost ? item.booking.requesterName : item.slot.hostName;
    let roleText = isHost ? "Host" : "Requester";
    let feedbackCol = "";
    let displayTime = Scheduler.formatDisplayTime(item.slot.time);
    let duration = item.slot.duration ? ` (${item.slot.duration}m)` : "";
    let topicCol = item.slot.topic ? `<div class="topic-sub">${escapeHtml(item.slot.topic)}</div>` : "";

    if (item.booking.status === "confirmed") {
      if (isHost) {
        feedbackCol = `
          <button class="table-button" type="button" data-done="${item.booking.id}">Mark done</button>
          <button class="table-button reject-button" type="button" data-reject="${item.booking.id}">Reject</button>
        `;
      } else {
        feedbackCol = `
          <button class="table-button reject-button" type="button" data-cancel="${item.booking.id}">Cancel meeting</button>
        `;
      }
    } else if (item.booking.status === "done" && !item.booking.feedback) {
      feedbackCol = `
        <button class="table-button" type="button" data-feedback="${item.booking.id}">Add</button>
      `;
    } else if (item.booking.feedback) {
      let fb = item.booking.feedback;
      let commentHtml = fb.comment ? `<span class="feedback-comment">${escapeHtml(fb.comment)}</span>` : "";
      feedbackCol = `
        <div class="feedback-summary">
          <span class="mono">${fb.communication}/${fb.problemSolving}/${fb.codeQuality}</span>
          ${commentHtml}
        </div>
      `;
    }

    bookingRowsHtml += `
      <tr>
        <td class="mono">${item.slot.day}</td>
        <td class="mono"><strong>${escapeHtml(displayTime)}</strong>${duration}${topicCol}</td>
        <td>${roleText}</td>
        <td>${escapeHtml(otherPerson)}</td>
        <td><span class="pill ${item.booking.status}">${escapeHtml(item.booking.status)}</span></td>
        <td>${feedbackCol}</td>
      </tr>
    `;
  }

  bookingsWrap.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Role</th>
            <th>With</th>
            <th>Status</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          ${bookingRowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

// Offer a new slot
function onOfferSubmit(event) {
  event.preventDefault();

  let user = getCurrentUserName();
  if (!user) {
    alert("Please add your name in the top bar before offering a slot.");
    document.getElementById("identity-input").focus();
    return;
  }

  let form = event.target;
  let day = form.elements["day"].value;
  let rawTime = form.elements["time"].value;
  let duration = Number(form.elements["duration"] ? form.elements["duration"].value : 60) || 60;
  let topic = form.elements["topic"] ? form.elements["topic"].value.trim() : "";

  if (!day || !rawTime) {
    showToast("Please specify both day and time.");
    return;
  }

  let normalizedTime = Scheduler.normalizeTime(rawTime);
  let slots = PrepStorage.getSlots();

  if (Scheduler.hasOfferedSlot(slots, user, day, normalizedTime)) {
    showToast(`You already offered a slot on ${day} at ${Scheduler.formatDisplayTime(normalizedTime)}.`);
    return;
  }

  let bookings = PrepStorage.getBookings();
  if (Scheduler.personHasConflict({ slots: slots, bookings: bookings }, user, day, normalizedTime)) {
    showToast(`You already have a booked session on ${day} at ${Scheduler.formatDisplayTime(normalizedTime)}.`);
    return;
  }

  let newSlot = {
    id: PrepStorage.uid(),
    day: day,
    time: normalizedTime,
    duration: duration,
    topic: topic,
    hostName: user,
    createdAt: Date.now()
  };

  slots.push(newSlot);
  PrepStorage.setSlots(slots);
  showToast(`Added open slot for ${day} at ${Scheduler.formatDisplayTime(normalizedTime)}!`);

  form.elements["topic"].value = "";
  renderAll();
}

// Remove an unbooked offered slot
function removeSlot(slotId) {
  let user = getCurrentUserName();
  let slots = PrepStorage.getSlots();
  let bookings = PrepStorage.getBookings();

  let slotIndex = slots.findIndex(function (s) { return s.id === slotId; });
  if (slotIndex === -1) {
    showToast("Slot not found.");
    return;
  }

  let targetSlot = slots[slotIndex];
  if (!Scheduler.samePerson(targetSlot.hostName, user)) {
    showToast("You can only remove your own slots.");
    return;
  }

  let hasActiveBooking = bookings.some(function (b) {
    return b.slotId === slotId && b.status !== "cancelled";
  });

  if (hasActiveBooking) {
    showToast("This slot is already booked. Please reject/cancel the session first.");
    return;
  }

  slots.splice(slotIndex, 1);
  PrepStorage.setSlots(slots);
  showToast(`Removed slot for ${targetSlot.day} at ${Scheduler.formatDisplayTime(targetSlot.time)}.`);
  renderAll();
}

// Open offer form pre-filled for a specific calendar cell
function openOfferForSlot(day, time) {
  let form = document.getElementById("offer-form");
  let toggle = document.getElementById("offer-toggle");

  if (form.hidden) {
    form.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.textContent = "− Hide slot form";
  }

  if (form.elements["day"]) {
    form.elements["day"].value = day;
  }
  if (form.elements["time"]) {
    form.elements["time"].value = Scheduler.normalizeTime(time);
  }

  form.scrollIntoView({ behavior: "smooth", block: "nearest" });
  let timeInput = form.elements["time"];
  if (timeInput) {
    timeInput.focus();
  }
  showToast(`Selected ${day} at ${Scheduler.formatDisplayTime(time)}. Customize & submit.`);
}

// Book an open slot
function tryBooking(slotId) {
  let user = getCurrentUserName();
  if (!user) {
    alert("Please add your name in the top bar before booking a slot.");
    document.getElementById("identity-input").focus();
    return;
  }

  let slots = PrepStorage.getSlots();
  let bookings = PrepStorage.getBookings();
  let targetSlot = slots.find(function (s) {
    return s.id === slotId;
  });

  if (!targetSlot) {
    showToast("That slot is no longer available.");
    return;
  }

  if (Scheduler.samePerson(targetSlot.hostName, user)) {
    showToast("You cannot book your own offered slot.");
    return;
  }

  if (Scheduler.slotBooking(bookings, slotId)) {
    showToast("That slot has already been booked.");
    return;
  }

  if (Scheduler.personHasConflict({ slots: slots, bookings: bookings }, user, targetSlot.day, targetSlot.time)) {
    showToast(`You already have a session on ${targetSlot.day} at ${Scheduler.formatDisplayTime(targetSlot.time)}.`);
    return;
  }

  let newBooking = {
    id: PrepStorage.uid(),
    slotId: slotId,
    requesterName: user,
    status: "confirmed",
    feedback: null
  };

  bookings.push(newBooking);
  PrepStorage.setBookings(bookings);
  showToast(`Booked ${targetSlot.hostName}’s ${targetSlot.day} ${Scheduler.formatDisplayTime(targetSlot.time)} session.`);
  renderAll();
}

// Status actions for bookings
function markDone(id) {
  let bookings = PrepStorage.getBookings();
  let target = bookings.find(function (b) { return b.id === id; });
  if (!target) return;

  target.status = "done";
  PrepStorage.setBookings(bookings);
  showToast("Session marked done. Add feedback when ready.");
  renderAll();
}

function rejectBooking(id) {
  let bookings = PrepStorage.getBookings();
  let target = bookings.find(function (b) { return b.id === id; });
  if (!target) return;

  target.status = "cancelled";
  PrepStorage.setBookings(bookings);
  showToast("Booking rejected and slot is open again.");
  renderAll();
}

function cancelBooking(id) {
  let bookings = PrepStorage.getBookings();
  let target = bookings.find(function (b) { return b.id === id; });
  if (!target) return;

  target.status = "cancelled";
  PrepStorage.setBookings(bookings);
  showToast("Meeting cancelled and slot is open again.");
  renderAll();
}

// Feedback Dialog helpers
function openFeedback(id) {
  let bookingIdInput = document.getElementById("feedback-booking-id");
  let feedbackForm = document.getElementById("feedback-form");
  let dialog = document.getElementById("feedback-dialog");

  if (!dialog) return;

  bookingIdInput.value = id;
  feedbackForm.reset();

  let outputs = document.querySelectorAll(".sliders output");
  outputs.forEach(function (output) {
    output.value = "3";
  });

  dialog.showModal();
}

function saveFeedback(event) {
  event.preventDefault();

  let form = event.target;
  let bookingId = form.elements["bookingId"].value;
  let communication = Number(form.elements["communication"].value);
  let problemSolving = Number(form.elements["problemSolving"].value);
  let codeQuality = Number(form.elements["codeQuality"].value);
  let comment = String(form.elements["comment"].value || "").trim();

  let bookings = PrepStorage.getBookings();
  let target = bookings.find(function (b) { return b.id === bookingId; });
  if (!target) return;

  target.feedback = {
    communication: communication,
    problemSolving: problemSolving,
    codeQuality: codeQuality,
    comment: comment
  };

  PrepStorage.setBookings(bookings);
  document.getElementById("feedback-dialog").close();
  showToast("Feedback saved successfully.");
  renderAll();
}

// Switch main navigation tabs
function switchTab(tabName) {
  renderAll();

  let tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (tab) {
    let isActive = tab.getAttribute("data-tab") === tabName;
    if (isActive) {
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
    } else {
      tab.classList.remove("is-active");
      tab.setAttribute("aria-selected", "false");
    }
  });

  let panels = document.querySelectorAll(".panel");
  panels.forEach(function (panel) {
    let isActive = panel.id === tabName;
    if (isActive) {
      panel.classList.add("is-active");
      panel.hidden = false;
    } else {
      panel.classList.remove("is-active");
      panel.hidden = true;
    }
  });
}

// Render all tabs
function renderAll() {
  renderDashboard();
  renderQuestions();
  renderSchedule();
}

// Initialize page and attach event listeners
function initialize() {
  let identityInput = document.getElementById("identity-input");
  let currentUserAccount = getCurrentAccount();

  identityInput.readOnly = Boolean(currentUserAccount);
  identityInput.value = currentUserAccount ? currentUserAccount.name : PrepStorage.getWhoami();

  // Populate day dropdown in offer form
  let daySelect = document.querySelector('#offer-form select[name="day"]');
  if (daySelect) {
    let dayOptionsHtml = "";
    for (let i = 0; i < Scheduler.DAYS.length; i++) {
      dayOptionsHtml += `<option value="${Scheduler.DAYS[i]}">${Scheduler.DAYS[i]}</option>`;
    }
    daySelect.innerHTML = dayOptionsHtml;
  }

  // Quick preset chips event listeners
  document.querySelectorAll("[data-preset-time]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      let presetTime = btn.getAttribute("data-preset-time");
      let timeInput = document.querySelector('#offer-form input[name="time"]');
      if (timeInput) {
        timeInput.value = presetTime;
        timeInput.focus();
        showToast(`Time set to ${Scheduler.formatDisplayTime(presetTime)}`);
      }
    });
  });

  // Navigation tab buttons
  let navTabs = document.querySelectorAll(".tab");
  navTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      switchTab(tab.getAttribute("data-tab"));
    });
  });

  // Quick action jump buttons (data-go="...")
  let goButtons = document.querySelectorAll("[data-go]");
  goButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchTab(btn.getAttribute("data-go"));
    });
  });

  // Auth switch buttons (Login / Sign up)
  let authTabs = document.querySelectorAll(".auth-tab");
  authTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      switchAuthMode(tab.getAttribute("data-auth-tab"));
    });
  });

  // Forms
  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document.getElementById("signup-form").addEventListener("submit", handleSignup);
  document.getElementById("logout-button").addEventListener("click", handleLogout);

  document.getElementById("leetcode-form").addEventListener("submit", function (e) {
    e.preventDefault();
    refreshLeetCodeProgress();
  });

  document.getElementById("gfg-form").addEventListener("submit", function (e) {
    e.preventDefault();
    refreshGfgProgress();
  });

  document.getElementById("question-form").addEventListener("submit", onQuestionSubmit);
  document.getElementById("offer-form").addEventListener("submit", onOfferSubmit);
  document.getElementById("profile-form").addEventListener("submit", saveProfile);
  document.getElementById("feedback-form").addEventListener("submit", saveFeedback);

  document.getElementById("profile-card").addEventListener("click", function (event) {
    if (event.target.closest("[data-edit-profile]")) openProfileEditor();
  });

  document.getElementById("profile-photo-input").addEventListener("change", function (event) {
    let file = event.target.files[0];
    let preview = document.getElementById("profile-photo-preview");
    if (!file || !file.type.startsWith("image/")) return;
    let reader = new FileReader();
    reader.addEventListener("load", function () {
      preview.innerHTML = `<img src="${escapeHtml(String(reader.result || ""))}" alt="Selected profile photo preview" />`;
    });
    reader.readAsDataURL(file);
  });

  document.getElementById("profile-cancel").addEventListener("click", function () {
    document.getElementById("profile-dialog").close();
  });
  document.getElementById("profile-cancel-bottom").addEventListener("click", function () {
    document.getElementById("profile-dialog").close();
  });

  // Offer slot toggle button
  let offerToggle = document.getElementById("offer-toggle");
  offerToggle.addEventListener("click", function () {
    let form = document.getElementById("offer-form");
    let isHidden = form.hidden;
    form.hidden = !isHidden;
    offerToggle.setAttribute("aria-expanded", String(isHidden));
    offerToggle.textContent = isHidden ? "− Hide slot form" : "+ Offer a slot";
    if (isHidden) {
      form.querySelector("input, select").focus();
    }
  });

  // Schedule grid actions delegation (book, remove, or quick offer from empty cell)
  document.getElementById("schedule-grid").addEventListener("click", function (event) {
    let bookBtn = event.target.closest("[data-book-slot]");
    if (bookBtn) {
      tryBooking(bookBtn.getAttribute("data-book-slot"));
      return;
    }

    let removeBtn = event.target.closest("[data-remove-slot]");
    if (removeBtn) {
      removeSlot(removeBtn.getAttribute("data-remove-slot"));
      return;
    }

    let emptyCell = event.target.closest("[data-offer-day]");
    if (emptyCell) {
      let day = emptyCell.getAttribute("data-offer-day");
      let time = emptyCell.getAttribute("data-offer-time");
      openOfferForSlot(day, time);
    }
  });

  // Bookings table action buttons delegation
  document.getElementById("bookings-table-wrap").addEventListener("click", function (event) {
    let doneBtn = event.target.closest("[data-done]");
    let rejectBtn = event.target.closest("[data-reject]");
    let cancelBtn = event.target.closest("[data-cancel]");
    let feedbackBtn = event.target.closest("[data-feedback]");

    if (doneBtn) markDone(doneBtn.getAttribute("data-done"));
    if (rejectBtn) rejectBooking(rejectBtn.getAttribute("data-reject"));
    if (cancelBtn) cancelBooking(cancelBtn.getAttribute("data-cancel"));
    if (feedbackBtn) openFeedback(feedbackBtn.getAttribute("data-feedback"));
  });

  // Close feedback dialog buttons
  document.getElementById("feedback-cancel").addEventListener("click", function () {
    document.getElementById("feedback-dialog").close();
  });
  document.getElementById("feedback-cancel-bottom").addEventListener("click", function () {
    document.getElementById("feedback-dialog").close();
  });

  // Slider outputs in feedback modal
  let sliderInputs = document.querySelectorAll(".sliders input");
  sliderInputs.forEach(function (slider) {
    slider.addEventListener("input", function () {
      let output = slider.closest("label").querySelector("output");
      if (output) output.value = slider.value;
    });
  });

  // Identity input manual change (for guest mode)
  identityInput.addEventListener("input", function () {
    if (identityInput.readOnly) {
      identityInput.value = getCurrentAccount() ? getCurrentAccount().name : PrepStorage.getWhoami();
      return;
    }

    let nextValue = identityInput.value.trim();
    PrepStorage.setWhoami(nextValue);

    let account = getCurrentAccount();
    if (account) {
      account.name = nextValue;
      let users = PrepStorage.getUsers();
      let index = users.findIndex(function (u) { return u.email === account.email; });
      if (index >= 0) {
        users[index] = { ...users[index], name: nextValue };
        PrepStorage.setUsers(users);
        PrepStorage.setCurrentUser({ ...account, name: nextValue });
      }
    }

    renderDashboard();
    renderSchedule();
  });

  // Window events
  window.addEventListener("storage", function () {
    setIdentityFromAccount();
    renderAll();
  });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) renderAll();
  });
  window.addEventListener("focus", renderAll);

  // Initial user setup
  if (currentUserAccount) {
    showAppScreen();
    leetCodeUsername = PrepStorage.getLeetCodeUsername();
    gfgUsername = PrepStorage.getGfgUsername() || leetCodeUsername;
    if (gfgUsername && !PrepStorage.getGfgUsername()) {
      PrepStorage.setGfgUsername(gfgUsername);
    }
  } else {
    showAuthScreen();
    switchAuthMode("login");
  }

  renderAll();
}

// Start application
initialize();
