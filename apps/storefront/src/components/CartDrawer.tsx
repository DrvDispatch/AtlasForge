'use client';

import { X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Cart, formatPrice } from '@/lib/api';
import { Button, QuantityStepper, Divider, EmptyState } from '@/components/ui';
import styles from './CartDrawer.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    cart: Cart | null;
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemoveItem: (itemId: string) => void;
    updating?: string | null;
}

export function CartDrawer({
    isOpen,
    onClose,
    cart,
    onUpdateQuantity,
    onRemoveItem,
    updating
}: Props) {
    const isEmpty = !cart || cart.items.length === 0;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`${styles.backdrop} ${isOpen ? styles.open : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside
                className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
                aria-label="Shopping cart"
            >
                <header className={styles.header}>
                    <h2 className="h2">Cart</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close cart"
                    >
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </header>

                {isEmpty ? (
                    <div className={styles.empty}>
                        <EmptyState
                            title="Your cart is empty"
                            description="Add products to get started."
                        />
                    </div>
                ) : (
                    <>
                        <div className={styles.items}>
                            {cart.items.map(item => (
                                <div
                                    key={item.id}
                                    className={`${styles.item} ${updating === item.id ? styles.updating : ''}`}
                                >
                                    <div className={styles.itemImage}>
                                        {item.offeringImage ? (
                                            <img src={item.offeringImage} alt={item.offeringName} />
                                        ) : (
                                            <div className={styles.placeholder} />
                                        )}
                                    </div>

                                    <div className={styles.itemContent}>
                                        <p className={styles.itemName}>{item.offeringName}</p>
                                        <p className={styles.itemPrice}>{formatPrice(item.priceCents)}</p>

                                        <div className={styles.itemActions}>
                                            <QuantityStepper
                                                value={item.quantity}
                                                onChange={(qty) => onUpdateQuantity(item.id, qty)}
                                                disabled={updating === item.id}
                                            />

                                            <button
                                                className={styles.removeBtn}
                                                onClick={() => onRemoveItem(item.id)}
                                                disabled={updating === item.id}
                                                aria-label="Remove"
                                            >
                                                <Trash2 size={16} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className={styles.itemTotal}>
                                        {formatPrice(item.totalCents)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <footer className={styles.footer}>
                            <Divider spacing="16" />

                            <div className={styles.subtotal}>
                                <span className="text-secondary">Subtotal</span>
                                <span className="h2">{formatPrice(cart.subtotalCents)}</span>
                            </div>

                            <p className={`meta ${styles.note}`}>
                                Shipping calculated at checkout
                            </p>

                            <Link href="/checkout" onClick={onClose} style={{ display: 'block' }}>
                                <Button variant="primary" style={{ width: '100%' }}>
                                    Checkout
                                </Button>
                            </Link>
                        </footer>
                    </>
                )}
            </aside>
        </>
    );
}
