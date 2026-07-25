import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  note?: string;
  htmlFor: string;
  children: ReactNode;
  align?: 'center' | 'top';
  className?: string;
  labelClassName?: string;
}

export default function FormField({ label, note, htmlFor, children, align = 'center', className, labelClassName }: FormFieldProps) {
  return (
    <div className={className} style={{ display: 'grid', gap: 'var(--s-1)' }}>
      <label
        htmlFor={htmlFor}
        className={labelClassName}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--c-ink-3)',
          lineHeight: 1.4,
          alignSelf: align === 'top' ? 'start' : 'center',
        }}
      >
        {label}
        {note && (
          <>
            <br />
            <span style={{ fontSize: '0.72rem', fontStyle: 'italic', color: 'var(--c-ink-4)' }}>{note}</span>
          </>
        )}
      </label>
      {children}
    </div>
  );
}
