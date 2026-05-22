import { useRef, type ReactNode } from 'react';
import { motion, useInView, type Variants } from 'motion/react';
import HeroAmbient from './HeroAmbient';

export type NewsTimelineItem = {
  date: string;       // ISO 2026-05-13
  dateLabel: string;  // '13 травня 2026'
  category?: string;
  title: string;
};

type NewsHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  items: NewsTimelineItem[];
  cadence?: string;   // "оновлюється щомісяця" — trust signal
  children?: ReactNode;
};

const lineVariants: Variants = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: { duration: 1.2, delay: 0.4, ease: [0.65, 0, 0.35, 1] },
  },
};

const dotVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { duration: 0.45, delay: 0.9 + i * 0.18, ease: [0.2, 0.7, 0.2, 1] },
  }),
};

const labelVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 1.0 + i * 0.18, ease: 'easeOut' },
  }),
};

// Перетворює ISO date "2026-05-13" → "13.05"
const shortDate = (iso: string): string => {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}.${parts[1]}`;
};

/**
 * Hero для /novyny — **TimelineHero**:
 * Horizontal timeline з 3 dots (newest first), connecting line drawn L→R,
 * active dot (newest) має pulse halo + lime caption, інші — gray.
 *
 * Семантика: "ритм оновлень видно одразу" — для аудиторії публіка/преса/клієнти
 * це і є основний trust signal (ми не спимо, оновлюємо регулярно).
 *
 * Аксіоми:
 * • Hierarchy: title primary, timeline secondary visual
 * • 5-sec test: title + 3 latest events видно одразу
 * • Trust signals: cadence + дати-проксі регулярності
 * • Specificity: реальні дати з news data
 * • Don't make me think: chronology format universal
 * • Above-fold ≤650px: py-10 md:py-14
 */
const NewsHero = ({
  eyebrow,
  title,
  lead,
  items,
  cadence = 'оновлюється щомісяця · без редактури',
  children,
}: NewsHeroProps) => {
  // newest first → left to right
  const top3 = items.slice(0, 3);

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative bg-bg-deep py-10 md:py-14 px-6 lg:px-8 border-b border-bg-surface overflow-hidden"
    >
      <HeroAmbient />

      {/* Large year-watermark — adds ambient "chronicle" feel */}
      <div
        aria-hidden="true"
        className="absolute right-6 lg:right-12 top-8 md:top-10 select-none pointer-events-none"
        style={{
          fontFamily: 'Montserrat, system-ui, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(120px, 18vw, 220px)',
          lineHeight: 0.85,
          letterSpacing: '-0.04em',
          color: 'transparent',
          WebkitTextStroke: '1px rgba(193,243,61,0.12)',
        }}
      >
        2026
      </div>

      <div className="relative max-w-7xl mx-auto flex flex-col gap-10 md:gap-14">

        {/* === TOP: text === */}
        <div className="max-w-4xl flex flex-col gap-5">
          {eyebrow && (
            <span className="inline-block text-xs font-mono tracking-[0.18em] text-accent uppercase">
              // {eyebrow}
            </span>
          )}
          <h1 className="text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.05] tracking-tight font-bold text-text-primary">
            {title}
          </h1>
          {lead && (
            <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-2xl">
              {lead}
            </p>
          )}
          {children && <div className="mt-2 flex flex-wrap gap-3">{children}</div>}
        </div>

        {/* === BOTTOM: horizontal timeline === */}
        {top3.length > 0 && (
          <div className="relative">
            {/* connecting line (SVG) — draws across all dots */}
            <svg
              aria-hidden="true"
              viewBox="0 0 100 4"
              preserveAspectRatio="none"
              className="absolute left-0 right-0 top-[8px] w-full h-1 overflow-visible"
            >
              <motion.line
                x1="2"
                y1="2"
                x2="98"
                y2="2"
                stroke="#C1F33D"
                strokeWidth="1"
                strokeOpacity="0.45"
                strokeLinecap="butt"
                vectorEffect="non-scaling-stroke"
                variants={lineVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
              />
            </svg>

            {/* dots + captions */}
            <ol className="relative grid grid-cols-3 gap-4 md:gap-8">
              {top3.map((item, i) => {
                const isActive = i === 0;
                return (
                  <li key={item.date} className="relative flex flex-col items-start gap-3 pt-0">
                    <div className="relative">
                      {isActive && (
                        <motion.span
                          aria-hidden="true"
                          className="absolute -top-1 -left-1 w-[18px] h-[18px] rounded-full"
                          style={{ background: 'rgba(193,243,61,0.4)', filter: 'blur(2px)' }}
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={
                            isInView
                              ? { opacity: [0, 0.6, 0], scale: [0.8, 2, 2] }
                              : { opacity: 0, scale: 0.6 }
                          }
                          transition={{
                            duration: 2.4,
                            delay: 1.6,
                            repeat: Infinity,
                            repeatDelay: 0.4,
                            ease: 'easeOut',
                          }}
                        />
                      )}
                      <motion.span
                        custom={i}
                        variants={dotVariants}
                        initial="hidden"
                        animate={isInView ? 'visible' : 'hidden'}
                        className={
                          isActive
                            ? 'relative block w-4 h-4 bg-accent'
                            : 'relative block w-2.5 h-2.5 mt-[3px] ml-[3px] bg-text-secondary opacity-70'
                        }
                        style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                      />
                    </div>

                    <motion.div
                      custom={i}
                      variants={labelVariants}
                      initial="hidden"
                      animate={isInView ? 'visible' : 'hidden'}
                      className="flex flex-col gap-1.5"
                    >
                      <span
                        className={`font-mono text-[11px] tracking-[0.14em] uppercase ${
                          isActive ? 'text-accent' : 'text-text-secondary'
                        }`}
                      >
                        {item.dateLabel}
                      </span>
                      {item.category && (
                        <span className="text-[10px] text-text-secondary/70 tracking-wider">
                          {item.category}
                        </span>
                      )}
                      <span
                        className={`text-sm md:text-[15px] leading-snug font-medium ${
                          isActive ? 'text-text-primary' : 'text-text-secondary'
                        } line-clamp-3`}
                      >
                        {item.title}
                      </span>
                    </motion.div>
                  </li>
                );
              })}
            </ol>

            {/* trust strip — cadence */}
            <div className="mt-8 pt-5 border-t border-bg-surface flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.16em] text-text-secondary uppercase">
                <span className="w-1.5 h-1.5 bg-accent" aria-hidden="true" />
                {cadence}
              </span>
              <span className="text-[10px] font-mono tracking-[0.14em] text-text-secondary/60 uppercase">
                // показано {top3.length} останніх з {items.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsHero;
