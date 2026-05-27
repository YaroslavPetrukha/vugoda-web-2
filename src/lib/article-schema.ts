import type { ArticleMetadata } from '../types';
import { siteUrl } from './site-url';

/**
 * Builds NewsArticle JSON-LD per schema.org spec.
 * Used in /novyny/{slug} pages to qualify for Google News and AI Overviews citation.
 *
 * Schema reference: https://schema.org/NewsArticle
 * Google guidance: https://developers.google.com/search/docs/appearance/structured-data/article
 */
export function articleJsonLd(meta: ArticleMetadata): string {
  const url = siteUrl(`/novyny/${meta.slug}`);
  const heroAbsolute = siteUrl(meta.hero);

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: meta.title,
    description: meta.description,
    image: { '@type': 'ImageObject', url: heroAbsolute, width: 1200, height: 630 },
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt ?? meta.publishedAt,
    inLanguage: 'uk-UA',
    author: {
      '@type': 'Organization',
      name: meta.author,
      '@id': siteUrl('/#organization'),
    },
    publisher: { '@id': siteUrl('/#organization') },
    articleSection: meta.categoryLabel,
    isAccessibleForFree: true,
  });
}

/**
 * BreadcrumbList JSON-LD for /novyny/{slug} pages.
 * Pattern: Головна → Новини → {article title}
 */
export function articleBreadcrumbJsonLd(meta: ArticleMetadata): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: siteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Новини', item: siteUrl('/novyny') },
      { '@type': 'ListItem', position: 3, name: meta.title },
    ],
  });
}
