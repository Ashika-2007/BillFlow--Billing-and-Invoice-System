import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmContext = createContext(null);

/**
 * Promise-based replacement for window.confirm():
 *   const confirm = useConfirm();
 *   if (await confirm({ title, message, confirmLabel, tone: 'danger' })) { ... }
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false });
  const resolver = useRef(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setState({ open: true, ...options });
      }),
    []
  );

  const close = (result) => {
    resolver.current?.(result);
    setState((s) => ({ ...s, open: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={state.open} onClose={() => close(false)} title={state.title || 'Are you sure?'} size="sm" labelledBy="confirm-title">
        <div className="confirm-body">
          <div className={`confirm-icon tone-${state.tone || 'danger'}`} aria-hidden="true">
            <AlertTriangle size={20} />
          </div>
          <p>{state.message}</p>
        </div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => close(false)}>
            {state.cancelLabel || 'Cancel'}
          </Button>
          <Button variant={state.tone === 'primary' ? 'primary' : 'danger'} onClick={() => close(true)}>
            {state.confirmLabel || 'Confirm'}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
