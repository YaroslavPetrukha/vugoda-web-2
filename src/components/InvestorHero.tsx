import { useRef, type ReactNode } from 'react';
import { motion, useInView, type Variants } from 'motion/react';
import HeroAmbient from './HeroAmbient';

type TrustItem = { label: string; value: string };
type ProjectMarker = {
  id: string;
  cx: number;
  cy: number;
  label: string;
  status: 'active' | 'permits' | 'pre-construction';
};

type InvestorHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  trust?: TrustItem[];
  projects?: ProjectMarker[];
  children?: ReactNode;
};

const DEFAULT_TRUST: TrustItem[] = [
  { label: 'ЄДРПОУ', value: '44876801' },
  { label: 'Pipeline', value: '1 активний · 4 у роботі' },
  { label: 'Стартова ціна', value: 'від $1600/м²' },
];

// Анонімні стадії замість назв ЖК (privacy + investor-relevant info)
const DEFAULT_PROJECTS: ProjectMarker[] = [
  { id: 'lakeview',    cx: 81,   cy: 39,    label: 'Будівництво', status: 'active' },
  { id: 'etno',        cx: 158,  cy: 39,    label: 'Меморандум',  status: 'pre-construction' },
  { id: 'nterest',     cx: 100,  cy: 72,    label: 'Дозволи',     status: 'permits' },
  { id: 'maetok',      cx: 139,  cy: 72,    label: 'Кошторис',    status: 'pre-construction' },
  { id: 'pipeline-04', cx: 81,   cy: 117,   label: 'Концепт',     status: 'pre-construction' },
];

// === ISOMETRIC-GRID — повна геометрія з оригінального public/isometric-grid.svg ===
// CLS-1: outer rhombuses (плоскі грані кубів) — 13 polygons
const ISO_FACE_POLYGONS = [
  '81.18 39.08 81.19 39.08 81.19 39.01 81.21 39 61.94 27.88 42.65 39.01 42.65 39.08 61.91 50.2 81.18 39.08',
  '158.3 39.1 177.53 50.2 196.8 39.08 196.81 39.08 196.81 39.01 196.82 39 177.55 27.88 158.28 39 158.3 39.01 158.3 39.1',
  '61.89 72.4 42.65 61.29 42.65 39.08 42.64 39.08 23.35 50.21 23.35 72.49 42.64 83.62 61.91 72.5 61.89 72.49 61.89 72.4',
  '61.89 72.4 61.89 50.21 61.91 50.2 42.65 39.08 42.65 61.29 61.89 72.4',
  '100.45 50.2 81.22 39.1 81.22 61.29 81.2 61.3 100.43 72.4 100.43 50.22 100.45 50.2',
  '138.99 50.2 138.97 50.22 138.97 72.4 139.01 72.42 139.01 50.21 138.99 50.2',
  '177.53 50.2 158.3 39.1 158.3 61.29 158.28 61.3 177.51 72.4 177.51 50.21 177.53 50.2',
  '81.18 83.74 81.19 83.74 81.19 83.67 81.2 83.66 61.94 72.54 42.65 83.67 42.65 83.74 61.91 94.86 81.18 83.74',
  '61.89 117.06 42.65 105.95 42.65 83.74 42.64 83.74 23.35 94.87 23.35 117.15 42.64 128.28 61.91 117.16 61.89 117.15 61.89 117.06',
  '100.43 117.06 81.2 105.96 61.94 117.08 61.93 117.08 61.93 117.15 61.91 117.16 81.18 128.28 100.45 117.16 100.43 117.15 100.43 117.06',
  '81.19 83.74 81.18 83.74 61.91 94.86 61.93 94.87 61.93 117.08 61.94 117.08 81.2 105.96 81.19 105.95 81.19 83.74',
  '177.51 117.06 158.28 105.96 139.01 117.08 139.01 117.08 139.01 117.15 138.99 117.16 158.26 128.28 177.53 117.16 177.51 117.15 177.51 117.06',
  '158.26 83.74 158.26 83.74 138.99 94.86 139.01 94.87 139.01 117.08 139.01 117.08 158.28 105.96 158.26 105.95 158.26 83.74',
];

