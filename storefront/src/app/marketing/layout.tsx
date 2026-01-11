import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './layout.module.css';

export const metadata: Metadata = {
    title: 'AtlasForge - Multi-Tenant SaaS Infrastructure',
    description: 'The all-in-one platform for multi-tenant ecommerce and bookings.',
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.container}>
                    <Link href="/" className={styles.logo}>
                        AtlasForge
                    </Link>
                    <nav className={styles.nav}>
                        <Link href="#features" className={styles.link}>Features</Link>
                        <Link href="/owner/login" className={styles.loginBtn}>
                            Owner Login
                        </Link>
                    </nav>
                </div>
            </header>
            <main className={styles.main}>
                {children}
            </main>
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.footerContent}>
                        <div className={styles.branding}>
                            <span className={styles.footerLogo}>AtlasForge</span>
                            <p className={styles.copyright}>&copy; {new Date().getFullYear()} Saidan Group.</p>
                        </div>
                        <div className={styles.legal}>
                            <p>Saidan Group (BE 1017.617.595)</p>
                            <p>Turnhoutsebaan 363 box 401, 2140 Antwerpen</p>
                            <Link href="mailto:contact@saidan.group" className={styles.link}>contact@saidan.group</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
