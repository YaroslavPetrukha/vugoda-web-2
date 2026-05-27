import type { CSSProperties, ReactNode, Key } from 'react';

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  key?: Key | null;
};

// CSS-only fade-in via animation-delay. No IntersectionObserver — SSR-safe.
// Prerendered HTML ships with content visible (final state). animation-fill-mode:backwards
// hides content during the delay period, then animates in. If JS fails or for
// non-JS crawlers the element stays visible (no JS toggling required).
// Keyframes defined in src/index.css. prefers-reduced-motion: no animation plays.
const FadeIn = ({ children, delay = 0, className = '' }: FadeInProps) => {
  const animationStyle: CSSProperties = {
    animation: `fade-in-up 0.6s ease-out ${delay}s both`,
  };

  return (
    <div
      className={className || undefined}
      style={animationStyle}
    >
      {children}
    </div>
  );
};

export default FadeIn;
