'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Users, Globe, Check, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
    createdAt: string;
    domains: { id: string; domain: string; isPrimary: boolean }[];
    config?: { businessName: string; email?: string };
    _count: { users: number };
}

export default function OwnerDashboard() {
    const { user, isLoggedIn, loading: authLoading } = useAuth();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const router = useRouter();

    const fetchTenants = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/owner/tenants`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setTenants(data);
            }
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && isLoggedIn && user?.role === 'OWNER') {
            fetchTenants();
        } else if (!authLoading && (!isLoggedIn || user?.role !== 'OWNER')) {
            router.push('/owner/login');
        }
    }, [authLoading, isLoggedIn, user, fetchTenants, router]);

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase())
    );

    if (authLoading || loading) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <p className="text-muted">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Tenants</h1>
                        <p className={styles.subtitle}>{tenants.length} total</p>
                    </div>
                    <Link href="/owner/tenants/new" className={styles.createBtn}>
                        <Plus size={16} strokeWidth={2} />
                        Create Tenant
                    </Link>
                </header>

                <div className={styles.searchWrap}>
                    <Search size={16} strokeWidth={1.5} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search tenants..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <span>Tenant</span>
                        <span>Domains</span>
                        <span>Users</span>
                        <span>Status</span>
                        <span></span>
                    </div>
                    {filteredTenants.map(tenant => (
                        <Link
                            key={tenant.id}
                            href={`/owner/tenants/${tenant.id}`}
                            className={styles.tableRow}
                        >
                            <div className={styles.tenantInfo}>
                                <span className={styles.tenantName}>{tenant.name}</span>
                                <span className={styles.tenantSlug}>/{tenant.slug}</span>
                            </div>
                            <div className={styles.domains}>
                                <Globe size={14} strokeWidth={1.5} />
                                <span>{tenant.domains.length}</span>
                            </div>
                            <div className={styles.users}>
                                <Users size={14} strokeWidth={1.5} />
                                <span>{tenant._count.users}</span>
                            </div>
                            <StatusChip status={tenant.status} />
                            <ChevronRight size={16} strokeWidth={1.5} className={styles.chevron} />
                        </Link>
                    ))}
                    {filteredTenants.length === 0 && (
                        <div className={styles.empty}>
                            <p>No tenants found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusChip({ status }: { status: string }) {
    const statusClass = {
        DRAFT: styles.statusDraft,
        ACTIVE: styles.statusActive,
        SUSPENDED: styles.statusSuspended,
        ARCHIVED: styles.statusArchived,
    }[status] || styles.statusDraft;

    return (
        <span className={`${styles.status} ${statusClass}`}>
            {status}
        </span>
    );
}
