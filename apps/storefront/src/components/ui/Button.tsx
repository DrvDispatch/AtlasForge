import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'default' | 'small';
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'default',
    className,
    children,
    ...props
}: Props) {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
}
