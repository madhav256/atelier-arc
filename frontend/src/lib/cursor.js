import { gsap, reducedMotion } from './motion';

// Gallery cursor (desktop fine pointers only): a small ink dot inside a thin
// gold ring that trails the pointer; over targets carrying [data-cursor] the
// ring opens into a pill with a short cue ("View", "Scroll"). The native
// cursor is hidden via the has-cursor class only after this mounts, so no-JS
// or a failure keeps the system cursor. Never runs under reduced motion or on
// coarse pointers.
export function startCursor() {
  if (reducedMotion()) return () => {};
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const root = document.createElement('div');
  root.className = 'cursor is-hidden';
  root.setAttribute('aria-hidden', 'true');
  const dot = document.createElement('i');
  dot.className = 'cursor-dot';
  const ring = document.createElement('i');
  ring.className = 'cursor-ring';
  const label = document.createElement('b');
  label.className = 'cursor-label';
  ring.appendChild(label);
  root.append(dot, ring);
  document.body.appendChild(root);
  document.documentElement.classList.add('has-cursor');
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
  const move = (e) => {
    root.classList.remove('is-hidden');
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
  };
  const over = (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const tagged = t.closest('[data-cursor]');
    const text = tagged?.getAttribute('data-cursor') || '';
    root.classList.toggle('is-label', Boolean(text));
    if (text) label.textContent = text;
    root.classList.toggle('is-hover', !text && Boolean(t.closest('a,button,[role="button"],input,select,textarea,summary,label')));
  };
  const down = () => root.classList.add('is-down');
  const up = () => root.classList.remove('is-down');
  const hide = () => root.classList.add('is-hidden');
  const show = () => root.classList.remove('is-hidden');
  window.addEventListener('mousemove', move, { passive: true });
  document.addEventListener('mouseover', over, { passive: true });
  window.addEventListener('mousedown', down);
  window.addEventListener('mouseup', up);
  document.documentElement.addEventListener('mouseleave', hide);
  document.documentElement.addEventListener('mouseenter', show);
  return () => {
    window.removeEventListener('mousemove', move);
    document.removeEventListener('mouseover', over);
    window.removeEventListener('mousedown', down);
    window.removeEventListener('mouseup', up);
    document.documentElement.removeEventListener('mouseleave', hide);
    document.documentElement.removeEventListener('mouseenter', show);
    document.documentElement.classList.remove('has-cursor');
    root.remove();
  };
}
