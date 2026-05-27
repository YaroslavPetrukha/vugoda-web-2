export type ProjectStage =
  | 'memorandum'    // Меморандум про відновлення будівництва
  | 'estimation'    // Кошторисна документація
  | 'permits'       // Дозвільна документація
  | 'pre-budget'    // Прорахунок кошторисної вартості (рання стадія)
  | 'construction'; // Будується

export type Project = {
  slug: string;
  name: string;
  stage: ProjectStage;
  stageLabel: string;
  location: string;
  externalSite?: string;
  rendersDir?: string;
  cardImage?: import('./components/ui/Picture').PictureSource;
  hasRenders: boolean;
};

export type NewsItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;        // ISO
  dateLabel: string;   // "28 березня 2026"
  category: string;    // "Етап проекту · Lakeview"
};

export type ArticleCategory =
  | 'construction-progress'  // Хід будівництва
  | 'guide'                  // Практичний гайд / чек-лист
  | 'analysis';              // Аналіз / дослідження

export type ArticleMetadata = {
  slug: string;                  // URL-safe (used in /novyny/{slug})
  title: string;                 // ≤60 chars (SEO title)
  description: string;           // 140-160 chars (meta description)
  excerpt: string;               // List card lead, 1-2 sentences
  publishedAt: string;           // ISO date (YYYY-MM-DD)
  updatedAt?: string;            // ISO date — present only if updated post-publish
  category: ArticleCategory;
  categoryLabel: string;         // Display label («Хід будівництва», «Гайд», «Аналіз»)
  hero: string;                  // OG image absolute path (e.g. '/og/lakeview.png')
  heroAlt: string;               // Image alt for accessibility
  author: string;                // 'Команда ВИГОДА'
  internalLinks?: string[];      // Slugs of related routes for "Related" section
  wordCount?: number;            // For reading-time estimate
};
