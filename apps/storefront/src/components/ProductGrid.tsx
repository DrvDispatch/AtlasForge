import { Offering } from '@/lib/api';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui';
import styles from './ProductGrid.module.css';

interface Props {
    products: Offering[];
    onAddToCart?: (productId: string) => void;
    loading?: boolean;
}

export function ProductGrid({ products, onAddToCart, loading }: Props) {
    if (loading) {
        return (
            <div className={styles.grid}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={styles.skeleton}>
                        <div className={styles.skeletonImage} />
                        <div className={styles.skeletonContent}>
                            <div className={styles.skeletonLine} style={{ width: '80%' }} />
                            <div className={styles.skeletonLine} style={{ width: '40%' }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return <EmptyState title="No products found" />;
    }

    return (
        <div className={styles.grid}>
            {products.map(product => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart ? () => onAddToCart(product.id) : undefined}
                />
            ))}
        </div>
    );
}
