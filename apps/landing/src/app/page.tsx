import Link from 'next/link';
import { Building2, CreditCard, Calendar, Palette, Shield, Zap, Globe, Lock } from 'lucide-react';

export default function HomePage() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="badge">
                        <Shield size={14} />
                        Trusted by businesses worldwide
                    </div>
                    <h1 className="title">
                        The All-in-One<br />
                        <span className="title-gradient">Multi-Tenant Infrastructure.</span>
                    </h1>
                    <p className="subtitle">
                        AtlasForge empowers small businesses and independent contractors with enterprise-grade
                        ecommerce, secure payments powered by Stripe, and seamless booking systems.
                    </p>
                    <div className="cta-group">
                        <Link href="/contact" className="primary-btn">
                            Get Started
                        </Link>
                        <Link href="mailto:saidangroup@outlook.com" className="secondary-btn">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="features">
                <div className="container">
                    <div className="section-header">
                        <h2>Everything you need to scale</h2>
                        <p>Build, deploy, and manage multi-tenant applications with confidence.</p>
                    </div>
                    <div className="grid">
                        <div className="card">
                            <div className="card-icon">
                                <Building2 size={20} />
                            </div>
                            <h3>Multi-Tenant Isolation</h3>
                            <p>Every tenant gets their own dedicated environment with complete database isolation and branded storefront.</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <CreditCard size={20} />
                            </div>
                            <h3>Stripe Connect</h3>
                            <p>Integrated payments with Stripe Express. Automated payouts, platform fee handling, and PCI-compliant transactions.</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <Calendar size={20} />
                            </div>
                            <h3>Unified Bookings</h3>
                            <p>Manage appointments and physical products in a single dashboard. Perfect for service businesses.</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <Palette size={20} />
                            </div>
                            <h3>Custom Skins</h3>
                            <p>Flexible theming engine allows each tenant to look unique while sharing the same robust core.</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <Zap size={20} />
                            </div>
                            <h3>Lightning Fast</h3>
                            <p>Built on modern technologies with edge caching. Your customers get sub-second load times globally.</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <Lock size={20} />
                            </div>
                            <h3>Enterprise Security</h3>
                            <p>End-to-end encryption, regular security audits, and comprehensive access controls.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2>How AtlasForge Works</h2>
                        <p>Get started in minutes, not months.</p>
                    </div>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Sign Up</h3>
                            <p>Create your platform account and configure your business settings.</p>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Customize</h3>
                            <p>Set up your branding, payment methods, and storefront appearance.</p>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Launch</h3>
                            <p>Go live and start accepting orders, bookings, and payments immediately.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust / About */}
            <section className="trust">
                <div className="container">
                    <div className="trust-content">
                        <Globe size={40} className="trust-icon" />
                        <h2>Built by Saidan Group</h2>
                        <p>
                            Headquartered in Antwerp, Belgium, we build reliability-first software for the modern economy.
                            AtlasForge is our flagship platform for scalable commerce, trusted by businesses across Europe.
                        </p>
                        <div className="trust-badges">
                            <div className="trust-badge">
                                <Shield size={16} />
                                GDPR Compliant
                            </div>
                            <div className="trust-badge">
                                <Lock size={16} />
                                256-bit Encryption
                            </div>
                            <div className="trust-badge">
                                <CreditCard size={16} />
                                PCI DSS Level 1
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2>Ready to get started?</h2>
                    <p>Join hundreds of businesses already using AtlasForge.</p>
                    <div className="cta-group">
                        <Link href="/contact" className="primary-btn">
                            Contact Us Today
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
