// GSAP Interactive — Draggable Carousels, Card Hovers
// FAQ + Tesis accordions are pure CSS (grid-template-rows trick)
// Requires gsap + Draggable loaded globally via CDN

export function initInteractive() {
  gsap.registerPlugin(Draggable);

  const mm = gsap.matchMedia();

  mm.add(
    {
      motion:       "(prefers-reduced-motion: no-preference)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    },
    (ctx) => {
      const { reduceMotion } = ctx.conditions;

      initDraggableScroll("#ops-scroll-track", reduceMotion);
      initDraggableScroll("#ops-news-scroll-track", reduceMotion);
      initInversoresDots(reduceMotion);
      initCardHovers(reduceMotion);
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAGGABLE SCROLL TRACK — for operation card tracks
// ─────────────────────────────────────────────────────────────────────────────
function initDraggableScroll(trackSelector, reduceMotion) {
  const container = document.querySelector(trackSelector);
  if (!container || reduceMotion) return;

  // Enhance drag feel with cursor feedback
  container.addEventListener("mousedown", () => {
    container.style.cursor = "grabbing";
  });
  document.addEventListener("mouseup", () => {
    container.style.cursor = "grab";
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INVERSORES SNAP DOTS — update active dot on scroll
// ─────────────────────────────────────────────────────────────────────────────
function initInversoresDots(reduceMotion) {
  const scroll = document.querySelector(".inversores-scroll");
  const dots   = document.querySelectorAll(".inversores-dot");
  const cards  = document.querySelectorAll(".inversores-card");

  if (!scroll || !dots.length || !cards.length) return;

  // Click dot → scroll to card
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      const card = cards[i];
      if (card) {
        scroll.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
      }
    });
  });

  // Update dots on scroll
  scroll.addEventListener("scroll", () => {
    const scrollLeft = scroll.scrollLeft;
    const cardWidth  = cards[0]?.offsetWidth || scroll.offsetWidth;
    const active     = Math.round(scrollLeft / cardWidth);
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === active);
    });
  }, { passive: true });

  // Init first dot active
  if (dots[0]) dots[0].classList.add("is-active");
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD HOVER EFFECTS
// ─────────────────────────────────────────────────────────────────────────────
function initCardHovers(reduceMotion) {
  if (reduceMotion) return;

  const cards = document.querySelectorAll(".ops-card, .ops-news-card, .risk-card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -2,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  });
}
