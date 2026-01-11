'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function CreateTenantPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        slug: '',
        primaryDomain: 'localhost',
        businessName: '',
        email: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Auto-generate slug from name
        if (name === 'name') {
            const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            setForm(prev => ({ ...prev, slug, businessName: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const response = await fetch(`${API_BASE}/owner/tenants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: form.name,
                    slug: form.slug,
                    primaryDomain: form.primaryDomain,
                    config: {
                        businessName: form.businessName || form.name,
                        email: form.email || undefined,
                    },
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create tenant');
            }

            const tenant = await response.json();
            router.push(`/owner/tenants/${tenant.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create tenant');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/owner/dashboard" className={styles.back}>
                    <ChevronLeft size={16} strokeWidth={1.5} />
                    Back to tenants
                </Link>

                <h1 className={styles.title}>Create Tenant</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.field}>
                        <label>Tenant Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Acme Store"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Slug *</label>
                        <input
                            type="text"
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            placeholder="acme-store"
                            required
                        />
                        <span className={styles.hint}>Used in URLs</span>
                    </div>

                    <div className={styles.field}>
                        <label>Primary Domain</label>
                        <input
                            type="text"
                            name="primaryDomain"
                            value={form.primaryDomain}
                            onChange={handleChange}
                            placeholder="localhost"
                        />
                        <span className={styles.hint}>e.g., shop.example.com</span>
                    </div>

                    <div className={styles.field}>
                        <label>Business Name</label>
                        <input
                            type="text"
                            name="businessName"
                            value={form.businessName}
                            onChange={handleChange}
                            placeholder="Acme Store LLC"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Contact Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="admin@example.com"
                        />
                    </div>

                    <button type="submit" disabled={submitting} className={styles.submitBtn}>
                        {submitting ? 'Creating...' : 'Create Tenant'}
                    </button>
                </form>
            </div>
        </div>
    );
}
