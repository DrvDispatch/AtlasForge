const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '';

interface FetchOptions extends RequestInit {
    json?: Record<string, unknown>;
}

/**
 * API client for AtlasForge backend
 */
async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { json, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(TENANT_ID && { 'X-Tenant-Id': TENANT_ID }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: 'include',
        body: json ? JSON.stringify(json) : options.body,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
}

// ===========================================
// OFFERINGS
// ===========================================

export interface OfferingAttribute {
    id: string;
    value: string;
    definition: {
        key: string;
        label: string;
        type: string;
    };
}

export interface Offering {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    priceCents: number | null;
    priceDisplay: string | null;
    image: string | null;
    isFeatured: boolean;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    attributes?: OfferingAttribute[];
}

export async function getOfferings(categorySlug?: string): Promise<Offering[]> {
    const params = categorySlug ? `?categorySlug=${categorySlug}` : '';
    return apiFetch<Offering[]>(`/offerings${params}`);
}

export async function getOfferingBySlug(slug: string): Promise<Offering> {
    return apiFetch<Offering>(`/offerings/${slug}`);
}

// ===========================================
// CART
// ===========================================

export interface CartItem {
    id: string;
    offeringId: string;
    offeringName: string;
    offeringSlug: string;
    offeringImage: string | null;
    quantity: number;
    priceCents: number;
    totalCents: number;
}

export interface Cart {
    id: string;
    items: CartItem[];
    itemCount: number;
    subtotalCents: number;
}

export async function getCart(): Promise<Cart> {
    return apiFetch<Cart>('/cart');
}

export async function addToCart(offeringId: string, quantity = 1): Promise<Cart> {
    return apiFetch<Cart>('/cart/items', {
        method: 'POST',
        json: { offeringId, quantity },
    });
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    return apiFetch<Cart>(`/cart/items/${itemId}`, {
        method: 'PATCH',
        json: { quantity },
    });
}

export async function removeCartItem(itemId: string): Promise<Cart> {
    return apiFetch<Cart>(`/cart/items/${itemId}`, {
        method: 'DELETE',
    });
}

// ===========================================
// CHECKOUT / ORDERS
// ===========================================

export interface CreateOrderDto {
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    shippingAddress?: {
        street: string;
        street2?: string;
        city: string;
        postalCode: string;
        country: string;
    };
    customerNotes?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    status: string;
    customerEmail: string;
    customerName: string;
    items: Array<{
        id: string;
        offeringName: string;
        quantity: number;
        priceCents: number;
        totalCents: number;
    }>;
    subtotalCents: number;
    totalCents: number;
    currency: string;
    createdAt: string;
    paidAt?: string;
}

export async function createOrder(data: CreateOrderDto): Promise<Order> {
    return apiFetch<Order>('/checkout', {
        method: 'POST',
        json: data as unknown as Record<string, unknown>,
    });
}

export async function trackOrder(orderNumber: string, email: string): Promise<Order> {
    return apiFetch<Order>(`/orders/track/${orderNumber}?email=${encodeURIComponent(email)}`);
}

/**
 * Get order history for logged-in user
 */
export async function getMyOrders(): Promise<Order[]> {
    return apiFetch<Order[]>('/orders/my');
}

// ===========================================
// HELPERS
// ===========================================

export function formatPrice(cents: number, currency = 'EUR'): string {
    const amount = cents / 100;
    const symbols: Record<string, string> = {
        EUR: '€',
        USD: '$',
        GBP: '£',
    };
    const symbol = symbols[currency] || currency + ' ';
    return `${symbol}${amount.toFixed(2)}`;
}

// ===========================================
// ADMIN: ORDERS
// ===========================================

export async function fetchAdminOrders(authToken: string, status?: string): Promise<Order[]> {
    const url = status ? `/admin/orders?status=${status}` : '/admin/orders';
    return apiFetch<Order[]>(url, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
}

export async function fetchAdminOrder(authToken: string, id: string): Promise<Order> {
    return apiFetch<Order>(`/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });
}

export async function updateOrderStatus(
    authToken: string,
    id: string,
    status: string,
    adminNotes?: string,
): Promise<Order> {
    return apiFetch<Order>(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
        json: { status, adminNotes },
    });
}
