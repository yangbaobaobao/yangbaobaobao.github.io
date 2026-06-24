class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 25;
        this.hp = 120;
        this.maxHp = 120;
        this.hpHeal = 0;
        this.invincibleTimer = 0;
        this.displayHp1 = this.maxHp;
        this.displayHp2 = this.maxHp;
        this.displayHp3 = this.maxHp;
        this.pointAngle = 0;
        this.angle = 0;
        this.angularVelocity = 0;
        this.torque = 0;
    }

    tick() {

      // spinning physics
      this.angularVelocity += this.torque * 0.001;
      this.angle += this.angularVelocity;

      this.angularVelocity *= 0.94;
      this.torque *= 0.75;

      if (Math.abs(this.angularVelocity) > 0.08)
      this.spinHitEnemies();

      // healthbar
      const bw = 400;
      const bh = 40;
      const bx = canvas.width / 2 - 620 - bw / 2;
      const by = canvas.height / 2 - 380 - this.radius - 40;
      this.displayHp1 += (this.hp - this.displayHp1) * 0.2;
      this.displayHp2 += (this.hp - this.displayHp2) * 0.05;
      this.displayHp3 += (this.hpHeal - this.displayHp3) * 0.08;

      ctx.fillStyle = "black";
      ctx.fillRect(bx,by,bw,bh);

      ctx.fillStyle = "rgba(255, 0, 0, 0.59)";
      ctx.fillRect(bx,by,bw*(this.displayHp2/this.maxHp),bh);

      ctx.fillStyle = "lime";
      ctx.fillRect(bx,by,bw*(this.displayHp1/this.maxHp),bh);

      ctx.fillStyle = "rgba(255, 0, 225, 0.28)";
      ctx.fillRect(bx,by,bw*(this.displayHp3/this.maxHp),bh);

      ctx.strokeStyle = "white";
      ctx.strokeRect(bx,by,bw,bh);

      if (this.hp <= 0)
      {
        startFreezeGlitch();

        setTimeout(() => {
          window.location.href = "game over.html";
        }, 3000);
        //throw new Error("Game Over");
      }

      if (keys["h"] && this.hpHeal < this.maxHp)
          this.hpHeal+=8.5;
      if (this.hpHeal > 0) {
        this.hpHeal-=8;
        this.hpHeal = Math.max(this.hpHeal, 0);
      }

      if (this.hpHeal >= this.maxHp){
        this.hp += 30;
        this.hp = Math.min(this.hp, this.maxHp);
        this.hpHeal = 0;
      }
    }

    spinHitEnemies() {
      const spinRadius = 180;
      const spinDamage = Math.abs(this.angularVelocity) * 90;
      const knockbackPower = Math.abs(this.angularVelocity) * 70;

      for (const enemy of enemies) {
        if (!enemy.playerSpinHitTimer) enemy.playerSpinHitTimer = 0;

        if (enemy.playerSpinHitTimer > 0) {
          enemy.playerSpinHitTimer--;
          continue;
        }

        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const d = Math.hypot(dx, dy);
        if (d === 0) continue;

        if (d < spinRadius + enemy.radius) {
          enemy.hp -= spinDamage;

          const nx = dx / d;
          const ny = dy / d;

          const mass = enemy.mass || 1;

          enemy.vx += (nx * knockbackPower) / mass;
          enemy.vy += (ny * knockbackPower) / mass;

          enemy.playerSpinHitTimer = 8;
        }
      }
    }
}

class Hammer {
  constructor(owner) {
    this.owner = owner;

    this.state = "held"; 
    // held, charging, thrown, returning

    this.x = owner.x;
    this.y = owner.y;

    this.vx = 0;
    this.vy = 0;

    this.angle = 0;
    this.chargeTime = 0;

    this.radius = 65;
    this.damage = 35;
    this.meleeCooldown = 0;

    this.swingTimer = 0;
    this.swingTime = 0;
    this.swingMaxTime = 14;
  }

