// Gallery motion: slow, restrained, and off entirely for prefers-reduced-motion.
// Text is revealed with clip-path + transform (never opacity) so contrast checks
// never see half-faded copy.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const EASE = 'expo.out';
export const EASE_IN_OUT = 'expo.inOut';
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const reducedMotion = () => typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const IMAGE = ['.art-card .art-image', '.detail-gallery', '.spotlight-image', '.editorial-grid article a > img', '.artist-hero img'];
const TEXT = ['.intro > *', '.section-head h2', '.section-head .eyebrow', '.spotlight h2', '.spotlight .dek', '.advisor-cta h2', '.advisor-cta p', '.price-story h2', '.price-story > div:first-child p', '.price-list span', '.editorial-grid h3', '.art-meta', '.detail-info > *'];
const PARALLAX = ['.spotlight-image img'];
const LINES = ['.price-list .rule'];

let lenis = null;
export function startSmoothScroll() {
  if (reducedMotion() || lenis) return () => {};
  lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

function revealImages(els) {
  els.forEach((el) => {
    const inner = el.querySelector('picture, img') || el;
    const target = inner === el ? el : inner;
    gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
    if (target !== el) gsap.set(target, { scale: 1.16, transformOrigin: '50% 60%' });
  });
  ScrollTrigger.batch(els, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: EASE, stagger: 0.12, clearProps: 'clipPath' });
      const inners = batch.map((el) => el.querySelector('picture, img')).filter(Boolean);
      gsap.to(inners, { scale: 1, duration: 2.2, ease: EASE, stagger: 0.12, clearProps: 'transform,transformOrigin' });
    },
  });
}

function revealText(els) {
  gsap.set(els, { clipPath: 'inset(0% 0% 100% 0%)', y: 32 });
  ScrollTrigger.batch(els, {
    start: 'top 94%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { clipPath: 'inset(0% 0% -25% 0%)', y: 0, duration: 1.3, ease: EASE, stagger: 0.09, clearProps: 'clipPath,transform' }),
  });
}

function drawLines(els) {
  gsap.set(els, { scaleX: 0 });
  ScrollTrigger.batch(els, { start: 'top 92%', once: true, onEnter: (batch) => gsap.to(batch, { scaleX: 1, duration: 1.8, ease: EASE_IN_OUT, stagger: 0.12, clearProps: 'transform' }) });
}

function parallax(els) {
  els.forEach((img) => {
    gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
  });
}

// Watches a container and animates matching elements once as they render.
export function watchReveals(root) {
  if (!root) return () => {};
  const mm = gsap.matchMedia();
  mm.add(MOTION_OK, () => {
    let timer;
    const scan = () => {
      const fresh = (sel) => [...root.querySelectorAll(sel.join(','))].filter((el) => !el.dataset.motion && (el.dataset.motion = '1'));
      const imgs = fresh(IMAGE);
      const text = fresh(TEXT);
      const para = fresh(PARALLAX);
      const lines = fresh(LINES);
      if (lines.length) drawLines(lines);
      if (imgs.length) revealImages(imgs);
      if (text.length) revealText(text);
      if (para.length) parallax(para);
      if (imgs.length || text.length || para.length || lines.length) ScrollTrigger.refresh();
    };
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(scan, 60);
    });
    observer.observe(root, { childList: true, subtree: true });
    scan();
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      root.querySelectorAll('[data-motion]').forEach((el) => delete el.dataset.motion);
    };
  });
  return () => mm.revert();
}

// Curtain wipe and a gentle lift on route change.
export function pageEnter(curtain, main) {
  if (reducedMotion()) return;
  const tl = gsap.timeline();
  if (curtain) tl.fromTo(curtain, { scaleY: 1, transformOrigin: '50% 0%' }, { scaleY: 0, duration: 1.05, ease: EASE_IN_OUT });
  if (main) tl.fromTo(main, { y: 28 }, { y: 0, duration: 1.2, ease: EASE, clearProps: 'transform' }, 0.25);
  return () => tl.kill();
}

// Splits an element's text into masked word spans so headlines can rise
// word by word. The original text is preserved as an aria-label; the visual
// spans are aria-hidden. Re-split after the text changes.
export function maskWords(el) {
  if (!el) return [];
  const text = el.textContent.trim();
  if (!text) return [];
  el.textContent = '';
  el.setAttribute('aria-label', text);
  const words = text.split(/\s+/);
  const targets = words.map((word, i) => {
    const mask = document.createElement('span');
    mask.className = 'wm';
    mask.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.className = 'wm-i';
    inner.textContent = word;
    mask.appendChild(inner);
    el.appendChild(mask);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    return inner;
  });
  return targets;
}

// Masked-word rise for a headline: words slide up out of their masks.
export function revealWords(el, { delay = 0, duration = 1.15, stagger = 0.055 } = {}) {
  const targets = maskWords(el);
  if (!targets.length) return;
  gsap.fromTo(targets, { yPercent: 112, rotate: 1.5 }, { yPercent: 0, rotate: 0, duration, delay, ease: EASE, stagger, clearProps: 'transform' });
}
