'use client';

import Link from 'next/link';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import styles from './Navbar.module.css';

interface Props {
    cartCount?: number;
    onCartClick?: () => void;
}

export function Navbar({ cartCount = 0, onCartClick }: Props) {
    const { user, isLoggedIn, logout, loading } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <header className={styles.navbar}>
            <div className={`container ${styles.inner}`}>
                <Link href="/" className={styles.logo}>
                    Atlas
                </Link>

                <nav className={styles.nav}>
                    <Link href="/products" className={styles.link}>
                        Products
                    </Link>
                </nav>

                <div className={styles.actions}>
                    {/* Auth state indicator */}
                    {!loading && (
                        isLoggedIn ? (
                            <div className={styles.userMenu}>
                                <span className={styles.userEmail}>
                                    {user?.name || user?.email?.split('@')[0]}
                                </span>
                                <button
                                    className={styles.iconBtn}
                                    onClick={handleLogout}
                                    aria-label="Logout"
                                    title="Logout"
                                >
                                    <LogOut size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                        ) : (
                            <Link href="/auth/login" className={styles.authLink}>
                                Sign in
                            </Link>
                        )
                    )}

                    {/* Cart button */}
                    <button
                        className={styles.cartBtn}
                        onClick={onCartClick}
                        aria-label="Open cart"
                    >
                        <ShoppingBag size={18} strokeWidth={1.5} />
                        {cartCount > 0 && (
                            <span className={styles.badge}>{cartCount}</span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
