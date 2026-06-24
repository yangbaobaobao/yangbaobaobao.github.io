const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const huaweiImg = new Image();
huaweiImg.src = "huawei.png";
const appleImg = new Image();
appleImg.src = "Apple-WWDC23-Vision-Pro-glass-230605_big.jpg.large-removebg-preview.png";
const energyImg = new Image();
energyImg.src = "Laser Charge Orb.png";
const auraImg = new Image();
auraImg.src = "energy aura blue.png";
const explosionImg = new Image();
explosionImg.src = "energy_shockwave.png";
const bullet= new Image();
bullet.src = "bolt.png";
const sledgeHammer = new Image();
sledgeHammer.src = "Sledgehammer_SS3.webp";
const watchImg = new Image();
watchImg.src = "71qth-es3nL-removebg-preview.png";
const blankPhoneImg = new Image();
blankPhoneImg.src = "p10.webp";
const trollImg = new Image();
trollImg.src = "5bbc23427517f-removebg-preview.png";
const ringImg = new Image();
ringImg.src = "SmartRingCOLMIR02Gold1-removebg-preview.png";
const podImg = new Image();
podImg.src = "5-RE_1-removebg-preview.png"

const waveText = document.getElementById("waveText");

function showWaveText(num) {
  waveText.textContent = "WAVE" + num;
{}
  waveText.classList.remove("waveAnim");
  void waveText.offsetWidth; //remove animation
  waveText.classList.add("waveAnim");
}


let lc = [];
let enemies = [];
var cameraShakeX = 0;
var cameraShakeY = 0;
var universalTimer = 0;
let shakeStrength = 0;
let shakeTime = 0;
let shakeDuration = 0;
let invert = 0;
let timeMalTimer = 0;
let timeCooldown = 0;
let invertTarget = 0;
let waveIndex = 0;
let waveCooldown = 0;
let waveTimer = 0;
let currentWaveHpPool = 0;
let currentWaveTriggered = false;

const keybinds = JSON.parse(localStorage.getItem("keybinds")) || {
  heal: "h",
  dash: "shift", // not yet implimented
  time: "p",
  up: "w",
  down: "s",
  left: "a",
  right: "d",
  recall: " "
};

const timePerWave = 3000;

const mouse = { x: 0, y: 0, down: false, holdTime: 0 };

addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

addEventListener("mousedown", e => {
  if (e.button !== 0) return;

  mouse.down = true;
  mouse.holdTime = 0;

  if (hammer.state === "held") {
    hammer.state = "charging";
    hammer.chargeTime = 0;
  }
});

addEventListener("mouseup", e => {
  if (e.button !== 0) return;

  mouse.down = false;

  if (hammer.state === "charging") {
    if (hammer.chargeTime < 15) {
      hammer.state = "held";
      hammer.meleeAttack();
    } else {
      hammer.throwHammer();
    }
  }
});

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

resize();
addEventListener("resize", resize);

const world = { x:0, y:0, radius:1600 };
const camera = { x:0, y:0 };

const player = new Player(0, 0);
player.speed = 10;
player.vx = 0;
player.vy = 0;
player.friction = 0.985;
player.bounce = 0.85;

const hammer = new Hammer(player);

if (false){
  enemies.push(new Huawei(300, 300, 160, 1, 1600, 1600));
  enemies.push(new Apple(-300, 300, 160, 0.7, 1600, 1600));
  enemies.push(new Watch(-300, 300, 70, 1.2, 500, 500));
  enemies.push(new Watch(-300, -300, 70, 1.2, 500, 500));
  enemies.push(new Watch(300, -300, 70, 1.2, 500, 500));
  enemies.push(new Watch(-400, 400, 70, 1.2, 500, 500));
  enemies.push(new Watch(-400, -400, 70, 1.2, 500, 500));
  enemies.push(new Watch(400, -400, 70, 1.2, 500, 500));
}

//enemies.push(new Ring(300, 300, 140, 1, 840, 840));
//enemies.push(new AirPod(-300, 300, 50, 0.7, 300, 300));
//enemies.push(new Apple(300, -300, 160, 0.7, 1600, 1600));
//enemies.push(new Apple(-300, -300, 160, 0.7, 1600, 1600));
//nemies.push(new Apple(-300, 300, 160, 0.7, 1600, 1600));
//enemies.push(new Apple(300, 300, 160, 0.7, 1600, 1600));
//enemies.push(new Huawei(300, 300, 160, 1, 1600, 1600));

