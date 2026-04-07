// GSAP Interactive — Accordion, Draggable Carousel, Card Hovers
// Requires gsap + Draggable loaded globally via CDN

export function initInteractive() {
  gsap.registerPlugin(Draggable);

  const mm = gsap.matchMedia();

  mm.add(
    {
      motion:      "(prefers-reduced-motion: no-preference)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    },
    (ctx) => {
      const { reduceMotion } = ctx.conditions;

      initAccordion(reduceMotion);
      initCarousel(reduceMotion);
      initCardHovers(reduceMotion);
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ACCORDION
// ─────────────────────────────────────────────────────────────────────────────
function initAccordion(reduceMotion) {
  const accordion = document.getElementById("accordion");
  if (!accordion) return;

  const items = accordion.querySelectorAll(".accordion__item");

  // Track the currently open item
  let openItem = null;

  items.forEach((item) => {
    const trigger  = item.querySelector(".accordion__trigger");
    const content  = item.querySelector(".accordion__content");
    const chevron  = item.querySelector(".accordion__chevron");

    if (!trigger || !content || !chevron) return;

    // Ensure content starts collapsed
    gsap.set(content, { height: 0 });

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      // Close currently open item first (if different from clicked)
      if (openItem && openItem.trigger !== trigger) {
        closeItem(openItem, reduceMotion);
        openItem = null;
      }

      if (isOpen) {
        // Close self
        closeItem({ trigger, content, chevron }, reduceMotion);
        openItem = null;
      } else {
        // Open self
        openAccItem({ trigger, content, chevron }, reduceMotion);
        openItem = { trigger, content, chevron };
      }
    });
  });
}

function openAccItem({ trigger, content, chevron }, reduceMotion) {
  trigger.setAttribute("aria-expanded", "true");
  content.setAttribute("aria-hidden", "false");

  const dur = reduceMotion ? 0 : 0.5;

  gsap.to(content, {
    height: "auto",
    duration: dur,
    ease: "expo.out"
  });

  gsap.to(chevron, {
    rotation: 180,
    duration: dur,
    ease: "expo.out"
  });
}

function closeItem({ trigger, content, chevron }, reduceMotion) {
  trigger.setAttribute("aria-expanded", "false");
  content.setAttribute("aria-hidden", "true");

  const dur = reduceMotion ? 0 : 0.4;

  gsap.to(content, {
    height: 0,
    duration: dur,
    ease: "expo.inOut"
  });

  gsap.to(chevron, {
    rotation: 0,
    duration: dur,
    ease: "expo.inOut"
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DRAGGABLE CAROUSEL
// ─────────────────────────────────────────────────────────────────────────────
function initCarousel(reduceMotion) {
  const track   = document.getElementById("carousel-track");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  if (!track) return;

  const items     = track.querySelectorAll(".carousel__item");
  const itemCount = items.length;
  if (!itemCount) return;

  // Measure after layout
  let itemW    = 0;
  let gap      = 24; // matches CSS 1.5rem gap
  let maxX     = 0;
  let currentIndex = 0;

  function measure() {
    itemW = items[0].offsetWidth + gap;
    // max negative x = full track width - visible area
    maxX = -(itemW * (itemCount - 1));
  }

  function getSnapX(index) {
    return -(itemW * Math.max(0, Math.min(index, itemCount - 1)));
  }

  function goTo(index, animate = true) {
    currentIndex = Math.max(0, Math.min(index, itemCount - 1));
    const x   = getSnapX(currentIndex);
    const dur = animate && !reduceMotion ? 0.6 : 0;

    gsap.to(track, { x, duration: dur, ease: "power3.out" });
    updateButtons();
  }

  function updateButtons() {
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === itemCount - 1;
  }

  measure();
  updateButtons();

  // Animate prev/next buttons on hover via GSAP
  [prevBtn, nextBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("mouseenter", () => {
      gsap.to(btn, { scale: 1.08, duration: 0.25, ease: "power2.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { scale: 1, duration: 0.25, ease: "power2.out" });
    });
  });

  prevBtn?.addEventListener("click", () => goTo(currentIndex - 1));
  nextBtn?.addEventListener("click", () => goTo(currentIndex + 1));

  // Draggable — snap to nearest item on drag end
  Draggable.create(track, {
    type: "x",
    bounds: { minX: maxX, maxX: 0 },
    edgeResistance: 0.65,
    onPress() {
      document.querySelector(".carousel")?.classList.add("is-dragging");
    },
    onRelease() {
      document.querySelector(".carousel")?.classList.remove("is-dragging");
    },
    onDragEnd() {
      // Find nearest snap point
      const currentX = gsap.getProperty(track, "x");
      const nearest  = Math.round(-currentX / itemW);
      goTo(nearest);
    },
    snap: {
      x: (rawX) => {
        const nearest = Math.round(-rawX / itemW);
        return getSnapX(nearest);
      }
    }
  });

  // Recalculate on resize
  window.addEventListener("resize", () => {
    measure();
    goTo(currentIndex, false);
  }, { passive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CARD HOVER EFFECTS — scale + shadow elevation
// ─────────────────────────────────────────────────────────────────────────────
function initCardHovers(reduceMotion) {
  if (reduceMotion) return;

  const cards = document.querySelectorAll(
    ".risk-card, .investor-card, .carousel__item"
  );

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        scale: 1.03,
        boxShadow: "0 12px 32px rgba(13, 13, 11, 0.1)",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: "0 0 0 rgba(13, 13, 11, 0)",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  });
}
