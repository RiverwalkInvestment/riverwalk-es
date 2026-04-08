// GSAP Animations — Riverwalk · nfinitepaper design system
// Requires gsap + ScrollTrigger loaded globally via CDN

export function initGsapAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // ─── LENIS SMOOTH SCROLL ──────────────────────────────────────────────────
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis');
  }

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop:    "(min-width: 800px)",
      isMobile:     "(max-width: 799px)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    },
    (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions;

      // ─── REDUCED MOTION ────────────────────────────────────────────────────
      if (reduceMotion) {
        gsap.set(".hero__kicker, .hero__h1, [data-reveal]", { autoAlpha: 1, y: 0 });
        document.querySelectorAll(".alineacion__panel").forEach((p, i) => {
          if (i === 0) p.classList.add("is-active");
        });
        return;
      }

      // ─── 1. HERO ENTRY ─────────────────────────────────────────────────────
      const h1 = document.querySelector(".hero__h1");
      const kicker = document.querySelector(".hero__kicker");

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

      const wordEls = document.querySelectorAll(".hero__h1 .word");

      gsap.set(wordEls, { autoAlpha: 0, y: 50 });
      gsap.set(kicker, { autoAlpha: 0, y: 16 });

      gsap.timeline({ delay: 0.2 })
        .to(kicker,  { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0)
        .to(wordEls, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.10, ease: "power3.out" }, 0.15);

      // ─── 2. STICKY NAV — transparent on hero ──────────────────────────────
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

      // ─── 3. SCROLL REVEALS ─────────────────────────────────────────────────
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1, y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 72%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      // ─── 4. METODOLOGÍA — sticky background ────────────────────────────────
      if (isDesktop) {
        const metodoIntro = document.querySelector(".metodo-intro h2");
        if (metodoIntro) {
          gsap.fromTo(metodoIntro,
            { autoAlpha: 0, y: 40 },
            {
              autoAlpha: 1, y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: "#metodologia",
                start: "top 60%"
              }
            }
          );
        }
      }

      // ─── 5. ALINEACIÓN — rotating circle + panel switching ─────────────────
      if (isDesktop) {
        const alineacion  = document.querySelector("#alineacion .alineacion__spacer");
        const circleEl    = document.querySelector(".alineacion__circle-svg");
        const arrowsEl    = document.querySelector(".alineacion__arrows-svg");
        const panels      = document.querySelectorAll(".alineacion__panel");

        if (alineacion && circleEl && panels.length) {
          // Activate first panel immediately
          panels[0].classList.add("is-active");

          ScrollTrigger.create({
            trigger: alineacion,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
            onUpdate: (self) => {
              const progress = self.progress;

              // Rotate circle and arrows together
              const rotation = progress * 360;
              gsap.set([circleEl, arrowsEl], {
                rotation,
                transformOrigin: "center center"
              });

              // Panel switching across 3 panels
              const panelIndex = Math.min(
                Math.floor(progress * panels.length),
                panels.length - 1
              );

              panels.forEach((p, i) => {
                p.classList.toggle("is-active", i === panelIndex);
              });
            }
          });
        }
      }

      // ─── 6. NEWS DRAG SCROLL ────────────────────────────────────────────────
      const track = document.getElementById("news-track");
      if (track) {
        let isDragging = false, startX = 0, scrollLeft = 0;

        track.addEventListener("mousedown", (e) => {
          isDragging = true;
          startX = e.pageX - track.offsetLeft;
          scrollLeft = track.scrollLeft;
          track.style.cursor = "grabbing";
        });
        window.addEventListener("mouseup", () => {
          isDragging = false;
          track.style.cursor = "grab";
        });
        track.addEventListener("mousemove", (e) => {
          if (!isDragging) return;
          e.preventDefault();
          const x = e.pageX - track.offsetLeft;
          const walk = (x - startX) * 1.5;
          track.scrollLeft = scrollLeft - walk;
        });
        // Touch support
        track.addEventListener("touchstart", (e) => {
          startX = e.touches[0].pageX - track.offsetLeft;
          scrollLeft = track.scrollLeft;
        }, { passive: true });
        track.addEventListener("touchmove", (e) => {
          const x = e.touches[0].pageX - track.offsetLeft;
          track.scrollLeft = scrollLeft - (x - startX);
        }, { passive: true });
      }

      // ─── 7. MARKET SECTIONS — stagger children on scroll ───────────────────
      document.querySelectorAll(".market-section").forEach((section) => {
        const children = section.querySelectorAll("h2, p");
        gsap.fromTo(children,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1, y: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 68%"
            }
          }
        );
      });

      // ─── 8. NOVEDADES TITLE — split reveal ─────────────────────────────────
      const novedadesTitle = document.querySelector(".novedades__title");
      if (novedadesTitle) {
        const spans = novedadesTitle.querySelectorAll("span");
        gsap.fromTo(spans,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1, y: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: novedadesTitle,
              start: "top 72%"
            }
          }
        );
      }
    }
  );
}