//enemies.push(new Ring(300, 300, 140, 3, 840, 840));
//enemies.push(new Ring(300, -300, 140, 3, 840, 840));
//enemies.push(new Ring(-300, 300, 140, 3, 840, 840));
//enemies.push(new Ring(-300, -300, 140, 3, 840, 840));


if (false){
  for (let i = 0; i < 10; i++) {
      const theta = i * 0.5;
      const r = 500 + 20 * theta;

      enemies.push(
          new Ring(
              Math.cos(theta) * r,
              Math.sin(theta) * r,
              50,
              0.7,
              300,
              300
          )
      );
  }
}

if (false){
  for (let i = 0; i < 200; i++) {
      const theta = i * 0.5;
      const r = 500 + 20 * theta;

      enemies.push(
          new AirPod( 
              Math.cos(theta) * r,
              Math.sin(theta) * r,
              50,
              0.7,
              300,
              300
          )
      );
  }
}

if (false){
  //enemies.push(new Apple(300, 300, 160, 0.7, 1600, 1600));
  enemies.push(new Ring(300, 300, 140, 3, 1000, 1000));
  enemies.push(new Ring(300, -300, 140, 3, 1000, 1000));
  enemies.push(new Ring(-300, -300, 140, 3, 1000, 1000));
  for (let i = 0; i < 10; i++) {
      const theta = i * 0.5;
      const r = 900 + 20 * theta;

      enemies.push(
          new Watch(
              Math.cos(theta) * r,
              Math.sin(theta) * r,
              70,
              1.2,
              500,
              500
          )
      );
  }
}

if (false){
  enemies.push(new Apple(300, 300, 160, 0.7, 1200, 1200));
  for (let i = 0; i < 80; i++) {
      const theta = i * 0.5;
      const r = 1600 + 20 * theta;

      enemies.push(
          new AirPod(
              Math.cos(theta) * r,
              Math.sin(theta) * r,
              50,
              1.6,
              200,
              200
          )
      );
  }
  for (let i = 0; i < 8; i++) {
      const theta = i * -0.5;
      const r = 2000 + 20 * theta;

      enemies.push(new Watch(Math.cos(theta) * r, Math.sin(theta) * r, 70, 1.2, 400, 400));
  }
}

const waves = [
  { pattern: "circle", type: "Watch", count: 8 },
  { pattern: "corners", type: "Ring", count: 2 },
  { pattern: "spiral", type: "AirPod", count: 50 },
  { pattern: "line", type: "Watch", count: 14 },
  { pattern: "bossApple", type: "Apple", count: 1 },
  { pattern: "mixedCircle", count: 14 },
  { pattern: "bossHuawei", type: "Huawei", count: 1 },
  { pattern: "mixedCircle", count: 10 }
];

function spawnEnemy(type, angle, distanceOutside = 700, force = 35) {
  const spawnDist = world.radius + distanceOutside;

  const x = Math.cos(angle) * spawnDist;
  const y = Math.sin(angle) * spawnDist;

  let enemy;

  if (type === "Watch") enemy = new Watch(x, y, 70, 1.2, 500, 500);
  if (type === "Ring") enemy = new Ring(x, y, 140, 3, 1000, 1000);
  if (type === "AirPod") enemy = new AirPod(x, y, 50, 1.6, 200, 200);
  if (type === "Apple") enemy = new Apple(x, y, 160, 0.7, 1600, 1600);
  if (type === "Huawei") enemy = new Huawei(x, y, 160, 1, 1600, 1600);

  enemies.push(enemy);
  flingIntoWorld(enemy, 0, 0, force);
}

function flingIntoWorld(enemy, targetX = player.x, targetY = player.y, force = 25) {
  const a = Math.atan2(targetY - enemy.y, targetX - enemy.x);

  enemy.vx = Math.cos(a) * force;
  enemy.vy = Math.sin(a) * force;

  enemy.crashInvulnerbility = 30;
}

