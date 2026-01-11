'use client';

import { useEffect, useState } from 'react';
import { Order, fetchAdminOrders, updateOrderStatus, formatPrice } from '@/lib/api';
import styles from './page.module.css';

const ORDER_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

// For demo purposes - in production, get from auth context
const DEMO_TOKEN = 'demo-admin-token';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchAdminOrders(DEMO_TOKEN, statusFilter || undefined);
            setOrders(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            setUpdatingId(orderId);
            await updateOrderStatus(DEMO_TOKEN, orderId, newStatus);
            await loadOrders();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Orders</h1>
                <p className={styles.loading}>Loading orders...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Orders</h1>
                <select
                    className={styles.filter}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All statuses</option>
                    {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </header>

            {error && <p className={styles.error}>{error}</p>}

            {orders.length === 0 ? (
                <p className={styles.empty}>No orders found</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td className={styles.orderNumber}>{order.orderNumber}</td>
                                <td>
                                    <div className={styles.customer}>
                                        <span>{order.customerName}</span>
                                        <span className={styles.email}>{order.customerEmail}</span>
                                    </div>
                                </td>
                                <td>{order.items.length} items</td>
                                <td className={styles.total}>{formatPrice(order.totalCents, order.currency)}</td>
                                <td>
                                    <span className={`${styles.status} ${styles[`status${order.status}`]}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className={styles.date}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <select
                                        className={styles.statusSelect}
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        disabled={updatingId === order.id}
                                    >
                                        {ORDER_STATUSES.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
