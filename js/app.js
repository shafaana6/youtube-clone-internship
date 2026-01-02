const video = document.getElementById("videoPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const timeDisplay = document.getElementById("timeDisplay");

// PLAY / PAUSE
playPauseBtn.addEventListener("click", () => {
  if (video.paused) {
    video.play();
    playPauseBtn.textContent = "⏸️";
  } else {
    video.pause();
    playPauseBtn.textContent = "▶️";
  }
});

// UPDATE PROGRESS BAR
video.addEventListener("timeupdate", () => {
  const progress = (video.currentTime / video.duration) * 100;
  progressBar.value = progress;

  const minutes = Math.floor(video.currentTime / 60);
  const seconds = Math.floor(video.currentTime % 60)
    .toString()
    .padStart(2, "0");

  timeDisplay.textContent = `${minutes}:${seconds}`;
});

// SEEK VIDEO
progressBar.addEventListener("input", () => {
  const seekTime = (progressBar.value / 100) * video.duration;
  video.currentTime = seekTime;
});
const backwardBtn = document.getElementById("backwardBtn");
const forwardBtn = document.getElementById("forwardBtn");

// SKIP BACKWARD 10s
backwardBtn.addEventListener("click", () => {
  video.currentTime = Math.max(0, video.currentTime - 10);
});

// SKIP FORWARD 10s
forwardBtn.addEventListener("click", () => {
  video.currentTime = Math.min(video.duration, video.currentTime + 10);
});

const gestureArea = document.getElementById("gestureArea");
let lastTapTime = 0;

gestureArea.addEventListener("click", (e) => {
  // ❌ Ignore clicks coming from controls
  if (e.target.closest(".controls")) return;

  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;

  const areaWidth = gestureArea.offsetWidth;
  const tapX = e.offsetX;

  // DOUBLE TAP
  if (tapLength < 300 && tapLength > 0) {
    if (tapX < areaWidth / 2) {
      video.currentTime = Math.max(0, video.currentTime - 10);
    } else {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
    }
  }
  // SINGLE TAP
  else {
    if (video.paused) {
      video.play();
      playPauseBtn.textContent = "⏸️";
    } else {
      video.pause();
      playPauseBtn.textContent = "▶️";
    }
  }

  lastTapTime = currentTime;
});
