import { formatPrice } from '@/lib/api';
import styles from './PriceTag.module.css';

interface Props {
    cents: number | null;
    currency?: string;
}

export function PriceTag({ cents, currency = 'EUR' }: Props) {
    if (cents === null) {
        return <span className={styles.quote}>Price on request</span>;
    }

    return <span className={styles.price}>{formatPrice(cents, currency)}</span>;
}
