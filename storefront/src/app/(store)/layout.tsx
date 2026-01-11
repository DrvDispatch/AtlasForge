'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar, CartDrawer } from '@/components';
import { getCart, addToCart, updateCartItem, removeCartItem, Cart } from '@/lib/api';
import { AuthProvider } from '@/lib/auth-context';
import styles from './layout.module.css';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        try {
            const data = await getCart();
            setCart(data);
        } catch {
            setCart(null);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Listen for cart events from PDP
    useEffect(() => {
        const handleCartUpdated = () => fetchCart();
        const handleOpenCart = () => setCartOpen(true);

        window.addEventListener('cart-updated', handleCartUpdated);
        window.addEventListener('open-cart', handleOpenCart);

        return () => {
            window.removeEventListener('cart-updated', handleCartUpdated);
            window.removeEventListener('open-cart', handleOpenCart);
        };
    }, [fetchCart]);

    const handleUpdateQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        setUpdating(itemId);
        try {
            const updated = await updateCartItem(itemId, quantity);
            setCart(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        setUpdating(itemId);
        try {
            const updated = await removeCartItem(itemId);
            setCart(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    return (
        <AuthProvider>
            <div className={styles.layout}>
                <Navbar
                    cartCount={cart?.itemCount || 0}
                    onCartClick={() => setCartOpen(true)}
                />

                <main className={styles.main}>
                    {children}
                </main>

                <CartDrawer
                    isOpen={cartOpen}
                    onClose={() => setCartOpen(false)}
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    updating={updating}
                />
            </div>
        </AuthProvider>
    );
}
