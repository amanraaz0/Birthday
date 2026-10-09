/* =====================================================================
   HAPPY BIRTHDAY KHUSHI — script.js
   Small, dependency-free JavaScript for:
     1. Smooth scrolling + scroll-reveal
     2. Typing effect                       (index.html, story.html)
     3. Countdown timers                    (index.html, countdown.html)
     4. Birthday celebration + surprise popup + optional music
     5. Confetti, fireworks, hearts & sparkles (shared canvas)
   Each feature only runs if its elements exist on the current page.
   ===================================================================== */

/* 🎂 Khushi's birthday begins at 12:00 AM on 10 October 2026 (India time).
   The "+05:30" makes it correct for anyone, in any time zone. */
const BIRTHDAY_START = new Date("2026-10-10T00:00:00+05:30");

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initReveal();
  initTyping();
  initCountdown();
  initSurprise();
  initFinale();
});

/* ---------------------------------------------------------------
   1. SMOOTH SCROLLING & SCROLL REVEAL
   --------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------
   2. TYPING EFFECT — <span data-typing='["line 1","line 2"]'>
   --------------------------------------------------------------- */
function initTyping() {
  const el = document.querySelector("[data-typing]");
  if (!el) return;
  const lines = JSON.parse(el.dataset.typing);
  let line = 0, char = 0, deleting = false;

  (function tick() {
    const text = lines[line];
    char += deleting ? -1 : 1;
    el.textContent = text.slice(0, char);

    let delay = deleting ? 35 : 75;
    if (!deleting && char === text.length) { delay = 2200; deleting = true; }
    else if (deleting && char === 0) { deleting = false; line = (line + 1) % lines.length; delay = 400; }
    setTimeout(tick, delay);
  })();
}

/* ---------------------------------------------------------------
   3. COUNTDOWN TIMER(S) — any element with [data-countdown]
      (big one on countdown.html, mini one on the home page).
      When it reaches zero, the celebration starts automatically.
   --------------------------------------------------------------- */
