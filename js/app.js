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

  /* ========= HELPERS ========= */
  function isValidComment(text) {
    return /^[a-zA-Z0-9\s.,!?🙂😂😍👍]+$/.test(text);
  }

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

  /* ========= COMMENTS ========= */
  let comments = JSON.parse(localStorage.getItem("comments")) || [];

  function saveAndRender() {
    localStorage.setItem("comments", JSON.stringify(comments));
    renderComments();
  }

  function renderComments() {
    commentsList.innerHTML = "";

    if (comments.length === 0) {
      commentsList.innerHTML =
        `<p style="color:#aaa;font-size:14px;">No comments yet.</p>`;
      return;
    }

    comments.forEach(c => {
      const div = document.createElement("div");

      div.innerHTML = `
        <p><strong>${c.user}</strong></p>
        <p class="comment-text">${c.text}</p>

        <div class="comment-actions">
          <button data-id="${c.id}" data-action="like">👍 ${c.likes}</button>
          <button data-id="${c.id}" data-action="dislike">👎 ${c.dislikes}</button>
        </div>
      `;

      commentsList.appendChild(div);
    });
  }

  commentsList.onclick = e => {
    const btn = e.target.closest("button");
    if (!btn || !currentUser) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    const comment = comments.find(c => c.id === id);
    if (!comment) return;

    if (action === "like") {
      comment.likes++;
    }

    if (action === "dislike") {
      comment.dislikes++;
      if (comment.dislikes >= 2) {
        comments = comments.filter(c => c.id !== id);
      }
    }

    saveAndRender();
  };

  addCommentBtn.onclick = () => {
    const text = commentInput.value.trim();
    if (!text) return;

    if (!isValidComment(text)) {
      alert("Special characters are not allowed.");
      return;
    }

    comments.push({
      id: crypto.randomUUID(), // 🔥 KEY FIX
      user: currentUser,
      text,
      likes: 0,
      dislikes: 0
    });

    saveAndRender();
    commentInput.value = "";
  };

  renderComments();

});
