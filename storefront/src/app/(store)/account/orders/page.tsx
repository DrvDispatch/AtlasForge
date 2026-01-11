'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { getMyOrders, Order, formatPrice } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui';
import styles from './page.module.css';

export default function AccountOrdersPage() {
    const { user, isLoggedIn, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        getMyOrders()
            .then(setOrders)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [isLoggedIn, authLoading]);

    // Not logged in
    if (!authLoading && !isLoggedIn) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.signInPrompt}>
                        <Package size={32} strokeWidth={1.5} />
                        <h1 className="h1 mb-8">Order History</h1>
                        <p className="text-secondary mb-24">Sign in to view your orders</p>
                        <Link href="/auth/login?returnUrl=/account/orders">
                            <Button variant="primary">Sign in</Button>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    // Loading
    if (loading) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <h1 className="h1 mb-24">Order History</h1>
                    <p className="text-muted">Loading...</p>
                </div>
            </section>
        );
    }

    // Error
    if (error) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <h1 className="h1 mb-24">Order History</h1>
                    <p className="text-muted">{error}</p>
                </div>
            </section>
        );
    }

    // Empty
    if (orders.length === 0) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <h1 className="h1 mb-24">Order History</h1>
                    <div className={styles.empty}>
                        <Package size={32} strokeWidth={1.5} />
                        <p className={styles.emptyTitle}>No orders yet</p>
                        <p className={styles.emptyDesc}>When you place orders, they'll appear here.</p>
                        <Link href="/products">
                            <Button variant="secondary">Browse products</Button>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <h1 className="h1 mb-24">Order History</h1>

                <div className={styles.orders}>
                    {orders.map(order => (
                        <Link
                            key={order.id}
                            href={`/order/${order.orderNumber}?email=${encodeURIComponent(user?.email || '')}`}
                            className={styles.orderCard}
                        >
                            <div className={styles.orderHeader}>
                                <span className={styles.orderNumber}>#{order.orderNumber}</span>
                                <span className={styles.orderStatus}>{order.status}</span>
                            </div>

                            <div className={styles.orderDetails}>
                                <span className={styles.orderDate}>
                                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                                <span className={styles.orderItems}>
                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                </span>
                                <span className={styles.orderTotal}>
                                    {formatPrice(order.totalCents, order.currency)}
                                </span>
                            </div>

                            <ChevronRight size={16} strokeWidth={1.5} className={styles.chevron} />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
