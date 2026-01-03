document.addEventListener("DOMContentLoaded", () => {

  /* ---------- ELEMENTS ---------- */
  const video = document.getElementById("videoPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const backwardBtn = document.getElementById("backwardBtn");
  const forwardBtn = document.getElementById("forwardBtn");
  const progressBar = document.getElementById("progressBar");
  const timeDisplay = document.getElementById("timeDisplay");

  const upgradeBtn = document.getElementById("upgradeBtn");
  const currentPlanTop = document.getElementById("currentPlan");
  const currentPlanBottom = document.getElementById("currentPlanText");
  const planButtons = document.querySelectorAll(".plan-btn");
  const lockMessage = document.getElementById("lockMessage");

  const commentInput = document.getElementById("commentInput");
  const addCommentBtn = document.getElementById("addCommentBtn");
  const commentsList = document.getElementById("commentsList");

  const usernameInput = document.getElementById("usernameInput");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginStatus = document.getElementById("loginStatus");

  /* ---------- CITY DETECTION ---------- */
  let userCity = "Unknown";

  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => userCity = data.city || "Unknown")
    .catch(() => userCity = "Unknown");

  /* ---------- LOGIN ---------- */
  let currentUser = localStorage.getItem("user");

  function updateLoginUI() {
    if (currentUser) {
      loginStatus.textContent = `Logged in as ${currentUser}`;
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      usernameInput.style.display = "none";
      addCommentBtn.disabled = false;
    } else {
      loginStatus.textContent = "Not logged in";
      loginBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
      usernameInput.style.display = "block";
      addCommentBtn.disabled = true;
    }
  }

  updateLoginUI();

  loginBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) return;
    currentUser = name;
    localStorage.setItem("user", name);
    updateLoginUI();
  };

  logoutBtn.onclick = () => {
    currentUser = null;
    localStorage.removeItem("user");
    updateLoginUI();
  };

  /* ---------- PLAN SETUP ---------- */
  let userPlan = localStorage.getItem("plan") || "FREE";
  localStorage.setItem("plan", userPlan);
  currentPlanTop.textContent = userPlan;
  currentPlanBottom.textContent = userPlan;

  const PLAN_LIMITS = {
    FREE: 30,
    BRONZE: 420,
    SILVER: 600,
    GOLD: Infinity
  };

  /* ---------- VIDEO CONTROLS ---------- */
  playPauseBtn.onclick = () => {
    if (video.paused) {
      video.play();
      playPauseBtn.textContent = "⏸️";
    } else {
      video.pause();
      playPauseBtn.textContent = "▶️";
    }
  };

  backwardBtn.onclick = () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  forwardBtn.onclick = () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  };

  video.ontimeupdate = () => {
    if (!video.duration) return;

    progressBar.value = (video.currentTime / video.duration) * 100;
    timeDisplay.textContent =
      `${Math.floor(video.currentTime)}s / ${Math.floor(video.duration)}s`;

    if (video.currentTime >= PLAN_LIMITS[userPlan]) {
      video.pause();
      lockMessage.style.display = "block";
    }
  };

  progressBar.oninput = () => {
    video.currentTime = (progressBar.value / 100) * video.duration;
  };

  function unlock() {
    lockMessage.style.display = "none";
  }

  upgradeBtn.onclick = () => {
    userPlan = "GOLD";
    localStorage.setItem("plan", "GOLD");
    currentPlanTop.textContent = "GOLD";
    currentPlanBottom.textContent = "GOLD";
    unlock();
  };

  planButtons.forEach(btn => {
    btn.onclick = () => {
      userPlan = btn.dataset.plan;
      localStorage.setItem("plan", userPlan);
      currentPlanTop.textContent = userPlan;
      currentPlanBottom.textContent = userPlan;
      unlock();
    };
  });

  /* ---------- COMMENTS ---------- */
  let comments = JSON.parse(localStorage.getItem("comments")) || [];

  function saveComments() {
    localStorage.setItem("comments", JSON.stringify(comments));
  }

  function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  async function translateComment(index) {
    const translatedEl = document.getElementById(`translated-${index}`);
    if (!translatedEl) return;

    if (translatedEl.style.display === "block") {
      translatedEl.style.display = "none";
      return;
    }

    try {
      const res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: comments[index].text,
          source: "auto",
          target: "en",
          format: "text"
        })
      });

      const data = await res.json();
      translatedEl.textContent = "→ " + data.translatedText;
      translatedEl.style.display = "block";
    } catch {
      translatedEl.textContent = "Translation failed";
      translatedEl.style.display = "block";
    }
  }

  function renderComments() {
    commentsList.innerHTML = "";

    comments.forEach((c, i) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <div class="comment-user">
          <div class="comment-avatar">👤</div>
          <span>
            ${c.user || "Guest"} • ${c.city || "Unknown"} • ${c.time ? timeAgo(c.time) : "just now"}
          </span>
        </div>

        <p class="comment-text">${c.text}</p>

        <div class="comment-actions">
          <button onclick="like(${i})">👍 ${c.likes}</button>
          <button onclick="dislike(${i})">👎 ${c.dislikes}</button>
          <button onclick="translateComment(${i})">🌐 Translate</button>
        </div>

        <p class="comment-text" id="translated-${i}" style="display:none; opacity:0.8;"></p>
      `;
      commentsList.appendChild(div);
    });
  }

  window.like = i => {
    comments[i].likes++;
    saveComments();
    renderComments();
  };

  window.dislike = i => {
    comments[i].dislikes++;
    if (comments[i].dislikes >= 2) comments.splice(i, 1);
    saveComments();
    renderComments();
  };

  addCommentBtn.onclick = () => {
    const text = commentInput.value.trim();
    if (!text || /[^a-zA-Z0-9\s]/.test(text)) return;

    comments.push({
      text,
      likes: 0,
      dislikes: 0,
      city: userCity,
      time: Date.now(),
      user: currentUser
    });

    saveComments();
    renderComments();
    commentInput.value = "";
  };

  /* ---------- GESTURE CONTROLS ---------- */
  const tapLeft = document.getElementById("tapLeft");
  const tapCenter = document.getElementById("tapCenter");
  const tapRight = document.getElementById("tapRight");

  function setupGestures(zone, actions) {
    if (!zone) return;

    let taps = 0;
    let timer = null;

    const handler = () => {
      taps++;
      clearTimeout(timer);

      timer = setTimeout(() => {
        if (taps === 1 && actions.single) actions.single();
        if (taps === 2 && actions.double) actions.double();
        if (taps === 3 && actions.triple) actions.triple();
        taps = 0;
      }, 300);
    };

    zone.addEventListener("click", handler);
    zone.addEventListener("touchstart", handler);
  }

  setupGestures(tapLeft, {
    double: () => video.currentTime = Math.max(0, video.currentTime - 10),
    triple: () => document.querySelector(".comments-section")?.scrollIntoView({ behavior: "smooth" })
  });

  setupGestures(tapCenter, {
    single: () => playPauseBtn.click(),
    triple: () => alert("Next video (demo)")
  });

  setupGestures(tapRight, {
    double: () => video.currentTime = Math.min(video.duration, video.currentTime + 10),
    triple: () => confirm("Close website?") && window.close()
  });

  renderComments();
});
