import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { siteUrl } from '../../src/lib/site-url';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import FadeIn from '../../src/components/FadeIn';
import NewsHero from '../../src/components/NewsHero';
import SectionHeading from '../../src/components/SectionHeading';
import Button from '../../src/components/Button';
import NewsCard from '../../src/components/NewsCard';
import ContactForm from '../../src/components/ContactForm';
import { news } from '../../src/data/news';
import { articles } from '../../src/data/articles';

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

const CATEGORIES = ['Усі', 'Хід будівництва', 'Гід покупця', 'Аналітика'];

const News = () => {
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

      {/* CATEGORIES */}
      <section className="bg-bg-deep border-b border-bg-surface py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 md:gap-4">
          <span className="text-[11px] font-medium uppercase tracking-widest text-text-secondary mr-2">
            Категорії
          </span>
          {CATEGORIES.map((c, i) => (
            <button
              type="button"
              key={c}
              aria-pressed={i === 0}
              className={`px-3 py-2 text-xs uppercase tracking-widest border transition-colors rounded-none ${
                i === 0
                  ? 'bg-accent text-bg-deep border-accent'
                  : 'bg-transparent text-text-secondary border-bg-surface hover:border-accent hover:text-accent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
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
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => {
              const dateLabel = new Date(article.publishedAt).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
              return (
                <FadeIn key={article.slug} delay={i * 0.05}>
                  <Link
                    to={`/novyny/${article.slug}`}
                    className="group block h-full bg-bg-deep border border-bg-surface p-6 hover:border-accent transition-colors"
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
        </div>
      </section>

      {/* CONSTRUCTION UPDATES */}
      <section className="bg-bg-deep border-t border-bg-surface py-16 md:py-24 px-6 lg:px-8">
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
        className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface"
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
