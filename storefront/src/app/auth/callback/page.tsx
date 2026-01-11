'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../auth.module.css';

/**
 * OAuth Callback Handler
 * 
 * Since we now use HttpOnly cookies (set by backend),
 * this page just handles the redirect after successful OAuth.
 */
export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Cookies are already set by the backend
        // Just redirect to the return URL
        const returnUrl = searchParams.get('returnUrl') || '/';
        router.replace(returnUrl);
    }, [router, searchParams]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Signing you in...</h1>
                <p className={styles.message}>Please wait while we complete your authentication.</p>
            </div>
        </div>
    );
}
