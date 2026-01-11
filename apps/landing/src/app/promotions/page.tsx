import { Gift, Tag, Clock, AlertCircle, CheckCircle } from 'lucide-react';
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
                    <h1>Promotions Terms &amp; Conditions</h1>
                    <p>Last updated: January 2026</p>
                </div>

                <div className="legal-section">
                    <h2>General Terms</h2>
                    <p>
                        These terms apply to all promotional offers, discount codes, and special deals
                        available on the AtlasForge platform unless otherwise specified.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Promotional Codes</h2>
                    <div className="policy-card">
                        <div className="policy-icon">
                            <Tag size={24} />
                        </div>
                        <div className="policy-content">
                            <h3>General Code Rules</h3>
                            <ul>
                                <li>Codes are single-use unless otherwise stated</li>
                                <li>Cannot be combined with other offers unless explicitly allowed</li>
                                <li>Valid only during the specified promotional period</li>
                                <li>May have minimum purchase requirements</li>
                                <li>Not redeemable for cash</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Eligibility</h2>
                    <p>
                        Promotional offers may be restricted to:
                    </p>
                    <ul>
                        <li>New customers only</li>
                        <li>Specific geographic regions</li>
                        <li>Certain product categories</li>
                        <li>Subscription tier holders</li>
                        <li>First-time purchasers</li>
                    </ul>
                    <p>
                        Eligibility requirements will be clearly stated in the promotion details.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Merchant Promotions</h2>
                    <p>
                        Individual merchants on the AtlasForge platform may offer their own promotions.
                        Merchant-specific promotions are governed by the merchant&apos;s own terms and conditions.
                    </p>

                    <div className="highlight-box warning">
                        <AlertCircle size={20} />
                        <p>
                            Saidan Group is not responsible for merchant-issued promotions.
                            Please contact the merchant directly for issues with their promotional offers.
                        </p>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Void Conditions</h2>
                    <p>Promotions may be voided if:</p>
                    <ul>
                        <li>The promotion code has expired</li>
                        <li>The offer has been used beyond its allowed limit</li>
                        <li>Abuse or fraud is detected</li>
                        <li>Technical errors caused incorrect pricing</li>
                        <li>The promotion conflicts with regulatory requirements</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>Modifications</h2>
                    <p>
                        Saidan Group reserves the right to modify, suspend, or terminate any promotion
                        at any time without prior notice. This includes the right to disqualify any
                        user who we believe is abusing the promotion.
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
