'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ProductGrid } from '@/components';
import { getOfferings, addToCart, Offering } from '@/lib/api';
import styles from './page.module.css';

export default function ProductsPage() {
    const [products, setProducts] = useState<Offering[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getOfferings();
            setProducts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Client-side search filtering
    const filteredProducts = useMemo(() => {
        if (!search.trim()) return products;

        const query = search.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.category?.name.toLowerCase().includes(query)
        );
    }, [products, search]);

    const handleAddToCart = async (productId: string) => {
        try {
            await addToCart(productId, 1);
            window.dispatchEvent(new CustomEvent('cart-updated'));
            window.dispatchEvent(new CustomEvent('open-cart'));
        } catch (err) {
            console.error(err);
        }
    };

    if (error) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <p className="text-muted">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <header className={styles.header}>
                    <div>
                        <h1 className="h1">Products</h1>
                        <p className="meta">{filteredProducts.length} items</p>
                    </div>

                    {/* Search bar */}
                    <div className={styles.searchWrap}>
                        <Search size={16} strokeWidth={1.5} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </header>

                <ProductGrid
                    products={filteredProducts}
                    loading={loading}
                    onAddToCart={handleAddToCart}
                />

                {/* No results message */}
                {!loading && search && filteredProducts.length === 0 && (
                    <div className={styles.noResults}>
                        <p>No products match "{search}"</p>
                        <button onClick={() => setSearch('')} className={styles.clearSearch}>
                            Clear search
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
