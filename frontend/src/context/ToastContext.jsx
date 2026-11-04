import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Check, CircleAlert, X } from 'lucide-react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const seq = useRef(0);

  const dismiss = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message, { tone = 'ok', duration = 4200 } = {}) => {
      const id = ++seq.current;
      setItems((list) => [...list.slice(-2), { id, message, tone }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            {t.tone === 'bad' ? <CircleAlert size={17} aria-hidden /> : <Check size={17} aria-hidden />}
            <span>{t.message}</span>
            <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss message">
              <X size={15} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
