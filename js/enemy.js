let bullets = [];

class laserCharge {
    constructor(lc, r) {
        this.laserCharge = lc;
        this.x;
        this.y;
        this.r = r;
        this._r = r;
        this.timer = 0;
        this.state = "charging";
        this.startX;
        this.startY;
        this.disable = false;
        this.deathTimer = -1;
    }

    tick(t) {
      this.timer+=t;
      if (this.laserCharge.dead){
        if (this.deathTimer == -1){
          knockbackPlayer(this.laserCharge.x, this.laserCharge.y, 5);
          shakeCamera(15, 170);
          this.state = "firing";
          this.timer = this.chargeTime - 40
          this.deathTimer = 30;
        }
        this.deathTimer--;
      }
      if (this.state === "firing" && this.deathTimer == 0) {
          this.disable = true;
          return;
      }
      if (this.state === "charging") {
        this._r = this.r * 4 * Math.exp(-0.03 * this.timer);

        const orbX = sx(this.laserCharge.x);
        const orbY = sy(this.laserCharge.y - this.r * 1.45);

        const orbAngle = this.timer * 0.12;

        ctx.save();
        ctx.translate(orbX, orbY);
        ctx.rotate(orbAngle);

        ctx.drawImage(
          explosionImg,
          -this._r/4,
          -this._r/4,
          this._r * 0.5,
          this._r * 0.5
        );

        ctx.drawImage(
          auraImg,
          -this._r,
          -this._r,
          this._r * 2,
          this._r * 2
        );

        ctx.restore();
        ctx.save();
        ctx.translate(orbX, orbY);
        ctx.rotate(-Math.sqrt(orbAngle*5));

        ctx.drawImage(
          auraImg,
          -this._r,
          -this._r,
          this._r * 2,
          this._r * 2
        );

        ctx.restore();
      }
      else if (this.state === "firing") {
        this.startX = this.laserCharge.x;
        this.startY = this.laserCharge.y - this.r * 1.45;
        const chargeTime = 600;
        const spinProgress = Math.min(this.timer / chargeTime, 1);

        // starts slow, gets faster
        var spinSpeed = 0;
        if (t != 0)
          spinSpeed = 0.0085 + spinProgress * spinProgress * 0.01;
        this.angle = (this.angle || 0) + spinSpeed;

        // beam collapses near the end
        const bloom = 1 - Math.exp(-this.timer * 0.09);

        let collapse = 1;
        if (this.timer > chargeTime - 40) {
          collapse = (chargeTime - this.timer) / 4;
          collapse = Math.max(collapse, 0);
          
        }
        if (this.timer == chargeTime - 30){
          knockbackPlayer(this.laserCharge.x, this.laserCharge.y, 300);
          shakeCamera(15, 170);
        }

        const outerWidth = (30 + Math.cos(this.timer * 0.4) * 3) * bloom * collapse;
        const bloomWidth = 45 * bloom * collapse;
        const innerWidth = (10 + Math.sin(this.timer * 0.05) * 3) * bloom * collapse;

        if (collapse <= 0.01) {
          this.state = "finish";
          this.disable = true;
          return;
        }
        if (this.timer > chargeTime + 30) this.state = "finish"

        const length = 10000;

        for (let i = 0; i < 4; i++) {
          const a = this.angle + i * Math.PI / 2;

          const endX = this.startX + Math.cos(a) * length;
          const endY = this.startY + Math.sin(a) * length;

          const laserDist = distanceToLine(
            player.x,
            player.y,
            this.startX,
            this.startY,
            a
          );

          if (laserDist < player.radius + outerWidth / 2 && this.timer < chargeTime - 40) {
            damagePlayer(9);
          }

          ctx.strokeStyle = "rgba(17, 0, 255, 0.4)";
          ctx.lineWidth = bloomWidth;
          ctx.beginPath();
          ctx.moveTo(sx(this.startX), sy(this.startY));
          ctx.lineTo(sx(endX), sy(endY));
          ctx.stroke();

          ctx.strokeStyle = "blue";
          ctx.lineWidth = outerWidth;
          ctx.beginPath();
          ctx.moveTo(sx(this.startX), sy(this.startY));
          ctx.lineTo(sx(endX), sy(endY));
          ctx.stroke();

          ctx.strokeStyle = "white";
          ctx.lineWidth = innerWidth;
          ctx.beginPath();
          ctx.moveTo(sx(this.startX), sy(this.startY));
          ctx.lineTo(sx(endX), sy(endY));
          ctx.stroke();
        }
      const orbX = this.laserCharge.x;
      const orbY = this.laserCharge.y - this.r * 1.45;

      const pulse = 0.75 + Math.sin(this.timer * 0.4) * 0.1;
      const orbSize = this.r * pulse * 5 * collapse;

      const orbAngle = this.timer * 0.08;

      ctx.save();
      ctx.translate(sx(orbX), sy(orbY));
      ctx.rotate(-Math.sqrt(orbAngle*30));

      ctx.drawImage(
        auraImg,
        -orbSize / 2,
        -orbSize / 2,
        orbSize,
        orbSize
      );

      ctx.restore();

      ctx.save();
      ctx.translate(sx(orbX), sy(orbY));
      ctx.rotate(orbAngle);

      ctx.drawImage(
        auraImg,
        -orbSize,
        -orbSize,
        orbSize*2,
        orbSize*2
      );

      ctx.restore();
      }
      if (this._r < 10 && this.state === "charging"){
        this.timer = 0;
        this.angle = 0;
        this.state = "firing";
      }
    }
}

