// Nav — sticky logic delegated to ScrollTrigger in gsap-animations.js
// This module only handles anchor smooth-scroll

export function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  nav.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
