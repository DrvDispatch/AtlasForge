'use client';

import Link from 'next/link';
import { Offering } from '@/lib/api';
import { PriceTag } from '@/components/ui';
import styles from './ProductCard.module.css';

interface Props {
    product: Offering;
    onAddToCart?: () => void;
}

export function ProductCard({ product, onAddToCart }: Props) {
    return (
        <article className={styles.card}>
            <Link href={`/products/${product.slug}`} className={styles.imageLink}>
                <div className={styles.image}>
                    {product.image ? (
                        <img src={product.image} alt={product.name} />
                    ) : (
                        <div className={styles.placeholder} />
                    )}
                </div>
            </Link>

            <div className={styles.content}>
                <Link href={`/products/${product.slug}`} className={styles.name}>
                    {product.name}
                </Link>

                <div className={styles.footer}>
                    <PriceTag cents={product.priceCents} />

                    {onAddToCart && product.priceCents !== null && (
                        <button
                            className={styles.addBtn}
                            onClick={(e) => {
                                e.preventDefault();
                                onAddToCart();
                            }}
                        >
                            Add
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