class Bullet {
  constructor(x, y, angle, speed, damage, radius = 8) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.radius = radius;
    this.dead = false;
  }

  render() {
    ctx.save();

    ctx.translate(
        sx(this.x),
        sy(this.y)
    );

    ctx.rotate(this.angle);
    ctx.globalAlpha = 0.35;

    let w1 = this.radius * 3 * 1.5;
    let h1 = this.radius * 1 * 1.5;

    ctx.drawImage(
        bullet,
        -w1 / 2,
        -h1 / 2,
        w1,
        h1
    );

    ctx.globalAlpha = 1;

    let w2 = this.radius * 3 * 0.8;
    let h2 = this.radius * 1 * 0.8;

    ctx.drawImage(
        bullet,
        -w2 / 2,
        -h2 / 2,
        w2,
        h2
    );

    ctx.restore();
  }

  tick(t) {
    this.x += Math.cos(this.angle) * this.speed; 
    this.y += Math.sin(this.angle) * this.speed;

    if (dist(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
      damagePlayer(this.damage);
      this.dead = true;
    }
  }
}

class Enemy {
  constructor(x, y, r, s, hp, maxhp, hx, hy) {
        this.x = x;
        this.y = y;
        this.hx = hx;
        this.hy = hy;

        this.radius = r;
        this.speed = s;

        this.hp = hp;
        this.maxHp = maxhp;

        this.image = new Image();
        this.timer = 0;
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.96;
        this.bounce = 0.9;
        this.mass = 8;
        this.displayHp1 = hp;
        this.displayHp2 = hp;
        this.dead = false;
        this.crashInvulnerbility = false;
        this.cI_timer = 0
    }

    render() {this.healthbar();}

    healthbar() {
      const bw = this.hx;
      const bh = this.hy;
      const bx = sx(this.x) - bw/2;
      const by = sy(this.y) - this.radius - 40;

      this.displayHp1 += (this.hp - this.displayHp1) * 0.15;
      this.displayHp2 += (this.hp - this.displayHp2) * 0.05;

      ctx.fillStyle = "black";
      ctx.fillRect(bx,by,bw,bh);

      ctx.fillStyle = "rgba(21, 255, 0, 1)";
      ctx.fillRect(bx,by,bw*(this.displayHp2/this.maxHp),bh);

      ctx.fillStyle = "red";
      ctx.fillRect(bx,by,bw*(this.displayHp1/this.maxHp),bh);

      ctx.strokeStyle = "white";
      ctx.strokeRect(bx,by,bw,bh);
    }

    tick(t) {
        if (this.cI_timer == 0 && this.crashInvulnerbility)
          this.cI_timer = 80;
        if (this.cI_timer > 0) {
          this.cI_timer--;
          if (this.cI_timer == 0)
            this.crashInvulnerbility = false;
        }
        this.x += this.vx;
        this.y += this.vy;

        this.vx *= this.friction;
        this.vy *= this.friction;

        const impactSpeed = keepInside(this);

        if (impactSpeed > 6) {
          const damage = (impactSpeed - 6) * 8;
          if (this.crashInvulnerbility)
            this.crashInvulnerbility = false;
          else
            this.hp -= damage;

          console.log("Wall slam damage:", damage);
        }
      keepInside(this);
      if (this.hp <=0 ){
        this.die();
      }
    }

