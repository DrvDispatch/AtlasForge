import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.inner}`}>
                <p className="text-sm text-tertiary">
                    © {new Date().getFullYear()} Atlas Accessories
                </p>
                <nav className={styles.links}>
                    <Link href="/order/track">Track Order</Link>
                </nav>
            </div>
        </footer>
    );
}
