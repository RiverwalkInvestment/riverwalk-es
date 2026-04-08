import { initForm } from './form.js';
import { initNav } from './nav.js';
import { initGsapAnimations } from './gsap-animations.js';
import { initOrbit } from './orbit.js';

document.addEventListener('DOMContentLoaded', () => {
  initGsapAnimations();
  initOrbit();
  initForm();
  initNav();
});
