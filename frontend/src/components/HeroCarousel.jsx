import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { money } from '../lib/api';
import { gsap, EASE, EASE_IN_OUT, reducedMotion, ScrollTrigger, revealWords } from '../lib/motion';

const HOLD = 8; // seconds each work stays on screen

// Cinematic featured-work hero: slow wipe between works, masked title reveal, gentle scroll parallax.
export function HeroCarousel({ works }) {
  const slides = works.slice(0, 6);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !reducedMotion());
  const [hovered, setHovered] = useState(false);
  const root = useRef(null);
  const prev = useRef(0);
  const progress = useRef(null);
  const n = slides.length;
  const go = (i) => {
    // Advance only once the target slide image is ready, so image and copy land together.
    const target = ((i % n) + n) % n;
    if (target === index) return;
    const img = root.current?.querySelectorAll('.hero-frame')[target]?.querySelector('img');
    if (!img || (img.complete && img.naturalWidth > 0)) { setIndex(target); return; }
    let done = false;
    const finish = () => { if (!done) { done = true; setIndex(target); } };
    img.decode?.().then(finish).catch(finish);
    img.addEventListener('load', finish, { once: true });
    img.addEventListener('error', finish, { once: true });
    setTimeout(finish, 3000);
  };

  // Transition between works
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const frames = el.querySelectorAll('.hero-frame');
    const from = prev.current;
    prev.current = index;
    frames.forEach((f, i) => f.classList.toggle('is-active', i === index));
    const copy = el.querySelectorAll('.hero-copy > *:not(.hero-brand):not(h1)');
    const h1 = el.querySelector('.hero-copy h1');
    if (reducedMotion() || from === index) {
      gsap.set(frames[index], { clipPath: 'inset(0% 0% 0% 0%)', zIndex: 2 });
      if (from === index && !reducedMotion()) {
        revealWords(h1, { delay: 0.45, duration: 1.3, stagger: 0.07 });
        gsap.fromTo(copy, { clipPath: 'inset(0% 0% 100% 0%)', y: 40 }, { clipPath: 'inset(0% 0% -25% 0%)', y: 0, duration: 1.4, ease: EASE, stagger: 0.08, delay: 0.5, clearProps: 'clipPath,transform' });
      }
      return;
    }
    const next = frames[index];
    const img = next.querySelector('img');
    const tl = gsap.timeline();
    gsap.set(frames, { zIndex: 0 });
    gsap.set(frames[from], { zIndex: 1 });
    tl.fromTo(next, { zIndex: 2, clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: EASE_IN_OUT }, 0)
      .fromTo(img, { scale: 1.18, xPercent: 4 }, { scale: 1.04, xPercent: 0, duration: 2.6, ease: EASE }, 0)
      .to(frames[from].querySelector('img'), { scale: 1.1, xPercent: -6, duration: 1.8, ease: EASE_IN_OUT }, 0)
      .fromTo(copy, { clipPath: 'inset(0% 0% 100% 0%)', y: 40 }, { clipPath: 'inset(0% 0% -25% 0%)', y: 0, duration: 1.3, ease: EASE, stagger: 0.08, clearProps: 'clipPath,transform' }, 0.7)
      .add(() => revealWords(h1, { duration: 1.2, stagger: 0.06 }), 0.75);
    return () => tl.progress(1).kill();
  }, [index]);

  // Preload every slide image up front so advancing never waits on the network.
  useEffect(() => {
    slides.forEach((s) => {
      const src = s?.images?.[0]?.url;
      if (!src) return;
      const im = new Image();
      im.src = src;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autoplay with a hairline progress bar; pauses on hover, focus, or the pause button.
  const tween = useRef(null);
  useEffect(() => {
    const bar = progress.current;
    if (!bar || n < 2) return;
    tween.current = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: HOLD, ease: 'none', paused: true, onComplete: () => go(index + 1) });
    return () => tween.current?.kill();
  }, [index, n]);
  useEffect(() => {
    const t = tween.current;
    if (!t) return;
    if (playing && !hovered) t.play();
    else t.pause();
  }, [index, playing, hovered]);

  // Arrow-key navigation while the hero is on screen (ignored while typing or when a dialog is open).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' || n < 2) return;
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const t = e.target;
      const tag = (t.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable || document.querySelector('dialog[open]')) return;
      e.preventDefault();
      go(index + (e.key === 'ArrowRight' ? 1 : -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, n]);

  // Scroll exit: the stage sinks and swells while the copy lifts away and fades.
  useEffect(() => {
    if (reducedMotion() || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.to('.hero-stage', { yPercent: 16, scale: 1.08, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-copy', { yPercent: -30, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: '75% top', scrub: true } });
      gsap.to('.hero-controls, .hero-mark', { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: '45% top', scrub: true } });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  const touch = useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    const s = touch.current;
    touch.current = null;
    if (!s || n < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
  };

  const w = slides[index];
  const pad = (x) => String(x).padStart(2, '0');
  return (
    <section
      className="hero"
      ref={root}
      aria-roledescription="carousel"
      aria-label="Featured acquisitions"
      aria-keyshortcuts="ArrowLeft ArrowRight"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHovered(false)}
    >
      <div className="hero-stage">
        {slides.map((s, i) => (
          <div className={`hero-frame${i === 0 ? ' is-active' : ''}`} key={s.slug} aria-hidden={i !== index}>
            <img src={s.images[0].url} alt={i === index ? s.images[0].alt : ''} fetchpriority={i === 0 ? 'high' : 'auto'} />
          </div>
        ))}
      </div>
      <div className="hero-shade" />
      <div className="hero-copy" aria-live={playing ? 'off' : 'polite'}>
        <p className="hero-brand">Original contemporary art, sourced directly from artists.</p>
        <span className="eyebrow">
          FEATURED ACQUISITION · {pad(index + 1)} / {pad(n)}
        </span>
        <h1>{w.title}</h1>
        <p className="artist">{w.artist?.name}</p>
        <p>
          {w.year} · {w.medium}
          <br />
          {w.priceOnRequest ? 'Price on request' : money(w.price)}
        </p>
        <Link className="text-link light" to={`/artworks/${w.slug}`}>
          View artwork <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      {n > 1 && (
        <div className="hero-controls">
          <button onClick={() => go(index - 1)} aria-label="Previous featured work">
            <ArrowLeft aria-hidden="true" />
          </button>
          <div className="hero-progress" aria-hidden="true">
            <i ref={progress} />
          </div>
          <button onClick={() => go(index + 1)} aria-label="Next featured work">
            <ArrowRight aria-hidden="true" />
          </button>
          <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} aria-pressed={!playing}>
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
        </div>
      )}
      <div className="hero-mark" aria-hidden="true">
        A<span>A</span>
      </div>
    </section>
  );
}
