import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

type NewsCardProps = {
  date: string;        // ISO
  dateLabel: string;
  category: string;
  title: string;
  lead: string;
  /** Optional detail link. Short construction updates are self-contained, so
   *  without an href the card is static and shows NO "Читати далі" CTA — the CTA
   *  and hover affordance only appear when there is actually somewhere to go. */
  href?: string;
};

const NewsCard = ({
  date,
  dateLabel,
  category,
  title,
  lead,
  href,
}: NewsCardProps) => {
  const interactive = Boolean(href);

  const Inner = (
    <article className="h-full">
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-widest text-text-secondary mb-4">
        <time dateTime={date}>{dateLabel}</time>
        <span aria-hidden="true">·</span>
        <span className="text-accent">{category}</span>
      </div>
      <h3
        className={`text-xl md:text-2xl font-bold text-text-primary mb-3 leading-snug ${
          interactive ? 'group-hover:text-accent transition-colors' : ''
        }`}
      >
        {title}
      </h3>
      <p className="text-text-secondary text-sm md:text-base leading-relaxed">
        {lead}
      </p>
      {interactive && (
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-text-primary uppercase tracking-widest">
          Читати далі{' '}
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </span>
      )}
    </article>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="block bg-bg-surface border border-border hover:border-accent transition-colors p-6 md:p-8 group rounded-none h-full"
      >
        {Inner}
      </Link>
    );
  }

  return (
    <div className="bg-bg-surface border border-border p-6 md:p-8 rounded-none h-full">
      {Inner}
    </div>
  );
};

export default NewsCard;
