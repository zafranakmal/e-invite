import { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type Variant = 'dark' | 'light' | 'outlined' | 'brown';

const VARIANTS: Record<Variant, CSSProperties> = {
  dark: { background: 'var(--c-ink)', color: 'var(--c-bg)', border: 'none' },
  light: { background: 'var(--c-white)', color: 'var(--c-ink)', border: '1px solid var(--c-line-soft)' },
  outlined: { background: 'transparent', color: 'var(--c-ink)', border: '1px solid var(--c-line)' },
  // Elementor template pill: #504534 with a soft drop shadow, Bellefair label
  brown: {
    background: 'var(--c-el-brown)',
    color: '#fff',
    border: 'none',
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    boxShadow: '0 0 10px 0 rgba(0,0,0,0.5)',
  },
};

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--s-2)',
  borderRadius: 'var(--r-pill)',
  minHeight: 44,
  padding: '0.6rem 1.4rem',
  fontFamily: 'var(--font-body)',
  fontSize: '0.95rem',
  cursor: 'pointer',
  textDecoration: 'none',
  transition:
    'border-color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)',
};

interface PillButtonAsButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
  variant?: Variant;
  icon?: ReactNode;
}

interface PillButtonAsAnchor extends AnchorHTMLAttributes<HTMLAnchorElement> {
  as: 'a';
  variant?: Variant;
  icon?: ReactNode;
}

type PillButtonProps = PillButtonAsButton | PillButtonAsAnchor;

export default function PillButton({ as = 'button', variant = 'dark', icon, children, style, ...rest }: PillButtonProps) {
  const combinedStyle = { ...baseStyle, ...VARIANTS[variant], ...style };

  if (as === 'a') {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} style={combinedStyle}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} style={combinedStyle}>
      {icon}
      {children}
    </button>
  );
}
