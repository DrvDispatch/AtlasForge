'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Mail, Package } from 'lucide-react';
import { trackOrder, Order, formatPrice } from '@/lib/api';
import { Button, Divider } from '@/components/ui';
import styles from './page.module.css';

interface Props {
    params: Promise<{ orderNumber: string }>;
}

export default function OrderPage({ params }: Props) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const isSuccess = searchParams.get('success') === '1';
    const emailParam = searchParams.get('email') || '';

    useEffect(() => {
        params.then(async ({ orderNumber }) => {
            if (!emailParam) {
                setError('Email required to view order');
                setLoading(false);
                return;
            }
            try {
                const data = await trackOrder(orderNumber, emailParam);
                setOrder(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Order not found');
            } finally {
                setLoading(false);
            }
        });
    }, [params, emailParam]);

    if (loading) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <p className="text-muted">Loading...</p>
                </div>
            </section>
        );
    }

    if (error || !order) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <p className="text-muted">{error || 'Order not found'}</p>
                    <Link href="/products" className="mt-16" style={{ display: 'inline-block' }}>
                        <Button variant="secondary">Continue shopping</Button>
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className="container">
                {/* Success header with calm messaging */}
                {isSuccess && (
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>
                            <Check size={28} strokeWidth={2.5} />
                        </div>
                        <h1 className={styles.successTitle}>Order confirmed</h1>
                        <p className={styles.successMessage}>
                            Thank you for your order. A confirmation has been sent to <strong>{emailParam}</strong>.
                        </p>
                    </div>
                )}

                {/* What's next section */}
                {isSuccess && (
                    <div className={styles.nextSteps}>
                        <div className={styles.step}>
                            <Mail size={18} strokeWidth={1.5} />
                            <div>
                                <p className={styles.stepTitle}>Check your email</p>
                                <p className={styles.stepDesc}>Confirmation sent to {emailParam}</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <Package size={18} strokeWidth={1.5} />
                            <div>
                                <p className={styles.stepTitle}>We'll update you</p>
                                <p className={styles.stepDesc}>When your order ships</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order details */}
                <div className={styles.orderCard}>
                    <div className={styles.header}>
                        <div>
                            <p className="meta">Order number</p>
                            <h2 className={styles.orderNumber}>#{order.orderNumber}</h2>
                            <p className="meta">
                                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        <span className={styles.status}>{order.status}</span>
                    </div>

                    <Divider spacing="24" />

                    <div className={styles.items}>
                        {order.items.map(item => (
                            <div key={item.id} className={styles.item}>
                                <span className={styles.itemQty}>{item.quantity}×</span>
                                <span className={styles.itemName}>{item.offeringName}</span>
                                <span>{formatPrice(item.totalCents, order.currency)}</span>
                            </div>
                        ))}
                    </div>

                    <Divider spacing="16" />

                    <div className={styles.totals}>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span className={styles.totalValue}>{formatPrice(order.totalCents, order.currency)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-32">
                    <Link href="/products">
                        <Button variant="secondary">Continue shopping</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
