import type { MetaFunction, LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { siteUrl } from '../../src/lib/site-url';
import { articles, getArticleBySlug, getArticleBodyBySlug } from '../../src/data/articles';
import { articleJsonLd, articleBreadcrumbJsonLd } from '../../src/lib/article-schema';
import Breadcrumb from '../../src/components/Breadcrumb';
import FadeIn from '../../src/components/FadeIn';
import Button from '../../src/components/Button';

export async function loader({ params }: LoaderFunctionArgs) {
  const article = getArticleBySlug(params.slug ?? '');
  if (!article) {
    throw new Response('Not Found', { status: 404 });
  }
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 2);
  return { article, related };
}

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  if (!data?.article) {
    return [{ title: 'Стаття не знайдена — ВИГОДА' }];
  }
  const { article } = data;
  const url = siteUrl(location.pathname);
  const image = siteUrl(article.hero);
  return [
    { title: `${article.title} — ВИГОДА` },
    { name: 'description', content: article.description },
    { property: 'og:title', content: article.title },
    { property: 'og:description', content: article.description },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: 'ВИГОДА' },
    { property: 'og:locale', content: 'uk_UA' },
    { property: 'article:published_time', content: article.publishedAt },
    ...(article.updatedAt
      ? [{ property: 'article:modified_time', content: article.updatedAt }]
      : []),
    { property: 'article:author', content: article.author },
    { property: 'article:section', content: article.categoryLabel },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: article.title },
    { name: 'twitter:description', content: article.description },
    { name: 'twitter:image', content: image },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
};

const ArticleSlugRoute = () => {
  const { article, related } = useLoaderData<typeof loader>();
  const Body = getArticleBodyBySlug(article.slug);
  const dateLabel = new Date(article.publishedAt).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const readingMinutes = article.wordCount
    ? Math.max(1, Math.round(article.wordCount / 200))
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleJsonLd(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleBreadcrumbJsonLd(article) }}
      />
      <Breadcrumb
        items={[
          { label: 'Головна', href: '/' },
          { label: 'Новини', href: '/novyny' },
          { label: article.title },
        ]}
      />

      <article className="bg-bg-base">
        {/* Article header */}
        <header className="bg-bg-deep border-b border-bg-surface py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-widest text-text-secondary mb-6">
                <time dateTime={article.publishedAt}>{dateLabel}</time>
                <span aria-hidden="true">·</span>
                <span className="text-accent">{article.categoryLabel}</span>
                {readingMinutes ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{readingMinutes} хв читання</span>
                  </>
                ) : null}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-6">
                {article.title}
              </h1>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
                {article.excerpt}
              </p>
            </FadeIn>
          </div>
        </header>

        {/* Article body */}
        <section className="py-12 md:py-16 px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-text-secondary">
            <FadeIn>{Body ? <Body /> : null}</FadeIn>
          </div>
        </section>

        {/* Author/footer attribution */}
        <section className="border-t border-bg-surface bg-bg-deep py-8 px-6 lg:px-8">
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-text-secondary">
            <span>
              Автор: <span className="text-text-primary">{article.author}</span>
            </span>
            <Link
              to="/novyny"
              className="inline-flex items-center gap-2 text-accent hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Усі публікації
            </Link>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 ? (
          <section className="bg-bg-base py-16 md:py-24 px-6 lg:px-8 border-t border-bg-surface">
            <div className="max-w-5xl mx-auto">
              <FadeIn>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
                  Читайте також
                </h2>
              </FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {related.map((r, i) => (
                  <FadeIn key={r.slug} delay={i * 0.05}>
                    <Link
                      to={`/novyny/${r.slug}`}
                      className="group block bg-bg-deep border border-bg-surface p-6 hover:border-accent transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-widest text-text-secondary mb-3">
                        <time dateTime={r.publishedAt}>
                          {new Date(r.publishedAt).toLocaleDateString('uk-UA', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </time>
                        <span aria-hidden="true">·</span>
                        <span className="text-accent">{r.categoryLabel}</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2 leading-snug group-hover:text-accent transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {r.excerpt}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-accent">
                        Читати <ArrowUpRight className="w-3 h-3" />
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* CTA */}
        <section className="bg-bg-deep border-t border-bg-surface py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                Хочете побачити обʼєкт особисто?
              </h2>
              <p className="text-text-secondary mb-8">
                Запишіться на огляд або задайте питання — менеджер відповість протягом робочого
                дня.
              </p>
              <Button as="a" href="/kontakty" variant="primary" size="lg">
                Контакти і запис
              </Button>
            </FadeIn>
          </div>
        </section>
      </article>
    </>
  );
};

export default ArticleSlugRoute;
