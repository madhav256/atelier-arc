import { useEffect, useRef, useState } from 'react';
import { gsap, reducedMotion, EASE_IN_OUT } from '../lib/motion';

const KEY = 'arc-greeted';
const BEATS = ['Original contemporary art.', 'Chosen for what it holds.'];

// First-visit threshold (reference: the allthingswtf.com trailer gate,
// translated to the gallery's ink/gold serif tone): two short beats, then the
// wordmark and an Enter pill. First visit only (localStorage); any click or
// key fast-forwards to Enter, Escape skips outright, and reduced motion shows
// the final state at once. It is an overlay on top of the rendered site, so
// no-JS visitors and crawlers are unaffected.
export function EnterGate() {
  const [show, setShow] = useState(() => {
    try {
      // Automated browsers (e2e, Lighthouse) never see the gate.
      if (window.navigator.webdriver) return false;
      return !window.localStorage.getItem(KEY);
    } catch {
      return false;
    }
  });
  const [ready, setReady] = useState(false);
  const root = useRef(null);
  const enterRef = useRef(null);

  const dismiss = (instant) => {
    try {
      window.localStorage.setItem(KEY, '1');
    } catch {
      /* private mode: gate simply returns next visit */
    }
    document.body.style.overflow = '';
    if (instant || reducedMotion()) {
      setShow(false);
      return;
    }
    gsap.to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: EASE_IN_OUT, onComplete: () => setShow(false) });
  };

  useEffect(() => {
    if (!show) return undefined;
    const el = root.current;
    document.body.style.overflow = 'hidden';
    let tl;
    const finish = () => setReady(true);
    if (reducedMotion()) {
      finish();
    } else {
      const beats = el.querySelectorAll('.gate-beat');
      tl = gsap.timeline({ onComplete: finish });
      beats.forEach((b, i) => {
        tl.fromTo(b, { clipPath: 'inset(0% 0% 100% 0%)', y: 26 }, { clipPath: 'inset(0% 0% -12% 0%)', y: 0, duration: 1.05, ease: 'expo.out' }, i * 1.7).to(
          b,
          { clipPath: 'inset(100% 0% 0% 0%)', y: -18, duration: 0.75, ease: 'expo.in' },
          i * 1.7 + 1.35,
        );
      });
    }
    const skip = () => {
      tl?.progress(1);
      tl?.kill();
      finish();
    };
    const key = (e) => {
      if (e.key === 'Escape') dismiss(true);
      else skip();
    };
    el.addEventListener('click', skip);
    window.addEventListener('keydown', key);
    return () => {
      tl?.kill();
      el.removeEventListener('click', skip);
      window.removeEventListener('keydown', key);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    if (ready) enterRef.current?.focus();
  }, [ready]);

  if (!show) return null;
  return (
    <div className="enter-gate" ref={root} role="dialog" aria-modal="true" aria-label="Welcome to Atelier Arc">
      <div className="gate-beats" aria-hidden="true">
        {BEATS.map((b) => (
          <p className="gate-beat" key={b}>
            {b}
          </p>
        ))}
      </div>
      <div className={ready ? 'gate-enter show' : 'gate-enter'}>
        <p className="gate-wordmark">
          Atelier <em>Arc</em>
        </p>
        <button
          ref={enterRef}
          className="gate-button"
          onClick={(e) => {
            e.stopPropagation();
            dismiss(false);
          }}
        >
          Enter
        </button>
      </div>
      <span className="gate-hint">Press any key to skip</span>
    </div>
  );
}
