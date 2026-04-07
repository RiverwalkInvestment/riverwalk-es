// GSAP Animations — Riverwalk
// Requires gsap + ScrollTrigger loaded globally via CDN before this module runs

export function initGsapAnimations() {
  // Respect prefers-reduced-motion
  const mm = gsap.matchMedia();

  mm.add(
    {
      motion:      "(prefers-reduced-motion: no-preference)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    },
    (ctx) => {
      const { reduceMotion } = ctx.conditions;

      // ─── Register ScrollTrigger ───────────────────────────────────────────
      gsap.registerPlugin(ScrollTrigger);

      // ─── Global defaults ─────────────────────────────────────────────────
      gsap.defaults({ ease: "power3.out" });

      if (reduceMotion) {
        // Show everything instantly, no motion
        gsap.set("[data-reveal]", { autoAlpha: 1 });
        gsap.set(".hero__stagger", { autoAlpha: 1, y: 0 });
        return;
      }

      // ─── 1. PAGE LOAD TIMELINE ───────────────────────────────────────────
      // Splits H1 into words and animates each in sequence
      const h1 = document.querySelector(".hero__content h1");
      const kicker = document.querySelector(".hero .kicker");
      const heroBody = document.querySelector(".hero .body-text");
      const heroScroll = document.querySelector(".hero__scroll");

      // Split H1 into word spans
      if (h1) {
        const words = h1.innerHTML.split(/(<br\s*\/?>|\s+)/).filter(Boolean);
        h1.innerHTML = words
          .map((w) =>
            w.match(/<br/i)
              ? w
              : `<span class="word-wrap"><span class="word">${w}</span></span>`
          )
          .join("");
      }

      const wordEls = document.querySelectorAll(".hero__content h1 .word");

      // Set initial states — autoAlpha hides + removes from a11y tree
      gsap.set(wordEls, { autoAlpha: 0, y: 60 });
      gsap.set([kicker, heroBody, heroScroll], { autoAlpha: 0, y: 20 });

      const pageLoadTl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.1
      });

      pageLoadTl
        .addLabel("start")
        .to(kicker, { autoAlpha: 1, y: 0, duration: 0.7 }, "start")
        .to(
          wordEls,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            stagger: 0.12
          },
          "start+=0.15"
        )
        .to(heroBody, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.4")
        .to(heroScroll, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.3");

      // ─── 2. SCROLL REVEALS — all [data-reveal] sections ──────────────────
      // Start hidden
      gsap.set("[data-reveal]", { autoAlpha: 0 });

      document.querySelectorAll("[data-reveal]").forEach((el) => {
        gsap.to(el, {
          autoAlpha: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true         // fire once, don't reverse
          }
        });
      });

      // ─── 3. STAGGERED CHILDREN inside sections ───────────────────────────
      // Headings, paragraphs and cards within revealed sections
      const staggerGroups = [
        { parent: "#tesis",      children: "h2, .body-text, .pull-quote" },
        { parent: "#metodo",     children: ".metodo__step" },
        { parent: "#operaciones",children: "thead, tbody tr" },
        { parent: "#riesgo",     children: ".risk-card" },
        { parent: "#inversores", children: ".investor-card" },
        { parent: "#alineacion", children: ".grid-3-col > div" },
        { parent: "#contacto",   children: ".contacto__text > *, .form-field, .btn" },
        { parent: ".dark-quote", children: ".kicker, .dark-quote__text, .dark-quote__attr" }
      ];

      staggerGroups.forEach(({ parent, children }) => {
        const els = document.querySelectorAll(`${parent} ${children}`);
        if (!els.length) return;

        gsap.set(els, { autoAlpha: 0, y: 24 });

        ScrollTrigger.create({
          trigger: parent,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(els, {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.08,
              ease: "power3.out"
            });
          }
        });
      });

      // ─── 4. GHOST PARALLAX (hero "rw") via ScrollTrigger ─────────────────
      // Replaces the manual RAF in parallax.js when GSAP is active
      const ghost = document.querySelector(".hero__ghost");
      if (ghost) {
        gsap.to(ghost, {
          y: "30%",
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }
    }
  );
}
