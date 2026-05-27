import { useRef, useState, useEffect, type ReactNode } from 'react';
import MarkCube from './MarkCube';
import HeroAmbient from './HeroAmbient';

type PipelineHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  caption?: string;
  children?: ReactNode;
};

/**
 * Hero для /portfolio/pipeline-04 (ROI #1 з первинного brainstorm):
 *
 * Куб mark.svg — **головний візуал** (не secondary як у ApproachHero/PartnerHero).
 * Це канон брендбуку: «проект без рендерів → ізометричний куб з брендбуку».
 * Куб як proxy для самого проекту — wireframe-знак замість рендеру.
 *
 * Marketing strategy (Pratfall Effect + Counter-positioning):
 * Замість приховувати «слабкість» (нема назви, нема рендеру) — зробити з цього
 * point of differentiation. Title визнає ситуацію → стає trust signal.
 *
 * Композиція:
 * • Left (45%): eyebrow + title + lead + 1 primary CTA
 * • Right (55%): cube ~440px max-w з floor glow + magnetic tilt по mouse
 * • БЕЗ trust bar — дублювало б StagePill секцію нижче (Occam's Razor)
 *
 * Аксіоми/моделі:
 * • Hick's Law: 1 primary CTA, secondary опціональний як text-link
 * • Pratfall Effect: title визнає «without name» → counter-positioning
 * • Hierarchy: cube + title primary, lead secondary, caption tertiary
 * • Above-fold ≤520px (компактніше без trust bar)
 * • Magnetic tilt: 5° max, prefers-reduced-motion guard
 */
const PipelineHero = ({
  eyebrow,
  title,
  lead,
  caption,
  children,
}: PipelineHeroProps) => {
  const cubeRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReducedMotion(mq.matches);
    handler();
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return; // desktop only
    const section = sectionRef.current;
    const cube = cubeRef.current;
    if (!section || !cube) return;

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      // 5° max tilt
      cube.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
    };
    const onLeave = () => {
      cube.style.transform = '';
    };

    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);
    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-bg-deep py-12 md:py-16 px-6 lg:px-8 border-b border-bg-surface overflow-hidden"
    >
      <HeroAmbient />

      {/* Cube floor glow — додає вагу під primary visual */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute right-[15%] top-1/2 -translate-y-1/2 w-[460px] h-[180px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgb(var(--accent-rgb) / 0.16) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 md:gap-14 items-center">

        {/* === LEFT: text + CTAs + trust bar === */}
        <div className="flex flex-col gap-5">
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
          {children && <div className="mt-2 flex flex-wrap gap-3 items-center">{children}</div>}
        </div>

        {/* === RIGHT: cube primary visual === */}
        <div className="relative flex flex-col items-center md:items-end gap-4">
          <div
            ref={cubeRef}
            className="relative w-full max-w-[360px] md:max-w-[440px]"
            style={{
              filter: 'drop-shadow(0 0 40px rgb(var(--accent-rgb) / 0.14))',
              transition: 'transform 460ms cubic-bezier(0.2, 0.7, 0.2, 1)',
              transformStyle: 'preserve-3d',
              perspective: '1200px',
            }}
          >
            <MarkCube className="w-full h-auto" showFaceNumbers={false} />
          </div>
          {caption && (
            <span className="block text-[10px] font-mono tracking-[0.18em] text-text-secondary uppercase max-w-[440px] text-center md:text-right">
              // {caption}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default PipelineHero;
