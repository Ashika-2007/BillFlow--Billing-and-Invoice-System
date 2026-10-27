import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 220);
  }, []);

  const push = useCallback(
    (type, message, duration = 4200) => {
      const id = nextId.current++;
      setItems((list) => [...list.slice(-3), { id, type, message }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m, 6000),
      info: (m) => push('info', m),
      dismiss
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" role="region" aria-label="Notifications" aria-live="polite">
        {items.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className={`toast toast-${t.type} ${t.leaving ? 'is-leaving' : ''}`} role={t.type === 'error' ? 'alert' : 'status'}>
              <Icon size={18} aria-hidden="true" />
              <span>{t.message}</span>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