  tick() {
    if (this.meleeCooldown > 0) this.meleeCooldown--;

    if (this.swingTimer > 0) {
      this.swingTimer--;
      this.swingTime++;
    } else {
      this.swingTime = 0;
    }

    if (this.state === "held") {
      this.x = this.owner.x;
      this.y = this.owner.y;
      this.drawHeld();
    }

    else if (this.state === "charging") {
      this.chargeTime++;

      this.x = this.owner.x;
      this.y = this.owner.y;

      this.angle = Math.atan2(mouse.y - sy(player.y), mouse.x - sx(player.x));

      this.drawHeld();
    }

    else if (this.state === "thrown") {
      this.x += this.vx;
      this.y += this.vy;

      this.angle += 0.35;

      this.bounceOffWorld();
      this.hitEnemies();

      this.drawFlying();
    }

    else if (this.state === "returning") {
      const dx = this.owner.x - this.x;
      const dy = this.owner.y - this.y;
      const d = Math.hypot(dx, dy);

      if (d > 0) {
        this.vx += dx / d * 1.6;
        this.vy += dy / d * 1.6;
      }
      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx;
      this.y += this.vy;

      this.angle += 0.5;

      this.hitEnemies();

      if (d < this.owner.radius + this.radius) {
        this.owner.vx = this.vx/3.5;
        this.owner.vy = this.vy/3.5;
        const catchSpeed = Math.hypot(this.vx, this.vy);
        const spinDir = Math.sign(this.vx * dy - this.vy * dx) || 1;

        this.owner.torque += spinDir * catchSpeed * 8;
        this.state = "held";
        this.vx = 0;
        this.vy = 0;
        this.chargeTime = 0;
      }

      this.drawFlying();
    }
  }

  drawHeld() {
    const aimAngle = Math.atan2(
      mouse.y - sy(player.y),
      mouse.x - sx(player.x)
    );

    const defaultOffset = -Math.PI / 3 + player.angle;
    let windBack = 0;
    let extraSwing = 0;

    if (this.state === "charging") {
      const charge = Math.min(this.chargeTime / 120, 1);
      windBack = charge * Math.PI * 0.9;
    }

    if (this.swingTimer > 0) {
      const t = this.swingTime / this.swingMaxTime;
      extraSwing = Math.sin(t * Math.PI) * Math.PI * 1.2;
    }

    ctx.save();
    ctx.translate(sx(this.owner.x), sy(this.owner.y));

    ctx.rotate(aimAngle + defaultOffset + extraSwing - windBack);

    let size = 130;

    if (this.state === "charging") {
      size = 130 + Math.min(this.chargeTime, 120) * 0.25;
    }

    ctx.drawImage(
      sledgeHammer,
      -size * 0.25,
      -size * 0.75,
      size,
      size
    );

    ctx.restore();
  }

  drawFlying() {
    ctx.save();
    ctx.translate(sx(this.x), sy(this.y));
    ctx.rotate(this.angle);

    const size = 140;

    ctx.drawImage(
      sledgeHammer,
      -size / 2,
      -size / 2,
      size,
      size
    );

    ctx.restore();
  }

  meleeAttack() {
    if (this.state !== "held") return;
    if (this.meleeCooldown > 0) return;

    this.meleeCooldown = 20;
    this.swingTimer = this.swingMaxTime;
    this.swingTime = 0;

    const attackAngle = Math.atan2(
      mouse.y - sy(player.y),
      mouse.x - sx(player.x)
    );

    hitEnemyWithArc(
      player.x,
      player.y,
      attackAngle,
      190,
      Math.PI * 0.925,
      100,
      120
    );
  }

  throwHammer() {
    if (this.state !== "charging") return;

    const charge = Math.min(this.chargeTime, 120);

    const a = Math.atan2(mouse.y - sy(player.y), mouse.x - sx(player.x));

    const speed = 20 + charge * 0.1;

    this.state = "thrown";

    this.x = this.owner.x;
    this.y = this.owner.y;

    this.vx = Math.cos(a) * speed;
    this.vy = Math.sin(a) * speed;

    this.damage = 45 + charge * 0.4;

    this.chargeTime = 0;
  }

  recall() {
    if (this.state === "thrown") {
      this.state = "returning";
    }
  }

  cancelCharge() {
    if (this.state === "charging") {
      this.state = "held";
      this.chargeTime = 0;
    }
  }

