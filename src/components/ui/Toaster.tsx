import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToasterState {
  toasts: Toast[];
}

interface ToasterContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined);

export const useToaster = (): ToasterContextType => {
  const context = React.useContext(ToasterContext);
  if (context === undefined) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
};

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ToasterState>({ toasts: [] });

  const addToast = (message: string, type: ToastType, duration = 5000) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type, duration };
    
    setState(prev => ({
      toasts: [...prev.toasts, newToast],
    }));
  };

  const removeToast = (id: string) => {
    setState(prev => ({
      toasts: prev.toasts.filter(t => t.id !== id),
    }));
  };

  return (
    <ToasterContext.Provider value={{ toasts: state.toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToasterContext.Provider>
  );
};

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="text-green-500" size={20} />;
    case 'error':
      return <XCircle className="text-red-500" size={20} />;
    case 'warning':
      return <AlertCircle className="text-amber-500" size={20} />;
    case 'info':
      return <AlertCircle className="text-blue-500" size={20} />;
  }
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onRemove();
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
  }[toast.type];

  return (
    <div 
      className={`flex items-center p-4 mb-3 rounded-lg border shadow-sm ${bgColor} animate-slide-in-right`}
      role="alert"
    >
      <div className="mr-3">
        <ToastIcon type={toast.type} />
      </div>
      <div className="flex-1 mr-2">{toast.message}</div>
      <button 
        onClick={onRemove} 
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  useEffect(() => {
    // For demo purposes, show a welcome toast
    const welcomeToast: Toast = {
      id: 'welcome',
      message: 'Welcome to 20/20 Realtors',
      type: 'info',
      duration: 5000,
    };
    
    setToasts([welcomeToast]);
    
    const timer = setTimeout(() => {
      setToasts([]);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 p-4 w-full max-w-sm z-50">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
};