'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag, Package } from 'lucide-react';
import { getCart } from '@/lib/api';
import styles from './Header.module.css';

export default function Header() {
    const [cartCount, setCartCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    const fetchCart = useCallback(() => {
        getCart()
            .then(cart => setCartCount(cart.itemCount))
            .catch(() => setCartCount(0));
    }, []);

    useEffect(() => {
        setMounted(true);
        fetchCart();

        // Listen for cart updates
        const handleCartUpdate = () => fetchCart();
        window.addEventListener('cart-updated', handleCartUpdate);
        return () => window.removeEventListener('cart-updated', handleCartUpdate);
    }, [fetchCart]);

    return (
        <header className={styles.header}>
            <div className={`container ${styles.inner}`}>
                <Link href="/" className={styles.logo}>
                    <Package size={20} strokeWidth={1.5} />
                    <span>Atlas</span>
                </Link>

                <nav className={styles.nav}>
                    <Link href="/products" className={styles.navLink}>
                        Products
                    </Link>
                    <Link href="/order/track" className={styles.navLink}>
                        Track Order
                    </Link>
                </nav>

                <div className={styles.actions}>
                    <Link href="/cart" className={styles.cartBtn}>
                        <ShoppingBag size={18} strokeWidth={1.5} />
                        {mounted && cartCount > 0 && (
                            <span className={styles.cartCount}>{cartCount}</span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
