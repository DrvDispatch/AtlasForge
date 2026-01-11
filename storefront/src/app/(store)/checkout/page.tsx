'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Check } from 'lucide-react';
import { getCart, createOrder, Cart, formatPrice } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button, Divider, EmptyState } from '@/components/ui';
import { CheckoutSkeleton } from '@/components/Skeleton';
import styles from './page.module.css';

export default function CheckoutPage() {
    const { user, isLoggedIn, loading: authLoading } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [form, setForm] = useState({
        name: '',
        email: '',
    });

    // Inline validation state
    const [touched, setTouched] = useState({
        name: false,
        email: false,
    });

    // Auto-fill from user data when logged in
    useEffect(() => {
        if (!authLoading && user) {
            setForm(prev => ({
                name: prev.name || user.name || '',
                email: prev.email || user.email || '',
            }));
        }
    }, [user, authLoading]);

    useEffect(() => {
        getCart()
            .then(setCart)
            .catch(() => setCart(null))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (field: 'name' | 'email') => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Inline validation
    const getFieldError = (field: 'name' | 'email'): string | null => {
        if (!touched[field]) return null;

        if (field === 'name' && !form.name.trim()) {
            return 'Name is required';
        }
        if (field === 'email') {
            if (!form.email.trim()) return 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email';
        }
        return null;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Mark all as touched for validation
        setTouched({ name: true, email: true });

        // Check for errors
        if (getFieldError('name') || getFieldError('email')) return;

        setSubmitting(true);

        try {
            const order = await createOrder({
                customerName: form.name,
                customerEmail: form.email,
            });
            router.push(`/order/${order.orderNumber}?success=1&email=${encodeURIComponent(form.email)}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    // Skeleton loading
    if (loading) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <CheckoutSkeleton />
                </div>
            </section>
        );
    }

    const isEmpty = !cart || cart.items.length === 0;

    if (isEmpty) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <EmptyState
                        title="Your cart is empty"
                        description="Add products before checkout."
                    />
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <Link href="/products" className={styles.back}>
                    <ChevronLeft size={16} strokeWidth={1.5} />
                    Continue shopping
                </Link>

                {/* Context label */}
                <p className={styles.contextLabel}>Checkout · Contact information</p>
                <h1 className="h1 mb-24">Complete your order</h1>

                <div className={styles.layout}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        {error && <p className={styles.error}>{error}</p>}

                        {/* Identity awareness banner */}
                        <IdentityBanner user={user} isLoggedIn={isLoggedIn} loading={authLoading} />

                        <div className={styles.group}>
                            <h2 className="h2 mb-16">Contact</h2>

                            <div className={`${styles.field} ${getFieldError('name') ? styles.fieldError : ''}`}>
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('name')}
                                    required
                                    autoComplete="name"
                                />
                                {getFieldError('name') && (
                                    <span className={styles.fieldHint}>{getFieldError('name')}</span>
                                )}
                            </div>

                            <div className={`${styles.field} ${getFieldError('email') ? styles.fieldError : ''}`}>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('email')}
                                    required
                                    autoComplete="email"
                                />
                                {getFieldError('email') && (
                                    <span className={styles.fieldHint}>{getFieldError('email')}</span>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={submitting}
                            style={{ width: '100%' }}
                        >
                            {submitting ? 'Placing order...' : 'Place order'}
                        </Button>
                    </form>

                    <aside className={styles.summary}>
                        <h2 className="h2 mb-16">Order summary</h2>

                        <div className={styles.items}>
                            {cart.items.map(item => (
                                <div key={item.id} className={styles.item}>
                                    <span className={styles.itemQty}>{item.quantity}×</span>
                                    <span className={styles.itemName}>{item.offeringName}</span>
                                    <span>{formatPrice(item.totalCents)}</span>
                                </div>
                            ))}
                        </div>

                        <Divider spacing="16" />

                        <div className={styles.totals}>
                            <div className={`${styles.totalRow} ${styles.total}`}>
                                <span>Total</span>
                                <span>{formatPrice(cart.subtotalCents)}</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}

// Identity awareness component
function IdentityBanner({
    user,
    isLoggedIn,
    loading
}: {
    user: { email: string; emailVerified: boolean } | null;
    isLoggedIn: boolean;
    loading: boolean;
}) {
    if (loading) return null;

    if (isLoggedIn && user) {
        return (
            <div className={styles.identityBanner}>
                <Check size={14} strokeWidth={2} />
                <span>
                    Signed in as <strong>{user.email}</strong>
                    {user.emailVerified && ' (verified)'}
                </span>
            </div>
        );
    }

    return (
        <div className={styles.identityBannerGuest}>
            <span>Checking out as guest</span>
            <Link href="/auth/login?returnUrl=/checkout">Sign in</Link>
        </div>
    );
}
