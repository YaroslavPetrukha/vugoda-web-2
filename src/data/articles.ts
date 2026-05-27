import type { ComponentType } from 'react';
import type { ArticleMetadata } from '../types';

import Article1Body, {
  metadata as article1Metadata,
} from '../content/articles/lakeview-progress-2026-04-05';
import Article2Body, {
  metadata as article2Metadata,
} from '../content/articles/chek-list-pereveryty-zabudovnyka';
import Article3Body, {
  metadata as article3Metadata,
} from '../content/articles/frankivskyi-raion-lokatsiia-lviv';

const ARTICLE_BODIES: Record<string, ComponentType> = {
  [article1Metadata.slug]: Article1Body,
  [article2Metadata.slug]: Article2Body,
  [article3Metadata.slug]: Article3Body,
};

// Sorted newest-first by publishedAt (descending).
export const articles: ArticleMetadata[] = [
  article1Metadata,
  article2Metadata,
  article3Metadata,
].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

export function getArticleBySlug(slug: string): ArticleMetadata | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticleBodyBySlug(slug: string): ComponentType | null {
  return ARTICLE_BODIES[slug] ?? null;
}
