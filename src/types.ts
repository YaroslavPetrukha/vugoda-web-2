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
