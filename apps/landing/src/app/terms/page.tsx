import { FileText, AlertCircle, CheckCircle, Scale } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - AtlasForge',
    description: 'Terms and conditions for using the AtlasForge platform.',
};

export default function TermsPage() {
    return (
        <div className="legal-page">
            <div className="container">
                <div className="legal-header">
                    <FileText size={48} className="legal-icon" />
                    <h1>Terms of Service</h1>
                    <p>Last updated: January 2026</p>
                </div>

                <div className="legal-section">
                    <h2>1. Agreement to Terms</h2>
                    <p>
                        By accessing or using AtlasForge services provided by Saidan Group (VAT: BE 1017.617.595),
                        you agree to be bound by these Terms of Service. If you disagree with any part of the terms,
                        you may not access the service.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>2. Description of Service</h2>
                    <p>
                        AtlasForge is a multi-tenant SaaS platform that provides:
                    </p>
                    <ul>
                        <li>E-commerce storefront hosting and management</li>
                        <li>Payment processing through Stripe Connect</li>
                        <li>Booking and appointment management</li>
                        <li>Custom branding and theming capabilities</li>
                        <li>Administrative dashboard and analytics</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>3. User Accounts</h2>
                    <p>
                        When you create an account with us, you must provide accurate, complete, and current information.
                        Failure to do so constitutes a breach of the Terms, which may result in immediate termination of
                        your account.
                    </p>
                    <p>
                        You are responsible for safeguarding the password and for all activities that occur under your account.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>4. Payment Terms</h2>
                    <p>
                        All payments are processed securely through Stripe. By using our payment services, you also agree
                        to Stripe's terms of service. Transaction fees and platform fees are clearly displayed before
                        any purchase is completed.
                    </p>
                    <div className="highlight-box">
                        <AlertCircle size={20} />
                        <p>
                            <strong>Important:</strong> All prices are displayed in EUR unless otherwise specified.
                            VAT is applied according to Belgian and EU regulations.
                        </p>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>5. Acceptable Use</h2>
                    <p>You agree not to use the service to:</p>
                    <ul>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe upon intellectual property rights</li>
                        <li>Transmit harmful code or malware</li>
                        <li>Engage in fraudulent activities</li>
                        <li>Harass, abuse, or harm others</li>
                        <li>Sell prohibited or restricted items</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>6. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are owned by Saidan Group
                        and are protected by international copyright, trademark, patent, trade secret, and other
                        intellectual property laws.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>7. Termination</h2>
                    <p>
                        We may terminate or suspend your account immediately, without prior notice or liability,
                        for any reason, including breach of these Terms. Upon termination, your right to use the
                        Service will cease immediately.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>8. Limitation of Liability</h2>
                    <p>
                        In no event shall Saidan Group be liable for any indirect, incidental, special, consequential,
                        or punitive damages resulting from your use or inability to use the service.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>9. Governing Law</h2>
                    <p>
                        These Terms shall be governed by the laws of Belgium, without regard to its conflict of law
                        provisions. Any disputes shall be resolved in the courts of Antwerp, Belgium.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>10. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify or replace these Terms at any time. Material changes will be
                        notified at least 30 days before taking effect. Continued use of the Service after changes
                        constitutes acceptance of new terms.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Contact Information</h2>
                    <p>
                        For questions about these Terms, please contact us at:
                    </p>
                    <address className="legal-address">
                        <strong>Saidan Group</strong><br />
                        Turnhoutsebaan 363 box 401<br />
                        2140 Antwerpen, Belgium<br />
                        Email: <a href="mailto:contact@saidan.group">contact@saidan.group</a><br />
                        VAT: BE 1017.617.595
                    </address>
                </div>
            </div>
        </div>
    );
}
