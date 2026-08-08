const DOWNLOAD_URL = "https://github.com/Beni-rajpoot/Hand-and-EyeControlled-Human-Computer-Interaction-System/releases/download/v1.0.0/HCI-Controller.exe";
const STORAGE_KEY = "hciPortalData";
const ADMIN_SESSION_KEY = "hciAdminLoggedIn";
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin@123";
let releaseAvailable = false;

const defaultData = {
  users: [],
  downloads: 0,
  ratings: [],
  activeUserEmail: null,
  signupCompleted: false,
  downloadUsed: false
};

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? JSON.parse(raw) : {};
  return { ...defaultData, ...parsed };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function updateDownloadState() {
  const downloadBtn = document.getElementById("downloadBtn");
  const gate = document.getElementById("downloadGate");
  if (!downloadBtn || !gate) return;

  const data = loadData();
  const isUnlocked = Boolean(data.signupCompleted && data.activeUserEmail && !data.downloadUsed);
  if (isUnlocked) {
    downloadBtn.classList.remove("disabled");
    downloadBtn.href = DOWNLOAD_URL;
    gate.textContent = `Download unlocked for ${data.activeUserEmail}.`;
  } else {
    downloadBtn.classList.add("disabled");
    downloadBtn.href = "#";
    if (data.signupCompleted && data.activeUserEmail && data.downloadUsed) {
      gate.textContent = "Download completed. Please signup again to download the software.";
    } else {
      gate.textContent = "Signup is required before downloading the software.";
    }
  }
}

async function checkReleaseAvailability() {
  const downloadBtn = document.getElementById("downloadBtn");
  if (!downloadBtn) return;

  try {
    const response = await fetch(DOWNLOAD_URL, { method: "HEAD", cache: "no-store" });
    releaseAvailable = response.ok;
  } catch {
    releaseAvailable = false;
  }
  updateDownloadState();
}

function updateAdminDashboard() {
  const userCount = document.getElementById("userCount");
  if (!userCount) return;

  if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== "true") {
    window.location.href = "admin-login.html";
    return;
  }

  const data = loadData();
  const ratingTotal = data.ratings.reduce((sum, item) => sum + Number(item.rating), 0);
  const average = data.ratings.length ? ratingTotal / data.ratings.length : 0;

  userCount.textContent = data.users.length;
  document.getElementById("downloadCount").textContent = data.downloads;
  document.getElementById("ratingCount").textContent = data.ratings.length;
  document.getElementById("avgRating").textContent = average.toFixed(1);

  const userList = document.getElementById("userList");
  const feedbackList = document.getElementById("feedbackList");

  userList.innerHTML = data.users.length
    ? data.users.slice(-6).reverse().map((user) => `
      <div class="list-row">
        <strong>${escapeHtml(user.name)}</strong>
        <span>${escapeHtml(user.email)} | ${escapeHtml(user.role)}</span>
      </div>
    `).join("")
    : `<div class="list-row"><span>No users yet.</span></div>`;

  feedbackList.innerHTML = data.ratings.length
    ? data.ratings.slice(-6).reverse().map((item) => `
      <div class="list-row">
        <strong>${item.rating}/5 from ${escapeHtml(item.email)}</strong>
        <span>${escapeHtml(item.feedback || "No written feedback.")}</span>
      </div>
    `).join("")
    : `<div class="list-row"><span>No ratings yet.</span></div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const signupForm = document.getElementById("signup");
if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = loadData();
    const user = {
      name: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim().toLowerCase(),
      role: document.getElementById("role").value,
      createdAt: new Date().toISOString()
    };

    const existing = data.users.find((item) => item.email === user.email);
    if (!existing) {
      data.users.push(user);
    }
    data.activeUserEmail = user.email;
    data.signupCompleted = true;
    data.downloadUsed = false;
    saveData(data);

    document.getElementById("signupMessage").textContent = existing
      ? "Welcome back. Your download is unlocked."
      : "Account created. Your download is unlocked.";
    updateDownloadState();
  });
}

const downloadBtn = document.getElementById("downloadBtn");
if (downloadBtn) {
  downloadBtn.addEventListener("click", (event) => {
    const data = loadData();
    if (!data.signupCompleted || !data.activeUserEmail || data.downloadUsed) {
      event.preventDefault();
      document.getElementById("downloadGate").textContent = "Please signup first to unlock the download.";
      document.getElementById("signup").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    data.downloads += 1;
    data.downloadUsed = true;
    saveData(data);

    setTimeout(() => {
    updateDownloadState();
    }, 1000);
  });
}

const ratingForm = document.getElementById("ratingForm");
if (ratingForm) {
  ratingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = loadData();
    data.ratings.push({
      email: data.activeUserEmail || "anonymous",
      rating: Number(document.getElementById("rating").value),
      feedback: document.getElementById("feedback").value.trim(),
      createdAt: new Date().toISOString()
    });
    saveData(data);
    document.getElementById("ratingMessage").textContent = "Thanks. Your feedback has been recorded.";
    event.target.reset();
  });
}

const adminLoginForm = document.getElementById("adminLoginForm");
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("adminEmail").value.trim().toLowerCase();
    const password = document.getElementById("adminPassword").value;
    const message = document.getElementById("adminLoginMessage");

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      message.textContent = "Login successful. Redirecting...";
      window.location.href = "admin.html";
      return;
    }

    message.textContent = "Invalid email or password.";
  });
}

const adminLogout = document.getElementById("adminLogout");
if (adminLogout) {
  adminLogout.addEventListener("click", (event) => {
    event.preventDefault();
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.href = "admin-login.html";
  });
}

updateDownloadState();
updateAdminDashboard();
checkReleaseAvailability();
