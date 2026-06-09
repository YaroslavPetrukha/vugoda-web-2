import type { MetaFunction } from 'react-router';
import { Link, useSearchParams } from 'react-router';
import { siteUrl } from '../../src/lib/site-url';
import { formatUkDate } from '../../src/lib/format-date';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import FadeIn from '../../src/components/FadeIn';
import NewsHero from '../../src/components/NewsHero';
import SectionHeading from '../../src/components/SectionHeading';
import Button from '../../src/components/Button';
import NewsCard from '../../src/components/NewsCard';
import ContactForm from '../../src/components/ContactForm';
import { news } from '../../src/data/news';
import { articles, articleCategoryChips } from '../../src/data/articles';

export const meta: MetaFunction = ({ location }) => {
  const title = 'Новини ВИГОДА — Lakeview, гіди покупця, аналітика';
  const description =
    'Звіти з майданчика ЖК Lakeview, чек-листи для покупців нерухомості та аналіз локацій Львова. Без рекламних формулювань — лише етапи, документи й дати.';
  const image = siteUrl('/og/news-v2.png');
  const url = siteUrl(location.pathname);
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'ВИГОДА' },
    { property: 'og:locale', content: 'uk_UA' },
    { tagName: 'link', rel: 'alternate', type: 'application/rss+xml', title: 'Новини ВИГОДА', href: siteUrl('/feed.xml') },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
};

// Ukrainian plural agreement for «публікація» (1 публікацію / 2-4 публікації / 5+ публікацій).
const pluralizePublications = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'публікацію';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'публікації';
  return 'публікацій';
};

const News = () => {
  // Filter state lives in the URL (?category=<slug>) — shareable, deep-linkable,
  // back/forward-aware. null = «Усі». The prerendered /novyny ships ALL articles,
  // so without JS / before hydration the list fails open (shows everything) and
  // nothing is hidden from crawlers; canonical stays /novyny (query excluded).
  const [searchParams] = useSearchParams();
  const active = searchParams.get('category');
  const filtered = active
    ? articles.filter((a) => a.category === active)
    : articles;

  return (
    <>
      <NewsHero
        eyebrow="Розділ 07 · хроніка"
        title="Хід будівництва без редактури"
        lead="Що відбувається на майданчиках, які рішення ухвалюємо, що публікуємо офіційно. Без рекламних формулювань — тільки етапи, документи, дати."
        items={news}
      >
        <Button as="a" href="#pidpyska" variant="primary" size="lg">
          Підписатись на оновлення <ArrowRight className="w-4 h-4" />
        </Button>
      </NewsHero>

      {/* CATEGORIES — URL-driven filter (Link + aria-current, not tabs/buttons) */}
      <section className="bg-bg-deep border-b border-border py-8 px-6 lg:px-8">
        <nav
          aria-label="Категорії новин"
          className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 md:gap-4"
        >
          <span className="text-[11px] font-medium uppercase tracking-widest text-text-secondary mr-2">
            Категорії
          </span>
          {[{ slug: null, label: 'Усі' }, ...articleCategoryChips].map(
            ({ slug, label }) => {
              const isActive = slug === active; // null === active(null) → «Усі»
              return (
                <Link
                  key={slug ?? 'all'}
                  to={slug ? `/novyny?category=${slug}` : '/novyny'}
                  aria-current={isActive ? 'true' : undefined}
                  preventScrollReset
                  className={`px-3 py-2 text-xs uppercase tracking-widest border transition-colors rounded-none ${
                    isActive
                      ? 'bg-accent text-bg-deep border-accent'
                      : 'bg-transparent text-text-secondary border-border hover:border-accent hover:text-accent'
                  }`}
                >
                  {label}
                </Link>
              );
            },
          )}
        </nav>
      </section>

      {/* EDITORIAL ARTICLES */}
      <section className="bg-bg-base py-16 md:py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="01"
              title="Публікації"
              description="Поглиблені матеріали: звіти з майданчика, гайди для покупців, аналіз локацій."
            />
          </FadeIn>

          {/* Polite SR announcement of the filtered result count */}
          <p role="status" aria-live="polite" className="sr-only">
            Показано {filtered.length} {pluralizePublications(filtered.length)}
          </p>

          {filtered.length === 0 ? (
            <div className="mt-12 border border-border bg-bg-deep p-10 text-center">
              <p className="text-text-secondary">
                Поки що немає публікацій у цій категорії.
              </p>
              <Link
                to="/novyny"
                className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-accent hover:underline"
              >
                Показати всі публікації
              </Link>
            </div>
          ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article, i) => {
              const dateLabel = formatUkDate(article.publishedAt);
              return (
                <FadeIn key={article.slug} delay={i * 0.05}>
                  <Link
                    to={`/novyny/${article.slug}`}
                    className="group block h-full bg-bg-deep border border-border p-6 hover:border-accent transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-widest text-text-secondary mb-4">
                      <time dateTime={article.publishedAt}>{dateLabel}</time>
                      <span aria-hidden="true">·</span>
                      <span className="text-accent">{article.categoryLabel}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3 leading-snug group-hover:text-accent transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                    <div className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-accent">
                      Читати <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* CONSTRUCTION UPDATES */}
      <section className="bg-bg-deep border-t border-border py-16 md:py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="02"
              title="Короткі оновлення з майданчика"
              description="Хроніка етапів ЖК Lakeview — дати, документи, факти."
            />
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((item, i) => (
              <FadeIn key={item.slug} delay={i * 0.05}>
                <NewsCard
                  date={item.date}
                  dateLabel={item.dateLabel}
                  category={item.category}
                  title={item.title}
                  lead={item.excerpt}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SUBSCRIBE FORM */}
      <section
        id="pidpyska"
        className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8 border-t border-border"
      >
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <ContactForm
              source="news-subscribe"
              heading="Підписатись на оновлення"
              description="Раз на місяць — короткий дайджест про етапи і прес-релізи."
              fields={['email']}
              submitLabel="Підписатись"
              successText="Прийнято. Перший дайджест надішлемо наприкінці місяця."
              disclaimer="Натискаючи «Підписатись», ви погоджуєтесь на обробку персональних даних. Відписатись можна в будь-який момент."
            />
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default News;
