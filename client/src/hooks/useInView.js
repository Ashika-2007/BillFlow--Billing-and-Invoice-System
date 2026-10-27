import { useEffect, useRef, useState } from 'react';

// One-shot IntersectionObserver for scroll-triggered reveals
export default function useInView(options = { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    if (!('IntersectionObserver' in window)) {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [seen]); // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, seen];
}
