type HeroAmbientProps = {
  /** показати CSS grid lines (architectural feel) */
  grid?: boolean;
  /** opacity сітки. default 0.08 (industry sweet spot для dark UI 2026) */
  gridOpacity?: number;
  /** показати SVG noise grain (film texture) */
  noise?: boolean;
  /** noise opacity. default 0.14 — видимий cross-device, але не "галасливий" */
  noiseOpacity?: number;
  /** показати top fade gradient — для visual rhythm з nav */
  topFade?: boolean;
  /** показати bottom vignette — focus pull до center */
  bottomVignette?: boolean;
  /** додатковий className для wrapper */
  className?: string;
};

// SVG turbulence noise, data-uri inline (~700B, browser caches)
// baseFrequency знижено з 0.85 → 0.75 — більш видимі grain particles
const NOISE_URL =
  "url(\"data:image/svg+xml;utf8,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.95 0 0 0 0 0.95 0 0 0 0.7 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Media-query bump для high-DPI displays + reduced-motion fallback.
// Style injected per-mount (duplicate rules harmless — CSS rules ідентичні).
// Якщо колись треба multiple heroes на одній сторінці — винести правила до src/index.css.

/**
 * Reusable ambient overlay для hero-блоків. Прибирає anti-pattern «bare solid bg».
 *
 * 4 шари (всі opt-in через props):
 *  • grid     — CSS 1.25px lime lines @ 88px (architectural skeleton), 8% default
 *  • noise    — SVG turbulence grain (film texture, soft-light blend), 14% default
 *  • topFade  — bg-deep → transparent (rhythm з navbar), 65% default
 *  • bottomVignette — transparent → bg-deep (focus pull до center), 55% default
 *
 * Cross-device guards:
 *  • Grid line thickness 1.25px — subpixel rendering на 2× DPR дає smooth visibility
 *  • @media (min-resolution: 2dppx) додає +30% noise opacity для retina/OLED
 *  • Не використовує `mix-blend-mode: overlay` (anti-pattern: dirty-olive)
 *  • Використовує `soft-light` blend mode — чистий film grain без зміни тону
 *
 * Розміщувати ВСЕРЕДИНІ section з position:relative, ПЕРЕД головним контентом.
 * Сам компонент має absolute inset-0, pointer-events-none, aria-hidden true.
 */
const HeroAmbient = ({
  grid = true,
  gridOpacity = 0.08,
  noise = true,
  noiseOpacity = 0.14,
  topFade = true,
  bottomVignette = true,
  className = '',
}: HeroAmbientProps) => {
  return (
    <>
      {/* Style tag — media query bump для high-DPI (retina/OLED).
          Без id: duplicates безпечні (CSS rules ідентичні). */}
      <style
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            @media (min-resolution: 2dppx) {
              [data-hero-ambient-noise] { opacity: 0.18 !important; }
            }
            @media (prefers-reduced-motion: reduce) {
              [data-hero-ambient-noise] { opacity: 0.08 !important; }
            }
          `,
        }}
      />

      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none ${className}`}
      >
        {grid && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(193,243,61,${gridOpacity}) 1.25px, transparent 1.25px), linear-gradient(90deg, rgba(193,243,61,${gridOpacity}) 1.25px, transparent 1.25px)`,
              backgroundSize: '88px 88px',
              backgroundPosition: '-1px -1px',
              maskImage:
                'radial-gradient(ellipse 95% 95% at center, black 35%, transparent 100%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 95% 95% at center, black 35%, transparent 100%)',
            }}
          />
        )}

        {noise && (
          <div
            data-hero-ambient-noise
            className="absolute inset-0"
            style={{
              backgroundImage: NOISE_URL,
              backgroundSize: '220px 220px',
              mixBlendMode: 'soft-light',
              opacity: noiseOpacity,
            }}
          />
        )}

        {topFade && (
          <div
            className="absolute inset-x-0 top-0 h-28"
            style={{
              background:
                'linear-gradient(to bottom, rgba(2,10,10,0.65) 0%, transparent 100%)',
            }}
          />
        )}

        {bottomVignette && (
          <div
            className="absolute inset-x-0 bottom-0 h-40"
            style={{
              background:
                'linear-gradient(to top, rgba(2,10,10,0.55) 0%, transparent 100%)',
            }}
          />
        )}
      </div>
    </>
  );
};

export default HeroAmbient;
