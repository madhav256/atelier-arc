import { useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { reducedMotion } from '../lib/motion';

// Cursor-attracted wrapper for a primary action: the content drifts toward
// the pointer within a few pixels and springs home on leave. Inert for
// reduced motion (renders children unwrapped).
export function Magnetic({ children, strength = 7 }) {
  const ref = useRef(null);
  const [style, api] = useSpring(() => ({ x: 0, y: 0, config: { tension: 220, friction: 18 } }));
  if (reducedMotion()) return children;
  const move = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.max(1, Math.hypot(dx, dy));
    const pull = Math.min(1, strength / dist) * 0.55;
    api.start({ x: dx * pull, y: dy * pull });
  };
  return (
    <animated.span ref={ref} className="magnetic" style={style} onMouseMove={move} onMouseLeave={() => api.start({ x: 0, y: 0 })}>
      {children}
    </animated.span>
  );
}
