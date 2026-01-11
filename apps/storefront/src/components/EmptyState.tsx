import { AlertTriangle, RefreshCw } from 'lucide-react';
import styles from './EmptyState.module.css';

interface Props {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: Props) {
    return (
        <div className={styles.container}>
            {icon && <div className={styles.icon}>{icon}</div>}
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
            {action && (
                <button onClick={action.onClick} className="btn btn-primary mt-4">
                    {action.label}
                </button>
            )}
        </div>
    );
}

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
    return (
        <div className={styles.container}>
            <div className={`${styles.icon} ${styles.errorIcon}`}>
                <AlertTriangle size={24} strokeWidth={1.5} />
            </div>
            <h3 className={styles.title}>Error</h3>
            <p className={styles.description}>{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="btn btn-secondary mt-4">
                    <RefreshCw size={16} strokeWidth={2} />
                    Try Again
                </button>
            )}
        </div>
    );
}
