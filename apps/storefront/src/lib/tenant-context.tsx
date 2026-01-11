'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '';

export interface TenantConfig {
    tenant: {
        id: string;
        name: string;
        slug: string;
        status: string;
    };
    branding: {
        businessName: string;
        logoUrl: string | null;
        primaryColor: string;
        darkMode: boolean;
    } | null;
    skin: {
        name: string;
        frontendUrl: string | null;
    };
    features: {
        catalog: boolean;
        ecommerce: boolean;
        bookings: boolean;
    } | null;
}

interface TenantContextType {
    config: TenantConfig | null;
    loading: boolean;
    skinName: string;
}

const TenantContext = createContext<TenantContextType>({
    config: null,
    loading: true,
    skinName: 'minimal',
});

export function TenantProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<TenantConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (TENANT_ID) {
                    headers['X-Tenant-Id'] = TENANT_ID;
                }

                const response = await fetch(`${API_BASE}/public/config`, {
                    headers,
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setConfig(data);
                }
            } catch (error) {
                console.error('Failed to fetch tenant config:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchConfig();
    }, []);

    const skinName = config?.skin?.name || 'minimal';

    return (
        <TenantContext.Provider value={{ config, loading, skinName }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    return useContext(TenantContext);
}

/**
 * Hook to get skin class name for body
 * Usage: <body className={useSkinClass()}>
 */
export function useSkinClass(): string {
    const { skinName } = useTenant();
    return `skin-${skinName}`;
}
