import { initCursor } from './cursor.js';
import { initForm } from './form.js';
import { initNav } from './nav.js';
import { initGsapAnimations } from './gsap-animations.js';

// scroll-reveal.js (CSS IntersectionObserver) replaced by GSAP ScrollTrigger
// parallax.js replaced by GSAP scrub ScrollTrigger in gsap-animations.js

document.addEventListener('DOMContentLoaded', () => {
  initGsapAnimations();
  initCursor();
  initForm();
  initNav();
});
