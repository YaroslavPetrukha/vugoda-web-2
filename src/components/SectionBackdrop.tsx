type CubePosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center-right'
  | 'none';

type GlowPosition = 'top-right' | 'bottom-left' | 'top-left' | 'bottom-right' | 'none';

type SectionBackdropProps = {
  /** Розташування великого брендового куба (mark.svg) як focal-акцент. default 'bottom-right' */
  cube?: CubePosition;
  /** Розташування ледь помітного lime-glow для кольору. default 'top-right' */
  glow?: GlowPosition;
  /** показати архітектурний грід. default true */
  grid?: boolean;
  className?: string;
};

// mark.svg viewBox 220.6 × 167.4 → ratio 1.318. Тримаємо ширину, висота = w / 1.318.
const CUBE_BOX: Record<Exclude<CubePosition, 'none'>, string> = {
  'bottom-right': '-bottom-20 -right-16 w-[320px] h-[243px] md:w-[480px] md:h-[364px]',
  'bottom-left': '-bottom-20 -left-16 w-[320px] h-[243px] md:w-[480px] md:h-[364px]',
  'top-right': '-top-20 -right-16 w-[320px] h-[243px] md:w-[480px] md:h-[364px]',
  'top-left': '-top-20 -left-16 w-[320px] h-[243px] md:w-[480px] md:h-[364px]',
  'center-right':
    'top-1/2 -translate-y-1/2 -right-24 w-[360px] h-[273px] md:w-[560px] md:h-[425px]',
};

const CUBE_POSITION: Record<Exclude<CubePosition, 'none'>, string> = {
  'bottom-right': 'bottom right',
  'bottom-left': 'bottom left',
  'top-right': 'top right',
  'top-left': 'top left',
  'center-right': 'center right',
};

const GLOW_GRADIENT: Record<Exclude<GlowPosition, 'none'>, string> = {
  'top-right':
    'radial-gradient(50% 45% at 86% 14%, rgb(var(--accent-rgb) / 0.08), transparent 72%)',
  'bottom-left':
    'radial-gradient(50% 45% at 12% 88%, rgb(var(--accent-rgb) / 0.08), transparent 72%)',
  'top-left':
    'radial-gradient(50% 45% at 14% 14%, rgb(var(--accent-rgb) / 0.08), transparent 72%)',
  'bottom-right':
    'radial-gradient(50% 45% at 86% 88%, rgb(var(--accent-rgb) / 0.08), transparent 72%)',
};

// Архітектурний лайм-грід (square, 1.25px @ 88px). Маска тримає грід присутнім
// у верхньому band (зона заголовка), плавно гасне донизу — щоб не «боротися»
// з непрозорими картками у середині card-heavy секцій.
const GRID_LAYER = `linear-gradient(rgb(var(--accent-rgb) / 0.09) 1.25px, transparent 1.25px), linear-gradient(90deg, rgb(var(--accent-rgb) / 0.09) 1.25px, transparent 1.25px)`;
const GRID_MASK =
  'radial-gradient(135% 110% at 50% 0%, black 28%, transparent 78%)';

/**
 * Композитний фон секції — замінює anti-pattern «tile-stamp isometric-grid @ 5%»
 * (візуальний шум, невидимий cross-device). 3 шари:
 *   1. Архітектурний лайм-грід (top-present маска → видимий у band заголовка)
 *   2. Ледь помітний lime radial-glow — додає кольору, блоки не «пусті»
 *   3. Великий брендовий куб (mark.svg, lime у самому SVG) — focal-акцент у відкритій зоні
 *
 * Розміщувати ВСЕРЕДИНІ section з position:relative + overflow-hidden, ПЕРЕД контентом.
 * Контент секції загортати у relative z-10.
 */
const SectionBackdrop = ({
  cube = 'bottom-right',
  glow = 'top-right',
  grid = true,
  className = '',
}: SectionBackdropProps) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
    >
      {/* 1 — архітектурний грід, присутній у верхньому band */}
      {grid && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: GRID_LAYER,
            backgroundSize: '88px 88px',
            backgroundPosition: '-1px -1px',
            maskImage: GRID_MASK,
            WebkitMaskImage: GRID_MASK,
          }}
        />
      )}

      {/* 2 — lime glow для кольору */}
      {glow !== 'none' && (
        <div
          className="absolute inset-0"
          style={{ background: GLOW_GRADIENT[glow] }}
        />
      )}

      {/* 3 — великий брендовий куб (lime у SVG), focal-акцент */}
      {cube !== 'none' && (
        <div
          className={`absolute opacity-[0.16] ${CUBE_BOX[cube]}`}
          style={{
            backgroundImage: "url('/mark.svg')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: CUBE_POSITION[cube],
          }}
        />
      )}
    </div>
  );
};

export default SectionBackdrop;
