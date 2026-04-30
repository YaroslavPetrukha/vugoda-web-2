import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type NewsCardProps = {
  date: string;        // ISO
  dateLabel: string;
  category: string;
  title: string;
  lead: string;
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
  const Inner = (
    <article className="h-full">
      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-text-secondary mb-4">
        <time dateTime={date}>{dateLabel}</time>
        <span aria-hidden="true">·</span>
        <span className="text-accent">{category}</span>
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3 leading-snug group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6">
        {lead}
      </p>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary uppercase tracking-wider">
        Читати далі{' '}
        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
      </span>
    </article>
  );

  const cls =
    'block bg-bg-surface border border-bg-surface hover:border-accent transition-colors p-6 md:p-8 group rounded-none h-full';

  if (href) {
    return (
      <Link to={href} className={cls}>
        {Inner}
      </Link>
    );
  }

  return <div className={cls}>{Inner}</div>;
};

export default NewsCard;
