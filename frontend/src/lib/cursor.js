// Gallery cursor (desktop fine pointers only), modelled on the allthingswtf.com
// custom cursor: a drawn cursor that swaps its artwork by context - a fine ink
// arrow by default, a slim line hand over links and buttons, a hairline I-beam
// over text - each edged in a gold echo, with the gallery's paper cue chip
// ("View", "Scroll") beside the arrow over [data-cursor] targets. It follows
// the pointer directly (no trailing), like the reference. The native cursor is
// hidden via the has-cursor class only after this mounts, so no-JS or a failure
// keeps the system cursor. Never runs on coarse pointers.
const GLYPHS = {
  arrow:
    '<svg class="cursor-art" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">' +
    '<path d="M5 3 L19 15 L12.5 15.8 L16 23 L13.2 24 L9.8 16.6 L5 20 Z" fill="var(--ink)" stroke="var(--gold)" stroke-width="2.6" stroke-linejoin="round"/></svg>',
  hand:
    '<svg class="cursor-art" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">' +
    '<path d="M9 11 V4.5 a1.8 1.8 0 0 1 3.6 0 V10 m0-2.4 a1.8 1.8 0 0 1 3.6 0 V11 m0-1.4 a1.8 1.8 0 0 1 3.6 0 V14 c0 4.2-3 7-7 7 h-1.4 c-2.6 0-4.2-1.2-5.4-3 L4 14.6 c-.9-1.3.7-3 2.2-2.1 L9 14.2 Z" fill="none" stroke="var(--gold)" stroke-width="4.2" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<path d="M9 11 V4.5 a1.8 1.8 0 0 1 3.6 0 V10 m0-2.4 a1.8 1.8 0 0 1 3.6 0 V11 m0-1.4 a1.8 1.8 0 0 1 3.6 0 V14 c0 4.2-3 7-7 7 h-1.4 c-2.6 0-4.2-1.2-5.4-3 L4 14.6 c-.9-1.3.7-3 2.2-2.1 L9 14.2 Z" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  text:
    '<svg class="cursor-art" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">' +
    '<path d="M8 4 h8 M8 20 h8 M12 4 V20" fill="none" stroke="var(--gold)" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M8 4 h8 M8 20 h8" fill="none" stroke="var(--gold)" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M12 4 V20" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round"/></svg>',
};
const HOTSPOTS = { arrow: [5, 3], hand: [10.5, 2.5], text: [12, 12] };

export function startCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const root = document.createElement('div');
  root.className = 'cursor state-arrow is-hidden';
  root.setAttribute('aria-hidden', 'true');
  const glyph = document.createElement('i');
  glyph.className = 'cursor-glyph';
  glyph.innerHTML = GLYPHS.arrow;
  const chip = document.createElement('b');
  chip.className = 'cursor-chip';
  root.append(glyph, chip);
  document.body.appendChild(root);
  document.documentElement.classList.add('has-cursor');

  let state = 'arrow';
  const setState = (next, label) => {
    const cls = next === 'chip' ? 'state-chip' : `state-${next}`;
    if (cls === root.className && next !== 'chip') return;
    root.className = `cursor ${cls}`;
    const g = next === 'chip' ? 'arrow' : next;
    if (g !== state || next === 'chip') glyph.innerHTML = GLYPHS[g];
    if (next === 'chip') chip.textContent = label;
    state = g;
  };

  const resolve = (t) => {
    const tagged = t.closest('[data-cursor]');
    const label = tagged?.getAttribute('data-cursor') || '';
    if (label) return ['chip', label];
    if (t.closest('a,button,[role="button"],input[type="submit"],input[type="button"],input[type="radio"],input[type="checkbox"],select,summary,label')) return ['pointer'];
    if (t.closest('p,h1,h2,h3,h4,h5,h6,blockquote,li,input,textarea')) return ['text'];
    return ['default'];
  };

  const move = (e) => {
    root.classList.remove('is-hidden');
    const [kind, label] = resolve(e.target instanceof Element ? e.target : document.body);
    setState(kind === 'default' ? 'arrow' : kind === 'pointer' ? 'hand' : kind === 'text' ? 'text' : 'chip', label);
    const [hx, hy] = HOTSPOTS[state];
    root.style.transform = `translate(${e.clientX - hx}px, ${e.clientY - hy}px)`;
  };
  const down = () => root.classList.add('is-down');
  const up = () => root.classList.remove('is-down');
  const hide = () => root.classList.add('is-hidden');
  const show = () => root.classList.remove('is-hidden');
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('mousedown', down);
  window.addEventListener('mouseup', up);
  document.documentElement.addEventListener('mouseleave', hide);
  document.documentElement.addEventListener('mouseenter', show);
  return () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('mousedown', down);
    window.removeEventListener('mouseup', up);
    document.documentElement.removeEventListener('mouseleave', hide);
    document.documentElement.removeEventListener('mouseenter', show);
    document.documentElement.classList.remove('has-cursor');
    root.remove();
  };
}