    die() {
      effects.push(new explosion(this.x, this.y, 5, 500));
      shakeCamera(15, 70);
      knockbackPlayer(this.x, this.y, 2);
      this.dead = true;
    }
}

class Watch extends Enemy {
    constructor(x, y, r, s, hp, maxhp) {
        super(x, y, r, s, hp, maxhp, 180, 18);
        this.timer = 0;
        this.mass = 6;
        //this.delay = parseInt(400 + 300 * Math.random());
        this.delay = 500;
        this.nextShot = 5;
        this.volleyShots = 0;
        this.shotsLeft = 0;
        this.nextShotTimer = 5;
        this.facing1 = false;
        this.facing2 = false;
    }

    render() {
      super.render();
      const size = this.radius * 2;
      if (timeMalTimer <= 0){
      this.facing1 = player.x < this.x ? -1 : 1;
      this.facing2 = player.y < this.y ? -1 : 1;
      }

      ctx.save();
      ctx.translate(sx(this.x), sy(this.y));
      ctx.scale(-this.facing1, 1);
      ctx.scale(1, -this.facing2);


      ctx.drawImage(
          watchImg,
          -size / 2,
          -size / 2,
          size,
          size
      );

      ctx.restore();
    }

    tick(t) {
      this.timer+=t;
      this.nextShotTimer--;

      const a = Math.atan2(player.y-this.y, player.x-this.x);
      this.x += Math.cos(a)*this.speed;
      this.y += Math.sin(a)*this.speed;

      super.tick(t);
      if (this.timer % (this.delay-80) == 0) {
          lc.push(new shotCharge(this, 40));
      }
      if (this.timer % this.delay == 0) {
          this.shotsLeft = 5;
          this.nextShotTimer = 5;
          this.timer = 0;
      }
      if (this.shotsLeft > 0 && this.nextShotTimer == 0){
          const angle = Math.atan2(
              player.y - this.y,
              player.x - this.x
          );
          bullets.push(
              new Bullet(
                  this.x,
                  this.y,
                  angle + (Math.random() - 0.5) * 1.25,
                  19,
                  18,
                  16
              )
          );
          this.shotsLeft--;
          this.nextShotTimer = 5;
      }
    }
}

class AirPod extends Enemy {
    constructor(x, y, r, s, hp, maxhp) {
        super(x, y, r, s, hp, maxhp, 160, 14);
        this.timer = 0;
        this.mass = 2.25;
        this.facing1 = false;
        this.facing2 = false;
        this.touchCooldown = 0;
        this.touchDamage = 12;
        this.knockbackPower = 0;
    }

    render() {
      const size = this.radius * 2;
      if (timeMalTimer <= 0){
      this.facing1 = player.x < this.x ? -1 : 1;
      this.facing2 = player.y < this.y ? -1 : 1;
      }

      ctx.save();
      ctx.translate(sx(this.x), sy(this.y));
      ctx.scale(-this.facing1, 1);
      //ctx.scale(1, -this.facing2);


      ctx.drawImage(
          podImg,
          -size / 2,
          -size / 2,
          size,
          size
      );

      ctx.restore();
      super.render();
    }

  tick(t) {
    this.timer += t;

    if (this.touchCooldown > 0) this.touchCooldown--;

    const a = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(a) * this.speed;
    this.y += Math.sin(a) * this.speed;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const d = Math.hypot(dx, dy);

    if (d < this.radius + player.radius && this.touchCooldown <= 0) {
      damagePlayer(this.touchDamage);

      knockbackPlayer(this.x, this.y, this.knockbackPower);

      this.touchCooldown = 30;
      shakeCamera(4, 60);
    }

    super.tick(t);
  }

  die() {
      effects.push(new explosion(this.x, this.y, 2, 200));
      shakeCamera(4, 50);
      //knockbackPlayer(this.x, this.y, 2);
      this.dead = true;
    }
}

class Ring extends Enemy {
    constructor(x, y, r, s, hp, maxhp) {
        super(x, y, r, s, hp, maxhp, 190, 18);

        this.timer = 0;
        this.mass = 8;
        this.size = this.radius * 1.6;

        this.angle = 0;
        this.turnSpeed = 0.02;

        this.state = "orbit";

        this.dashCooldown = 180;
        this.dashCooldownTimer = 180;

        this.lockTimer = 0;
        this.lockTime = 60;

        this.dashTimer = 0;
        this.dashTime = 25;
        this.dashSpeed = 7;
        this.dashAngle = 0;

        this.recoverTimer = 0;
        this.recoverTime = 65;

        this.touchCooldown = 0;
        this.touchDamage = 22 * (r/50);
        this.knockbackPower = 45;
    }

