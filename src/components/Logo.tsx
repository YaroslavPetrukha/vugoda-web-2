type LogoProps = {
  size?: 40 | 56;
  className?: string;
};

const Logo = ({ size = 40, className = '' }: LogoProps) => {
  const height = size === 40 ? 40 : 56;
  return (
    <img
      src="/vugoda-web-2/logo-dark.svg"
      alt="Вигода — системний девелопмент"
      height={height}
      style={{ height: `${height}px`, width: 'auto' }}
      className={`block select-none ${className}`}
      draggable={false}
    />
  );
};

export default Logo;
