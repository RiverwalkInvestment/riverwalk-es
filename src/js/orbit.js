// Orbit diagram — cycles through 3 cards every 4s
export function initOrbit() {
  const cards = document.querySelectorAll('.orbit-card');
  if (!cards.length) return;

  let current = 0;
  const total  = cards.length;
  const DELAY  = 4200; // ms per card

  function show(idx) {
    cards.forEach((c, i) => {
      c.classList.toggle('orbit-card--active', i === idx);
    });
  }

  show(0);
  const timer = setInterval(() => {
    current = (current + 1) % total;
    show(current);
  }, DELAY);

  // Pause on hover
  const wrap = document.querySelector('.orbit-wrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => clearInterval(timer));
  }
}
