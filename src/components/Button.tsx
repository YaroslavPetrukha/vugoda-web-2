import type { ReactNode, MouseEvent } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
};

type ButtonAsButton = CommonProps & {
  as?: 'button';
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  href?: never;
  external?: never;
};

type ButtonAsLink = CommonProps & {
  as: 'a';
  href: string;
  external?: boolean;
  type?: never;
  disabled?: never;
  onClick?: never;
};

type ButtonAsRouterLink = CommonProps & {
  as: 'router';
  href: string;
  type?: never;
  disabled?: never;
  external?: never;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsRouterLink;

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wider rounded-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-accent text-bg-deep font-bold hover:bg-text-primary active:translate-y-px',
  secondary:
    'bg-text-primary text-bg-deep font-bold hover:bg-accent active:translate-y-px',
  ghost:
    'border border-text-primary text-text-primary bg-transparent hover:border-accent hover:text-accent',
  link:
    'text-text-primary underline underline-offset-4 decoration-accent decoration-1 px-0 hover:text-accent',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
};

const Button = (props: ButtonProps) => {
  const {
    variant = 'primary',
    size = 'md',
    children,
    className = '',
  } = props;

  const sizeCls = props.variant === 'link' ? '' : SIZE_CLASSES[size];
  const cls = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${sizeCls} ${className}`.trim();

  if (props.as === 'a') {
    const ext = props.external
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {};
    return (
      <a
        href={props.href}
        className={cls}
        aria-label={props['aria-label']}
        {...ext}
      >
        {children}
      </a>
    );
  }

  if (props.as === 'router') {
    return (
      <Link
        to={props.href}
        className={cls}
        aria-label={props['aria-label']}
        onClick={props.onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      disabled={props.disabled}
      onClick={props.onClick}
      className={cls}
      aria-label={props['aria-label']}
    >
      {children}
    </button>
  );
};

export default Button;
