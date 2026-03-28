import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 6000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const icons = {
    info: <Info size={18} color="var(--md-sys-color-primary)" />,
    error: <AlertCircle size={18} color="var(--md-sys-color-error)" />,
    success: <CheckCircle2 size={18} color="#10b981" />,
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <div className="toast-icon">{icons[t.type]}</div>
            <div className="toast-message">{t.message}</div>
            <button 
              className="toast-close"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
