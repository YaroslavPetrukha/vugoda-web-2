import { Link } from 'react-router';
import { Fragment } from 'react';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  return (
    <nav
      aria-label="breadcrumb"
      className={`bg-bg-deep px-4 sm:px-6 lg:px-8 pt-3 pb-1 sm:pt-6 sm:pb-2 border-b border-bg-surface ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary max-w-7xl mx-auto">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <Fragment key={`${item.label}-${idx}`}>
              <li>
                {isLast || !item.href ? (
                  <span aria-current={isLast ? 'page' : undefined} className="text-text-primary">
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.href} className="hover:text-accent transition-colors">
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="text-text-secondary/40">
                  /
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
