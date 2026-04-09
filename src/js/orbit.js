// Orbit diagram — scroll-driven on desktop, timer on mobile
// Desktop: CSS sticky + GSAP ScrollTrigger (no pin, Lenis-safe)
// The ellipse ring rotates clockwise on scroll; cards fade in/out at 1/3 thresholds

export function initOrbit() {
  if (typeof gsap === 'undefined') return;

  const parent  = document.querySelector('.orbit-scroll-parent');
  const section = document.querySelector('.orbit-section');
  const cards   = Array.from(document.querySelectorAll('.orbit-card'));
  const ellipse = document.querySelector('.orbit-ring__ellipse');

  if (!section || !cards.length) return;

  const total = cards.length;

  // ── INITIAL STATE ────────────────────────────────────────────────────────
  // Remove any CSS class-based visibility — GSAP owns opacity/transform
  cards.forEach(c => c.classList.remove('orbit-card--active'));
  gsap.set(cards[0], { autoAlpha: 1, y: 0 });
  gsap.set(cards.slice(1), { autoAlpha: 0, y: 16 });

  // Override CSS transform on ellipse so GSAP can animate rotation + scale together
  if (ellipse) {
    gsap.set(ellipse, { scaleX: 1.25, scaleY: 0.58, rotation: 0, transformOrigin: '50% 50%' });
  }

  let activeIdx = 0;

  function showCard(newIdx) {
    if (newIdx === activeIdx) return;
    const out = cards[activeIdx];
    const inn = cards[newIdx];
    activeIdx = newIdx;

    gsap.killTweensOf([out, inn]);
    gsap.to(out, { autoAlpha: 0, y: -14, duration: 0.38, ease: 'power2.in' });
    gsap.fromTo(inn,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.22 }
    );
  }

  // ── MOBILE — auto-timer, no scroll driver ────────────────────────────────
  if (window.matchMedia('(max-width: 799px)').matches) {
    let cur = 0;
    const timer = setInterval(() => {
      cur = (cur + 1) % total;
      showCard(cur);
    }, 4200);

    // Pause on hover
    if (section) {
      section.addEventListener('mouseenter', () => clearInterval(timer));
    }
    return;
  }

  // ── DESKTOP — scroll-driven via CSS sticky + ScrollTrigger ───────────────
  if (typeof ScrollTrigger === 'undefined' || !parent) return;

  ScrollTrigger.create({
    trigger: parent,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.8,
    onUpdate(self) {
      const p = self.progress;

      // Rotate ellipse clockwise (0° → 220° over full scroll)
      if (ellipse) {
        gsap.set(ellipse, { rotation: p * 220 });
      }

      // Switch card at 1/3 and 2/3 of scroll progress
      const newIdx = Math.min(Math.floor(p * total), total - 1);
      showCard(newIdx);
    }
  });
}