  bounceOffWorld() {
    const d = dist(this.x, this.y, world.x, world.y);

    if (d + this.radius > world.radius) {
      const nx = this.x / d;
      const ny = this.y / d;

      this.x = nx * (world.radius - this.radius);
      this.y = ny * (world.radius - this.radius);

      const dot = this.vx * nx + this.vy * ny;

      if (dot > 0) {
        this.vx -= 2 * dot * nx;
        this.vy -= 2 * dot * ny;

        this.vx *= 0.9;
        this.vy *= 0.9;
      }
    }
  }

  hitEnemies() {
    const enemies_ = enemies;

    for (const enemy of enemies_) {
      if (!enemy.hammerHitTimer) enemy.hammerHitTimer = 0;

      if (enemy.hammerHitTimer > 0) {
        enemy.hammerHitTimer--;
        continue;
      }

      if (dist(this.x, this.y, enemy.x, enemy.y) < this.radius + enemy.radius) {
        enemy.hp -= this.damage;

        const mass = enemy.mass || 1;

        const hitSpeed = Math.hypot(this.vx, this.vy);
        const hitAngle = Math.atan2(this.vy, this.vx);

        enemy.vx += Math.cos(hitAngle) * hitSpeed * 5 / mass;
        enemy.vy += Math.sin(hitAngle) * hitSpeed * 5 / mass;

        enemy.hammerHitTimer = 20;

        if (this.state === "thrown") {
          const a = Math.atan2(this.y - enemy.y, this.x - enemy.x);

          this.vx = Math.cos(a) * hitSpeed * 0.75;
          this.vy = Math.sin(a) * hitSpeed * 0.75;
        }
      }
    }
  }

  bounceOffWorld() {
    const d = dist(this.x, this.y, world.x, world.y);

    if (d + this.radius > world.radius) {
      const nx = this.x / d;
      const ny = this.y / d;

      this.x = nx * (world.radius - this.radius);
      this.y = ny * (world.radius - this.radius);

      const dot = this.vx * nx + this.vy * ny;

      if (dot > 0) {
        this.vx -= 2 * dot * nx;
        this.vy -= 2 * dot * ny;

        this.vx *= 0.9;
        this.vy *= 0.9;
      }
    }
  }

  hitEnemies() {
    const enemies_ = enemies;

    for (const enemy of enemies_) {
      if (!enemy.hammerHitTimer) enemy.hammerHitTimer = 0;

      if (enemy.hammerHitTimer > 0) {
        enemy.hammerHitTimer--;
        continue;
      }

      if (dist(this.x, this.y, enemy.x, enemy.y) < this.radius + enemy.radius) {
        enemy.hp -= this.damage;

        const mass = enemy.mass || 1;

        const hitSpeed = Math.hypot(this.vx, this.vy);
        const hitAngle = Math.atan2(this.vy, this.vx);

        enemy.vx += (Math.cos(hitAngle) * hitSpeed * 10) / mass;
        enemy.vy += (Math.sin(hitAngle) * hitSpeed * 10) / mass;

        enemy.hammerHitTimer = 5;

        if (this.state === "thrown") {
          const a = Math.atan2(this.y - enemy.y, this.x - enemy.x);

          this.vx = Math.cos(a) * hitSpeed * 0.75;
          this.vy = Math.sin(a) * hitSpeed * 0.75;
        }
      }
    }
  }
}

let freezeGlitch = {
  active: false,
  timer: 0,
  duration: 60,
  snapshot: document.createElement("canvas")
};

function startFreezeGlitch() {
  freezeGlitch.active = true;
  freezeGlitch.timer = freezeGlitch.duration;

  freezeGlitch.snapshot.width = canvas.width;
  freezeGlitch.snapshot.height = canvas.height;

  const sctx = freezeGlitch.snapshot.getContext("2d");
  sctx.drawImage(canvas, 0, 0);
}

function drawFreezeGlitch() {
  const img = freezeGlitch.snapshot;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sliceHeight = 12;

  for (let y = 0; y < canvas.height; y += sliceHeight) {
    const offsetY = Math.random() * 40 - 20;

    ctx.drawImage(
      img,
      0, y, canvas.width, sliceHeight,
      0, y + offsetY, canvas.width, sliceHeight
    );
  }

  ctx.fillStyle = "rgba(0, 255, 255, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}