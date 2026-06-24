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