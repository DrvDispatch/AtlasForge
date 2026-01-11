'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Globe, Plus, Trash2, UserPlus, Check, Ban, Copy } from 'lucide-react';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    status: string;
    createdAt: string;
    domains: { id: string; domain: string; isPrimary: boolean }[];
    config: { businessName: string; email?: string } | null;
    _count: { users: number };
}

interface Props {
    params: Promise<{ id: string }>;
}

export default function TenantDetailPage({ params }: Props) {
    const router = useRouter();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [newDomain, setNewDomain] = useState('');
    const [adminForm, setAdminForm] = useState({ email: '', name: '' });
    const [credentials, setCredentials] = useState<{ email: string; oneTimePassword: string } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTenant = useCallback(async (id: string) => {
        try {
            const response = await fetch(`${API_BASE}/owner/tenants/${id}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setTenant(data);
            }
        } catch (error) {
            console.error('Failed to fetch tenant:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        params.then(({ id }) => fetchTenant(id));
    }, [params, fetchTenant]);

    const addDomain = async () => {
        if (!tenant || !newDomain.trim()) return;
        setActionLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/owner/tenants/${tenant.id}/domains`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ domain: newDomain }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to add domain');
            }
            setNewDomain('');
            fetchTenant(tenant.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add domain');
        } finally {
            setActionLoading(false);
        }
    };

    const removeDomain = async (domainId: string) => {
        if (!confirm('Remove this domain?')) return;
        try {
            await fetch(`${API_BASE}/owner/domains/${domainId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (tenant) fetchTenant(tenant.id);
        } catch (err) {
            console.error(err);
        }
    };

    const provisionAdmin = async () => {
        if (!tenant || !adminForm.email.trim() || !adminForm.name.trim()) return;
        setActionLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/owner/tenants/${tenant.id}/provision-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(adminForm),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to provision admin');
            }
            const data = await response.json();
            setCredentials({ email: data.email, oneTimePassword: data.oneTimePassword });
            setAdminForm({ email: '', name: '' });
            fetchTenant(tenant.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to provision admin');
        } finally {
            setActionLoading(false);
        }
    };

    const updateStatus = async (status: 'ACTIVE' | 'SUSPENDED') => {
        if (!tenant) return;
        const confirm_ = confirm(`${status === 'ACTIVE' ? 'Activate' : 'Suspend'} this tenant?`);
        if (!confirm_) return;
        setActionLoading(true);
        try {
            await fetch(`${API_BASE}/owner/tenants/${tenant.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status }),
            });
            fetchTenant(tenant.id);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const copyCredentials = () => {
        if (!credentials) return;
        navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.oneTimePassword}`);
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <p>Tenant not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/owner/dashboard" className={styles.back}>
                    <ChevronLeft size={16} strokeWidth={1.5} />
                    Back to tenants
                </Link>

                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{tenant.name}</h1>
                        <p className={styles.slug}>/{tenant.slug}</p>
                    </div>
                    <span className={`${styles.status} ${styles[`status${tenant.status}`]}`}>
                        {tenant.status}
                    </span>
                </header>

                {error && <p className={styles.error}>{error}</p>}

                {/* One-time credentials display */}
                {credentials && (
                    <div className={styles.credentialsCard}>
                        <h3>⚠️ Admin Credentials (One-Time Display)</h3>
                        <div className={styles.credentialsRow}>
                            <span>Email:</span>
                            <code>{credentials.email}</code>
                        </div>
                        <div className={styles.credentialsRow}>
                            <span>Password:</span>
                            <code>{credentials.oneTimePassword}</code>
                        </div>
                        <button onClick={copyCredentials} className={styles.copyBtn}>
                            <Copy size={14} /> Copy credentials
                        </button>
                        <p className={styles.credentialsWarning}>
                            This password is shown once only. The admin must change it on first login.
                        </p>
                    </div>
                )}

                {/* Domains */}
                <section className={styles.section}>
                    <h2><Globe size={18} strokeWidth={1.5} /> Domains</h2>
                    <div className={styles.domainList}>
                        {tenant.domains.map(d => (
                            <div key={d.id} className={styles.domainItem}>
                                <span>{d.domain}</span>
                                {d.isPrimary && <span className={styles.primaryBadge}>Primary</span>}
                                <button onClick={() => removeDomain(d.id)} className={styles.iconBtn}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className={styles.addDomain}>
                        <input
                            type="text"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            placeholder="shop.example.com"
                        />
                        <button onClick={addDomain} disabled={actionLoading}>
                            <Plus size={14} /> Add
                        </button>
                    </div>
                </section>

                {/* Admin Provisioning */}
                <section className={styles.section}>
                    <h2><UserPlus size={18} strokeWidth={1.5} /> Provision Admin</h2>
                    <p className={styles.sectionDesc}>Create initial admin user for this tenant</p>
                    <div className={styles.provisionForm}>
                        <input
                            type="text"
                            value={adminForm.name}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Admin name"
                        />
                        <input
                            type="email"
                            value={adminForm.email}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="admin@example.com"
                        />
                        <button onClick={provisionAdmin} disabled={actionLoading}>
                            <UserPlus size={14} /> Create Admin
                        </button>
                    </div>
                </section>

                {/* Actions */}
                <section className={styles.section}>
                    <h2>Actions</h2>
                    <div className={styles.actions}>
                        {tenant.status !== 'ACTIVE' && (
                            <button onClick={() => updateStatus('ACTIVE')} className={styles.activateBtn} disabled={actionLoading}>
                                <Check size={14} /> Activate Tenant
                            </button>
                        )}
                        {tenant.status === 'ACTIVE' && (
                            <button onClick={() => updateStatus('SUSPENDED')} className={styles.suspendBtn} disabled={actionLoading}>
                                <Ban size={14} /> Suspend Tenant
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
