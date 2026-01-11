import { FileText, Scale, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - AtlasForge',
    description: 'Terms and conditions for using the AtlasForge platform and services.',
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
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the AtlasForge platform (&quot;Service&quot;), you agree to be bound by these
                        Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not
                        access the Service.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>2. Description of Service</h2>
                    <p>
                        AtlasForge provides a multi-tenant software-as-a-service (SaaS) platform that enables
                        businesses to create and manage online storefronts, process payments, and handle bookings.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>3. User Accounts</h2>
                    <p>
                        When you create an account, you must provide accurate and complete information.
                        You are responsible for:
                    </p>
                    <ul>
                        <li>Maintaining the security of your account credentials</li>
                        <li>All activities that occur under your account</li>
                        <li>Notifying us immediately of any unauthorized access</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>4. Payment Terms</h2>
                    <p>
                        Payment processing is handled through Stripe. By using our Service, you also agree
                        to Stripe&apos;s Services Agreement. Platform fees and subscription costs are billed
                        according to your selected plan.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>5. Acceptable Use</h2>
                    <p>You agree not to use the Service to:</p>
                    <ul>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe on intellectual property rights</li>
                        <li>Transmit harmful code or malware</li>
                        <li>Engage in fraudulent activities</li>
                        <li>Harass, abuse, or harm others</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>6. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are owned by
                        Saidan Group and are protected by international copyright, trademark, and other
                        intellectual property laws.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>7. Termination</h2>
                    <p>
                        We may terminate or suspend your account immediately, without prior notice, for
                        conduct that we believe violates these Terms or is harmful to other users, us,
                        or third parties.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>8. Limitation of Liability</h2>
                    <p>
                        In no event shall Saidan Group be liable for any indirect, incidental, special,
                        consequential, or punitive damages arising out of your use of the Service.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>9. Governing Law</h2>
                    <p>
                        These Terms shall be governed by the laws of Belgium. Any disputes shall be
                        resolved in the courts of Antwerp, Belgium.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>10. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will notify users
                        of any material changes via email or through the Service.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Contact Information</h2>
                    <address className="legal-address">
                        Saidan Group<br />
                        Turnhoutsebaan 363 box 401<br />
                        2140 Antwerpen, Belgium<br /><br />
                        Email: <a href="mailto:saidangroup@outlook.com">saidangroup@outlook.com</a><br />
                        VAT: BE 1017.617.595
                    </address>
                </div>
            </div>
        </div>
    );
}
