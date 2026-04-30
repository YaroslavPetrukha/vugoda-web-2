import type { ReactNode } from 'react';

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  image?: string;
  imageAlt?: string;
  decorative?: boolean;
  align?: 'left' | 'center';
  children?: ReactNode;
};

const PageHero = ({
  eyebrow,
  title,
  lead,
  image,
  imageAlt = '',
  decorative = false,
  align = 'left',
  children,
}: PageHeroProps) => {
  const alignCls =
    align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';

  return (
    <section className="relative bg-bg-deep py-24 md:py-32 px-6 lg:px-8 border-b border-bg-surface overflow-hidden">
      {image && (
        <>
          <img
            src={image}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-bg-deep/60 via-bg-deep/70 to-bg-deep"
          />
        </>
      )}
      {decorative && (
        <img
          src="/vugoda-web-2/isometric-grid.svg"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08] mix-blend-overlay pointer-events-none"
        />
      )}
      <div
        className={`relative max-w-7xl mx-auto flex flex-col gap-6 ${alignCls}`}
      >
        {eyebrow && (
          <span className="inline-block text-xs font-mono tracking-widest text-accent uppercase">
            // {eyebrow}
          </span>
        )}
        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight font-bold text-text-primary max-w-4xl">
          {title}
        </h1>
        {lead && (
          <p className="text-lg leading-relaxed text-text-secondary max-w-2xl">
            {lead}
          </p>
        )}
        {children && <div className="mt-2 flex flex-wrap gap-4">{children}</div>}
      </div>
    </section>
  );
};

export default PageHero;
