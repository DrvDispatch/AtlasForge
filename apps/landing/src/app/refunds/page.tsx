import { RotateCcw, Package, Clock, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Return & Refund Policy - AtlasForge',
    description: 'Learn about our return and refund policies for physical goods and digital services.',
};

export default function RefundsPage() {
    return (
        <div className="legal-page">
            <div className="container">
                <div className="legal-header">
                    <RotateCcw size={48} className="legal-icon" />
                    <h1>Return & Refund Policy</h1>
                    <p>Last updated: January 2026</p>
                </div>

                <div className="legal-section">
                    <h2>Overview</h2>
                    <p>
                        This policy outlines the refund and return procedures for purchases made through AtlasForge-powered
                        storefronts. Each tenant (store) may have additional policies that supplement these terms.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Physical Goods Returns</h2>
                    <div className="policy-card">
                        <div className="policy-icon">
                            <Package size={24} />
                        </div>
                        <div className="policy-content">
                            <h3>30-Day Return Window</h3>
                            <p>
                                Physical products purchased through AtlasForge storefronts may be returned within 30 days
                                of delivery for a full refund, provided they are:
                            </p>
                            <ul>
                                <li>Unused and in original condition</li>
                                <li>In original packaging with all tags attached</li>
                                <li>Accompanied by proof of purchase</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Return Process</h2>
                    <div className="steps-list">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <div>
                                <strong>Contact the Store</strong>
                                <p>Email the store directly using the contact information on your order confirmation.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <div>
                                <strong>Receive Return Authorization</strong>
                                <p>You will receive a return authorization number and shipping instructions.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <div>
                                <strong>Ship the Item</strong>
                                <p>Pack the item securely and ship it using a tracked shipping method.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <div>
                                <strong>Receive Refund</strong>
                                <p>Refunds are processed within 5-10 business days after we receive the returned item.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Refund Processing</h2>
                    <div className="policy-card">
                        <div className="policy-icon">
                            <CreditCard size={24} />
                        </div>
                        <div className="policy-content">
                            <h3>Payment Method</h3>
                            <p>
                                Refunds are issued to the original payment method used for the purchase.
                                Processing times vary by payment provider:
                            </p>
                            <ul>
                                <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                                <li><strong>Bank Transfers:</strong> 3-5 business days</li>
                                <li><strong>Digital Wallets:</strong> 1-3 business days</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Non-Refundable Items</h2>
                    <div className="highlight-box warning">
                        <AlertCircle size={20} />
                        <div>
                            <p>The following items cannot be returned or refunded:</p>
                            <ul>
                                <li>Digital products or downloads once accessed</li>
                                <li>Personalized or custom-made items</li>
                                <li>Perishable goods</li>
                                <li>Items marked as final sale</li>
                                <li>Gift cards</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Damaged or Defective Items</h2>
                    <div className="policy-card success">
                        <div className="policy-icon">
                            <CheckCircle size={24} />
                        </div>
                        <div className="policy-content">
                            <h3>We Have Got You Covered</h3>
                            <p>
                                If you receive a damaged or defective item, please contact the store within 48 hours
                                of delivery. We will provide a full refund or replacement at no additional cost,
                                including return shipping.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Dispute Resolution</h2>
                    <p>
                        If you are unsatisfied with a refund decision, you may:
                    </p>
                    <ol>
                        <li>Contact the store directly to escalate your concern</li>
                        <li>Reach out to AtlasForge support at <a href="mailto:contact@saidan.group">contact@saidan.group</a></li>
                        <li>File a dispute with your payment provider (Stripe)</li>
                    </ol>
                    <p>
                        We are committed to resolving all disputes fairly and promptly.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Contact Us</h2>
                    <p>
                        For questions about this policy, please contact:
                    </p>
                    <address className="legal-address">
                        <strong>Saidan Group</strong><br />
                        Email: <a href="mailto:contact@saidan.group">contact@saidan.group</a><br />
                        Address: Turnhoutsebaan 363 box 401, 2140 Antwerpen, Belgium
                    </address>
                </div>
            </div>
        </div>
    );
}
