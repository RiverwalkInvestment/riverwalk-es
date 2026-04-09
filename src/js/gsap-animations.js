// GSAP Animations — Riverwalk · nfinitepaper design system
// Requires gsap + ScrollTrigger + Lenis loaded globally via CDN

import { initCanvasBg } from './canvas-bg.js';

export function initGsapAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // ── LENIS SMOOTH SCROLL ────────────────────────────────────────────────────
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis');
  }

  // ── CANVAS BG — start immediately (renders while invisible) ───────────────
  const canvasBg = initCanvasBg();

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop:    "(min-width: 800px)",
      isMobile:     "(max-width: 799px)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    },
    (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions;

      // ── REDUCED MOTION ─────────────────────────────────────────────────────
      if (reduceMotion) {
        gsap.set(".hero__kicker, .hero__h1, .hero__sub, [data-reveal]", { autoAlpha: 1, y: 0 });
        return;
      }

      // ── 1. HERO ENTRY ──────────────────────────────────────────────────────
      const h1 = document.querySelector(".hero__h1");
      const dim = document.querySelector(".hero__h1-dim");

      if (h1) {
        gsap.set(h1, { autoAlpha: 1 });

        const parts     = h1.innerHTML.split('<span class="hero__h1-dim">');
        const brightRaw = parts[0].replace(/<br\s*\/?>\s*$/i, '').trim();
        const dimRaw    = dim ? dim.innerHTML : '';

        h1.innerHTML =
          `<span class="hero__bright">${brightRaw}</span>` +
          (dimRaw ? `<span class="hero__h1-dim hero__dim-wrap">${dimRaw}</span>` : '');

        gsap.set(".hero__bright",   { autoAlpha: 0, y: 30 });
        gsap.set(".hero__dim-wrap", { autoAlpha: 0, y: 30 });
      }

      gsap.timeline({ delay: 0.25 })
        .to(".hero__bright",   { autoAlpha: 1, y: 0, duration: 1.0, ease: "power3.out" }, 0)
        .to(".hero__dim-wrap", { autoAlpha: 1, y: 0, duration: 1.0, ease: "power3.out" }, 0.18);

      // Ghost "rw" parallax
      const ghost = document.querySelector(".hero__ghost");
      if (ghost) {
        gsap.to(ghost, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // ── 2. STICKY NAV ──────────────────────────────────────────────────────
      const nav = document.getElementById("nav");
      if (nav) {
        ScrollTrigger.create({
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          onLeave:     () => nav.classList.add("is-scrolled"),
          onEnterBack: () => nav.classList.remove("is-scrolled")
        });
      }

      // ── 3. SCROLL REVEALS — [data-reveal] ──────────────────────────────────
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1, y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 75%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      // ── 4. METODOLOGÍA CANVAS — scroll-driven progress ────────────────────
      if (isDesktop && canvasBg) {
        const section    = document.getElementById("metodologia");
        const progressBar = document.getElementById("metodo-progress-bar");

        if (section) {
          // How tall is the section (includes sticky + spacers + content parts)
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;

              // Drive canvas particles
              canvasBg.setProgress(p);

              // Drive progress bar
              if (progressBar) {
                progressBar.style.width = `${p * 100}%`;
              }
            }
          });

          // Reveal intro h2 when section enters view
          const introH2 = document.querySelector(".metodo-intro h2");
          if (introH2) {
            gsap.fromTo(introH2,
              { autoAlpha: 0, y: 40 },
              {
                autoAlpha: 1, y: 0, duration: 1,
                ease: "power3.out",
                scrollTrigger: { trigger: introH2, start: "top 65%" }
              }
            );
          }

          // Fade metodo-part1 children
          gsap.utils.toArray(".metodo-part1 h3, .metodo-part1__body, .metodo-legend__item").forEach((el, i) => {
            gsap.fromTo(el,
              { autoAlpha: 0, y: 20 },
              {
                autoAlpha: 1, y: 0,
                duration: 0.75,
                delay: i * 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 72%" }
              }
            );
          });

          // Fade part2 items
          gsap.utils.toArray(".metodo-stat-item").forEach((el, i) => {
            gsap.fromTo(el,
              { autoAlpha: 0, y: 20 },
              {
                autoAlpha: 1, y: 0,
                duration: 0.75,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 78%" }
              }
            );
          });
        }
      }

      return () => {
        // Cleanup on mm context dispose
        if (canvasBg) canvasBg.destroy?.();
      };
    }
  );
}
