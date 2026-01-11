import { Ban, Clock, ShoppingCart, Calendar, CreditCard } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cancellation Policy - AtlasForge',
    description: 'Cancellation policy for orders, bookings, and subscriptions on AtlasForge.',
};

export default function CancellationPage() {
    return (
        <div className="legal-page">
            <div className="container">
                <div className="legal-header">
                    <Ban size={48} className="legal-icon" />
                    <h1>Cancellation Policy</h1>
                    <p>Last updated: January 2026</p>
                </div>

                <div className="legal-section">
                    <h2>Order Cancellations</h2>
                    <div className="policy-card">
                        <div className="policy-icon">
                            <ShoppingCart size={24} />
                        </div>
                        <div className="policy-content">
                            <h3>Physical Product Orders</h3>
                            <p>
                                Orders can be cancelled free of charge before they are shipped.
                                Once an order has been shipped, please refer to our Returns Policy.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Booking Cancellations</h2>
                    <div className="policy-card">
                        <div className="policy-icon">
                            <Calendar size={24} />
                        </div>
                        <div className="policy-content">
                            <h3>Appointment &amp; Service Bookings</h3>
                            <p>Cancellation fees may apply depending on how close to the appointment you cancel:</p>

                            <div className="cancellation-table">
                                <div className="table-row header">
                                    <div>Cancellation Window</div>
                                    <div>Fee</div>
                                </div>
                                <div className="table-row">
                                    <div>48+ hours before</div>
                                    <div className="success-text">Free</div>
                                </div>
                                <div className="table-row">
                                    <div>24–48 hours before</div>
                                    <div className="warning-text">25% of booking value</div>
                                </div>
                                <div className="table-row">
                                    <div>Less than 24 hours</div>
                                    <div className="error-text">50% of booking value</div>
                                </div>
                                <div className="table-row">
                                    <div>No-show</div>
                                    <div className="error-text">100% of booking value</div>
                                </div>
                            </div>

                            <p>Note: Individual merchants may have their own cancellation policies which may vary from above.</p>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Subscription Cancellations</h2>
                    <div className="policy-card">
                        <div className="policy-icon">
                            <CreditCard size={24} />
                        </div>
                        <div className="policy-content">
                            <h3>Platform Subscriptions</h3>
                            <ul>
                                <li>Subscriptions can be cancelled at any time from your account settings</li>
                                <li>Service continues until the end of the current billing period</li>
                                <li>No partial refunds for unused time in the billing period</li>
                                <li>Your data will be retained for 30 days after cancellation</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>How to Cancel</h2>
                    <div className="steps-list">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <div>
                                <strong>Orders &amp; Bookings</strong>
                                <p>Contact the merchant directly through their storefront or order confirmation email.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <div>
                                <strong>Platform Subscriptions</strong>
                                <p>Navigate to Settings → Billing → Cancel Subscription in your dashboard.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <div>
                                <strong>Need Help?</strong>
                                <p>Contact us at saidangroup@outlook.com for assistance with any cancellation.</p>
                            </div>
                        </div>
                    </div>
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
