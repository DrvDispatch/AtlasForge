'use client';

import { Minus, Plus } from 'lucide-react';
import styles from './QuantityStepper.module.css';

interface Props {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export function QuantityStepper({
    value,
    onChange,
    min = 1,
    max = 99,
    disabled = false
}: Props) {
    const decrement = () => {
        if (value > min) onChange(value - 1);
    };

    const increment = () => {
        if (value < max) onChange(value + 1);
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= min && val <= max) {
            onChange(val);
        }
    };

    return (
        <div className={styles.stepper}>
            <button
                type="button"
                className={styles.btn}
                onClick={decrement}
                disabled={disabled || value <= min}
                aria-label="Decrease"
            >
                <Minus size={14} strokeWidth={2} />
            </button>

            <input
                type="number"
                className={styles.input}
                value={value}
                onChange={handleInput}
                min={min}
                max={max}
                disabled={disabled}
                aria-label="Quantity"
            />

            <button
                type="button"
                className={styles.btn}
                onClick={increment}
                disabled={disabled || value >= max}
                aria-label="Increase"
            >
                <Plus size={14} strokeWidth={2} />
            </button>
        </div>
    );
}
