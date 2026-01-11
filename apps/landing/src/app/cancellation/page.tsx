import { Ban, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cancellation Policy - AtlasForge',
    description: 'Learn about cancellation policies for orders, subscriptions, and bookings on AtlasForge.',
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
                    <p>
                        Orders can be cancelled under the following conditions:
                    </p>
                    <div className="policy-timeline">
                        <div className="timeline-item">
                            <div className="timeline-icon success">
                                <Clock size={20} />
                            </div>
                            <div className="timeline-content">
                                <h4>Within 1 hour of placing order</h4>
                                <p>Free cancellation with full refund</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-icon warning">
                                <Clock size={20} />
                            </div>
                            <div className="timeline-content">
                                <h4>Before shipping</h4>
                                <p>Cancellation possible, subject to processing fees</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-icon error">
                                <Clock size={20} />
                            </div>
                            <div className="timeline-content">
                                <h4>After shipping</h4>
                                <p>Cannot cancel - please see our return policy instead</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Booking Cancellations</h2>
                    <p>
                        For appointment and booking cancellations:
                    </p>
                    <div className="cancellation-table">
                        <div className="table-row header">
                            <div>Cancellation Window</div>
                            <div>Refund Amount</div>
                        </div>
                        <div className="table-row">
                            <div>More than 48 hours before</div>
                            <div className="success-text">100% refund</div>
                        </div>
                        <div className="table-row">
                            <div>24-48 hours before</div>
                            <div className="warning-text">50% refund</div>
                        </div>
                        <div className="table-row">
                            <div>Less than 24 hours before</div>
                            <div className="error-text">No refund</div>
                        </div>
                    </div>
                    <div className="highlight-box">
                        <AlertCircle size={20} />
                        <p>
                            <strong>Note:</strong> Individual stores may have stricter cancellation policies.
                            Always check the specific terms during booking.
                        </p>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Subscription Cancellations</h2>
                    <p>
                        Platform subscriptions and recurring services:
                    </p>
                    <ul>
                        <li>Subscriptions can be cancelled at any time from your account dashboard</li>
                        <li>Cancellation takes effect at the end of the current billing period</li>
                        <li>No partial refunds for unused time within a billing period</li>
                        <li>Annual subscriptions can be refunded within the first 14 days (pro-rated)</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>How to Cancel</h2>
                    <div className="steps-list">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <div>
                                <strong>Log into your account</strong>
                                <p>Access your account through the store or platform dashboard.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <div>
                                <strong>Go to Orders/Bookings</strong>
                                <p>Find the order or booking you wish to cancel.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <div>
                                <strong>Request cancellation</strong>
                                <p>Click the cancel button if available, or contact the store directly.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <div>
                                <strong>Confirmation</strong>
                                <p>You will receive an email confirming your cancellation and any applicable refund.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Exceptions</h2>
                    <p>
                        Cancellation may not be possible for:
                    </p>
                    <ul>
                        <li>Custom or personalized orders already in production</li>
                        <li>Perishable goods prepared for delivery</li>
                        <li>Digital products already delivered or accessed</li>
                        <li>Services already rendered</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>Contact Us</h2>
                    <p>
                        For cancellation assistance, please contact:
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
