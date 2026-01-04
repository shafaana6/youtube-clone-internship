document.addEventListener("DOMContentLoaded", () => {

  /* ========= ELEMENTS ========= */
  const video = document.getElementById("videoPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const backwardBtn = document.getElementById("backwardBtn");
  const forwardBtn = document.getElementById("forwardBtn");
  const progressBar = document.getElementById("progressBar");
  const timeDisplay = document.getElementById("timeDisplay");
  const controls = document.querySelector(".controls");

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

  const gestureArea = document.getElementById("gestureArea");

  const downloadBtn = document.getElementById("downloadBtn");
  const downloadMsg = document.getElementById("downloadMsg");

  /* ========= LOGIN ========= */
  let currentUser = localStorage.getItem("user");

  function updateLoginUI() {
    const loggedIn = Boolean(currentUser);
    loginStatus.textContent = loggedIn
      ? `Logged in as ${currentUser}`
      : "Not logged in";

    loginBtn.style.display = loggedIn ? "none" : "inline-block";
    logoutBtn.style.display = loggedIn ? "inline-block" : "none";
    usernameInput.style.display = loggedIn ? "none" : "block";
    addCommentBtn.disabled = !loggedIn;
    commentInput.disabled = !loggedIn;
  }

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

  updateLoginUI();

  /* ========= PLAN ========= */
  const PLAN_LIMITS = {
    FREE: 30,
    BRONZE: 420,
    SILVER: 600,
    GOLD: Infinity
  };

  let userPlan = localStorage.getItem("plan") || "FREE";
  localStorage.setItem("plan", userPlan);

  function updatePlanUI() {
    currentPlanTop.textContent = userPlan;
    currentPlanBottom.textContent = userPlan;
    lockMessage.style.display = "none";
    controls.classList.remove("disabled");
  }

  planButtons.forEach(btn => {
    btn.onclick = () => {
      userPlan = btn.dataset.plan;
      localStorage.setItem("plan", userPlan);
      updatePlanUI();
    };
  });

  updatePlanUI();

  /* ========= DOWNLOAD ========= */
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      if (userPlan !== "GOLD") {
        downloadMsg.textContent = "Upgrade to GOLD to download this video.";
        downloadMsg.style.color = "#ff4d4d";
        return;
      }

      downloadMsg.textContent = "Download started...";
      downloadMsg.style.color = "#4CAF50";

      const link = document.createElement("a");
      link.href = video.currentSrc || "assets/sample.mp4";
      link.download = "mytube-video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }

  /* ========= VIDEO ========= */
  playPauseBtn.onclick = () => {
    video.paused ? video.play() : video.pause();
  };

  backwardBtn.onclick = () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  forwardBtn.onclick = () => {
    if (!video.duration) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  };

  video.addEventListener("loadedmetadata", () => {
    progressBar.max = video.duration;
  });

  video.addEventListener("timeupdate", () => {
    if (!video.duration) return;

    const limit = PLAN_LIMITS[userPlan];
    if (video.currentTime >= limit) {
      video.currentTime = limit;
      video.pause();
      lockMessage.style.display = "block";
      controls.classList.add("disabled");
    }

    progressBar.value = video.currentTime;
    timeDisplay.textContent =
      `${Math.floor(video.currentTime)}s / ${Math.floor(video.duration)}s`;
  });

  progressBar.oninput = () => {
    video.currentTime = Math.min(progressBar.value, PLAN_LIMITS[userPlan]);
  };

  /* ========= TRANSLATION DATA ========= */
  const DICTIONARIES = {
    Hindi: {
      namaste: "hello",
      shukriya: "thank you",
      dhanyavaad: "thank you",
      dost: "friend",
      pyaar: "love"
    },
    Tamil: {
      vanakkam: "hello",
      nandri: "thank you",
      nanri: "thank you",
      nanban: "friend",
      kadhal: "love",
      epdi: "how",
      enna: "what"
    },
    Other: {
      hola: "hello",
      bonjour: "hello",
      amigo: "friend",
      gracias: "thank you",
      danke: "thank you",
      salaam: "peace"
    }
  };

  function detectLanguage(word) {
    for (const lang in DICTIONARIES) {
      if (DICTIONARIES[lang][word]) {
        return {
          language: lang,
          translation: DICTIONARIES[lang][word]
        };
      }
    }
    return null;
  }

  /* ========= COMMENTS ========= */
  let comments = JSON.parse(localStorage.getItem("comments")) || [];

  function renderComments() {
    commentsList.innerHTML = "";

    if (comments.length === 0) {
      commentsList.innerHTML = `
        <p style="color:#aaa;font-size:14px;">
          No comments yet. Be the first to comment!
        </p>`;
      return;
    }

    comments.forEach((c, i) => {
      const div = document.createElement("div");
      div.dataset.index = i;

      div.innerHTML = `
        <p><strong>${c.user}</strong></p>
        <p class="comment-text">${c.text}</p>

        <div class="comment-actions">
          <button data-action="like">👍 ${c.likes}</button>
          <button data-action="dislike">👎 ${c.dislikes}</button>
          <button data-action="translate">
            ${c.showTranslation ? "❌ Hide" : "🌐 Translate"}
          </button>
        </div>

        ${
          c.showTranslation
            ? `<p class="comment-text translated" style="opacity:0.7;">
                → ${c.translated}<br>
                <small>Detected: ${c.language}</small>
              </p>`
            : ""
        }
      `;

      commentsList.appendChild(div);
    });
  }

  commentsList.onclick = e => {
    if (!currentUser) return;

    const btn = e.target.closest("button");
    if (!btn) return;

    const card = btn.closest("div[data-index]");
    const i = Number(card.dataset.index);
    const action = btn.dataset.action;

    if (action === "like") comments[i].likes++;

    if (action === "dislike") {
      comments[i].dislikes++;
      if (comments[i].dislikes >= 2) comments.splice(i, 1);
    }

    if (action === "translate") {
      if (comments[i].translated) {
        comments[i].showTranslation = !comments[i].showTranslation;
      } else {
        const key = comments[i].text.toLowerCase();
        const result = detectLanguage(key);

        comments[i].translated = result
          ? result.translation
          : "Translation not available";
        comments[i].language = result
          ? result.language
          : "Unknown";
        comments[i].showTranslation = true;
      }
    }

    localStorage.setItem("comments", JSON.stringify(comments));
    renderComments();
  };

  addCommentBtn.onclick = () => {
    const text = commentInput.value.trim();
    if (!text) return;

    comments.push({
      user: currentUser,
      text,
      likes: 0,
      dislikes: 0,
      translated: null,
      language: null,
      showTranslation: false
    });

    localStorage.setItem("comments", JSON.stringify(comments));
    renderComments();
    commentInput.value = "";
  };

  renderComments();

  /* ========= GESTURES ========= */
  gestureArea.onclick = e => {
    const w = gestureArea.clientWidth;
    if (e.offsetX < w / 3) backwardBtn.click();
    else if (e.offsetX > (w * 2) / 3) forwardBtn.click();
    else playPauseBtn.click();
  };

});
