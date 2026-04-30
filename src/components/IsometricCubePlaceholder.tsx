import type { CSSProperties } from 'react';

type IsometricCubePlaceholderProps = {
  /** Fixed width in px. If omitted — width comes from `className` (Tailwind responsive). */
  size?: number;
  className?: string;
  ariaLabel?: string;
};

// mark.svg viewBox is 220.6 × 167.4 — landscape ratio ~1.318
const MARK_RATIO = 167.4 / 220.6;

const IsometricCubePlaceholder = ({
  size,
  className = '',
  ariaLabel = 'Проєкт у стадії планування',
}: IsometricCubePlaceholderProps) => {
  const inlineStyle: CSSProperties = size
    ? { width: `${size}px`, height: `${Math.round(size * MARK_RATIO)}px` }
    : { aspectRatio: '220.6 / 167.4' };

  return (
    <img
      src="/vugoda-web-2/mark.svg"
      alt={ariaLabel}
      className={className}
      style={inlineStyle}
      draggable={false}
    />
  );
};

export default IsometricCubePlaceholder;
