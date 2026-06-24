const canvas = document.getElementById("gameOver");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

resize();
addEventListener("resize", resize);

let freezeGlitch = {
  snapshot: document.createElement("canvas")
};

function drawGrid(size, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  for (let x = 0; x <= canvas.width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawTechBackground() {
  ctx.fillStyle = "#020b14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = 2000;

  ctx.save();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  drawGrid(25, "rgba(0,190,255,0.15)", 1);
  drawGrid(150, "rgba(0,220,255,0.75)", 2);

  ctx.restore();

  drawGrid(450, "rgba(0,220,255,0.35)", 2);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(80,230,255,0.95)";
  ctx.lineWidth = 8;
  ctx.shadowColor = "cyan";
  ctx.shadowBlur = 25;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // scan lines
  ctx.strokeStyle = "rgba(0,255,255,0.04)";
  ctx.lineWidth = 1;

  for (let y = 0; y < canvas.height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function captureFrame() {
  freezeGlitch.snapshot.width = canvas.width;
  freezeGlitch.snapshot.height = canvas.height;

  const sctx = freezeGlitch.snapshot.getContext("2d");

  sctx.clearRect(
    0,
    0,
    freezeGlitch.snapshot.width,
    freezeGlitch.snapshot.height
  );

  sctx.drawImage(canvas, 0, 0);
}

function drawFreezeGlitch() {
  const img = freezeGlitch.snapshot;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sliceHeight = 6;

  for (let y = 0; y < canvas.height; y += sliceHeight) {
    const offsetX = Math.random() * 12 - 6;
    const offsetY = Math.random() * 2 - 1;

    ctx.drawImage(
      img,
      0,
      y,
      canvas.width,
      sliceHeight,
      offsetX,
      y + offsetY,
      canvas.width,
      sliceHeight
    );
  }

  // subtle cyan tint
  ctx.fillStyle = "rgba(0,255,255,0.025)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // occasional glitch bars
  if (Math.random() < 0.15) {
    const y = Math.random() * canvas.height;
    const h = Math.random() * 6 + 1;

    ctx.fillStyle = "rgba(0,255,255,0.06)";
    ctx.fillRect(0, y, canvas.width, h);
  }
}

function loop() {
  drawTechBackground();

  captureFrame();

  drawFreezeGlitch();

  requestAnimationFrame(loop);
}

loop();