import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
    title: 'AtlasForge - Multi-Tenant SaaS Infrastructure',
    description: 'The all-in-one platform for multi-tenant ecommerce and bookings.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <div className="layout">
                    <header className="header">
                        <div className="container">
                            <Link href="/" className="logo">
                                AtlasForge
                            </Link>
                            <nav className="nav">
                                <Link href="#features" className="nav-link">Features</Link>
                                <Link href="mailto:contact@saidan.group" className="login-btn">
                                    Contact
                                </Link>
                            </nav>
                        </div>
                    </header>
                    <main className="main">
                        {children}
                    </main>
                    <footer className="footer">
                        <div className="container">
                            <div className="footer-content">
                                <div className="branding">
                                    <span className="footer-logo">AtlasForge</span>
                                    <p className="copyright">&copy; {new Date().getFullYear()} Saidan Group.</p>
                                </div>
                                <div className="legal">
                                    <p>Saidan Group (BE 1017.617.595)</p>
                                    <p>Turnhoutsebaan 363 box 401, 2140 Antwerpen</p>
                                    <Link href="mailto:contact@saidan.group" className="nav-link">contact@saidan.group</Link>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
