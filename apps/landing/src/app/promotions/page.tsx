import { Gift, AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Promotions Terms - AtlasForge',
    description: 'Terms and conditions for promotional offers and discounts on AtlasForge.',
};

export default function PromotionsPage() {
    return (
        <div className="legal-page">
            <div className="container">
                <div className="legal-header">
                    <Gift size={48} className="legal-icon" />
                    <h1>Promotions Terms & Conditions</h1>
                    <p>Last updated: January 2026</p>
                </div>

                <div className="legal-section">
                    <h2>General Promotion Terms</h2>
                    <p>
                        The following terms apply to all promotional offers, discount codes, and special campaigns
                        offered through AtlasForge and its affiliated storefronts.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Promotional Code Usage</h2>
                    <div className="policy-card">
                        <div className="policy-icon">
                            <Gift size={24} />
                        </div>
                        <div className="policy-content">
                            <h3>How Promo Codes Work</h3>
                            <ul>
                                <li>Enter valid promo codes at checkout before completing payment</li>
                                <li>Only one promotional code can be used per order</li>
                                <li>Promotional codes cannot be combined with other offers unless stated</li>
                                <li>Codes are case-sensitive and must be entered exactly as provided</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Validity & Expiration</h2>
                    <div className="policy-card">
                        <div className="policy-icon">
                            <Calendar size={24} />
                        </div>
                        <div className="policy-content">
                            <h3>Time Limits</h3>
                            <ul>
                                <li>All promotions have specific start and end dates</li>
                                <li>Expired codes will not be honored</li>
                                <li>Promotions may end early if maximum redemptions are reached</li>
                                <li>Time zones are based on Central European Time (CET)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Eligibility</h2>
                    <p>Unless otherwise specified:</p>
                    <ul>
                        <li>Promotions are available to all registered users</li>
                        <li>Some promotions may be limited to first-time customers only</li>
                        <li>Minimum purchase amounts may apply</li>
                        <li>Certain product categories may be excluded</li>
                        <li>Promotions are not valid on gift cards or previous purchases</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>Modifications & Cancellations</h2>
                    <div className="highlight-box warning">
                        <AlertCircle size={20} />
                        <div>
                            <p>
                                <strong>Important:</strong> Saidan Group and affiliated stores reserve the right to:
                            </p>
                            <ul>
                                <li>Modify or cancel any promotion at any time</li>
                                <li>Limit quantities or exclude certain items</li>
                                <li>Revoke promotional benefits if fraud is suspected</li>
                                <li>Correct any errors in promotion details</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Refunds on Promotional Orders</h2>
                    <p>
                        When returning items purchased with a promotional discount:
                    </p>
                    <ul>
                        <li>Refunds are calculated based on the discounted price paid</li>
                        <li>If a minimum purchase requirement is no longer met after partial return, the promotion may be voided</li>
                        <li>Free gift items must be returned with the main purchase to qualify for full refund</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>Current Promotions</h2>
                    <div className="policy-card success">
                        <div className="policy-icon">
                            <CheckCircle size={24} />
                        </div>
                        <div className="policy-content">
                            <h3>No Active Platform-Wide Promotions</h3>
                            <p>
                                There are currently no active platform-wide promotions. Individual stores may offer
                                their own discounts and special offers. Please check each store for current deals.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Contact Us</h2>
                    <p>
                        For questions about promotions, please contact:
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