function spawnWave(wave) {
  console.log("Wave:", waveIndex, wave.pattern);

  currentWaveHpPool = 0;
  currentWaveTriggered = false;
  waveTimer = 0;

  if (wave.pattern === "corners") {
    const d = 900;
    spawnEnemy(wave.type, d, d);
    spawnEnemy(wave.type, d, -d);
    spawnEnemy(wave.type, -d, d);
    spawnEnemy(wave.type, -d, -d);
  }

  if (wave.pattern === "circle") {
    for (let i = 0; i < wave.count; i++) {
      const a = i / wave.count * Math.PI * 2;
      spawnEnemy(wave.type, a, 900, 35);
    }
  }

  if (wave.pattern === "spiral") {
    for (let i = 0; i < wave.count; i++) {
      const a = i * 0.6;
      const r = 500 + i * 35;
      spawnEnemy(wave.type, Math.cos(a) * r, Math.sin(a) * r);
    }
  }

  if (wave.pattern === "line") {
    for (let i = 0; i < wave.count; i++) {
      const x = -700 + i * 150;
      spawnEnemy(wave.type, x, -1000);
    }
  }

  if (wave.pattern === "bossApple") {
    spawnEnemy("Apple", 0, -1000);
  }

  if (wave.pattern === "bossHuawei") {
    spawnEnemy("Huawei", 0, -1000);
  }

  if (wave.pattern === "mixedCircle") {
    for (let i = 0; i < wave.count; i++) {
      const a = i / wave.count * Math.PI * 2;
      const type = i % 3 === 0 ? "Ring" : i % 3 === 1 ? "Watch" : "AirPod";
      spawnEnemy(type, Math.cos(a) * world.radius, Math.sin(a) * world.radius);
    }
  }
  for (const e of enemies) {
    currentWaveHpPool += e.hp;
  }
}

function getCurrentEnemyHpPool() {
  let total = 0;

  for (const e of enemies) {
    if (!e.dead) total += Math.max(e.hp, 0);
  }

  return total;
}

function updateWaves() {
  if (waveCooldown > 0) {
    waveCooldown--;
    return;
  }

  if (enemies.length === 0) {
    startNextWave();
    return;
  }

  waveTimer++;

  const currentHp = getCurrentEnemyHpPool();
  const hpLost = currentWaveHpPool - currentHp;
  const halfHpLost = hpLost >= currentWaveHpPool * 0.765;
  const timePassed = waveTimer >= timePerWave;

  if (!currentWaveTriggered && (halfHpLost || timePassed)) {
    currentWaveTriggered = true;
    startNextWave();
  }
}

function startNextWave() {
  const displayWave = waveIndex + 1;

  showWaveText(displayWave);

  const wave = waves[waveIndex];

  spawnWave(wave);

  waveIndex++;

  if (waveIndex >= waves.length) {
    waveIndex = 0;
  }

  waveCooldown = 120;
}

const keys = {};
addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (keys[keybinds.recall]) {
    hammer.recall();
  }
});

addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

function dist(ax, ay, bx, by){
  return Math.hypot(ax-bx, ay-by);
}

function keepInside(obj){
  const d = dist(obj.x, obj.y, world.x, world.y);

  if(d + obj.radius > world.radius){
    const nx = obj.x / d;
    const ny = obj.y / d;

    obj.x = nx * (world.radius - obj.radius);
    obj.y = ny * (world.radius - obj.radius);

    if(obj.vx !== undefined){
      const dot = obj.vx * nx + obj.vy * ny;

      if(dot > 0){
        const impactSpeed = dot;

        obj.vx -= (1 + obj.bounce) * dot * nx;
        obj.vy -= (1 + obj.bounce) * dot * ny;

        return impactSpeed;
      }
    }
  }
}

