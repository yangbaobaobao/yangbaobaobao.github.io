let canvasLose;
let ctxLose;
let loseRunning = false;

function startLose() {
  canvasLose = document.getElementById("gameOver");
  ctxLose = canvasLose.getContext("2d");

  loseRunning = true;
  resizeLose();
  drawTechBackground();
  captureFrame();
  loopx();
}
function resizeLose() {
  if (!canvasLose) return;

  canvasLose.width = innerWidth;
  canvasLose.height = innerHeight;
}

function stopLose() {
  loseRunning = false;
}

function loopx() {
  if (!loseRunning) return;

  drawFreezeGlitchOver();

  requestAnimationFrame(loopx);
}

addEventListener("resize", resizeLose);

let freezeGlitchLose = {
  snapshot: document.createElement("canvas")
};

function drawGrid(size, color, width) {
  ctxLose.strokeStyle = color;
  ctxLose.lineWidth = width;

  for (let x = 0; x <= canvasLose.width; x += size) {
    ctxLose.beginPath();
    ctxLose.moveTo(x, 0);
    ctxLose.lineTo(x, canvasLose.height);
    ctxLose.stroke();
  }

  for (let y = 0; y <= canvasLose.height; y += size) {
    ctxLose.beginPath();
    ctxLose.moveTo(0, y);
    ctxLose.lineTo(canvasLose.width, y);
    ctxLose.stroke();
  }
}

function drawTechBackground() {
  ctxLose.fillStyle = "#020b14";
  ctxLose.fillRect(0, 0, canvasLose.width, canvasLose.height);

  const cx = canvasLose.width / 2;
  const cy = canvasLose.height / 2;
  const r = 2000;

  ctxLose.save();

  ctxLose.beginPath();
  ctxLose.arc(cx, cy, r, 0, Math.PI * 2);
  ctxLose.clip();

  drawGrid(25, "rgba(0,190,255,0.15)", 1);
  drawGrid(150, "rgba(0,220,255,0.75)", 2);

  ctxLose.restore();

  drawGrid(450, "rgba(0,220,255,0.35)", 2);

  ctxLose.beginPath();
  ctxLose.arc(cx, cy, r, 0, Math.PI * 2);
  ctxLose.strokeStyle = "rgba(80,230,255,0.95)";
  ctxLose.lineWidth = 8;
  ctxLose.shadowColor = "cyan";
  ctxLose.shadowBlur = 25;
  ctxLose.stroke();
  ctxLose.shadowBlur = 0;

  // scan lines
  ctxLose.strokeStyle = "rgba(0,255,255,0.04)";
  ctxLose.lineWidth = 1;

  for (let y = 0; y < canvasLose.height; y += 4) {
    ctxLose.beginPath();
    ctxLose.moveTo(0, y);
    ctxLose.lineTo(canvasLose.width, y);
    ctxLose.stroke();
  }
}

function captureFrame() {
  freezeGlitchLose.snapshot.width = canvasLose.width;
  freezeGlitchLose.snapshot.height = canvasLose.height;

  const sctx = freezeGlitchLose.snapshot.getContext("2d");

  sctx.clearRect(
    0,
    0,
    freezeGlitchLose.snapshot.width,
    freezeGlitchLose.snapshot.height
  );

  sctx.drawImage(canvasLose, 0, 0);
}

function drawFreezeGlitchOver() {
  const img = freezeGlitchLose.snapshot;

  ctxLose.clearRect(0, 0, canvasLose.width, canvasLose.height);

  const sliceHeight = 6;

  for (let y = 0; y < canvasLose.height; y += sliceHeight) {
    const offsetX = Math.random() * 12 - 6;
    const offsetY = Math.random() * 2 - 1;

    ctxLose.drawImage(
      img,
      0,
      y,
      canvasLose.width,
      sliceHeight,
      offsetX,
      y + offsetY,
      canvasLose.width,
      sliceHeight
    );
  }

  // subtle cyan tint
  ctxLose.fillStyle = "rgba(0,255,255,0.025)";
  ctxLose.fillRect(0, 0, canvasLose.width, canvasLose.height);

  // occasional glitch bars
  if (Math.random() < 0.15) {
    const y = Math.random() * canvasLose.height;
    const h = Math.random() * 6 + 1;

    ctxLose.fillStyle = "rgba(0,255,255,0.06)";
    ctxLose.fillRect(0, y, canvasLose.width, h);
  }
}