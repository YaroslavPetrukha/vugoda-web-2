import type { ReactNode } from 'react';
import MarkCube from './MarkCube';
import HeroAmbient from './HeroAmbient';

type TrustItem = { label: string; value: string };

type PortfolioHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  trust?: TrustItem[];
  children?: ReactNode;
};

const DEFAULT_TRUST: TrustItem[] = [
  { label: 'ЄДРПОУ', value: '44876801' },
  { label: 'Технологія', value: 'монолітно-каркас' },
  { label: 'У роботі', value: 'ЖК Lakeview · бізнес-клас' },
  { label: 'Здача', value: '2027' },
];

/**
 * Hero для /portfolio (System/Method pattern, axiom-driven):
 *
 * • Hierarchy: text 3fr (md:order-1, primary) + MarkCube 2fr (md:order-2, secondary)
 * • Above-the-fold ≤650px: py-12 md:py-16
 * • Trust signals first: 4-cell canonical row (ЄДРПОУ / Технологія / У роботі / Здача)
 *   — без «4 pipeline» бо клієнт заборонив публічно
 * • Specificity: конкретні значення з canonical pool (project_design_pilots)
 * • Don't make me think: куб passive wireframe drawing on view (faceHi=0)
 * • Conversion gravity: 1 primary CTA + 1 text-link secondary через children
 *   (Hick's Law — не 2 повноцінні size=lg кнопки)
 * • Mobile-first: trust row stacks 2×2 на sm, 4×1 на md+. Cube max 240px sm, 380px md+
 *
 * Voice: декларативний короткий title, restrained lead. Без «преміум / мрія / унікальний».
 *
 * Reuses InvestorHero/PartnerHero/ApproachHero structure для cross-page coherence.
 */
const PortfolioHero = ({
  eyebrow,
  title,
  lead,
  trust = DEFAULT_TRUST,
  children,
}: PortfolioHeroProps) => {
  return (
    <section className="relative bg-bg-deep py-12 md:py-16 px-6 lg:px-8 border-b border-bg-surface overflow-hidden">

      <HeroAmbient />

      {/* Subtle floor glow під cube — weight без шуму (mirror ApproachHero) */}
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

        {/* === CUBE — secondary visual, brand mark === */}
        <div className="md:order-2 relative flex items-center justify-center md:justify-end">
          <div
            className="relative w-full max-w-[240px] sm:max-w-[300px] md:max-w-[380px]"
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
            <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-xl hyphens-auto">
              {lead}
            </p>
          )}
          {children && <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">{children}</div>}

          {/* Trust row — 4-cell canonical pool. Mobile 2×2, md+ 4×1 */}
          <dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-5 border-t border-bg-surface">
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

export default PortfolioHero;