// CLS-2: outline path-и (рамки кубів з cutout via evenodd) — створюють 3D wireframe depth
// Це були mix-blend-overlay у оригіналі (давало dirty olive); ми використовуємо як fill без blend
const ISO_OUTLINE_PATHS = [
  'M61.91,50.68l-19.67-11.36v-.47l.2-.19,19.49-11.25,20.09,11.6-.43.25v.44s-.38-.16-.38-.16l-19.3,11.14ZM43.4,39.05l18.51,10.68,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M100.45,50.68l-19.63-11.33v-.09s-.41-.23-.41-.23l.59-.36,19.47-11.24,20.09,11.6-.43.24v.46l-.39-.17-19.29,11.14ZM81.94,39.05l18.51,10.68,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M138.99,50.68l-19.63-11.33v-.09l-.4-.24.59-.36,19.47-11.24,20.09,11.6-.44.25v.47s-.39-.18-.39-.18l-19.29,11.14ZM120.48,39.05l18.51,10.68,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M177.53,50.68l-19.63-11.34v-.09s-.4-.24-.4-.24l.59-.36,19.48-11.24,20.09,11.6-.43.25v.44l-.38-.16-19.3,11.14ZM159.02,39.05l18.51,10.68,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M42.64,84.1l-19.7-11.37v-22.74s19.69-11.37,19.69-11.37l.42.22v.25s0,21.97,0,21.97l19.25,11.11v.09s.41.24.41.24l-.6.36-19.47,11.24ZM23.76,72.25l18.88,10.9,18.53-10.7-18.93-10.93v-21.74l-18.48,10.67v21.8Z',
  'M62.3,73.1l-20.06-11.58v-23.15s20.49,11.83,20.49,11.83l-.43.25v22.65ZM43.06,61.05l18.43,10.64v-21.26l-18.43-10.64v21.26Z',
  'M81.18,84.09l-20.09-11.6.43-.25v-.46s.39.18.39.18l19.29-11.14,19.63,11.34v.09l.41.24-.6.36-19.47,11.24ZM62.67,72.47l18.51,10.69,18.53-10.7-18.51-10.69-18.53,10.7Z',
  'M61.94,72.89l-.42-.23v-22.21s-.41-.24-.41-.24l.6-.36,19.46-11.24.42.22v.25s0,21.97,0,21.97l.41.23-.59.36-19.47,11.24ZM62.34,50.43v21.29l18.44-10.65v-21.29s-18.44,10.65-18.44,10.65Z',
  'M100.84,73.1l-20.45-11.81.43-.25v-22.65s20.45,11.81,20.45,11.81l-.43.25v22.65ZM81.63,61.07l18.39,10.62v-21.26s-18.39-10.62-18.39-10.62v21.26Z',
  'M119.72,84.1l-20.08-11.59.42-.25v-.43s.38.15.38.15l19.31-11.15,19.63,11.34v.09l.41.24-.59.36-19.47,11.24ZM101.21,72.47l18.51,10.68,18.53-10.7-18.51-10.69-18.53,10.7Z',
  'M100.49,72.89l-.43-.22v-22.22s-.4-.24-.4-.24l.59-.36,19.47-11.24.41.23v.24s0,21.96,0,21.96l.42.23-.6.37-19.46,11.24ZM100.88,50.43v21.29s18.44-10.65,18.44-10.65v-21.29s-18.44,10.65-18.44,10.65Z',
  'M139.38,73.1l-20.44-11.8.42-.25v-22.65s20.45,11.81,20.45,11.81l-.43.25v22.65ZM120.17,61.07l18.39,10.62v-21.26l-18.39-10.62v21.26Z',
  'M158.26,84.1l-20.08-11.59.42-.25v-.43l.38.15,19.31-11.15,19.64,11.34v.09s.41.24.41.24l-.6.36-19.47,11.24ZM139.75,72.47l18.51,10.69,18.53-10.7-18.51-10.69-18.53,10.7Z',
  'M139.03,72.89l-.43-.21v-22.22s-.4-.24-.4-.24l.59-.36,19.48-11.24.41.24v.24s0,21.96,0,21.96l.42.23-.6.37-19.46,11.24ZM139.42,50.43v21.29l18.44-10.65v-21.29s-18.44,10.64-18.44,10.64Z',
  'M177.92,73.1l-20.45-11.8.42-.25v-22.66l20.45,11.81-.43.25v22.65ZM158.71,61.07l18.39,10.62v-21.26l-18.39-10.62v21.26Z',
  'M61.91,95.34l-19.67-11.36v-.47s.2-.19.2-.19l19.49-11.25,20.09,11.6-.43.25v.48s-.4-.19-.4-.19l-19.29,11.13ZM43.4,83.71l18.51,10.69,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M100.45,95.34l-19.63-11.33v-.09s-.41-.24-.41-.24l.59-.36,19.47-11.24,20.09,11.6-.44.24v.5s-.4-.21-.4-.21l-19.28,11.13ZM81.94,83.71l18.51,10.68,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M138.99,95.34l-19.63-11.33v-.09l-.4-.23.59-.36,19.47-11.24,20.09,11.6-.44.25v.52s-.41-.23-.41-.23l-19.28,11.13ZM120.48,83.71l18.51,10.68,18.53-10.7-18.51-10.69-18.53,10.7Z',
  'M177.53,95.34l-19.64-11.33v-.09l-.4-.24.59-.36,19.47-11.24,20.09,11.6-.43.25v.48s-.4-.19-.4-.19l-19.29,11.14ZM159.02,83.71l18.51,10.69,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M42.64,128.75l-19.7-11.37v-22.74l19.7-11.37.4.25v.23s0,21.97,0,21.97l19.25,11.11v.09l.42.23-.61.37-19.47,11.24ZM23.76,116.91l18.88,10.9,18.53-10.7-18.94-10.93v-21.74s-18.48,10.67-18.48,10.67v21.8Z',
  'M62.3,117.76l-20.06-11.58v-23.15s20.51,11.84,20.51,11.84l-.45.24v22.64ZM43.06,105.71l18.43,10.64v-21.26s-18.43-10.64-18.43-10.64v21.26Z',
  'M81.18,128.75l-20.1-11.6.44-.24v-.46s.39.18.39.18l19.29-11.14,19.63,11.34v.09l.42.23-.61.37-19.47,11.24ZM62.68,117.13l18.51,10.68,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M61.94,117.55l-.42-.24v-22.2s-.43-.23-.43-.23l.62-.38,19.48-11.24.41.24v.24s0,21.97,0,21.97l.41.24-.6.36-19.47,11.24ZM62.34,95.09v21.29l18.44-10.65v-21.29s-18.44,10.65-18.44,10.65Z',
  'M100.84,117.76l-20.45-11.81.43-.25v-22.65l20.47,11.82-.45.24v22.65ZM81.63,105.73l18.39,10.62v-21.26l-18.39-10.62v21.26Z',
  'M119.72,128.76l-20.09-11.6.43-.24v-.42l.38.14,19.31-11.15,19.63,11.34v.09s.42.23.42.23l-.61.37-19.47,11.24ZM101.21,117.13l18.51,10.68,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M100.49,117.55l-.43-.21v-22.21s-.43-.23-.43-.23l.61-.37,19.48-11.25.4.25v.23s0,21.96,0,21.96l.42.23-.6.37-19.46,11.23ZM100.88,95.09v21.29s18.44-10.65,18.44-10.65v-21.29s-18.44,10.65-18.44,10.65Z',
  'M139.38,117.76l-20.45-11.8.42-.25v-22.65s20.48,11.82,20.48,11.82l-.45.24v22.64ZM120.17,105.73l18.39,10.62v-21.26s-18.39-10.62-18.39-10.62v21.26Z',
  'M158.26,128.75l-20.09-11.6.43-.24v-.42s.38.14.38.14l19.31-11.15,19.64,11.33v.09s.42.23.42.23l-.61.37-19.47,11.24ZM139.75,117.13l18.51,10.69,18.53-10.7-18.51-10.69-18.53,10.7Z',
  'M139.03,117.54l-.43-.21v-22.21l-.43-.23.61-.37,19.49-11.25.39.26v.22s0,21.96,0,21.96l.42.23-.6.37-19.46,11.23ZM139.42,95.09v21.29l18.44-10.65v-21.29s-18.44,10.65-18.44,10.65Z',
  'M177.92,117.76l-20.45-11.8.42-.25v-22.65s20.48,11.82,20.48,11.82l-.45.24v22.64ZM158.71,105.73l18.39,10.62v-21.26s-18.39-10.62-18.39-10.62v21.26Z',
  'M61.91,140l-19.67-11.36v-.47l.2-.19,19.49-11.25,20.1,11.6-.44.24v.44l-.38-.16-19.3,11.14ZM43.4,128.37l18.51,10.69,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M100.45,140l-19.63-11.34v-.09s-.42-.23-.42-.23l.61-.37,19.47-11.24,20.11,11.61-.45.24v.46l-.39-.17-19.29,11.14ZM81.94,128.37l18.51,10.68,18.53-10.7-18.51-10.68-18.53,10.7Z',
  'M138.99,140l-19.63-11.34v-.09s-.42-.23-.42-.23l.6-.37,19.47-11.24,20.11,11.61-.45.24v.47s-.39-.18-.39-.18l-19.29,11.14ZM120.48,128.37l18.51,10.68,18.53-10.7-18.51-10.69-18.53,10.7Z',
  'M177.53,140l-19.63-11.34v-.09l-.42-.23.6-.37,19.47-11.24,20.1,11.6-.44.24v.44s-.39-.16-.39-.16l-19.3,11.14ZM159.02,128.37l18.51,10.68,18.53-10.7-18.51-10.68-18.53,10.7Z',
];

const gridFaceVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.025, ease: [0.2, 0.7, 0.2, 1] },
  }),
};

const gridOutlineVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 0.28,
    transition: { duration: 0.45, delay: 0.15 + i * 0.018, ease: 'easeOut' },
  }),
};

const markerVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: 1.0 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] },
  }),
};

const labelVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 1.1 + i * 0.12, ease: 'easeOut' },
  }),
};

const STATUS_COLORS = {
  active: '#C1F33D',
  permits: '#C1F33D',
  'pre-construction': '#A7AFBC',
} as const;

/**
 * Hero для /investoram (axiom-driven):
 *
 * • Hierarchy: text 60% (primary), iso-grid landscape 40% (secondary)
 * • Trust signals first: trust bar з ліцензією, pipeline, стартовою ціною
 * • Specificity: 5 markers = 5 реальних проектів (анонімні стадії, без назв ЖК)
 * • Conversion gravity: primary CTA + secondary
 * • Above-the-fold ≤650px: py-12 md:py-16
 * • isometric-grid обігрування: повний оригінальний SVG (face polygons + outline paths),
 *   stroke variant без mix-blend-overlay (фіксить dirty-olive артефакт)
 *
 * Метафора: "карта вашого капіталу — 5 точок над кварталом, кожна = проект на своїй стадії".
 */
