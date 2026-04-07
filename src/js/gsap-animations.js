// GSAP Animations — Riverwalk
// Requires gsap + ScrollTrigger loaded globally via CDN before this module runs

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

      // ─── REDUCED MOTION — show everything, no animation ──────────────────
      if (reduceMotion) {
        gsap.set("[data-reveal], .hero__stagger", { autoAlpha: 1, y: 0 });
        return;
      }

      // ─────────────────────────────────────────────────────────────────────
      // 1. PAGE LOAD TIMELINE — hero entry
      // ─────────────────────────────────────────────────────────────────────
      const h1       = document.querySelector(".hero__content h1");
      const kicker   = document.querySelector(".hero .kicker");
      const heroBody = document.querySelector(".hero .body-text");
      const heroScroll = document.querySelector(".hero__scroll");

      // Split H1 text into individual word spans
      if (h1) {
        const parts = h1.innerHTML.split(/(<br\s*\/?>|\s+)/).filter(Boolean);
        h1.innerHTML = parts
          .map((p) =>
            p.match(/<br/i)
              ? p
              : `<span class="word-wrap"><span class="word">${p}</span></span>`
          )
          .join("");
      }

      const wordEls = document.querySelectorAll(".hero__content h1 .word");

      gsap.set(wordEls,   { autoAlpha: 0, y: 60 });
      gsap.set([kicker, heroBody, heroScroll], { autoAlpha: 0, y: 20 });

      gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 })
        .addLabel("start")
        .to(kicker,   { autoAlpha: 1, y: 0, duration: 0.7 }, "start")
        .to(wordEls,  { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, "start+=0.15")
        .to(heroBody, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.4")
        .to(heroScroll, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.3");

      // ─────────────────────────────────────────────────────────────────────
      // 2. STICKY NAV — transparente → sólido con ScrollTrigger toggleClass
      // ─────────────────────────────────────────────────────────────────────
      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        // toggleClass in the ScrollTrigger sense: add when active (hero visible),
        // remove when past. We invert: use onLeave/onEnterBack for the scrolled state.
        onLeave: ()      => document.getElementById("nav")?.classList.add("is-scrolled"),
        onEnterBack: ()  => document.getElementById("nav")?.classList.remove("is-scrolled")
      });

      // ─────────────────────────────────────────────────────────────────────
      // 3. HERO PARALLAX — fondo "rw" a 0.4× velocidad de scroll
      // ─────────────────────────────────────────────────────────────────────
      const ghost = document.querySelector(".hero__ghost");
      if (ghost) {
        // On desktop parallax is 0.4× (moves 40% of hero height downward)
        // On mobile halve the intensity to avoid layout issues
        const yEnd = isDesktop ? "40%" : "20%";

        gsap.to(ghost, {
          y: yEnd,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.8        // slight lag for silky feel
          }
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // 4. SCROLL REVEALS — secciones entran al 60% del viewport
      //    start: "top 60%", toggleActions: "play none none none"
      // ─────────────────────────────────────────────────────────────────────
      gsap.set("[data-reveal]", { autoAlpha: 0 });

      document.querySelectorAll("[data-reveal]").forEach((el) => {
        gsap.to(el, {
          autoAlpha: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 60%",
            toggleActions: "play none none none"
          }
        });
      });

      // ─────────────────────────────────────────────────────────────────────
      // 5. STAGGERED CHILDREN — hijos de cada sección
      //    Usan refreshPriority en orden descendente de posición en página
      //    para que ScrollTrigger.refresh() los recalcule top-to-bottom
      // ─────────────────────────────────────────────────────────────────────
      const staggerGroups = [
        { parent: "#tesis",       children: "h2, .body-text, .pull-quote",                      priority: 9 },
        { parent: "#metodo",      children: ".metodo__step",                                     priority: 8 },
        { parent: "#proceso",     children: "h2, .kicker",                                      priority: 7.5 },
        { parent: "#operaciones", children: "thead, tbody tr",                                   priority: 7 },
        { parent: ".dark-quote",  children: ".kicker, .dark-quote__text, .dark-quote__attr",     priority: 6 },
        { parent: "#riesgo",      children: ".risk-card",                                        priority: 5 },
        { parent: "#inversores",  children: ".investor-card",                                    priority: 4 },
        { parent: "#alineacion",  children: ".grid-3-col > div",                                 priority: 3 },
        { parent: "#contacto",    children: ".contacto__text > *, .form-field, .btn",            priority: 2 }
      ];

      staggerGroups.forEach(({ parent, children, priority }) => {
        const els = document.querySelectorAll(`${parent} ${children}`);
        if (!els.length) return;

        gsap.set(els, { autoAlpha: 0, y: 20 });

        ScrollTrigger.create({
          trigger: parent,
          start: "top 60%",
          toggleActions: "play none none none",
          refreshPriority: priority,
          onEnter: () => {
            gsap.to(els, {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              stagger: { each: 0.08, from: "start" },
              ease: "power3.out"
            });
          }
        });
      });

      // ─────────────────────────────────────────────────────────────────────
      // 6. ORBITAL SECTION — three concentric ellipses drawn by scroll scrub
      // ─────────────────────────────────────────────────────────────────────
      if (isDesktop) {
        const e1  = document.getElementById("ellipse-1");
        const e2  = document.getElementById("ellipse-2");
        const e3  = document.getElementById("ellipse-3");
        const a1  = document.getElementById("arrow-1");
        const a2  = document.getElementById("arrow-2");
        const a3  = document.getElementById("arrow-3");
        const sl1 = document.getElementById("svgl-1");
        const sl2 = document.getElementById("svgl-2");
        const sl3 = document.getElementById("svgl-3");

        if (e1 && e2 && e3) {
          // Ensure arrows and labels start fully invisible
          gsap.set(
            [a1, a2, a3, sl1, sl2, sl3].filter(Boolean),
            { opacity: 0 }
          );

          const orbTl = gsap.timeline({
            scrollTrigger: {
              trigger: "#proceso",
              pin: true,
              scrub: 1.2,
              start: "top top",
              end: "+=220%",
            }
          });

          orbTl
            // Inner ellipse draws first
            .to(e1, { strokeDashoffset: 0, duration: 1, ease: "none" }, 0)
            .to([a1, sl1].filter(Boolean), { opacity: 0.85, duration: 0.25 }, 0.8)
            // Middle ellipse
            .to(e2, { strokeDashoffset: 0, duration: 1.2, ease: "none" }, 1.1)
            .to([a2, sl2].filter(Boolean), { opacity: 0.85, duration: 0.25 }, 2.1)
            // Outer ellipse
            .to(e3, { strokeDashoffset: 0, duration: 1.5, ease: "none" }, 2.4)
            .to([a3, sl3].filter(Boolean), { opacity: 0.85, duration: 0.25 }, 3.7);
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 7. MARQUEE — solo en desktop
      //    Anima la pista interna (.marquee__track) de derecha a izquierda
      //    de forma infinita con repeat: -1 y ease: "none"
      // ─────────────────────────────────────────────────────────────────────
      if (isDesktop) {
        const track = document.querySelector(".marquee__track");
        if (track) {
          // Measure a single set of items (half the track = one loop)
          const items = track.querySelectorAll(".marquee__item");
          const itemCount = items.length;

          if (itemCount > 0) {
            // The track contains two copies of items for seamless loop.
            // Animate x from 0 to -50% (exactly one full copy width).
            gsap.to(track, {
              xPercent: -50,
              duration: 28,
              ease: "none",
              repeat: -1,
              modifiers: {
                // keep value within [-50, 0] for perfect seamless loop
                xPercent: (v) => parseFloat(v) % 50
              }
            });
          }
        }
      }
    }
  );
}