    render() {
      super.render();
      ctx.save();

        ctx.translate(
            sx(this.x),
            sy(this.y)
        );

        ctx.rotate(this.angle);
        ctx.globalAlpha = 1;

        ctx.drawImage(
            ringImg,
            -this.size / 2,
            -this.size / 2,
            this.size,
            this.size
        );
      ctx.restore();
    }

    tick(t) {
        this.timer+=t;

        if (this.touchCooldown > 0) this.touchCooldown--;

        this.size = this.radius * 1.6;

        const targetAngle = Math.atan2(
            player.y - this.y,
            player.x - this.x
        );

        let diff = targetAngle - this.angle;

        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        if (Math.abs(diff) < this.turnSpeed) {
            this.angle = targetAngle;
        } else {
            this.angle += Math.sign(diff) * this.turnSpeed;
        }

        ctx.save();

        ctx.translate(
            sx(this.x),
            sy(this.y)
        );

        ctx.rotate(this.angle);
        ctx.globalAlpha = 1;

        ctx.drawImage(
            ringImg,
            -this.size / 2,
            -this.size / 2,
            this.size,
            this.size
        );
      ctx.restore();

      if (this.state === "orbit") {
        this.turnSpeed = 0.021;
        this.orbitAngle += this.orbitSpeed;

        const targetX = player.x;
        const targetY = player.y;

        const a = Math.atan2(targetY - this.y, targetX - this.x);

        this.x += Math.cos(a) * this.speed;
        this.y += Math.sin(a) * this.speed;

        this.dashCooldownTimer--;

        if (this.dashCooldownTimer <= 0) {
            this.state = "lock";
            this.lockTimer = this.lockTime;
            lc.push(new shotCharge(this, 40));
        }
    }

    else if (this.state === "lock") {
      this.turnSpeed = 0.018;
        this.lockTimer--;

    drawIndicator(
        this.x,
        this.y,
        30000,
        this.radius * 1.2,
        this.angle,
        "cyan",
        this.timer
    );
        if (this.lockTimer <= 0) {
            this.state = "dash";
            this.dashTimer = this.dashTime;
            this.dashAngle = this.angle;
        }
    }

  else if (this.state === "dash") {
      this.crashInvulnerbility = true;
      this.vx += Math.cos(this.dashAngle) * this.dashSpeed;
      this.vy += Math.sin(this.dashAngle) * this.dashSpeed;

      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const d = Math.hypot(dx, dy);

      if (d < this.radius + player.radius && this.touchCooldown <= 0) {
          damagePlayer(this.touchDamage);
          knockbackPlayer(this.x, this.y, this.knockbackPower);
          shakeCamera(6, 70);
          this.touchCooldown = 35;
      }

      this.dashTimer--;
      if (!this.crashInvulnerbility){
          this.state = "recover";
          this.recoverTimer = this.recoverTime;
      }
      if (this.dashTimer <= 0) {
          this.state = "recover";
          this.recoverTimer = this.recoverTime;
      }
    }

    else if (this.state === "recover") {
        this.recoverTimer--;

        if (this.recoverTimer <= 0) {
            this.state = "orbit";
            this.dashCooldownTimer = this.dashCooldown;
        }
    }
      super.tick(t);
    }

    die() {
      effects.push(new explosion(this.x, this.y, 100, 400));
      shakeCamera(23, 100);
      knockbackPlayer(this.x, this.y, 10);
      this.dead = true;
    }
}

// unused
class trollPhone extends Enemy {
    constructor(x, y, r, s, hp, maxhp) {
        super(x, y, r, s, hp, maxhp, 180, 18);
        this.timer = 0;
        this.mass = 5.5;
        this.delay = 560;
        this.pullStrength = 5;
        this.size = this.radius * 1.6;

        this.state = "orbit";
        this.orbitAngle = Math.random() * Math.PI * 2;
        this.orbitRadius = 220;
        this.orbitSpeed = 0.035;

        this.dashCooldown = 180;
        this.dashCooldownTimer = 180;

        this.lockTimer = 0;
        this.lockTime = 35;

        this.dashTimer = 0;
        this.dashTime = 25;
        this.dashSpeed = 18;
        this.dashAngle = 0;

        this.recoverTimer = 0;
        this.recoverTime = 45;
    }

