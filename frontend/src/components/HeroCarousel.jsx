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
    // Choreography: outgoing copy exits first, then the image changes, then the new
    // image and its copy arrive together. Advancement still waits for the target image.
    const target = ((i % n) + n) % n;
    if (target === index) return;
    const advance = () => {
      const copy = root.current?.querySelectorAll('.hero-copy > *:not(.hero-brand)');
      if (!copy?.length || reducedMotion()) { setIndex(target); return; }
      gsap.to(copy, { clipPath: 'inset(100% 0% 0% 0%)', y: -30, autoAlpha: 0, duration: 0.45, ease: EASE_IN_OUT, stagger: 0.04, onComplete: () => setIndex(target) });
    };
    const img = root.current?.querySelectorAll('.hero-frame')[target]?.querySelector('img');
    if (!img || (img.complete && img.naturalWidth > 0)) { advance(); return; }
    let done = false;
    const finish = () => { if (!done) { done = true; advance(); } };
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
    // Clear the exit tween's leftover clip/transform/opacity from the reused copy nodes.
    gsap.set(el.querySelectorAll('.hero-copy > *:not(.hero-brand)'), { autoAlpha: 1, clearProps: 'clipPath,transform' });
    if (reducedMotion() || from === index) {
      gsap.set(frames[index], { clipPath: 'inset(0% 0% 0% 0%)', zIndex: 2 });
      if (from === index && !reducedMotion()) {
        revealWords(h1, { delay: 0.45, duration: 1.3, stagger: 0.07 });
        gsap.fromTo(copy, { clipPath: 'inset(0% 0% 100% 0%)', y: 40 }, { clipPath: 'inset(0% 0% -25% 0%)', y: 0, duration: 1.4, ease: EASE, stagger: 0.08, delay: 0.5, clearProps: 'clipPath,transform' });
      }
      return;
    }
    // Keep the title hidden until its masked-word reveal lands with the image.
    gsap.set(h1, { autoAlpha: 0 });
    const next = frames[index];
    const img = next.querySelector('img');
    const tl = gsap.timeline();
    gsap.set(frames, { zIndex: 0 });
    gsap.set(frames[from], { zIndex: 1 });
    tl.fromTo(next, { zIndex: 2, clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: EASE_IN_OUT }, 0)
      .fromTo(img, { scale: 1.18, xPercent: 4 }, { scale: 1.04, xPercent: 0, duration: 2.6, ease: EASE }, 0)
      .to(frames[from].querySelector('img'), { scale: 1.1, xPercent: -6, duration: 1.8, ease: EASE_IN_OUT }, 0)
      .fromTo(copy, { clipPath: 'inset(0% 0% 100% 0%)', y: 40 }, { clipPath: 'inset(0% 0% -25% 0%)', y: 0, duration: 1.3, ease: EASE, stagger: 0.08, clearProps: 'clipPath,transform' }, 1.1)
      .add(() => { gsap.set(h1, { autoAlpha: 1 }); revealWords(h1, { duration: 1.2, stagger: 0.06 }); }, 1.15);
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
        <img src="data:image/png;base64,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" alt="" />
      </div>
    </section>
  );
}
