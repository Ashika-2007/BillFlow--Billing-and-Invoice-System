import React, { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Counts up to `value`. `format` turns the in-flight number into display text
 * (defaults to Indian digit grouping). Skips animation for reduced-motion users.
 */
export default function AnimatedNumber({ value, duration = 900, format }) {
  const target = Number(value) || 0;
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? target : 0);
  const from = useRef(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(target);
      return undefined;
    }
    const start = performance.now();
    const origin = from.current;
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = origin + (target - origin) * eased;
      setDisplay(current);
      from.current = current;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);

  const rounded = Math.round(display);
  return <>{format ? format(rounded) : rounded.toLocaleString('en-IN')}</>;
}
