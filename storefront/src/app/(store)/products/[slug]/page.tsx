'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getOfferingBySlug, addToCart, Offering, formatPrice } from '@/lib/api';
import { Button, PriceTag, QuantityStepper, Divider } from '@/components/ui';
import styles from './page.module.css';

interface Props {
    params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: Props) {
    const [product, setProduct] = useState<Offering | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        params.then(async ({ slug }) => {
            try {
                const data = await getOfferingBySlug(slug);
                setProduct(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Product not found');
            } finally {
                setLoading(false);
            }
        });
    }, [params]);

    const handleAddToCart = async () => {
        if (!product) return;

        setAdding(true);
        try {
            await addToCart(product.id, quantity);
            window.dispatchEvent(new CustomEvent('cart-updated'));
            // Open cart drawer
            window.dispatchEvent(new CustomEvent('open-cart'));
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.skeleton} />
                </div>
            </section>
        );
    }

    if (error || !product) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <Link href="/products" className={styles.back}>
                        <ChevronLeft size={16} strokeWidth={1.5} />
                        Products
                    </Link>
                    <p className="text-muted mt-24">{error || 'Product not found'}</p>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <Link href="/products" className={styles.back}>
                    <ChevronLeft size={16} strokeWidth={1.5} />
                    Products
                </Link>

                <div className={styles.layout}>
                    <div className={styles.image}>
                        {product.image ? (
                            <img src={product.image} alt={product.name} />
                        ) : (
                            <div className={styles.placeholder} />
                        )}
                    </div>

                    <div className={styles.details}>
                        {product.category && (
                            <p className={`meta ${styles.category}`}>{product.category.name}</p>
                        )}

                        <h1 className="h1">{product.name}</h1>

                        {product.description && (
                            <p className={styles.description}>{product.description}</p>
                        )}

                        {/* Backend-driven attributes */}
                        {product.attributes && product.attributes.length > 0 && (
                            <div className={styles.attributes}>
                                {product.attributes.map(attr => (
                                    <div key={attr.id} className={styles.attribute}>
                                        <span className={styles.attrLabel}>{attr.definition.label}</span>
                                        <span className={styles.attrValue}>{attr.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Divider spacing="24" />

                        <div className={styles.priceRow}>
                            <PriceTag cents={product.priceCents} />
                        </div>

                        {product.priceCents !== null && (
                            <>
                                <div className={styles.quantityRow}>
                                    <span className="text-secondary">Quantity</span>
                                    <QuantityStepper
                                        value={quantity}
                                        onChange={setQuantity}
                                    />
                                </div>

                                <Button
                                    variant="primary"
                                    onClick={handleAddToCart}
                                    disabled={adding}
                                    style={{ width: '100%', marginTop: 'var(--space-16)' }}
                                >
                                    {adding ? 'Adding...' : 'Add to Cart'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
