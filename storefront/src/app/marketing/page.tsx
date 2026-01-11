import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroGlow} />
                <div className={styles.container}>
                    <h1 className={styles.title}>
                        The All-in-One<br />
                        <span className={styles.titleGradient}>Multi-Tenant Infrastructure.</span>
                    </h1>
                    <p className={styles.subtitle}>
                        AtlasForge empowers small businesses and independent contractors with enterprise-grade ecommerce,
                        secure payments, and seamless booking systems.
                    </p>
                    <div className={styles.ctaGroup}>
                        <Link href="/owner/login" className={styles.primaryBtn}>
                            Start Building
                        </Link>
                        <Link href="mailto:contact@saidan.group" className={styles.secondaryBtn}>
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className={styles.features}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <div className={styles.cardIcon}>🏝️</div>
                            <h3>Multi-Tenant Isolation</h3>
                            <p>Every shop gets its own dedicated environment, database isolation, and branded storefront.</p>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardIcon}>💳</div>
                            <h3>Stripe Connect</h3>
                            <p>Integrated payments with Stripe Express. Automated payouts and platform fee handling.</p>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardIcon}>📅</div>
                            <h3>Unified Bookings</h3>
                            <p>Manage appointments and physical products in a single dashboard. Perfect for service businesses.</p>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardIcon}>🎨</div>
                            <h3>Custom Skins</h3>
                            <p>Flexible theming engine allows each tenant to look unique while sharing the same robust core.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust / About */}
            <section className={styles.trust}>
                <div className={styles.container}>
                    <div className={styles.trustContent}>
                        <h2>Built by Saidan Group</h2>
                        <p>
                            Headquartered in Antwerp, Belgium, we build reliability-first software for the modern economy.
                            AtlasForge is our flagship platform for scalable commerce.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
