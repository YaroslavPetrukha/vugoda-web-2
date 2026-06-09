import type { CSSProperties } from 'react';

/**
 * Site-load preloader — каркасний куб ВИГОДА «зводиться» (метафора будівництва).
 *
 * Повністю CSS-driven (keyframes у src/index.css) — БЕЗ motion/react, щоб
 * markup малювався у prerendered HTML на byte 0 і анімувався ще до hydration
 * (нуль JS-залежності, нуль ваги бандла, LCP-safe).
 *
 * Рендериться один раз у root Layout як `fixed inset-0` overlay → не ремоунтиться
 * на client-side навігації RR, тому анімація грає лише на hard-load.
 *
 * Геометрія = public/mark.svg / MarkCube.tsx (ті самі 3 outer + 3 inner path-и).
 * Hydration-safe: чистий статичний markup, без хуків/Date/random.
 */

const FACES = [
  {
    // face-1 — top/bottom rhombus
    outer: 'M110.3,136.11l-44.58-25.74,44.58-25.74,44.58,25.74-44.58,25.74Z',
    inner: 'M67.72,110.37l42.58,24.59,42.58-24.59-42.58-24.59-42.58,24.59Z',
  },
  {
    // face-2 — right rhombus
    outer: 'M155.95,108.52l-44.58-25.74V31.3l44.58,25.74v51.48Z',
    inner: 'M112.37,82.2l42.58,24.59v-49.17l-42.58-24.59v49.17Z',
  },
  {
    // face-3 — left rhombus
    outer: 'M64.65,108.52v-51.48l44.58-25.74v51.48l-.25.14-44.33,25.6Z',
    inner: 'M65.65,57.61v49.17l42.58-24.59v-49.17l-42.58,24.59Z',
  },
];

const Splash = () => (
  <div id="vg-splash" aria-hidden="true" role="presentation">
    <div className="vg-splash-inner">
      <div className="vg-cube-wrap">
        <svg viewBox="0 0 220.6 167.4" xmlns="http://www.w3.org/2000/svg">
          {FACES.map((face, i) => (
            <g key={i} className="vg-face" style={{ '--i': i } as CSSProperties}>
              <path
                className="vg-outer"
                d={face.outer}
                pathLength={1}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="miter"
                strokeLinecap="butt"
              />
              <path className="vg-inner" d={face.inner} />
            </g>
          ))}
        </svg>
      </div>
      <span className="vg-ground" />
    </div>
  </div>
);

export default Splash;
