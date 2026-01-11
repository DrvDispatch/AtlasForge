import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';
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
                            <Mail size={24} />
                        </div>
                        <h3>Email</h3>
                        <p>For general inquiries and support</p>
                        <a href="mailto:contact@saidan.group" className="contact-link">
                            contact@saidan.group
                        </a>
                    </div>

                    <div className="contact-card">
                        <div className="contact-icon">
                            <MapPin size={24} />
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
                            <Clock size={24} />
                        </div>
                        <h3>Business Hours</h3>
                        <p>When we are available</p>
                        <div className="contact-hours">
                            Monday - Friday: 9:00 - 18:00 CET<br />
                            Saturday - Sunday: Closed
                        </div>
                    </div>

                    <div className="contact-card">
                        <div className="contact-icon">
                            <MessageSquare size={24} />
                        </div>
                        <h3>Response Time</h3>
                        <p>Expected response times</p>
                        <div className="contact-response">
                            General inquiries: 24-48 hours<br />
                            Technical support: 12-24 hours<br />
                            Urgent issues: 4-8 hours
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
                            <strong>EU Member State:</strong> Yes
                        </div>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Support Channels</h2>
                    <p>
                        For the fastest response, please email us at <a href="mailto:contact@saidan.group">contact@saidan.group</a> with
                        a detailed description of your inquiry. Include your account email and any relevant order numbers if applicable.
                    </p>
                    <p>
                        For platform-related technical issues, please include:
                    </p>
                    <ul>
                        <li>Your tenant/store name</li>
                        <li>Description of the issue</li>
                        <li>Steps to reproduce (if applicable)</li>
                        <li>Any error messages received</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
