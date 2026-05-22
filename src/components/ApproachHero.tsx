import type { ReactNode } from 'react';
import MarkCube from './MarkCube';

type TrustItem = { label: string; value: string };

type ApproachHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  trust?: TrustItem[];
  children?: ReactNode;
};

const DEFAULT_TRUST: TrustItem[] = [
  { label: 'ЄДРПОУ', value: '44876801' },
  { label: 'Ліцензія', value: 'з 27.12.2019' },
  { label: 'Портфель', value: '1 активний · 4 pipeline' },
];

/**
 * Hero для /pidkhid побудоване по аксіомах веб-дизайну:
 *
 * • Hierarchy: text — primary focus (60% ширини), куб — secondary brand mark (40%)
 * • Above-the-fold ≤ 650px: py-12 md:py-16, title clamp(2rem, 4.2vw, 3.5rem)
 * • 5-second test: title + lead + CTA + trust bar читаються одразу
 * • Don't make me think: куб просто малюється і заливається, без hover/annotation
 * • Trust signals first: ЄДРПОУ + ліцензія + портфельні числа у hero
 * • Conversion gravity: primary CTA + secondary CTA, нічого зайвого
 * • Mobile-first: куб над текстом, max 220px на mobile щоб не з'їсти fold
 *
 * Children — слот для CTA кнопок.
 */
const ApproachHero = ({
  eyebrow,
  title,
  lead,
  trust = DEFAULT_TRUST,
  children,
}: ApproachHeroProps) => {
  return (
    <section className="relative bg-bg-deep py-12 md:py-16 px-6 lg:px-8 border-b border-bg-surface overflow-hidden">
      {/* Subtle floor glow під cube — додає weight без візуального шуму */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute right-[8%] top-1/2 -translate-y-1/2 w-[320px] h-[80px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(193,243,61,0.14) 0%, transparent 60%)',
          filter: 'blur(36px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 md:gap-12 items-center">

        {/* === CUBE — secondary visual, decorative brand mark === */}
        <div className="md:order-2 relative flex items-center justify-center md:justify-end">
          <div
            className="relative w-full max-w-[220px] md:max-w-[340px]"
            style={{ filter: 'drop-shadow(0 0 28px rgba(193,243,61,0.10))' }}
          >
            <MarkCube
              className="w-full h-auto"
              showFaceNumbers={false}
            />
          </div>
        </div>

        {/* === TEXT — primary focal point === */}
        <div className="md:order-1 flex flex-col gap-5">
          {eyebrow && (
            <span className="inline-block text-xs font-mono tracking-[0.18em] text-accent uppercase">
              // {eyebrow}
            </span>
          )}
          <h1 className="text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.05] tracking-tight font-bold text-text-primary max-w-3xl">
            {title}
          </h1>
          {lead && (
            <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-xl">
              {lead}
            </p>
          )}
          {children && <div className="mt-2 flex flex-wrap gap-3">{children}</div>}

          {/* Trust bar — фактаж замість слоганів */}
          <dl className="mt-6 grid grid-cols-3 gap-4 md:gap-6 pt-5 border-t border-bg-surface">
            {trust.map((item) => (
              <div key={item.label}>
                <dt className="text-[10px] font-mono tracking-[0.16em] text-text-secondary uppercase mb-1.5">
                  {item.label}
                </dt>
                <dd className="text-sm md:text-[15px] text-text-primary font-medium leading-snug">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default ApproachHero;
