export function initParallax() {
  const ghost = document.querySelector('.hero__ghost');
  if (!ghost) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      ghost.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.3}px))`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}
