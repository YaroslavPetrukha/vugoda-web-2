import { useRef } from 'react';
import { motion, useInView, type Variants } from 'motion/react';

/**
 * 6 path-ів = 3 outer (заливаються) + 3 inner (вирізають "вікно" кольором фону).
 * Розкол зроблено навмисно — окремий path для inner cutout дає stable fill
 * незалежно від motion's behaviour з multi-subpath path-ами.
 *
 * Координати точно з public/mark.svg.
 */
const FACE_OUTERS = [
  // face-1 — top/bottom rhombus
  'M110.3,136.11l-44.58-25.74,44.58-25.74,44.58,25.74-44.58,25.74Z',
  // face-2 — right rhombus
  'M155.95,108.52l-44.58-25.74V31.3l44.58,25.74v51.48Z',
  // face-3 — left rhombus
  'M64.65,108.52v-51.48l44.58-25.74v51.48l-.25.14-44.33,25.6Z',
];

const FACE_INNERS = [
  'M67.72,110.37l42.58,24.59,42.58-24.59-42.58-24.59-42.58,24.59Z',
  'M112.37,82.2l42.58,24.59v-49.17l-42.58-24.59v49.17Z',
  'M65.65,57.61v49.17l42.58-24.59v-49.17l-42.58,24.59Z',
];

// Центри граней у координатах viewBox (для overlay цифр при hover)
const FACE_CENTERS = [
  { x: 110.3, y: 110.5 }, // face-1
  { x: 134.16, y: 70.0 }, // face-2
  { x: 87.34, y: 70.0 },  // face-3
];

const outerVariants: Variants = {
  hidden: {
    pathLength: 0,
    fillOpacity: 0,
    strokeOpacity: 0.95,
    strokeWidth: 0.8,
  },
  visible: (i: number) => ({
    pathLength: 1,
    fillOpacity: 0.6,
    strokeOpacity: 0,
    strokeWidth: 0.8,
    transition: {
      pathLength: { duration: 1.0, delay: i * 0.32, ease: [0.65, 0, 0.35, 1] },
      strokeOpacity: { duration: 0.4, delay: i * 0.32 + 0.9 },
      fillOpacity: { duration: 0.5, delay: i * 0.32 + 0.8 },
    },
  }),
  highlighted: {
    pathLength: 1,
    fillOpacity: 0.85,
    strokeOpacity: 1,
    strokeWidth: 1.5,
    transition: { duration: 0.22, ease: 'easeOut' },
  },
  dimmed: {
    pathLength: 1,
    fillOpacity: 0.15,
    strokeOpacity: 0,
    strokeWidth: 0.8,
    transition: { duration: 0.22, ease: 'easeOut' },
  },
};

const innerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.3, delay: i * 0.32 + 1.1 },
  }),
  highlighted: { opacity: 1, transition: { duration: 0.22 } },
  dimmed: { opacity: 1, transition: { duration: 0.22 } },
};

const numberVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  highlighted: { opacity: 1, scale: 1, transition: { duration: 0.24, ease: 'easeOut' } },
};

export type FaceIndex = 0 | 1 | 2 | 3;

type MarkCubeProps = {
  faceHi?: FaceIndex;
  className?: string;
  ariaLabel?: string;
  /** показувати цифри 01/02/03 на гранях коли faceHi !== 0 (default true) */
  showFaceNumbers?: boolean;
  /** колір фону — для inner cutout. default: bg-deep #020A0A */
  bgColor?: string;
};

/**
 * Каркасний куб бренду ВИГОДА (з public/mark.svg).
 * На вхід у viewport:
 *   1. Кожна з 3 outer-граней малюється stroke-by-stroke (motion pathLength 0→1)
 *   2. Fill заливається до оригінальної opacity 0.6
 *   3. Inner cutout проявляється — створює wireframe-ring як в оригіналі
 * Фінал ідентичний public/mark.svg.
 *
 * faceHi=1|2|3 — підсвічує конкретну грань, інші затемнюються;
 *               на грані з'являється велика цифра 01/02/03 (як графіті).
 */
const MarkCube = ({
  faceHi = 0,
  className = '',
  ariaLabel,
  showFaceNumbers = true,
  bgColor = '#020A0A',
}: MarkCubeProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const stateFor = (i: number): string => {
    if (!isInView) return 'hidden';
    if (faceHi === 0) return 'visible';
    return faceHi === i + 1 ? 'highlighted' : 'dimmed';
  };

  return (
    <svg
      ref={ref}
      viewBox="0 0 220.6 167.4"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* Outer rhombuses — drawn with stroke, then fill */}
      {FACE_OUTERS.map((d, i) => (
        <motion.path
          key={`outer-${i}`}
          d={d}
          custom={i}
          variants={outerVariants}
          initial="hidden"
          animate={stateFor(i)}
          fill="#C1F33D"
          stroke="#C1F33D"
          strokeLinejoin="miter"
          strokeLinecap="butt"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Inner cutout — fades in after outer fill, creates "ring" look */}
      {FACE_INNERS.map((d, i) => (
        <motion.path
          key={`inner-${i}`}
          d={d}
          custom={i}
          variants={innerVariants}
          initial="hidden"
          animate={stateFor(i)}
          fill={bgColor}
        />
      ))}

      {/* Face numbers overlay (на hover) */}
      {showFaceNumbers && FACE_CENTERS.map((c, i) => (
        <motion.text
          key={`num-${i}`}
          x={c.x}
          y={c.y + 7}
          textAnchor="middle"
          fill="#020A0A"
          fontSize="18"
          fontWeight={700}
          fontFamily="Montserrat, system-ui, sans-serif"
          variants={numberVariants}
          initial="hidden"
          animate={faceHi === i + 1 ? 'highlighted' : 'hidden'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {`0${i + 1}`}
        </motion.text>
      ))}
    </svg>
  );
};

export default MarkCube;
