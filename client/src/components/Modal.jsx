import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import usePresence from '../hooks/usePresence';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, children, wide = false, size, labelledBy = 'modal-title' }) {
  const { mounted, state } = usePresence(open, 180);
  const panel = useRef(null);
  const returnTo = useRef(null);

  // Focus management + scroll lock
  useEffect(() => {
    if (!open) return undefined;
    returnTo.current = document.activeElement;
    document.body.classList.add('no-scroll');
    const t = setTimeout(() => {
      const first = panel.current?.querySelector('input, select, textarea') || panel.current?.querySelector(FOCUSABLE);
      (first || panel.current)?.focus();
    }, 30);
    return () => {
      clearTimeout(t);
      document.body.classList.remove('no-scroll');
      returnTo.current?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const nodes = [...panel.current.querySelectorAll(FOCUSABLE)];
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="modal-backdrop"
      data-state={state}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        className={`modal ${wide ? 'modal-wide' : ''} ${size ? `modal-${size}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="modal-head">
          <h2 id={labelledBy}>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