const InvestorHero = ({
  eyebrow,
  title,
  lead,
  trust = DEFAULT_TRUST,
  projects = DEFAULT_PROJECTS,
  children,
}: InvestorHeroProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(mapRef, { once: true, margin: '-80px' });

  return (
    <section className="relative bg-bg-deep py-12 md:py-16 px-6 lg:px-8 border-b border-bg-surface overflow-hidden">

      {/* gridOpacity 0 — own iso-grid map already provides structure */}
      <HeroAmbient grid={false} />

      <div
        aria-hidden="true"
        className="hidden md:block absolute right-[16%] top-[28%] w-[300px] h-[80px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgb(var(--accent-rgb) / 0.16) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 md:gap-12 items-center">

        {/* === MAP — full isometric grid + 5 project markers === */}
        <div
          ref={mapRef}
          className="md:order-2 relative w-full max-w-[440px] md:max-w-none mx-auto md:mx-0"
        >
          {/* aspect-ratio wrapper — координати labels overlay у % від його width/height */}
          <div className="relative w-full" style={{ aspectRatio: '220.6 / 167.4' }}>
          <svg
            viewBox="0 0 220.6 167.4"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Карта проектів забудовника"
            role="img"
            className="absolute inset-0 w-full h-full"
            style={{ overflow: 'visible' }}
          >
            {/* Layer 1: face polygons — outline rhombuses (skeleton) */}
            <g>
              {ISO_FACE_POLYGONS.map((points, i) => (
                <motion.polygon
                  key={`face-${i}`}
                  points={points}
                  custom={i}
                  variants={gridFaceVariants}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  fill="#C1F33D"
                  fillOpacity={0.08}
                  stroke="#C1F33D"
                  strokeOpacity={0.5}
                  strokeWidth={0.5}
                  strokeLinejoin="miter"
                  strokeLinecap="butt"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>

            {/* Layer 2: outline paths — depth lines кожного куба (3D feel) */}
            <g>
              {ISO_OUTLINE_PATHS.map((d, i) => (
                <motion.path
                  key={`outline-${i}`}
                  d={d}
                  custom={i}
                  variants={gridOutlineVariants}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  fill="#C1F33D"
                  fillRule="evenodd"
                  stroke="none"
                />
              ))}
            </g>

            {/* Layer 3: project markers — 5 stages above grid */}
            <g>
              {projects.map((p, i) => {
                const color = STATUS_COLORS[p.status];
                const size = p.status === 'active' ? 5 : 3.5;
                return (
                  <g key={p.id}>
                    {p.status === 'active' && (
                      <motion.circle
                        cx={p.cx}
                        cy={p.cy}
                        r={6}
                        fill="none"
                        stroke="#C1F33D"
                        strokeWidth={0.8}
                        vectorEffect="non-scaling-stroke"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={
                          isInView
                            ? { opacity: [0, 0.6, 0], scale: [0.8, 1.8, 1.8] }
                            : { opacity: 0, scale: 0.6 }
                        }
                        transition={{
                          duration: 2.4,
                          delay: 1.6,
                          repeat: Infinity,
                          repeatDelay: 0.6,
                          ease: 'easeOut',
                        }}
                      />
                    )}
                    {/* Темний halo під marker — щоб не зливався з filled face */}
                    <motion.rect
                      x={p.cx - size / 2 - 1}
                      y={p.cy - size / 2 - 1}
                      width={size + 2}
                      height={size + 2}
                      fill="#020A0A"
                      custom={i}
                      variants={markerVariants}
                      initial="hidden"
                      animate={isInView ? 'visible' : 'hidden'}
                      style={{ transformOrigin: `${p.cx}px ${p.cy}px`, transformBox: 'fill-box' }}
                    />
                    <motion.rect
                      x={p.cx - size / 2}
                      y={p.cy - size / 2}
                      width={size}
                      height={size}
                      fill={color}
                      fillOpacity={p.status === 'active' ? 1 : 0.7}
                      custom={i}
                      variants={markerVariants}
                      initial="hidden"
                      animate={isInView ? 'visible' : 'hidden'}
                      style={{ transformOrigin: `${p.cx}px ${p.cy}px`, transformBox: 'fill-box' }}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

            {/* HTML labels overlay — гарантований контраст (фон bg-deep + padding) */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {projects.map((p, i) => {
                const xPct = (p.cx / 220.6) * 100;
                const yPct = (p.cy / 167.4) * 100;
                const isActive = p.status === 'active';
                return (
                  <motion.div
                    key={`label-${p.id}`}
                    custom={i}
                    variants={labelVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="absolute"
                    style={{
                      left: `${xPct}%`,
                      top: `${yPct}%`,
                      transform: 'translate(0.7rem, -50%)',
                    }}
                  >
                    <span
                      className={
                        isActive
                          ? 'inline-block px-2 py-0.5 text-[11px] md:text-xs font-medium tracking-wide bg-bg-deep border-l-2 border-accent text-accent whitespace-nowrap'
                          : 'inline-block px-2 py-0.5 text-[11px] md:text-xs font-medium tracking-wide bg-bg-deep border-l border-text-secondary/40 text-text-secondary whitespace-nowrap'
                      }
                      style={{ boxShadow: '0 0 8px rgba(2,10,10,0.6)' }}
                    >
                      {p.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-4 text-[10px] font-mono tracking-[0.14em] text-text-secondary uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-accent" aria-hidden="true" />
              активна стадія
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-text-secondary opacity-70" aria-hidden="true" />
              у роботі
            </span>
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

export default InvestorHero;
