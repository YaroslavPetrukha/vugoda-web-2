import { useRef, useState, type ReactNode } from 'react';
import { motion, useInView, type Variants } from 'motion/react';
import { Mail, Phone, MapPin, Copy, Check, ExternalLink } from 'lucide-react';
import HeroAmbient from './HeroAmbient';

export type ContactTile = {
  kind: 'email' | 'phone' | 'address';
  label: string;
  value: string;
  /** клік-target: mailto:, tel:, google maps url */
  href?: string;
};

type ContactsHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  tiles?: ContactTile[];
  legal?: string;
  children?: ReactNode;
};

const DEFAULT_TILES: ContactTile[] = [
  {
    kind: 'email',
    label: 'Email',
    value: 'vygoda.sales@gmail.com',
    href: 'mailto:vygoda.sales@gmail.com',
  },
  {
    kind: 'phone',
    label: 'Телефон',
    value: '0969 900 390',
    href: 'tel:+380969900390',
  },
  {
    kind: 'address',
    label: 'Офіс продажу',
    value: 'вул. Володимира Великого, 4, к. 406, Львів',
    href: 'https://maps.google.com/?q=вул.+Володимира+Великого+4+Львів',
  },
];

const tileVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.3 + i * 0.1, ease: [0.2, 0.7, 0.2, 1] },
  }),
};

const ICON_MAP = {
  email: Mail,
  phone: Phone,
  address: MapPin,
} as const;

/**
 * Hero для /kontakty — pragmatic action-grid:
 *
 * Title + lead зверху, 3 prominent action-tiles нижче (Email / Phone / Office).
 * Email + Phone мають copy-to-clipboard with toast feedback, Address → відкриває maps.
 *
 * Семантика: «контакти — це не для wow, а для ДІЇ». 1 plыта = 1 шлях зв'язатися.
 *
 * Аксіоми:
 * • Hierarchy: title primary, 3 tiles — паралельні primary action targets
 * • Don't make me think: 3 channels, кожен з очевидним verb (mailto/tel/maps)
 * • Conversion gravity: КОЖЕН tile = CTA. Усі ведуть до контакту з людиною
 * • Specificity: реальний email, реальний телефон, реальна адреса
 * • Trust signal: legal strip знизу (ПП ДІК Вигода+ · ЄДРПОУ 44876801)
 * • Above-fold ≤650px: py-10 md:py-14
 * • 5-sec test: бачиш email + phone + office одразу + знаєш як зв'язатись
 */
const ContactsHero = ({
  eyebrow,
  title,
  lead,
  tiles = DEFAULT_TILES,
  legal = 'ПП «ДІК "Вигода +"» · ЄДРПОУ 44876801',
  children,
}: ContactsHeroProps) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [copiedKind, setCopiedKind] = useState<ContactTile['kind'] | null>(null);

  const handleCopy = async (kind: ContactTile['kind'], value: string) => {
    try {
      await navigator.clipboard?.writeText(value);
      setCopiedKind(kind);
      setTimeout(() => setCopiedKind((c) => (c === kind ? null : c)), 1800);
    } catch {
      /* clipboard API not available — fallback to href default */
    }
  };

  return (
    <section
      ref={ref}
      className="relative bg-bg-deep py-10 md:py-14 px-6 lg:px-8 border-b border-bg-surface overflow-hidden"
    >
      <HeroAmbient />

      {/* Soft ambient glow — subtle warm spot щоб «розблокувати» порожнечу */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute right-[6%] top-[20%] w-[340px] h-[180px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(193,243,61,0.10) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
      />

      {/* mark.svg watermark (very subtle) у правому-нижньому куті */}
      <div
        aria-hidden="true"
        className="absolute -right-12 -bottom-10 w-[280px] h-[210px] pointer-events-none opacity-[0.06]"
      >
        <svg viewBox="0 0 220.6 167.4" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g>
            <path fill="#C1F33D" d="M110.3,136.11l-44.58-25.74,44.58-25.74,44.58,25.74-44.58,25.74ZM67.72,110.37l42.58,24.59,42.58-24.59-42.58-24.59-42.58,24.59Z" />
            <path fill="#C1F33D" d="M155.95,108.52l-44.58-25.74V31.3l44.58,25.74v51.48ZM112.37,82.2l42.58,24.59v-49.17l-42.58-24.59v49.17Z" />
            <path fill="#C1F33D" d="M64.65,108.52v-51.48l44.58-25.74v51.48l-.25.14-44.33,25.6ZM65.65,57.61v49.17l42.58-24.59v-49.17l-42.58,24.59Z" />
          </g>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto flex flex-col gap-10 md:gap-12">

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

        {/* === BOTTOM: 3 action tiles === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bg-surface border border-bg-surface">
          {tiles.map((tile, i) => {
            const Icon = ICON_MAP[tile.kind];
            const isCopyable = tile.kind === 'email' || tile.kind === 'phone';
            const isCopied = copiedKind === tile.kind;
            const isExternal = tile.kind === 'address';

            return (
              <motion.div
                key={tile.kind}
                custom={i}
                variants={tileVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className="relative bg-bg-base group hover:bg-bg-surface/50 transition-colors duration-200"
              >
                <a
                  href={tile.href}
                  {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="block p-6 md:p-7 focus-visible:outline-none"
                  aria-label={`${tile.label}: ${tile.value}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="inline-flex items-center justify-center w-9 h-9 bg-bg-deep border border-bg-surface group-hover:border-accent transition-colors">
                      <Icon className="w-4 h-4 text-accent" strokeWidth={1.6} />
                    </span>
                    {isExternal && (
                      <ExternalLink
                        className="w-3.5 h-3.5 text-text-secondary group-hover:text-accent transition-colors mt-1"
                        strokeWidth={1.6}
                      />
                    )}
                  </div>
                  <span className="block text-[10.5px] font-mono tracking-[0.18em] text-text-secondary uppercase mb-2">
                    // {tile.label}
                  </span>
                  <span className="block text-base md:text-[17px] font-bold text-text-primary group-hover:text-accent transition-colors leading-snug break-words">
                    {tile.value}
                  </span>
                </a>

                {/* copy-to-clipboard button — лише для email/phone */}
                {isCopyable && (
                  <button
                    type="button"
                    onClick={() => handleCopy(tile.kind, tile.value)}
                    className="absolute top-5 right-5 inline-flex items-center justify-center w-7 h-7 text-text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:text-accent"
                    aria-label={`Скопіювати ${tile.label.toLowerCase()}`}
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
                    ) : (
                      <Copy className="w-3.5 h-3.5" strokeWidth={1.6} />
                    )}
                  </button>
                )}
                {isCopied && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-5 right-14 text-[10px] font-mono tracking-widest text-accent uppercase whitespace-nowrap"
                  >
                    // copied
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* === legal trust strip === */}
        {legal && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.16em] text-text-secondary uppercase">
              <span className="w-1.5 h-1.5 bg-accent" aria-hidden="true" />
              {legal}
            </span>
            <span className="text-[10px] font-mono tracking-[0.14em] text-text-secondary/60 uppercase">
              // прямий канал · без посередників
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactsHero;