function initCountdown() {
  const boxes = document.querySelectorAll("[data-countdown]");
  if (!boxes.length) return;
  const msg = document.querySelector("[data-countdown-msg]");
  const pad = (n) => String(n).padStart(2, "0");
  let timer = null;

  function render(values) {
    boxes.forEach((box) =>
      Object.entries(values).forEach(([unit, v]) => {
        const el = box.querySelector(`[data-unit="${unit}"]`);
        if (el) el.textContent = pad(v);
      })
    );
  }

  function update() {
    const diff = BIRTHDAY_START - new Date();

    if (diff <= 0) { // 🎉 It's her birthday!
      clearInterval(timer);
      render({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (msg) msg.textContent = msg.dataset.done || "It's officially your day! 💖";
      showBirthdayBanner();
      setTimeout(celebrate, 600);
      return;
    }
    render({
      days: Math.floor(diff / 864e5),
      hours: Math.floor((diff / 36e5) % 24),
      minutes: Math.floor((diff / 6e4) % 60),
      seconds: Math.floor((diff / 1e3) % 60),
    });
    if (msg) msg.textContent = msg.dataset.wait || "";
  }
  update();
  if (BIRTHDAY_START - new Date() > 0) timer = setInterval(update, 1000);
}

function showBirthdayBanner() {
  document.body.classList.add("is-birthday");
  const banner = document.getElementById("bday-banner");
  if (banner) banner.hidden = false;
}

/* ---------------------------------------------------------------
   4. CELEBRATION — popup + cake + confetti + fireworks + hearts + sparkles
   --------------------------------------------------------------- */
function celebrate() {
  const popup = document.getElementById("popup");
  if (popup) popup.classList.add("open");
  FX.confetti(220);
  FX.fireworksShow(7000);
  FX.hearts(50);
  FX.sparkles(90);
}

function initSurprise() {
  const btn = document.getElementById("open-surprise");
  const popup = document.getElementById("popup");
  if (!btn || !popup) return;

  const close = () => popup.classList.remove("open");

  btn.addEventListener("click", celebrate);
  popup.querySelector(".popup__close").addEventListener("click", close);
  popup.addEventListener("click", (e) => { if (e.target === popup) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  const again = document.getElementById("celebrate-again");
  if (again) again.addEventListener("click", () => { FX.confetti(160); FX.fireworksShow(4000); FX.hearts(30); FX.sparkles(60); });

  const musicBtn = document.getElementById("music-btn");
  if (musicBtn) {
    musicBtn.addEventListener("click", () => {
      const playing = Music.toggle();
      musicBtn.textContent = playing ? "🔇 Stop Music" : "🎵 Play Music";
    });
  }
}

/* Plays "Happy Birthday" with the Web Audio API — no audio file needed.
   Tip: to use a real song instead, add <audio> with your MP3 (see README). */
const Music = (() => {
  let ctx = null, timer = null, playing = false;
  const N = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
  const song = [
    ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
    ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
    ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
    ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2.5],
  ];
  const beat = 0.42;

  function playOnce() {
    let t = ctx.currentTime + 0.1;
    song.forEach(([note, len]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = N[note];
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + len * beat * 0.95);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + len * beat);
      t += len * beat;
    });
    const total = song.reduce((s, [, l]) => s + l, 0) * beat;
    timer = setTimeout(() => playing && playOnce(), (total + 1.2) * 1000);
  }

  return {
    toggle() {
      if (playing) {
        playing = false;
        clearTimeout(timer);
        ctx && ctx.close();
        ctx = null;
      } else {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
        playing = true;
        playOnce();
      }
      return playing;
    },
  };
})();

/* ---------------------------------------------------------------
   5. CONFETTI, FIREWORKS, HEARTS & SPARKLES — one shared <canvas id="fx">
   --------------------------------------------------------------- */
const FX = (() => {
  const COLORS = ["#ff6fae", "#ff9ecb", "#8e44ff", "#c79bff", "#f5c76b", "#ffffff"];
  let canvas, ctx, W, H, running = false;
  const parts = [];
  const rand = (a, b) => Math.random() * (b - a) + a;

  function setup() {
    if (canvas) return true;
    canvas = document.getElementById("fx");
    if (!canvas) return false;
    ctx = canvas.getContext("2d");
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);
    return true;
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.update();
      p.draw();
      if (p.dead) parts.splice(i, 1);
    }
    if (parts.length) requestAnimationFrame(loop);
    else running = false;
  }
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }

  /* Confetti piece: falling, spinning ribbon */
  function Confetti() {
    this.x = rand(0, W); this.y = rand(-H * 0.6, -10);
    this.w = rand(6, 11); this.h = rand(10, 18);
    this.vx = rand(-1.5, 1.5); this.vy = rand(2, 5);
    this.rot = rand(0, Math.PI * 2); this.vr = rand(-0.15, 0.15);
    this.tilt = rand(0, Math.PI * 2);
    this.color = COLORS[(Math.random() * COLORS.length) | 0];
    this.update = () => {
      this.tilt += 0.08;
      this.x += this.vx + Math.sin(this.tilt) * 0.8;
      this.y += this.vy;
      this.rot += this.vr;
      if (this.y > H + 20) this.dead = true;
    };
    this.draw = () => {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.scale(1, Math.cos(this.tilt));
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    };
  }

  /* Spark from an exploding firework */
  function Spark(x, y, color) {
    const angle = rand(0, Math.PI * 2), speed = rand(1.5, 6.5);
    this.x = x; this.y = y;
    this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
    this.life = 1; this.decay = rand(0.011, 0.02);
    this.update = () => {
      this.vx *= 0.97; this.vy = this.vy * 0.97 + 0.06;
      this.x += this.vx; this.y += this.vy;
      this.life -= this.decay;
      if (this.life <= 0) this.dead = true;
    };
    this.draw = () => {
      ctx.globalAlpha = Math.max(this.life, 0);
      ctx.fillStyle = color;
      ctx.shadowBlur = 12; ctx.shadowColor = color;
      ctx.beginPath(); ctx.arc(this.x, this.y, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    };
  }

  /* Rocket that flies up and bursts into sparks */
  function Rocket() {
    this.x = rand(W * 0.15, W * 0.85); this.y = H;
    this.ty = rand(H * 0.12, H * 0.45);
    this.vy = -rand(9, 13);
    this.color = COLORS[(Math.random() * (COLORS.length - 1)) | 0];
    this.update = () => {
      this.y += this.vy; this.vy *= 0.985;
      if (this.y <= this.ty || this.vy > -2) {
        this.dead = true;
        const count = W < 600 ? 50 : 80;
        for (let i = 0; i < count; i++) parts.push(new Spark(this.x, this.y, i % 3 ? this.color : "#f5c76b"));
      }
    };
    this.draw = () => {
      ctx.fillStyle = "#fff6d6";
      ctx.beginPath(); ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(245,199,107,0.4)";
      ctx.fillRect(this.x - 1, this.y, 2, 18);
    };
  }

  /* Heart that floats up from the bottom and fades away */
  function Heart() {
    this.x = rand(0, W); this.y = H + rand(10, H * 0.5);
    this.size = rand(10, 24); this.vy = -rand(1.2, 2.8);
    this.sway = rand(0, Math.PI * 2); this.life = 1;
    this.color = ["#ff6fae", "#ff9ecb", "#ffffff", "#f5c76b"][(Math.random() * 4) | 0];
    this.update = () => {
      this.sway += 0.04; this.x += Math.sin(this.sway) * 0.9; this.y += this.vy;
      if (this.y < H * 0.25) this.life -= 0.015;
      if (this.life <= 0 || this.y < -40) this.dead = true;
    };
    this.draw = () => {
      const s = this.size / 2;
      ctx.save();
      ctx.globalAlpha = Math.max(this.life, 0) * 0.9;
      ctx.translate(this.x, this.y);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 14; ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.6);
      ctx.bezierCurveTo(-s * 1.4, -s * 0.4, -s * 0.6, -s * 1.5, 0, -s * 0.6);
      ctx.bezierCurveTo(s * 0.6, -s * 1.5, s * 1.4, -s * 0.4, 0, s * 0.6);
      ctx.fill();
      ctx.restore();
    };
  }

  /* Twinkling four-point sparkle */
  function Sparkle() {
    this.x = rand(0, W); this.y = rand(0, H);
    this.max = rand(4, 11); this.t = -rand(0, 120); this.dur = rand(50, 90);
    this.color = Math.random() < 0.5 ? "#f5c76b" : "#ffffff";
    this.update = () => { this.t++; if (this.t > this.dur) this.dead = true; };
    this.draw = () => {
      if (this.t < 0) return;
      const k = Math.sin((this.t / this.dur) * Math.PI), r = this.max * k;
      ctx.save();
      ctx.translate(this.x, this.y); ctx.rotate(this.t * 0.03);
      ctx.globalAlpha = k; ctx.fillStyle = this.color;
      ctx.shadowBlur = 12; ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r);
      ctx.fill();
      ctx.restore();
    };
  }

  return {
    hearts(n = 40) {
      if (!setup()) return;
      for (let i = 0; i < n; i++) parts.push(new Heart());
      start();
    },
    sparkles(n = 80) {
      if (!setup()) return;
      for (let i = 0; i < n; i++) parts.push(new Sparkle());
      start();
    },
    confetti(n = 200) {
      if (!setup()) return;
      for (let i = 0; i < n; i++) parts.push(new Confetti());
      start();
    },
    firework() {
      if (!setup()) return;
      parts.push(new Rocket());
      start();
    },
    fireworksShow(duration = 5000) {
      const end = Date.now() + duration;
      const fire = () => {
        this.firework();
        if (Date.now() < end) setTimeout(fire, rand(250, 650));
      };
      fire();
    },
  };
})();

/* ---------------------------------------------------------------
   6. FINAL PAGE — gentle fireworks on arrival + replay button
   --------------------------------------------------------------- */
function initFinale() {
  if (!document.body.classList.contains("final-body")) return;
  setTimeout(() => { FX.fireworksShow(5000); FX.confetti(120); FX.hearts(30); FX.sparkles(60); }, 1200);
  const btn = document.getElementById("one-more");
  if (btn) btn.addEventListener("click", () => { FX.fireworksShow(5000); FX.confetti(180); FX.hearts(40); FX.sparkles(70); });
}
