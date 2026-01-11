'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');

    if (registered) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Verify Your Email</h1>
                    <p className={styles.message}>
                        We've sent a verification link to your email address.
                        Please check your inbox and click the link to verify your account.
                    </p>
                    <p className={styles.footer}>
                        <Link href="/auth/login">Back to Sign In</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Email Verification</h1>
                <p className={styles.message}>
                    Please check your email for a verification link.
                </p>
                <p className={styles.footer}>
                    <Link href="/auth/login">Back to Sign In</Link>
                </p>
            </div>
        </div>
    );
}