    tick(t) {
      this.timer+=t;

      this.size = this.radius * 1.6;
      const facing1 = player.x < this.x ? -1 : 1;
      const facing2 = player.y < this.y ? -1 : 1;

      ctx.save();
      ctx.translate(sx(this.x), sy(this.y));
      ctx.scale(-facing1, 1);
      //ctx.scale(1, -facing2);

      ctx.drawImage(
          blankPhoneImg,
          -this.size / 2,
          -this.size / 1.4,
          this.size,
          this.size * 1.5
      );
      console.log(this.size)

      this.size = this.radius * 1;
      console.log(this.size)
      ctx.drawImage(
          trollImg,
          -this.size / 2,
          -this.size / 2,
          this.size,
          this.size
      );

      ctx.restore();
      super.render();

      if (this.state === "orbit") {
          this.orbitAngle += this.orbitSpeed;

          const targetX = player.x + Math.cos(this.orbitAngle) * this.orbitRadius;
          const targetY = player.y + Math.sin(this.orbitAngle) * this.orbitRadius;

          const a = Math.atan2(targetY - this.y, targetX - this.x);

          this.x += Math.cos(a) * this.speed;
          this.y += Math.sin(a) * this.speed;

          this.dashCooldownTimer--;

          if (this.dashCooldownTimer <= 0) {
              this.state = "lock";
              this.lockTimer = this.lockTime;
          }
      }

      else if (this.state === "lock") {
          this.lockTimer--;

          if (this.lockTimer <= 0) {
              this.state = "dash";
              this.dashTimer = this.dashTime;
              this.dashAngle = Math.atan2(player.y - this.y, player.x - this.x);
          }
      }

      else if (this.state === "dash") {
          this.x += Math.cos(this.dashAngle) * this.dashSpeed;
          this.y += Math.sin(this.dashAngle) * this.dashSpeed;

          this.dashTimer--;

          if (this.dashTimer <= 0) {
              this.state = "recover";
              this.recoverTimer = this.recoverTime;
          }
      }

      else if (this.state === "recover") {
          this.recoverTimer--;

          if (this.recoverTimer <= 0) {
              this.state = "orbit";
              this.dashCooldownTimer = this.dashCooldown;
          }
      }

      super.tick(t);
      if (this.timer % (this.delay-80) == 0) {
          lc.push(new shotCharge(this, 40));
      }
      if (this.timer % this.delay == 0) {
          this.shotsLeft = 5;
          this.nextShotTimer = 5;
          this.timer = 0;
      }
      if (this.shotsLeft > 0 && this.nextShotTimer == 0){
          const angle = Math.atan2(
              player.y - this.y,
              player.x - this.x
          );
          bullets.push(
              new Bullet(
                  this.x,
                  this.y,
                  angle + (Math.random() - 0.5) * 0.8,
                  18,
                  16,
                  16
              )
          );
          this.shotsLeft--;
          this.nextShotTimer = 5;
      }
    }
}

// huawei class
class Huawei extends Enemy {
    constructor(x, y, r, s, hp, maxhp) {
        super(x, y, r, s, hp, maxhp, 260, 25);
        this.image.src = "huawei.png";
        this.timer = 1000;
        this.mass = 50;
    }

    render() {
      const size = this.radius * 2;

      ctx.drawImage(
        huaweiImg,
        sx(this.x) - size / 2,
        sy(this.y) - size / 2,
        size,
        size
      );

      super.render();
    }

    tick(t) {
      this.timer+=t;

      if (this.timer % 1060 == 0) {
        lc.push(new laserCharge(this, 100));
        shakeCamera(12, 200);
        console.log("fire!");
      }

      const a = Math.atan2(player.y-this.y, player.x-this.x);
      this.x += Math.cos(a)*this.speed;
      this.y += Math.sin(a)*this.speed;
      super.tick(t);
    }

    die() {
      effects.push(new explosion(this.x, this.y, 200, 500));
      shakeCamera(25, 100);
      knockbackPlayer(this.x, this.y, 12);
      this.dead = true;
    }
}

class Apple extends Enemy {
    constructor(x, y, r, s, hp, maxhp) {
        super(x, y, r, s, hp, maxhp, 260, 25);
        this.mass = 40;

        this.timer = 1000;

        this.angle = 0;
        this.turnSpeed;

        this.state = "aim";

        this.shockCooldown = 240;
        this.shockCooldownTimer = 240;

        this.chargeTimer = 0;
        this.chargeTime = 120;

        this.shockRange = 7000;
        this.shockAngle = Math.PI / 1.8;
        this.shockDamage = 90;
        this.shockKnockback = 225;
    }

