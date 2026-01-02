// ================== ELEMENTS ==================
const video = document.getElementById("videoPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const timeDisplay = document.getElementById("timeDisplay");
const backwardBtn = document.getElementById("backwardBtn");
const forwardBtn = document.getElementById("forwardBtn");
const gestureArea = document.getElementById("gestureArea");

// ================== PLAN & WATCH LIMIT ==================
const userPlan = localStorage.getItem("plan") || "FREE";

const planLimits = {
  FREE: 30,        // demo: 30 seconds
  BRONZE: 420,     // 7 minutes
  SILVER: 600,     // 10 minutes
  GOLD: Infinity
};

const maxWatchTime = planLimits[userPlan];

// ================== PLAY / PAUSE ==================
playPauseBtn.addEventListener("click", () => {
  if (video.paused) {
    // prevent replay beyond limit
    if (userPlan !== "GOLD" && video.currentTime >= maxWatchTime) {
      alert("Watch limit reached. Upgrade to continue watching.");
      return;
    }
    video.play();
    playPauseBtn.textContent = "⏸️";
  } else {
    video.pause();
    playPauseBtn.textContent = "▶️";
  }
});

// ================== TIME UPDATE + HARD LIMIT ==================
video.addEventListener("timeupdate", () => {
  // progress bar
  const progress = (video.currentTime / video.duration) * 100;
  progressBar.value = progress || 0;

  // time text
  const minutes = Math.floor(video.currentTime / 60);
  const seconds = Math.floor(video.currentTime % 60)
    .toString()
    .padStart(2, "0");
  timeDisplay.textContent = `${minutes}:${seconds}`;

  // HARD STOP
  if (userPlan !== "GOLD" && video.currentTime >= maxWatchTime) {
    video.currentTime = maxWatchTime;
    video.pause();
    playPauseBtn.textContent = "▶️";
    alert("Watch limit reached. Upgrade to continue watching.");
  }
});

// ================== SEEK (BLOCK OVER LIMIT) ==================
progressBar.addEventListener("input", () => {
  const seekTime = (progressBar.value / 100) * video.duration;

  if (userPlan !== "GOLD" && seekTime > maxWatchTime) {
    video.currentTime = maxWatchTime;
    video.pause();
    alert("Watch limit reached. Upgrade to continue watching.");
  } else {
    video.currentTime = seekTime;
  }
});

// ================== SKIP BUTTONS ==================
backwardBtn.addEventListener("click", () => {
  video.currentTime = Math.max(0, video.currentTime - 10);
});

forwardBtn.addEventListener("click", () => {
  const nextTime = video.currentTime + 10;

  if (userPlan !== "GOLD" && nextTime > maxWatchTime) {
    video.currentTime = maxWatchTime;
    video.pause();
    alert("Watch limit reached. Upgrade to continue watching.");
  } else {
    video.currentTime = Math.min(video.duration, nextTime);
  }
});

// ================== GESTURE CONTROLS ==================
let lastTapTime = 0;

gestureArea.addEventListener("click", (e) => {
  if (e.target.closest(".controls")) return;

  const now = Date.now();
  const diff = now - lastTapTime;
  const width = gestureArea.offsetWidth;
  const tapX = e.offsetX;

  // DOUBLE TAP
  if (diff < 300 && diff > 0) {
    if (tapX < width / 2) {
      video.currentTime = Math.max(0, video.currentTime - 10);
    } else {
      const nextTime = video.currentTime + 10;
      if (userPlan !== "GOLD" && nextTime > maxWatchTime) {
        video.currentTime = maxWatchTime;
        video.pause();
        alert("Watch limit reached. Upgrade to continue watching.");
      } else {
        video.currentTime = Math.min(video.duration, nextTime);
      }
    }
  }
  // SINGLE TAP
  else {
    if (video.paused) {
      if (userPlan !== "GOLD" && video.currentTime >= maxWatchTime) {
        alert("Watch limit reached. Upgrade to continue watching.");
        return;
      }
      video.play();
      playPauseBtn.textContent = "⏸️";
    } else {
      video.pause();
      playPauseBtn.textContent = "▶️";
    }
  }

  lastTapTime = now;
});

// ================== PLAN UI LOGIC ==================
const planButtons = document.querySelectorAll(".plan-btn");
const currentPlanText = document.getElementById("currentPlanText");

// Show current plan on load
currentPlanText.textContent = userPlan;

// Highlight active plan
planButtons.forEach(btn => {
  if (btn.dataset.plan === userPlan) {
    btn.classList.add("active");
  }

  btn.addEventListener("click", () => {
    const selectedPlan = btn.dataset.plan;

    // Save plan
    localStorage.setItem("plan", selectedPlan);

    alert(`Plan changed to ${selectedPlan}. Page will reload.`);

    // Reload to apply new limits
    location.reload();
  });
});

