// GSAP Animations — Riverwalk · nfinitepaper visual system
// Requires gsap + ScrollTrigger loaded globally via CDN

export function initGsapAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop:    "(min-width: 861px)",
      isMobile:     "(max-width: 860px)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    },
    (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions;

      // ─── REDUCED MOTION — reveal everything ─────────────────────────────
      if (reduceMotion) {
        gsap.set("[data-reveal], .hero__badge, .hero h1 .word, .hero .hero__sub, .hero__scroll", {
          autoAlpha: 1, y: 0
        });
        document.querySelectorAll(".alineacion__panel").forEach((p, i) => {
          if (i === 0) p.classList.add("is-active");
        });
        return;
      }

      // ─────────────────────────────────────────────────────────────────────
      // 1. PAGE LOAD — hero entry
      // ─────────────────────────────────────────────────────────────────────
      const badge     = document.querySelector(".hero__badge");
      const h1        = document.querySelector(".hero h1");
      const heroSub   = document.querySelector(".hero .hero__sub");
      const heroScroll = document.querySelector(".hero__scroll");

      // Split H1 into word spans (line by line to preserve <br>)
      if (h1) {
        const lines = h1.innerHTML.split(/<br\s*\/?>/i);
        h1.innerHTML = lines
          .map((line) =>
            line.trim()
              .split(/\s+/)
              .filter(Boolean)
              .map((w) => `<span class="word-wrap"><span class="word">${w}</span></span>`)
              .join(" ")
          )
          .join("<br>");
      }

      const wordEls = document.querySelectorAll(".hero h1 .word");

      gsap.set(wordEls, { autoAlpha: 0, y: 60 });
      gsap.set([badge, heroSub, heroScroll].filter(Boolean), { autoAlpha: 0, y: 20 });

      gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 })
        .to(badge,     { autoAlpha: 1, y: 0, duration: 0.7 }, 0)
        .to(wordEls,   { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 0.15)
        .to(heroSub,   { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.4")
        .to(heroScroll, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.3");

      // ─────────────────────────────────────────────────────────────────────
      // 2. STICKY NAV — transparent on hero, add bg when scrolled past
      // ─────────────────────────────────────────────────────────────────────
      const nav = document.getElementById("nav");

      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        onLeave:      () => nav?.classList.add("is-scrolled"),
        onEnterBack:  () => nav?.classList.remove("is-scrolled")
      });

      // ─────────────────────────────────────────────────────────────────────
      // 3. SCROLL REVEALS
      // ─────────────────────────────────────────────────────────────────────
      gsap.set("[data-reveal]", { autoAlpha: 0, y: 24 });

      document.querySelectorAll("[data-reveal]").forEach((el) => {
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 65%",
            toggleActions: "play none none none"
          }
        });
      });

      // ─────────────────────────────────────────────────────────────────────
      // 4. TECHNOLOGY / MÉTODO — sticky title + part reveals
      // ─────────────────────────────────────────────────────────────────────
      if (isDesktop) {
        const metodoTitle = document.querySelector(".metodo__sticky-title");
        if (metodoTitle) {
          gsap.set(metodoTitle, { autoAlpha: 0, y: 30 });
          ScrollTrigger.create({
            trigger: "#metodo",
            start: "top 60%",
            onEnter: () => gsap.to(metodoTitle, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" })
          });
        }

        const metodoParts = document.querySelectorAll(".metodo__part [data-reveal-child]");
        metodoParts.forEach((el) => {
          gsap.set(el, { autoAlpha: 0, y: 20 });
          ScrollTrigger.create({
            trigger: el,
            start: "top 65%",
            onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.75, ease: "power3.out" })
          });
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // 5. IMPACT CIRCLE — rotate SVG + fade panels via scroll scrub
      // ─────────────────────────────────────────────────────────────────────
      if (isDesktop) {
        const alineacion = document.getElementById("alineacion");
        const circleSvg  = document.querySelector(".alineacion__svg");
        const panels     = document.querySelectorAll(".alineacion__panel");

        if (alineacion && circleSvg && panels.length) {
          // Show first panel immediately
          panels[0].classList.add("is-active");

          const totalHeight = alineacion.offsetHeight;
          const panelCount  = panels.length;

          ScrollTrigger.create({
            trigger: alineacion,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;

              // Rotate circle
              gsap.set(circleSvg, { rotation: progress * 360, transformOrigin: "center center" });

              // Panel switching: 3 panels across scroll range
              const panelIndex = Math.min(
                Math.floor(progress * panelCount),
                panelCount - 1
              );

              panels.forEach((p, i) => {
                if (i === panelIndex) {
                  p.classList.add("is-active");
                } else {
                  p.classList.remove("is-active");
                }
              });
            }
          });
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 6. MARQUEE — infinite scroll on desktop
      // ─────────────────────────────────────────────────────────────────────
      if (isDesktop) {
        const track = document.querySelector(".marquee__track");
        if (track) {
          gsap.to(track, {
            xPercent: -50,
            duration: 28,
            ease: "none",
            repeat: -1,
            modifiers: {
              xPercent: (v) => parseFloat(v) % 50
            }
          });
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 7. STAGGERED SECTION CHILDREN
      // ─────────────────────────────────────────────────────────────────────
      const staggerGroups = [
        { parent: "#tesis .tesis__header",    children: "h2, .tesis__stat",      priority: 9 },
        { parent: "#metodo .metodo__part-2",  children: ".metodo__stat",         priority: 7 },
        { parent: "#riesgo",                  children: ".risk-card",            priority: 5 },
        { parent: "#operaciones-news",        children: ".ops-news-card",        priority: 4 },
        { parent: "#contacto",                children: ".form-field, .btn",     priority: 2 }
      ];

      staggerGroups.forEach(({ parent, children, priority }) => {
        const els = document.querySelectorAll(`${parent} ${children}`);
        if (!els.length) return;

        gsap.set(els, { autoAlpha: 0, y: 16 });

        ScrollTrigger.create({
          trigger: parent,
          start: "top 65%",
          toggleActions: "play none none none",
          refreshPriority: priority,
          onEnter: () => {
            gsap.to(els, {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: { each: 0.07, from: "start" },
              ease: "power3.out"
            });
          }
        });
      });
    }
  );
}
