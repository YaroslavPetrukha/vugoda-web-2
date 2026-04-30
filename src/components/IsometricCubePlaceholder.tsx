type IsometricCubePlaceholderProps = {
  size?: number;
  className?: string;
  ariaLabel?: string;
};

const IsometricCubePlaceholder = ({
  size = 200,
  className = '',
  ariaLabel = 'Проєкт у стадії планування',
}: IsometricCubePlaceholderProps) => {
  const height = (size * 220) / 200;
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={height}
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      >
        {/* top face */}
        <polygon points="100,20 180,60 100,100 20,60" />
        {/* left face */}
        <polygon points="20,60 100,100 100,200 20,160" />
        {/* right face */}
        <polygon points="180,60 100,100 100,200 180,160" />
        {/* internal edges */}
        <line x1="100" y1="100" x2="100" y2="200" opacity="0.5" />
        <line x1="20" y1="60" x2="20" y2="160" opacity="0.4" />
        <line x1="180" y1="60" x2="180" y2="160" opacity="0.4" />
      </g>
    </svg>
  );
};

export default IsometricCubePlaceholder;