function enemyEnemyBounce() {
  const minBounceSpeed = 5;
  const damageMultiplier = 2.1;

  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const a = enemies[i];
      const b = enemies[j];

      if (a.dead || b.dead) continue;
      if (a.crashInvulnerbility || b.crashInvulnerbility) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      const minDist = a.radius + b.radius;

      if (d > 0 && d < minDist) {
        const nx = dx / d;
        const ny = dy / d;

        const rvx = b.vx - a.vx;
        const rvy = b.vy - a.vy;

        const impactSpeed = Math.abs(rvx * nx + rvy * ny);

        const overlap = minDist - d;
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;

        if (impactSpeed >= minBounceSpeed) {;
        const reducedMass = (a.mass * b.mass) / (a.mass + b.mass);
        const impulse = reducedMass * impactSpeed;

        // shared crash severity
        const crashEnergy =
          Math.pow(impactSpeed - minBounceSpeed, 1) *
          Math.pow(reducedMass, 1.5) *
          damageMultiplier;

        // heavier enemies resist impact damage
        const resistanceA = Math.pow(a.mass, 0.85);
        const resistanceB = Math.pow(b.mass, 0.85);

        // each enemy is hurt more by heavier opponents
        const damageToA = crashEnergy * Math.pow(b.mass, 0.55) / resistanceA;
        const damageToB = crashEnergy * Math.pow(a.mass, 0.55) / resistanceB;

        // optional cap so tiny enemies do not take absurd damage
        a.hp -= Math.min(damageToA, a.maxHp ? a.maxHp * 0.6 : damageToA);
        b.hp -= Math.min(damageToB, b.maxHp ? b.maxHp * 0.6 : damageToB);

          const bouncePower = impulse * 0.9;

          a.vx -= nx * bouncePower / a.mass;
          a.vy -= ny * bouncePower / a.mass;
          b.vx += nx * bouncePower / b.mass;
          b.vy += ny * bouncePower / b.mass;
        }
      }
    }
  }
}

// world space
function sx(x){ return x - camera.x + canvas.width/2 + cameraShakeX; }
function sy(y){ return y - camera.y + canvas.height/2 + cameraShakeY; }

function updateCameraShake() {
    if (shakeTime > 0) {
        const s = shakeStrength * (shakeTime / shakeDuration);

        cameraShakeX = (Math.random() - 0.5) * s;
        cameraShakeY = (Math.random() - 0.5) * s;

        shakeTime--;
    } else {
        cameraShakeX = 0;
        cameraShakeY = 0;
    }
}

function shakeCamera(strength, time) {
    shakeStrength = Math.max(shakeStrength, strength);
    shakeTime = Math.max(shakeTime, time);
    shakeDuration = time;
}

function update(){
  universalTimer++;
  if (timeCooldown > 0)
    timeCooldown--;
  else
    timeCooldown = 0;
  if (timeMalTimer > 0)
      timeMalTimer--;
  else {
    timeMalTimer = 0;
    invertTarget = 0;
  }
  if (timeCooldown <= 0 && keys[keybinds.time] && pNotPressed)
  {
    timeCooldown = 600;
    timeMalTimer = 200;
    invertTarget = 1;
    pNotPressed = false;
  }
  //print(timeCooldown);
  if (timeCooldown > 0 && keys[keybinds.time] && pNotPressed)
  {
    timeCooldown = 80;
    invertTarget = 0;
    timeMalTimer = 0;
    pNotPressed = false;
  }
  if (!keys[keybinds.time])
    pNotPressed = true;
  if (player.invincibleTimer > 0) {
    player.invincibleTimer--;
  }
  invert += (invertTarget - invert) * 0.1;
  let dx=0, dy=0;

  if(keys[keybinds.up]) dy-=2;
  if(keys[keybinds.down]) dy+=2;
  if(keys[keybinds.left]) dx-=2;
  if(keys[keybinds.right]) dx+=2;

  if(dx || dy){
    const l = Math.hypot(dx,dy);
    dx/=l; dy/=l;
  }

  // actively slow knockback if player moves against it
  if (dx || dy) {
    const dot = player.vx * dx + player.vy * dy;

    // dot < 0 means input is opposite knockback direction
    if (dot < 0) {
      const slowPower = 0.35;

      player.vx += dx * player.speed * slowPower;
      player.vy += dy * player.speed * slowPower;
    }
  }

  // normal movement
  player.x += dx * player.speed;
  player.y += dy * player.speed;

  // knockback velocity movement
  player.x += player.vx;
  player.y += player.vy;

  player.vx *= player.friction;
  player.vy *= player.friction;

  keepInside(player);

  camera.x = player.x;
  camera.y = player.y;
}