    render() {
        super.render();

        const size = this.radius * 2;

        ctx.save();
        ctx.translate(sx(this.x), sy(this.y));
        ctx.rotate(this.angle - Math.PI/2);

        ctx.drawImage(
            appleImg,
            -(size * 1.5) / 2,
            -size / 2,
            size * 1.5,
            size
        );
        ctx.rotate(this.angle);

        ctx.restore();
    }

    tick(t) {
        this.timer += t;

        if (this.state === "charge") {
            this.turnSpeed = 0.0035;
        }
        else {
            this.turnSpeed = 0.015;
        }

        const targetAngle = Math.atan2(
            player.y - this.y,
            player.x - this.x
        );

        let diff = targetAngle - this.angle;

        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        if (Math.abs(diff) < this.turnSpeed) {
            this.angle = targetAngle;
        } else {
            this.angle += Math.sign(diff) * this.turnSpeed;
        }

        this.shockCooldownTimer--;

        if (this.state === "aim" && this.shockCooldownTimer <= 0) {
            this.state = "charge";
            this.chargeTimer = this.chargeTime;
        }

        if (this.state === "charge") {
            drawConeIndicator(
                this.x,
                this.y,
                this.shockRange,
                this.shockAngle,
                this.angle,
                "cyan",
                this.timer
            );

            this.chargeTimer--;

            if (this.chargeTimer <= 0) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const d = Math.hypot(dx, dy);

                const playerAngle = Math.atan2(dy, dx);
                let angleDiff = playerAngle - this.angle;

                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                if (
                    d < this.shockRange &&
                    Math.abs(angleDiff) < this.shockAngle / 2
                ) {
                    damagePlayer(this.shockDamage);
                    knockbackPlayer(this.x, this.y, this.shockKnockback);
                }

                shakeCamera(25, 120);
                effects.push(new explosion(this.x, this.y, 160, 350));
                effects.push(
                new ConeShockwave(
                      this.x,
                      this.y,
                      this.angle,
                      this.shockAngle,
                      this.shockRange
                  )
                );

                this.state = "aim";
                this.shockCooldownTimer = this.shockCooldown;
            }
        }

        const a = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(a) * this.speed;
        this.y += Math.sin(a) * this.speed;

        super.tick(t);
    }

    die() {
        effects.push(new explosion(this.x, this.y, 200, 500));
        shakeCamera(25, 100);
        knockbackPlayer(this.x, this.y, 10);
        this.dead = true;
    }
}

class shotCharge extends laserCharge {
    constructor(lc, r) {
        super(lc, r);
    }

    tick(t) {
      this.timer+=t;
        if (this._r < 10){
          this.timer = 0;
          this.angle = 0;
          this.disable = true;
          return;
        }
        this._r = this.r * 4 * Math.exp(-0.03 * this.timer);

        const orbX = sx(this.laserCharge.x);
        const orbY = sy(this.laserCharge.y);

        const orbAngle = this.timer * 0.12;

        ctx.save();
        ctx.translate(orbX, orbY);
        ctx.rotate(orbAngle);

        ctx.drawImage(
          auraImg,
          -this._r,
          -this._r,
          this._r * 2,
          this._r * 2
        );

        ctx.restore();
        ctx.save();
        ctx.translate(orbX, orbY);
        ctx.rotate(-Math.sqrt(orbAngle*5));

        ctx.drawImage(
          auraImg,
          -this._r,
          -this._r,
          this._r * 2,
          this._r * 2
        );

        ctx.restore();
    }
}

function drawIndicator(x, y, length, width, angle, color, timer) {
    const alpha = 0.2 + Math.sin(timer * 0.15) * 0.15;

    ctx.save();
    ctx.translate(sx(x), sy(y));
    ctx.rotate(angle);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;

    // starts at enemy center and extends forward
    ctx.fillRect(
        0,
        -width / 2,
        length,
        width
    );

    ctx.globalAlpha = alpha + 0.25;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.strokeRect(
        0,
        -width / 2,
        length,
        width
    );

    ctx.restore();
}

function drawConeIndicator(x, y, length, coneAngle, angle, color, timer) {
    const alpha = 0.12 + Math.sin(timer * 0.15) * 0.08;

    ctx.save();
    ctx.translate(sx(x), sy(y));
    ctx.rotate(angle);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, Math.tan(coneAngle / 2) * length);
    ctx.lineTo(length, -Math.tan(coneAngle / 2) * length);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = alpha + 0.25;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}
