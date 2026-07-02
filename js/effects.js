let effects = [];

class explosion {
    constructor(x, y, R, maxR) {
        this.x = x;
        this.y = y;
        this.r = R;
        this.maxR = maxR;
        this.timer = 0;
        this.state = "charging";
        this.startX;
        this.startY;
        this.disable = false;
        this.al = 0.8;
    }

    tick() {
      this.timer++;
      if (this.state === "charging") {
        ctx.globalAlpha = this.al;
        this.r += 70;
        this.al -= 0.03;

        const orbX = sx(this.x);
        const orbY = sy(this.y);

        const orbAngle = this.timer * 0.12;

        ctx.save();
        ctx.translate(orbX, orbY);
        ctx.rotate(orbAngle);

        ctx.drawImage(
          energyImg,
          -this.r/4,
          -this.r/4,
          this.r * 0.5,
          this.r * 0.5
        ),
        ctx.restore();
        ctx.globalAlpha = 1;
      }
      if (this.al <= 0) {
        this.state = "cancel";
        this.disable = true;
      }
    }
}

class ConeShockwave {
    constructor(x, y, angle, cAngle, range) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.cAngle = cAngle;
        this.range = range;

        this.timer = 0;
        this.life = 25;
        this.dead = false;
    }

    tick() {
        this.timer++;

        const progress = this.timer / this.life;
        const currentRange = this.range * progress;

        ctx.save();
        ctx.translate(sx(this.x), sy(this.y));
        ctx.rotate(this.angle);

        ctx.fillStyle = `rgba(0,255,255,${0.5*(1-progress)})`;

        ctx.beginPath();
        ctx.moveTo(0, 0);

        ctx.arc(
            0,
            0,
            currentRange,
            -this.cAngle/2,
            this.cAngle/2
        );

        ctx.closePath();
        ctx.fill();

        ctx.restore();

        if (this.timer >= this.life)
            this.dead = true;
    }
}

class Collectable {
    constructor(x, y, vx = 0, vy = 0, amount = 1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;

        this.amount = amount;
        this.timer = 0;
        this.dead = false;
        this.radius = 100;

        this.friction = 0.94;
        this.bounce = 0.55;
    }

    tick() {
        this.timer++;

        if (timeMalTimer <= 0) {
            this.x += this.vx;
            this.y += this.vy;

            this.vx *= this.friction;
            this.vy *= this.friction;

            keepInside(this);
        }

        const size = this.radius * 0.55;
        const w = size * 1.75;
        const h = size;

        let hover = 0;
        if (timeMalTimer <= 0)
            hover = Math.sin(this.timer * 0.08) * 3;

        const floatY = -7.5 + hover;

        ctx.save();
        ctx.translate(sx(this.x), sy(this.y));

        const temp = document.createElement("canvas");
        temp.width = w;
        temp.height = h;
        const tctx = temp.getContext("2d");

        tctx.drawImage(ramImg, 0, 0, w, h);
        tctx.globalCompositeOperation = "source-in";
        tctx.fillStyle = "yellow";
        tctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.shadowColor = "yellow";
        ctx.shadowBlur = 25;
        ctx.globalAlpha = 0.65;
        ctx.drawImage(temp, -w / 2, -h / 2);
        ctx.restore();

        ctx.save();
        ctx.translate(0, floatY);
        ctx.shadowColor = "yellow";
        ctx.shadowBlur = 15;

        ctx.drawImage(ramImg, -w / 2, -h / 2, w, h);

        ctx.restore();
        ctx.restore();

        if (dist(this.x, this.y, player.x, player.y) < this.radius/2 + player.radius) {
            credits += this.amount;
            localStorage.setItem("credits", credits);
            showRamCounter();
            this.dead = true;
        }
    }
}