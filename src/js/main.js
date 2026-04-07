import { initScrollReveal } from './scroll-reveal.js';
import { initCursor } from './cursor.js';
import { initParallax } from './parallax.js';
import { initForm } from './form.js';
import { initNav } from './nav.js';

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCursor();
  initParallax();
  initForm();
  initNav();
});