function draw(){
  canvas.style.filter = "invert("+invert+")";
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawTechBackground();

  ctx.beginPath();
  ctx.arc(sx(0), sy(0), world.radius, 0, Math.PI*2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.stroke();
  if (timeMalTimer <= 0){

  for (let i=0; i<enemies.length; i++) {
      enemies[i].tick(1);
  }

  for (let i=0; i<bullets.length; i++) {
      bullets[i].tick(1);
  }

    for (let i=0; i<effects.length; i++) {
      effects[i].tick(1);

    if (effects[i].disable) {
      effects.splice(i, 1);
    }
  }
}

for (let i=0; i<enemies.length; i++) {
      enemies[i].render();

    if (enemies[i].dead) {
      enemies.splice(i, 1);
    }
  }
  enemyEnemyBounce();

for (let i=0; i<bullets.length; i++) {
    bullets[i].render();

    if (bullets[i].dead) {
      bullets.splice(i, 1);
    }
}
    player.tick();
    hammer.tick();

    for (let i=0; i<lc.length; i++) {
      if (timeMalTimer <= 0) {
          lc[i].tick(1);
      } else {
          lc[i].tick(0);
      }

    if (lc[i].disable) {
      lc.splice(i, 1);
    }
  }

  updateWaves();

    //lc.forEach((element) => element.tick());

    // player circle
  ctx.beginPath();
  ctx.arc(sx(player.x), sy(player.y), player.radius, 0, Math.PI*2);
  ctx.fillStyle = "cyan";
  ctx.fill();
  updateCameraShake();
}

function loop(){
  if (!freezeGlitch.active) {
    update();
    draw();
  } else {
    drawFreezeGlitch();
    freezeGlitch.timer--;

    if (freezeGlitch.timer <= 0) {
      freezeGlitch.active = false;
    }
  }
  requestAnimationFrame(loop);
}

function knockbackPlayer(fromX, fromY, force){
  const a = Math.atan2(player.y - fromY, player.x - fromX);
  hammer.cancelCharge();

  player.vx += Math.cos(a) * force;
  player.vy += Math.sin(a) * force;
}

function damagePlayer(amount) {
  if (player.invincibleTimer > 0) return;

  player.hp -= amount;
  player.invincibleTimer = 8;
  player.hpHeal = 0;

  //hammer.cancelCharge();

  console.log("Player HP:", player.hp);

  if (player.hp <= 0) {
    console.log("ded");
  }
}

function distanceToLine(px, py, x1, y1, angle) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  const toPlayerX = px - x1;
  const toPlayerY = py - y1;

  return Math.abs(toPlayerX * dy - toPlayerY * dx);
}

function angleDiff(a, b) {
  let diff = a - b;

  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  return Math.abs(diff);
}

function hitEnemyWithArc(x, y, angle, range, arc, damage, knockback) {
  const enemies_ = enemies;

  for (const enemy of enemies_) {
    const d = dist(x, y, enemy.x, enemy.y);

    if (d < range + enemy.radius) {
      const enemyAngle = Math.atan2(enemy.y - y, enemy.x - x);

      if (angleDiff(enemyAngle, angle) < arc / 2) {
        enemy.hp -= damage;

        const mass = enemy.mass || 1;

        enemy.vx += Math.cos(enemyAngle) * knockback / mass;
        enemy.vy += Math.sin(enemyAngle) * knockback / mass;
      }
    }
  }
}

function drawTechBackground() {
  // dark base
  ctx.fillStyle = "#020b14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = sx(world.x);
  const cy = sy(world.y);
  const r = world.radius;

  // only draw grid inside world circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  drawGrid(25, "rgba(0, 190, 255, 0.18)", 1);

  drawGrid(150, "rgba(0, 220, 255, 0.75)", 2);

  ctx.restore();

  drawGrid(450, "rgba(0, 220, 255, 0.75)", 2);

  // outer glow ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(80, 230, 255, 0.95)";
  ctx.lineWidth = 8;
  ctx.shadowColor = "cyan";
  ctx.shadowBlur = 25;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawGrid(size, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  const startX = Math.floor((camera.x - canvas.width/2) / size) * size;
  const endX = camera.x + canvas.width/2;

  const startY = Math.floor((camera.y - canvas.height/2) / size) * size;
  const endY = camera.y + canvas.height/2;

  for (let x = startX; x <= endX; x += size) {
    ctx.beginPath();
    ctx.moveTo(sx(x), 0);
    ctx.lineTo(sx(x), canvas.height);
    ctx.stroke();
  }

  for (let y = startY; y <= endY; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, sy(y));
    ctx.lineTo(canvas.width, sy(y));
    ctx.stroke();
  }
}

loop();
