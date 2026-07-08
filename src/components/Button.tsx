import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'amber' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  big?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-accent text-bg hover:bg-accent-dark',
  secondary: 'bg-surface-alt text-txt border-[1.5px] border-line hover:bg-surface-hi',
  danger: 'bg-danger text-txt hover:brightness-110',
  amber: 'bg-amber text-bg hover:brightness-110',
  ghost: 'bg-transparent text-txt border-[1.5px] border-line hover:bg-surface',
};

/** Referee-sized button: min height 56px (h-14) for fast tapping. */
export function Button({ variant = 'primary', big = false, className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`${VARIANT_CLASSES[variant]} ${big ? 'min-h-16 text-xl' : 'min-h-14 text-base'} w-full cursor-pointer rounded-2xl px-6 font-bold transition select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}
