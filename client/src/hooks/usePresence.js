import { useEffect, useState } from 'react';

// Keeps an element mounted long enough to play its exit animation.
// Returns { mounted, state } where state is 'open' | 'closing'.
export default function usePresence(open, duration = 180) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState(open ? 'open' : 'closing');

  useEffect(() => {
    if (open) {
      setMounted(true);
      setState('open');
      return undefined;
    }
    setState('closing');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setMounted(false), reduce ? 0 : duration);
    return () => clearTimeout(t);
  }, [open, duration]);

  return { mounted, state };
}
