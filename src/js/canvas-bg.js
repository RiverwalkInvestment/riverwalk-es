// Canvas background animation — Riverwalk / metodología section
// Inspired by nfinitepaper's tech background: animated particle grid
// driven by GSAP ScrollTrigger progress (0→1)

export function initCanvasBg() {
  const canvas = document.getElementById('metodo-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, particles, animId;
  let scrollProgress = 0;   // 0–1 driven by GSAP
  let time = 0;

  // ── Particle definition ────────────────────────────────────────────────────
  class Particle {
    constructor(x, y, col, row, totalCols, totalRows) {
      this.x = x;
      this.y = y;
      this.col = col;
      this.row = row;
      this.totalCols = totalCols;
      this.totalRows = totalRows;
      // Base radius
      this.r = 1.5;
      // Phase offset so they don't all pulse simultaneously
      this.phase = (col / totalCols) * Math.PI * 2 + (row / totalRows) * Math.PI;
      // "Activation threshold" — fraction of scroll at which this dot lights up
      this.threshold = (col / totalCols) * 0.6 + (row / totalRows) * 0.4;
      // Fixed base opacity
      this.baseAlpha = 0.12 + Math.random() * 0.06;
    }

    draw(t, progress) {
      const activated = progress > this.threshold;

      // Pulse frequency increases as scroll progresses
      const pulse = Math.sin(t * 1.2 + this.phase) * 0.5 + 0.5;  // 0–1

      let alpha, radius;

      if (activated) {
        // Lit up dot — brighter, slightly larger
        const activationStrength = Math.min((progress - this.threshold) / 0.15, 1);
        alpha = this.baseAlpha + activationStrength * (0.50 + pulse * 0.30);
        radius = this.r + activationStrength * (1.0 + pulse * 0.8);
      } else {
        // Dormant dot — very subtle
        alpha = this.baseAlpha * (0.5 + pulse * 0.2);
        radius = this.r * (0.7 + pulse * 0.15);
      }

      // Color: cream with a hint of blue-teal on activated dots
      let r = 255, g = 250, b = 246;
      if (activated) {
        const blend = Math.min((progress - this.threshold) / 0.2, 1);
        r = Math.round(255 - blend * (255 - 113));  // 113,203,225 = dark-blue
        g = Math.round(250 - blend * (250 - 203));
        b = Math.round(246 - blend * (246 - 225));
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    }
  }

  // ── Connection lines between nearby activated particles ────────────────────
  function drawConnections(particles, progress) {
    const maxDist = Math.min(w, h) * 0.065;
    const activated = particles.filter(p => progress > p.threshold + 0.05);

    ctx.lineWidth = 0.4;

    for (let i = 0; i < activated.length; i++) {
      for (let j = i + 1; j < activated.length; j++) {
        const a = activated[i], b = activated[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const strengthA = Math.min((progress - a.threshold) / 0.15, 1);
          const strengthB = Math.min((progress - b.threshold) / 0.15, 1);
          const alpha = Math.min(strengthA, strengthB) * (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(113,203,225,${alpha})`;
          ctx.stroke();
        }
      }
    }
  }

  // ── Setup ──────────────────────────────────────────────────────────────────
  function setup() {
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width  = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Grid density
    const cols = Math.floor(w / 40);
    const rows = Math.floor(h / 40);
    const gapX = w / cols;
    const gapY = h / rows;
    const offsetX = gapX / 2;
    const offsetY = gapY / 2;

    particles = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Add small jitter so grid isn't perfectly rigid
        const jitter = gapX * 0.12;
        const jx = (Math.random() - 0.5) * jitter;
        const jy = (Math.random() - 0.5) * jitter;
        particles.push(new Particle(
          offsetX + col * gapX + jx,
          offsetY + row * gapY + jy,
          col, row, cols, rows
        ));
      }
    }
  }

  // ── Render loop ────────────────────────────────────────────────────────────
  function render() {
    time += 0.016;
    ctx.clearRect(0, 0, w, h);

    // Dark background — already set by CSS, but fill for compositing
    ctx.fillStyle = 'rgba(15,19,26,1)';
    ctx.fillRect(0, 0, w, h);

    // Radial glow at scroll progress position
    if (scrollProgress > 0) {
      const glowX = w * 0.35;
      const glowY = h * 0.5;
      const grd = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, w * 0.55);
      grd.addColorStop(0, `rgba(138,180,252,${0.04 * scrollProgress})`);
      grd.addColorStop(1, 'rgba(138,180,252,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    }

    // Connection lines
    if (scrollProgress > 0.1) {
      drawConnections(particles, scrollProgress);
    }

    // Particles
    for (const p of particles) {
      p.draw(time, scrollProgress);
    }

    animId = requestAnimationFrame(render);
  }

  // ── Public API (called by GSAP) ────────────────────────────────────────────
  function setProgress(p) {
    scrollProgress = Math.max(0, Math.min(1, p));
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  setup();
  render();

  // Resize
  window.addEventListener('resize', () => {
    setup();
  }, { passive: true });

  // Cleanup
  function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', setup);
  }

  return { setProgress, destroy };
}
