document.addEventListener("DOMContentLoaded", () => {

  // ELEMENTS
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

  // PLAN SETUP
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

  // VIDEO CONTROLS
  playPauseBtn.onclick = () => {
    if (video.paused) {
      video.play();
      playPauseBtn.textContent = "⏸️";
    } else {
      video.pause();
      playPauseBtn.textContent = "▶️";
    }
  };

  backwardBtn.onclick = () => video.currentTime -= 10;
  forwardBtn.onclick = () => video.currentTime += 10;

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

  // COMMENTS
  let comments = JSON.parse(localStorage.getItem("comments")) || [];

  function saveComments() {
    localStorage.setItem("comments", JSON.stringify(comments));
  }

  function renderComments() {
    commentsList.innerHTML = "";
    comments.forEach((c, i) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <p>${c.text}</p>
        <button onclick="like(${i})">👍 ${c.likes}</button>
        <button onclick="dislike(${i})">👎 ${c.dislikes}</button>
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
    comments.push({ text, likes: 0, dislikes: 0 });
    saveComments();
    renderComments();
    commentInput.value = "";
  };

  renderComments();
});
