import styles from './Skeleton.module.css';

interface Props {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
}

export function Skeleton({ width, height = 16, borderRadius, className }: Props) {
    return (
        <div
            className={`${styles.skeleton} ${className || ''}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius: borderRadius || 'var(--radius-sm)',
            }}
        />
    );
}

export function ProductCardSkeleton() {
    return (
        <div className={styles.productCard}>
            <Skeleton height="100%" className={styles.productImage} />
            <div className={styles.productContent}>
                <Skeleton width={60} height={10} />
                <Skeleton width="80%" height={16} />
                <Skeleton width={50} height={18} />
            </div>
        </div>
    );
}

export function CartItemSkeleton() {
    return (
        <div className={styles.cartItem}>
            <Skeleton width={48} height={48} />
            <div className={styles.cartItemDetails}>
                <Skeleton width="60%" height={14} />
                <Skeleton width={40} height={12} />
            </div>
            <Skeleton width={80} height={32} />
            <Skeleton width={60} height={14} />
            <Skeleton width={32} height={32} />
        </div>
    );
}

export function CheckoutSkeleton() {
    return (
        <div className={styles.checkoutSkeleton}>
            <div className={styles.checkoutForm}>
                <Skeleton width={120} height={24} />
                <div style={{ marginTop: 16 }}>
                    <Skeleton width={60} height={12} />
                    <Skeleton width="100%" height={40} />
                </div>
                <div style={{ marginTop: 16 }}>
                    <Skeleton width={60} height={12} />
                    <Skeleton width="100%" height={40} />
                </div>
                <div style={{ marginTop: 24 }}>
                    <Skeleton width="100%" height={44} borderRadius="var(--radius)" />
                </div>
            </div>
            <div className={styles.checkoutSummary}>
                <Skeleton width={140} height={20} />
                <div style={{ marginTop: 16 }}>
                    <Skeleton width="100%" height={16} />
                    <Skeleton width="80%" height={16} />
                    <Skeleton width="60%" height={16} />
                </div>
                <div style={{ marginTop: 16 }}>
                    <Skeleton width="100%" height={32} />
                </div>
            </div>
        </div>
    );
}

