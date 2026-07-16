import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const value = useMemo(() => ({ show, success: (m) => show(m, 'success'), error: (m) => show(m, 'error') }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="auth-toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`auth-toast auth-toast--${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
