// ================== VIDEO ELEMENTS ==================
const video = document.getElementById("videoPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const backwardBtn = document.getElementById("backwardBtn");
const forwardBtn = document.getElementById("forwardBtn");
const progressBar = document.getElementById("progressBar");
const timeDisplay = document.getElementById("timeDisplay");

const upgradeBtn = document.getElementById("upgradeBtn");
const currentPlanTextTop = document.getElementById("currentPlan");
const currentPlanTextBottom = document.getElementById("currentPlanText");
const planButtons = document.querySelectorAll(".plan-btn");

// ================== PLAN SETUP ==================
let userPlan = localStorage.getItem("plan");

if (!userPlan) {
  userPlan = "FREE";
  localStorage.setItem("plan", "FREE");
}

currentPlanTextTop.innerText = userPlan;
currentPlanTextBottom.innerText = userPlan;

const PLAN_LIMITS = {
  FREE: 30,
  BRONZE: 420,
  SILVER: 600,
  GOLD: Infinity
};

// ================== VIDEO CONTROLS ==================
playPauseBtn.addEventListener("click", () => {
  if (video.paused) {
    video.play();
    playPauseBtn.textContent = "⏸️";
  } else {
    video.pause();
    playPauseBtn.textContent = "▶️";
  }
});

backwardBtn.addEventListener("click", () => {
  video.currentTime = Math.max(0, video.currentTime - 10);
});

forwardBtn.addEventListener("click", () => {
  video.currentTime = Math.min(video.duration, video.currentTime + 10);
});

video.addEventListener("timeupdate", () => {
  if (!video.duration) return;

  progressBar.value = (video.currentTime / video.duration) * 100;

  const current = Math.floor(video.currentTime);
  const total = Math.floor(video.duration);
  timeDisplay.textContent = `${current}s / ${total}s`;

  if (video.currentTime >= PLAN_LIMITS[userPlan]) {
    video.pause();
    alert("Your plan limit is reached. Upgrade to continue.");
  }
});

progressBar.addEventListener("input", () => {
  video.currentTime = (progressBar.value / 100) * video.duration;
});

// ================== PLAN BUTTONS ==================
upgradeBtn.addEventListener("click", () => {
  userPlan = "GOLD";
  localStorage.setItem("plan", "GOLD");
  currentPlanTextTop.innerText = "GOLD";
  currentPlanTextBottom.innerText = "GOLD";
  alert("Upgraded to GOLD plan 🎉");
});

planButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const selectedPlan = btn.dataset.plan;
    userPlan = selectedPlan;
    localStorage.setItem("plan", selectedPlan);
    currentPlanTextTop.innerText = selectedPlan;
    currentPlanTextBottom.innerText = selectedPlan;
    alert(`Switched to ${selectedPlan} plan`);
  });
});

// ================== COMMENTS SYSTEM ==================
const commentInput = document.getElementById("commentInput");
const addCommentBtn = document.getElementById("addCommentBtn");
const commentsList = document.getElementById("commentsList");

let comments = JSON.parse(localStorage.getItem("comments")) || [];

function saveComments() {
  localStorage.setItem("comments", JSON.stringify(comments));
}

function hasSpecialChars(text) {
  return /[^a-zA-Z0-9\s]/.test(text);
}

function renderComments() {
  commentsList.innerHTML = "";

  comments.forEach((comment, index) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <p>${comment.text}</p>
      <button onclick="likeComment(${index})">👍 ${comment.likes}</button>
      <button onclick="dislikeComment(${index})">👎 ${comment.dislikes}</button>
      <hr>
    `;

    commentsList.appendChild(div);
  });
}

addCommentBtn.addEventListener("click", () => {
  const text = commentInput.value.trim();

  if (!text) {
    alert("Comment cannot be empty");
    return;
  }

  if (hasSpecialChars(text)) {
    alert("Special characters are not allowed");
    return;
  }

  comments.push({
    text,
    likes: 0,
    dislikes: 0
  });

  saveComments();
  renderComments();
  commentInput.value = "";
});

function likeComment(index) {
  comments[index].likes++;
  saveComments();
  renderComments();
}

function dislikeComment(index) {
  comments[index].dislikes++;

  if (comments[index].dislikes >= 2) {
    comments.splice(index, 1);
  }

  saveComments();
  renderComments();
}

renderComments();
