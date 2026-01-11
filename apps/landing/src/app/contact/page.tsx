import { Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us - AtlasForge',
    description: 'Get in touch with the AtlasForge team. We are here to help with any questions about our platform.',
};

export default function ContactPage() {
    return (
        <div className="legal-page">
            <div className="container">
                <div className="legal-header">
                    <Mail size={48} className="legal-icon" />
                    <h1>Contact Us</h1>
                    <p>We would love to hear from you. Get in touch with our team.</p>
                </div>

                <div className="contact-grid">
                    <div className="contact-card">
                        <div className="contact-icon">
                            <Mail size={20} />
                        </div>
                        <h3>Email</h3>
                        <p>For general inquiries and support</p>
                        <a href="mailto:saidangroup@outlook.com" className="contact-link">
                            saidangroup@outlook.com
                        </a>
                    </div>

                    <div className="contact-card">
                        <div className="contact-icon">
                            <MapPin size={20} />
                        </div>
                        <h3>Address</h3>
                        <p>Our headquarters</p>
                        <address className="contact-address">
                            Saidan Group<br />
                            Turnhoutsebaan 363 box 401<br />
                            2140 Antwerpen, Belgium
                        </address>
                    </div>

                    <div className="contact-card">
                        <div className="contact-icon">
                            <Clock size={20} />
                        </div>
                        <h3>Business Hours</h3>
                        <p>When we&apos;re available</p>
                        <div className="contact-hours">
                            Monday – Friday: 9:00 – 18:00 CET<br />
                            Saturday – Sunday: Closed
                        </div>
                    </div>

                    <div className="contact-card">
                        <div className="contact-icon">
                            <MessageSquare size={20} />
                        </div>
                        <h3>Response Time</h3>
                        <p>What to expect</p>
                        <div className="contact-response">
                            We typically respond within 24–48 business hours.
                            Priority support available for enterprise customers.
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Company Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <strong>Legal Name:</strong> Saidan Group
                        </div>
                        <div className="info-item">
                            <strong>VAT Number:</strong> BE 1017.617.595
                        </div>
                        <div className="info-item">
                            <strong>Country:</strong> Belgium
                        </div>
                        <div className="info-item">
                            <strong>Business Type:</strong> Technology Services
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>How to Reach Us</h2>
                    <p>
                        For the fastest response, please email us at <a href="mailto:saidangroup@outlook.com">saidangroup@outlook.com</a> with
                        a clear subject line describing your inquiry.
                    </p>
                    <p>
                        For billing inquiries, include your account email and any relevant invoice numbers.
                        For technical support, please describe the issue in detail.
                    </p>
                </div>
            </div>
        </div>
    );
}
