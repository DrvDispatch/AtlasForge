import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, Shield, FileText, RotateCcw, Ban, Scale, Gift } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import './globals.css';

export const metadata: Metadata = {
    title: 'AtlasForge - Multi-Tenant SaaS Infrastructure',
    description: 'The all-in-one platform for multi-tenant ecommerce and bookings. Built by Saidan Group.',
    keywords: ['SaaS', 'multi-tenant', 'ecommerce', 'bookings', 'platform'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" data-theme="light">
            <body>
                <div className="layout">
                    <header className="header">
                        <div className="container header-inner">
                            <Link href="/" className="logo">
                                <Shield size={18} />
                                AtlasForge
                            </Link>
                            <nav className="nav">
                                <Link href="/#features" className="nav-link">Features</Link>
                                <Link href="/contact" className="nav-link">Contact</Link>
                                <Link href="/terms" className="nav-link">Terms</Link>
                                <Link href="/refunds" className="nav-link">Refunds</Link>
                                <ThemeToggle />
                            </nav>
                        </div>
                    </header>

                    <main className="main">
                        {children}
                    </main>

                    <footer className="footer">
                        <div className="container">
                            <div className="footer-grid">
                                <div className="footer-brand">
                                    <div className="footer-logo">
                                        <Shield size={16} />
                                        AtlasForge
                                    </div>
                                    <p className="footer-tagline">Enterprise-grade multi-tenant infrastructure for modern businesses.</p>
                                    <p className="copyright">© {new Date().getFullYear()} Saidan Group. All rights reserved.</p>
                                </div>

                                <div className="footer-links">
                                    <h4>Legal</h4>
                                    <Link href="/terms"><FileText size={14} /> Terms of Service</Link>
                                    <Link href="/refunds"><RotateCcw size={14} /> Refund Policy</Link>
                                    <Link href="/cancellation"><Ban size={14} /> Cancellation Policy</Link>
                                    <Link href="/promotions"><Gift size={14} /> Promotions</Link>
                                </div>

                                <div className="footer-links">
                                    <h4>Company</h4>
                                    <Link href="/contact"><Mail size={14} /> Contact Us</Link>
                                    <div className="footer-contact">
                                        <p><MapPin size={14} /> Turnhoutsebaan 363 box 401</p>
                                        <p>2140 Antwerpen, Belgium</p>
                                    </div>
                                </div>

                                <div className="footer-links">
                                    <h4>Business Info</h4>
                                    <p><Scale size={14} /> Saidan Group</p>
                                    <p>VAT: BE 1017.617.595</p>
                                    <a href="mailto:saidangroup@outlook.com"><Mail size={14} /> saidangroup@outlook.com</a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
