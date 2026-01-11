'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../auth.module.css';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
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

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Loading...</h1>
                </div>
            </div>
        }>
            <CallbackHandler />
        </Suspense>
    );
}
