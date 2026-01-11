'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
    toast: () => { },
    success: () => { },
    error: () => { },
});

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-remove after 3 seconds
        setTimeout(() => removeToast(id), 3000);
    }, [removeToast]);

    const success = useCallback((message: string) => toast(message, 'success'), [toast]);
    const error = useCallback((message: string) => toast(message, 'error'), [toast]);

    return (
        <ToastContext.Provider value={{ toast, success, error }}>
            {children}

            {/* Toast container */}
            {toasts.length > 0 && (
                <div className={styles.container}>
                    {toasts.map(t => (
                        <div
                            key={t.id}
                            className={`${styles.toast} ${styles[t.type]}`}
                            onClick={() => removeToast(t.id)}
                        >
                            {t.message}
                        </div>
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
