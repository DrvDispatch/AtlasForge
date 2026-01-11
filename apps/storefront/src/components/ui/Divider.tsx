import styles from './Divider.module.css';

interface Props {
    spacing?: '8' | '12' | '16' | '24' | '32';
}

export function Divider({ spacing = '16' }: Props) {
    return <hr className={`${styles.divider} ${styles[`spacing-${spacing}`]}`} />;
}
