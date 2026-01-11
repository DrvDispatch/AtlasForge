import Link from 'next/link';
import { Building2, CreditCard, Calendar, Palette, Shield, Zap, Lock, ArrowRight, Check } from 'lucide-react';

export default function HomePage() {
    return (
        <>
            {/* Hero Section - Split Layout */}
            <section className="hero">
                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-content">
                            <div className="badge">
                                <Shield size={14} />
                                Enterprise-Ready Platform
                            </div>
                            <h1 className="title">
                                Multi-Tenant Infrastructure for Modern Commerce
                            </h1>
                            <p className="subtitle">
                                Power your business with isolated storefronts, integrated Stripe payments,
                                and unified booking management. Built for scale.
                            </p>
                            <div className="cta-group">
                                <Link href="/contact" className="primary-btn">
                                    Get Started
                                    <ArrowRight size={16} />
                                </Link>
                                <Link href="mailto:saidangroup@outlook.com" className="secondary-btn">
                                    Contact Sales
                                </Link>
                            </div>
                            <div className="hero-stats">
                                <div className="stat">
                                    <span className="stat-value">99.9%</span>
                                    <span className="stat-label">Uptime SLA</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">256-bit</span>
                                    <span className="stat-label">Encryption</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">GDPR</span>
                                    <span className="stat-label">Compliant</span>
                                </div>
                            </div>
                        </div>
                        <div className="hero-visual">
                            <div className="feature-preview">
                                <div className="preview-header">
                                    <div className="preview-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <span className="preview-title">Dashboard</span>
                                </div>
                                <div className="preview-content">
                                    <div className="preview-sidebar">
                                        <div className="preview-menu-item active"></div>
                                        <div className="preview-menu-item"></div>
                                        <div className="preview-menu-item"></div>
                                        <div className="preview-menu-item"></div>
                                    </div>
                                    <div className="preview-main">
                                        <div className="preview-card"></div>
                                        <div className="preview-card"></div>
                                        <div className="preview-card wide"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features - Bento Grid */}
            <section id="features" className="features">
                <div className="container">
                    <div className="section-header">
                        <h2>Built for serious businesses</h2>
                        <p>Everything you need to run multi-tenant commerce at scale.</p>
                    </div>
                    <div className="bento-grid">
                        <div className="bento-card large">
                            <div className="card-icon">
                                <Building2 size={24} />
                            </div>
                            <h3>Complete Tenant Isolation</h3>
                            <p>
                                Each tenant operates in a fully isolated environment. Separate databases,
                                dedicated storage, and branded storefronts ensure zero data leakage.
                            </p>
                            <ul className="feature-list">
                                <li><Check size={14} /> Isolated databases per tenant</li>
                                <li><Check size={14} /> Custom domain support</li>
                                <li><Check size={14} /> White-label branding</li>
                            </ul>
                        </div>
                        <div className="bento-card">
                            <div className="card-icon">
                                <CreditCard size={24} />
                            </div>
                            <h3>Stripe Connect</h3>
                            <p>PCI-compliant payments with automated splits and instant payouts.</p>
                        </div>
                        <div className="bento-card">
                            <div className="card-icon">
                                <Calendar size={24} />
                            </div>
                            <h3>Unified Bookings</h3>
                            <p>Appointments and products in one dashboard. Perfect for service businesses.</p>
                        </div>
                        <div className="bento-card">
                            <div className="card-icon">
                                <Palette size={24} />
                            </div>
                            <h3>Custom Theming</h3>
                            <p>Each tenant gets unique branding while sharing infrastructure.</p>
                        </div>
                        <div className="bento-card">
                            <div className="card-icon">
                                <Zap size={24} />
                            </div>
                            <h3>Edge Performance</h3>
                            <p>Global CDN with sub-second load times for every storefront.</p>
                        </div>
                        <div className="bento-card">
                            <div className="card-icon">
                                <Lock size={24} />
                            </div>
                            <h3>Enterprise Security</h3>
                            <p>End-to-end encryption, audit logs, and role-based access control.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - Horizontal Steps */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2>Get started in minutes</h2>
                        <p>Launch your platform without months of development.</p>
                    </div>
                    <div className="steps-horizontal">
                        <div className="step-card">
                            <div className="step-number">01</div>
                            <h3>Create Platform</h3>
                            <p>Set up your multi-tenant platform with your branding and configuration.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-card">
                            <div className="step-number">02</div>
                            <h3>Onboard Tenants</h3>
                            <p>Invite merchants to create their isolated storefronts with Stripe onboarding.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-card">
                            <div className="step-number">03</div>
                            <h3>Collect Revenue</h3>
                            <p>Platform fees are automatically calculated and split on every transaction.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section - Inline */}
            <section className="trust">
                <div className="container">
                    <div className="trust-inline">
                        <div className="trust-content">
                            <h2>Built by Saidan Group</h2>
                            <p>
                                Headquartered in Antwerp, Belgium. We build infrastructure for
                                the modern economy with a focus on reliability and compliance.
                            </p>
                        </div>
                        <div className="trust-badges">
                            <div className="trust-badge">
                                <Shield size={18} />
                                <span>GDPR Compliant</span>
                            </div>
                            <div className="trust-badge">
                                <Lock size={18} />
                                <span>256-bit SSL</span>
                            </div>
                            <div className="trust-badge">
                                <CreditCard size={18} />
                                <span>PCI DSS L1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div className="cta-content">
                            <h2>Ready to launch your platform?</h2>
                            <p>Join businesses across Europe using AtlasForge for scalable commerce.</p>
                        </div>
                        <Link href="/contact" className="primary-btn">
                            Get Started
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
