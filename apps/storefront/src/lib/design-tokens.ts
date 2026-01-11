/**
 * DESIGN TOKENS — FROZEN
 * Do not add new values. Use only what's defined here.
 */

export const tokens = {
    // ═══════════════════════════════════════════════════════════
    // COLORS
    // ═══════════════════════════════════════════════════════════
    color: {
        bg: '#FFFFFF',
        bgSubtle: '#F9FAFB',

        text: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#94A3B8',

        border: '#E5E7EB',

        accent: '#4F46E5',
        accentSubtle: '#EEF2FF',

        success: '#059669',
        successSubtle: '#D1FAE5',

        error: '#DC2626',
        errorSubtle: '#FEE2E2',
    },

    // ═══════════════════════════════════════════════════════════
    // TYPOGRAPHY
    // ═══════════════════════════════════════════════════════════
    font: {
        family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
        mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    },

    fontSize: {
        h1: '32px',      // semibold
        h2: '24px',      // semibold
        body: '14px',    // regular
        meta: '12px',    // muted
    },

    fontWeight: {
        regular: 400,
        medium: 500,
        semibold: 600,
    },

    lineHeight: {
        tight: 1.25,
        normal: 1.5,
    },

    // ═══════════════════════════════════════════════════════════
    // SPACING (8px base)
    // ═══════════════════════════════════════════════════════════
    space: {
        8: '8px',
        12: '12px',
        16: '16px',
        24: '24px',
        32: '32px',
    },

    // ═══════════════════════════════════════════════════════════
    // LAYOUT
    // ═══════════════════════════════════════════════════════════
    radius: '6px',
    maxWidth: '1120px',
    transition: '120ms ease',
} as const;

// CSS custom properties string for injection
export const cssVariables = `
:root {
    /* Colors */
    --color-bg: ${tokens.color.bg};
    --color-bg-subtle: ${tokens.color.bgSubtle};
    --color-text: ${tokens.color.text};
    --color-text-secondary: ${tokens.color.textSecondary};
    --color-text-muted: ${tokens.color.textMuted};
    --color-border: ${tokens.color.border};
    --color-accent: ${tokens.color.accent};
    --color-accent-subtle: ${tokens.color.accentSubtle};
    --color-success: ${tokens.color.success};
    --color-success-subtle: ${tokens.color.successSubtle};
    --color-error: ${tokens.color.error};
    --color-error-subtle: ${tokens.color.errorSubtle};

    /* Typography */
    --font-family: ${tokens.font.family};
    --font-mono: ${tokens.font.mono};
    --font-size-h1: ${tokens.fontSize.h1};
    --font-size-h2: ${tokens.fontSize.h2};
    --font-size-body: ${tokens.fontSize.body};
    --font-size-meta: ${tokens.fontSize.meta};

    /* Spacing */
    --space-8: ${tokens.space[8]};
    --space-12: ${tokens.space[12]};
    --space-16: ${tokens.space[16]};
    --space-24: ${tokens.space[24]};
    --space-32: ${tokens.space[32]};

    /* Layout */
    --radius: ${tokens.radius};
    --max-width: ${tokens.maxWidth};
    --transition: ${tokens.transition};
}
`;
