import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-glow" />
                <div className="container">
                    <h1 className="title">
                        The All-in-One<br />
                        <span className="title-gradient">Multi-Tenant Infrastructure.</span>
                    </h1>
                    <p className="subtitle">
                        AtlasForge empowers small businesses and independent contractors with enterprise-grade ecommerce,
                        secure payments, and seamless booking systems.
                    </p>
                    <div className="cta-group">
                        <Link href="mailto:contact@saidan.group" className="primary-btn">
                            Get Started
                        </Link>
                        <Link href="mailto:contact@saidan.group" className="secondary-btn">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="features">
                <div className="container">
                    <div className="grid">
                        <div className="card">
                            <div className="card-icon">🏝️</div>
                            <h3>Multi-Tenant Isolation</h3>
                            <p>Every shop gets its own dedicated environment, database isolation, and branded storefront.</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">💳</div>
                            <h3>Stripe Connect</h3>
                            <p>Integrated payments with Stripe Express. Automated payouts and platform fee handling.</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">📅</div>
                            <h3>Unified Bookings</h3>
                            <p>Manage appointments and physical products in a single dashboard. Perfect for service businesses.</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">🎨</div>
                            <h3>Custom Skins</h3>
                            <p>Flexible theming engine allows each tenant to look unique while sharing the same robust core.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust / About */}
            <section className="trust">
                <div className="container">
                    <div className="trust-content">
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
