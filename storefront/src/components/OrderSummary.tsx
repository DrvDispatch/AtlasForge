'use client';

import { formatPrice } from '@/lib/api';
import { Divider } from './ui';
import styles from './OrderSummary.module.css';

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    priceCents: number;
    totalCents: number;
    image?: string | null;
}

interface Props {
    items: OrderItem[];
    subtotalCents: number;
    showImages?: boolean;
    compact?: boolean;
}

/**
 * Reusable OrderSummary component
 * Used in: CartDrawer, Checkout, Order Confirmation
 */
export function OrderSummary({ items, subtotalCents, showImages = false, compact = false }: Props) {
    return (
        <div className={styles.summary}>
            <h2 className={`h2 ${styles.title}`}>Order summary</h2>

            <div className={styles.items}>
                {items.map(item => (
                    <div key={item.id} className={styles.item}>
                        {showImages && (
                            <div className={styles.imageWrap}>
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className={styles.image} />
                                ) : (
                                    <div className={styles.placeholder} />
                                )}
                            </div>
                        )}
                        <div className={styles.itemDetails}>
                            <span className={styles.itemQty}>{item.quantity}×</span>
                            <span className={styles.itemName}>{item.name}</span>
                        </div>
                        <span className={styles.itemPrice}>{formatPrice(item.totalCents)}</span>
                    </div>
                ))}
            </div>

            <Divider spacing="16" />

            <div className={styles.totals}>
                <div className={styles.totalRow}>
                    <span>Total</span>
                    <span className={styles.totalValue}>{formatPrice(subtotalCents)}</span>
                </div>
            </div>
        </div>
    );
}
