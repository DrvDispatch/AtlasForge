import Link from 'next/link';
import styles from './EmptyState.module.css';

interface Props {
    title: string;
    description?: string;
    action?: {
        label: string;
        href: string;
    };
}

/**
 * Soft empty state component
 * 
 * Calm, text-only design with optional single action.
 * Used for: empty cart, empty order history, no search results
 */
export function EmptyState({ title, description, action }: Props) {
    return (
        <div className={styles.container}>
            <p className={styles.title}>{title}</p>
            {description && <p className={styles.description}>{description}</p>}
            {action && (
                <Link href={action.href} className={styles.action}>
                    {action.label}
                </Link>
            )}
        </div>
    );
}
