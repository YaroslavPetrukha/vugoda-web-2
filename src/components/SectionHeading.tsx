import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h2' | 'h3';
  className?: string;
};

const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Tag = 'h2',
  className = '',
}: SectionHeadingProps) => {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const titleCls =
    Tag === 'h2'
      ? 'text-3xl md:text-5xl leading-[1.1] tracking-tight font-bold text-text-primary'
      : 'text-xl md:text-2xl leading-snug font-bold text-text-primary';

  return (
    <div className={`max-w-3xl ${alignCls} ${className}`}>
      {eyebrow && (
        <span
          className={`inline-block text-xs font-mono tracking-widest text-accent uppercase mb-4`}
        >
          // {eyebrow}
        </span>
      )}
      <Tag className={titleCls}>{title}</Tag>
      {description && (
        <p className="mt-5 text-text-secondary text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
