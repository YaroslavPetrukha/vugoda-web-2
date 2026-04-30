type IsometricCubePlaceholderProps = {
  size?: number;
  className?: string;
  ariaLabel?: string;
};

// mark.svg viewBox is 220.6 × 167.4 — landscape ratio ~1.318
const MARK_RATIO = 167.4 / 220.6;

const IsometricCubePlaceholder = ({
  size = 200,
  className = '',
  ariaLabel = 'Проєкт у стадії планування',
}: IsometricCubePlaceholderProps) => {
  const height = Math.round(size * MARK_RATIO);
  return (
    <img
      src="/vugoda-web-2/mark.svg"
      alt={ariaLabel}
      width={size}
      height={height}
      className={className}
      style={{ width: `${size}px`, height: `${height}px` }}
      draggable={false}
    />
  );
};

export default IsometricCubePlaceholder;
