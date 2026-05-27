import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import MarkCube, { type FaceIndex } from './MarkCube';
import HeroAmbient from './HeroAmbient';

type FaceFact = {
  num: '01' | '02' | '03';
  label: string;
  value: string;
};

type PartnerHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  facts?: FaceFact[];
  children?: ReactNode;
};

const DEFAULT_FACTS: FaceFact[] = [
  { num: '01', label: 'ЄДРПОУ',     value: '44876801' },
  { num: '02', label: 'Технологія', value: 'монолітно-каркас' },
  { num: '03', label: 'Сфера',      value: 'будівництво ж/нж будівель' },
];

const FACE_INDEX_MAP: FaceIndex[] = [1, 2, 3];

/**
 * Hero для /partneram — креативно-брендова версія:
 *
 * Куб mark.svg як «жива печатка»: кожна з 3 граней — окремий **trust signal**
 * (ЄДРПОУ, Технологія, Сфера). Автоматичний cycle через грані (3s/each)
 * з паузою на hover/focus відповідного caption.
 *
 * Семантика: «наш брендовий знак ВЖЕ містить ключові факти компанії —
 * кожна грань = окрема перевірка».
 *
 * Аксіоми:
 * • Hierarchy: title — primary, куб + captions — паралельний primary
 *   (бо для банку фактаж і ціль однаково важать)
 * • Trust signals first: 3 ключові юр.факти прямо у hero
 * • Specificity: реальний ЄДРПОУ, дата ліцензії, сфера
 * • Don't make me think: captions поряд з кубом, активна грань підсвічена
 * • 5-second test: за 5s — повний cycle через 3 факти + title видно одразу
 * • Conversion gravity: 2 CTAs у text column
 * • Reduced-motion: cycle відключений, all faces equal, hover досі працює
 */
const PartnerHero = ({
  eyebrow,
  title,
  lead,
  facts = DEFAULT_FACTS,
  children,
}: PartnerHeroProps) => {
  const items = facts.slice(0, 3);

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const [activeIdx, setActiveIdx] = useState(0); // 0 → 01, 1 → 02, 2 → 03
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect prefers-reduced-motion (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReducedMotion(mq.matches);
    handler();
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Auto-cycle через 3 грані. Pause: hover/focus, in-view false, reduced-motion
  useEffect(() => {
    if (paused || !isInView || reducedMotion) return;
    const id = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % items.length);
    }, 3200);
    return () => clearInterval(id);
  }, [paused, isInView, reducedMotion, items.length]);

  const faceHi: FaceIndex = reducedMotion ? 0 : FACE_INDEX_MAP[activeIdx];

  return (
    <section
      ref={ref}
      className="relative bg-bg-deep py-12 md:py-16 px-6 lg:px-8 border-b border-bg-surface overflow-hidden"
    >
      <HeroAmbient />

      {/* Atmospheric glow під кубом */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute left-[12%] top-1/2 -translate-y-1/2 w-[360px] h-[120px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgb(var(--accent-rgb) / 0.12) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[5fr_6fr] gap-10 md:gap-14 items-center">

        {/* === LEFT: cube + 3 face captions === */}
        <div className="order-2 md:order-1 flex flex-col gap-6 md:gap-7">
          <div
            className="relative w-full max-w-[300px] md:max-w-[340px] mx-auto md:mx-0"
            style={{ filter: 'drop-shadow(0 0 32px rgb(var(--accent-rgb) / 0.12))' }}
          >
            <MarkCube faceHi={faceHi} className="w-full h-auto" />
          </div>

          {/* face captions list */}
          <ul
            className="flex flex-col"
            role="tablist"
            aria-label="Юридичні гарантії"
          >
            {items.map((fact, i) => {
              const isActive = !reducedMotion && activeIdx === i;
              return (
                <li
                  key={fact.num}
                  className={`border-l-2 transition-colors duration-300 ${
                    isActive ? 'border-accent' : 'border-bg-surface'
                  }`}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onMouseEnter={() => {
                      setActiveIdx(i);
                      setPaused(true);
                    }}
                    onMouseLeave={() => setPaused(false)}
                    onFocus={() => {
                      setActiveIdx(i);
                      setPaused(true);
                    }}
                    onBlur={() => setPaused(false)}
                    onTouchStart={() => {
                      setActiveIdx(i);
                      setPaused(true);
                    }}
                    onTouchEnd={() => setPaused(false)}
                    onTouchCancel={() => setPaused(false)}
                    className="group block w-full text-left pl-5 pr-3 py-3 cursor-pointer"
                  >
                    <span className="flex items-baseline gap-3">
                      <span
                        className={`font-mono text-[10.5px] tracking-[0.18em] uppercase transition-colors duration-300 ${
                          isActive ? 'text-accent' : 'text-text-secondary'
                        }`}
                      >
                        // грань {fact.num}
                      </span>
                      <span
                        className={`text-[11px] font-medium uppercase tracking-widest transition-colors duration-300 ${
                          isActive ? 'text-text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {fact.label}
                      </span>
                    </span>
                    <span
                      className={`block mt-1 font-bold leading-tight transition-colors duration-300 ${
                        isActive
                          ? 'text-accent text-xl md:text-[26px] tracking-tight'
                          : 'text-text-primary text-[17px] md:text-lg'
                      }`}
                    >
                      {fact.value}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* live progress indicator — three short bars показують який face активний */}
          {!reducedMotion && (
            <div className="flex items-center gap-2 pl-5" aria-hidden="true">
              {items.map((_, i) => (
                <span
                  key={i}
                  className={`h-[2px] transition-all duration-300 ${
                    activeIdx === i ? 'w-10 bg-accent' : 'w-5 bg-bg-surface'
                  }`}
                />
              ))}
              <span className="ml-3 text-[9px] font-mono tracking-[0.16em] text-text-secondary uppercase">
                {paused ? 'pause · hover' : 'auto · 3s'}
              </span>
            </div>
          )}
        </div>

        {/* === RIGHT: title + lead + CTAs === */}
        <div className="order-1 md:order-2 flex flex-col gap-5">
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

          {/* Live legal entity strip — постійно видна, малий заголовок */}
          <div className="mt-6 pt-5 border-t border-bg-surface flex flex-col gap-3">
            <span className="text-[10px] font-mono tracking-[0.18em] text-text-secondary uppercase">
              // юридична особа
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={`entity-${activeIdx}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="text-sm md:text-base text-text-primary"
              >
                <span className="font-bold">ПП «ДІК "Вигода +"»</span>
                <span className="mx-2 text-text-secondary">·</span>
                <span className="text-text-secondary">
                  {items[activeIdx]?.label.toLowerCase()}:{' '}
                </span>
                <span className="text-accent font-medium">
                  {items[activeIdx]?.value}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerHero;
