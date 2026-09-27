import { gsap, reducedMotion } from './motion';

// Kinetic display headings (reference: allthingswtf.com kinetic type, restrained
// to the gallery palette): an element's text is split into per-letter spans that
// slowly cycle between solid ink and a thin gold outline. The animation itself
// is CSS (design.css, ktCycle) and only runs under prefers-reduced-motion:
// no-preference; this helper only prepares the markup. The heading keeps its
// full text as an aria-label and the letter spans are aria-hidden, so screen
// readers and accessibility contrast checks see the plain heading.

function kineticizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const frag = document.createDocumentFragment();
    for (const ch of node.textContent) {
      const s = document.createElement('span');
      s.className = 'kt';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      // Random negative delay and slightly varied period keep the cycle organic
      // rather than a metronome sweep across the word.
      s.style.setProperty('--kt-delay', `${(-Math.random() * 12).toFixed(2)}s`);
      s.style.setProperty('--kt-dur', `${(7 + Math.random() * 6).toFixed(2)}s`);
      frag.appendChild(s);
    }
    node.replaceWith(frag);
    return;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    [...node.childNodes].forEach(kineticizeNode);
  }
}

// Splits el's text (inline markup such as <em> and <br> is preserved) and marks
// it kinetic. Idempotent; headings are page-permanent, so no teardown is needed.
export function kineticize(el) {
  if (!el || el.classList.contains('kinetic')) return () => {};
  const labelText = [...el.childNodes]
    .map((n) => (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'BR' ? ' ' : n.textContent))
    .join('');
  el.setAttribute('aria-label', labelText.replace(/\s+/g, ' ').trim());
  [...el.childNodes].forEach(kineticizeNode);
  el.classList.add('kinetic');
  return () => {};
}

// Letters-settle (reference: the wavy statement letters on allthingswtf.com,
// restrained to a quiet straightening): after kineticize has split a heading
// into .kt spans, each letter starts a few degrees off-axis and a touch low,
// then straightens as the heading scrolls into view. Reversible with the
// scroll. Never runs under reduced motion - letters simply render straight.
export function settleLetters(el, { tilt = 3, rise = 14 } = {}) {
  if (!el || reducedMotion()) return () => {};
  const letters = [...el.querySelectorAll('.kt')];
  if (!letters.length) return () => {};
  letters.forEach((s) => {
    gsap.set(s, { display: 'inline-block', rotation: (Math.random() * 2 - 1) * tilt, y: Math.random() * rise });
  });
  const tween = gsap.to(letters, {
    rotation: 0,
    y: 0,
    ease: 'none',
    stagger: { each: 0.012, from: 'random' },
    scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 42%', scrub: 1 },
  });
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
