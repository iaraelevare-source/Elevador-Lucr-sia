import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const toastTypeClasses = {
    success: 'bg-green-600 border-green-500',
    error: 'bg-red-600 border-red-500',
    info: 'bg-slate-700 border-slate-600',
  };
  
   const toastIcon = {
    success: '✅',
    error: '❌',
    info: '🔔',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[200] space-y-2 w-full max-w-sm">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`toast-item flex items-center justify-between p-4 text-white rounded-lg shadow-2xl shadow-black/50 border ${toastTypeClasses[toast.type]}`}
            role="alert"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{toastIcon[toast.type]}</span>
              <span className="text-sm font-semibold">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="ml-4 p-1 text-xl opacity-70 hover:opacity-100">&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};