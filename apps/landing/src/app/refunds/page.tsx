import { RotateCcw, CheckCircle, Clock, Package, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Refund Policy - AtlasForge',
    description: 'Return and refund policy for products purchased through AtlasForge storefronts.',
};

export default function RefundsPage() {
    return (
        <div className="legal-page">
            <div className="container">
                <div className="legal-header">
                    <RotateCcw size={48} className="legal-icon" />
                    <h1>Return &amp; Refund Policy</h1>
                    <p>Last updated: January 2026</p>
                </div>

                <div className="policy-card success">
                    <div className="policy-icon">
                        <CheckCircle size={24} />
                    </div>
                    <div className="policy-content">
                        <h3>30-Day Return Window</h3>
                        <p>We offer a 30-day return period for most physical goods purchased through AtlasForge storefronts.</p>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Eligibility for Returns</h2>
                    <p>To be eligible for a return, items must be:</p>
                    <ul>
                        <li>Returned within 30 days of delivery</li>
                        <li>In original, unused condition</li>
                        <li>In original packaging with all tags attached</li>
                        <li>Accompanied by proof of purchase</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>Non-Returnable Items</h2>
                    <p>The following items cannot be returned:</p>
                    <ul>
                        <li>Digital products and downloads</li>
                        <li>Personalized or custom-made items</li>
                        <li>Perishable goods</li>
                        <li>Intimate/hygiene products</li>
                        <li>Gift cards</li>
                        <li>Items marked as final sale</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>Refund Process</h2>
                    <div className="policy-timeline">
                        <div className="timeline-item">
                            <div className="timeline-icon success">
                                <Package size={18} />
                            </div>
                            <div className="timeline-content">
                                <h4>Step 1: Initiate Return</h4>
                                <p>Contact the merchant directly through their storefront to request a return.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-icon success">
                                <RotateCcw size={18} />
                            </div>
                            <div className="timeline-content">
                                <h4>Step 2: Ship Item</h4>
                                <p>Return the item to the merchant&apos;s specified address within 14 days.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-icon success">
                                <Clock size={18} />
                            </div>
                            <div className="timeline-content">
                                <h4>Step 3: Receive Refund</h4>
                                <p>Refunds are processed within 5–10 business days after receiving the returned item.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Refund Method</h2>
                    <p>
                        Refunds will be credited to the original payment method. Please note that it may
                        take an additional 2–5 business days for the refund to appear on your statement,
                        depending on your financial institution.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Disputes</h2>
                    <p>
                        If you have a dispute with a merchant, please first attempt to resolve it directly with them.
                        If you cannot reach a resolution, contact our support team:
                    </p>
                    <ul>
                        <li>Reach out to AtlasForge support at <a href="mailto:saidangroup@outlook.com">saidangroup@outlook.com</a></li>
                        <li>Include your order number and description of the issue</li>
                        <li>Provide any relevant communication with the merchant</li>
                    </ul>
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
