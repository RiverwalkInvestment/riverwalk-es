import { initCursor } from './cursor.js';
import { initForm } from './form.js';
import { initNav } from './nav.js';
import { initGsapAnimations } from './gsap-animations.js';
import { initInteractive } from './gsap-interactive.js';

document.addEventListener('DOMContentLoaded', () => {
  initGsapAnimations();
  initInteractive();
  initCursor();
  initForm();
  initNav();
});
