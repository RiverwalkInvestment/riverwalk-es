// Canvas background — Riverwalk / metodología section
// Replicates nfinitepaper's 3-D isometric layered-slab particle animation.
// Scroll progress (0 → 1) drives layer revelation and particle coagulation.

export function initCanvasBg() {
  const canvas = document.getElementById('metodo-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, animId;
  let scrollProgress = 0;
  let time = 0;

  // ── Isometric projection helpers ──────────────────────────────────────────
  // Classic 2:1 dimetric (≈26.565°) — matches the nfinitepaper look.
  // Input:  3-D (x, y, z)  — y is UP
  // Output: 2-D (sx, sy)   anchored to canvas centre (cx, cy)
  function iso(x3, y3, z3, scale, cx, cy) {
    return {
      sx: cx + (x3 - z3) * scale,
      sy: cy + (x3 + z3) * scale * 0.5 - y3 * scale
    };
  }

  // ── Particle ──────────────────────────────────────────────────────────────
  class Particle {
    constructor(x3, y3, z3, layerIdx, totalLayers, isAmbient) {
      this.ox3 = x3;   // "structure" target position
      this.oy3 = y3;
      this.oz3 = z3;

      // Ambient start position — scattered wide
      this.ax3 = x3 + (Math.random() - 0.5) * 520;
      this.ay3 = y3 + (Math.random() - 0.5) * 220;
      this.az3 = z3 + (Math.random() - 0.5) * 520;

      this.layerIdx   = layerIdx;
      this.totalLayers = totalLayers;
      this.isAmbient  = isAmbient;

      // Layer activation threshold: bottom layers first
      this.threshold = isAmbient
        ? 0.05 + Math.random() * 0.30          // ambient particles appear early
        : (layerIdx / totalLayers) * 0.75 + 0.10; // layers build bottom→top

      this.phase = Math.random() * Math.PI * 2;
      this.baseR = isAmbient ? 0.6 + Math.random() * 0.5 : 0.7 + Math.random() * 0.9;

      // Per-particle random jitter on the layer surface
      this.jx = (Math.random() - 0.5) * 12;
      this.jz = (Math.random() - 0.5) * 12;
    }

    draw(t, progress, scale, cx, cy) {
      const pulse = Math.sin(t * 1.4 + this.phase) * 0.5 + 0.5; // 0→1

      let alpha, radius;
      let r = 255, g = 252, b = 248; // cream default

      if (this.isAmbient) {
        // Ambient cloud: visible early, fades as structure forms
        const appear = Math.max(0, Math.min((progress - this.threshold) / 0.15, 1));
        const fade   = Math.max(0, 1 - Math.max(0, (progress - 0.25) / 0.45));
        alpha  = appear * fade * (0.12 + pulse * 0.08);
        radius = this.baseR * (0.8 + pulse * 0.3);

        const p = iso(this.ax3, this.ay3, this.az3, scale, cx, cy);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
        return;
      }

      // Structure particle
      const activated = progress > this.threshold;
      if (!activated) {
        // Dormant — tiny ghost dot at ambient position
        const p = iso(this.ax3, this.ay3, this.az3, scale, cx, cy);
        alpha  = 0.04 + pulse * 0.02;
        radius = this.baseR * 0.45;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,252,248,${alpha})`;
        ctx.fill();
        return;
      }

      // Interpolate from ambient scatter → structure position
      const strength = Math.min((progress - this.threshold) / 0.18, 1);
      const ease     = strength * strength * (3 - 2 * strength); // smoothstep

      const cx3 = this.ax3 + (this.ox3 + this.jx - this.ax3) * ease;
      const cy3 = this.ay3 + (this.oy3         - this.ay3) * ease;
      const cz3 = this.az3 + (this.oz3 + this.jz - this.az3) * ease;

      alpha  = 0.07 + ease * (0.52 + pulse * 0.28);
      radius = this.baseR + ease * (0.9 + pulse * 0.5);

      // Color: cream (bottom layers) → teal (top layers)
      const layerT   = this.layerIdx / (this.totalLayers - 1); // 0=bottom, 1=top
      const tealBlend = layerT * ease * 0.85;
      // Target: teal ≈ rgb(80, 200, 220)
      r = Math.round(255 - tealBlend * (255 -  80));
      g = Math.round(252 - tealBlend * (252 - 200));
      b = Math.round(248 - tealBlend * (248 - 220));

      const p = iso(cx3, cy3, cz3, scale, cx, cy);
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    }
  }

  // ── Build particle system ─────────────────────────────────────────────────
  let particles = [];
  let scale, cx, cy;

  function setup() {
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width  = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Scale: slab fits roughly 60% of the smaller dimension
    scale = Math.min(w, h) * 0.00062;
    cx    = w * 0.52;
    cy    = h * 0.50;

    particles = [];

    // ── 3D slab dimensions (3D units) ─────────────────────────────────────
    const LAYERS    = 10;          // horizontal strata
    const SLAB_W    = 260;         // half-width  (X axis)
    const SLAB_D    = 180;         // half-depth  (Z axis)
    const LAYER_SEP = 30;          // vertical gap between layers (Y axis)
    const PER_LAYER = 220;         // particles per layer
    const LAYER_BASE_Y = -(LAYERS / 2) * LAYER_SEP;

    for (let li = 0; li < LAYERS; li++) {
      const y3 = LAYER_BASE_Y + li * LAYER_SEP;
      for (let i = 0; i < PER_LAYER; i++) {
        const x3 = (Math.random() - 0.5) * SLAB_W * 2;
        const z3 = (Math.random() - 0.5) * SLAB_D * 2;
        particles.push(new Particle(x3, y3, z3, li, LAYERS, false));
      }
    }

    // ── Ambient scatter cloud ──────────────────────────────────────────────
    for (let i = 0; i < 320; i++) {
      const x3 = (Math.random() - 0.5) * SLAB_W * 4.5;
      const y3 = (Math.random() - 0.5) * LAYER_SEP * LAYERS * 2;
      const z3 = (Math.random() - 0.5) * SLAB_D * 4.5;
      const li  = Math.floor(Math.random() * LAYERS);
      particles.push(new Particle(x3, y3, z3, li, LAYERS, true));
    }
  }

  // ── Render loop ───────────────────────────────────────────────────────────
  function render() {
    time += 0.016;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(15,19,26,1)';
    ctx.fillRect(0, 0, w, h);

    // Radial glow that intensifies with scroll
    if (scrollProgress > 0.08) {
      const glowR = w * 0.5;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      grd.addColorStop(0, `rgba(80,160,210,${0.07 * scrollProgress})`);
      grd.addColorStop(0.5, `rgba(40,120,180,${0.03 * scrollProgress})`);
      grd.addColorStop(1, 'rgba(40,120,180,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    }

    // Draw ambient particles first (behind structure)
    for (const p of particles) {
      if (p.isAmbient) p.draw(time, scrollProgress, scale, cx, cy);
    }

    // Draw structure particles sorted back→front for correct iso depth
    const structured = particles.filter(p => !p.isAmbient);
    structured.sort((a, b) => (a.ox3 + a.oz3) - (b.ox3 + b.oz3));

    for (const p of structured) {
      p.draw(time, scrollProgress, scale, cx, cy);
    }

    animId = requestAnimationFrame(render);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  function setProgress(p) {
    scrollProgress = Math.max(0, Math.min(1, p));
  }

  // ── Init — defer until canvas has real dimensions ─────────────────────────
  // The canvas lives inside a sticky container that may be off-screen at load.
  // Use ResizeObserver to kick off as soon as the element gets a real size.
  let started = false;

  function start() {
    if (started) return;
    if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return;
    started = true;
    ro.disconnect();
    setup();
    render();
  }

  const ro = new ResizeObserver(start);
  ro.observe(canvas);
  start(); // attempt immediately (works if already sized)

  window.addEventListener('resize', setup, { passive: true });

  function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', setup);
    ro.disconnect();
  }

  return { setProgress, destroy };
}
