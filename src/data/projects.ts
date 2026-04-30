import type { Project } from '../types';

export const projects: Project[] = [
  {
    slug: 'lakeview',
    name: 'ЖК Lakeview',
    stage: 'construction',
    stageLabel: 'Будується · здача 2027',
    location: 'вул. Володимира Великого, 2А, Львів',
    externalSite: 'https://yaroslavpetrukha.github.io/Lakeview/',
    rendersDir: '/projects/lakeview/',
    cardImage: '/projects/lakeview/aerial.jpg',
    hasRenders: true,
  },
  {
    slug: 'etno-dim',
    name: 'ЖК Етно Дім',
    stage: 'memorandum',
    stageLabel: 'Меморандум',
    location: 'вул. Судова, Львів',
    rendersDir: '/projects/etno-dim/',
    cardImage: '/projects/etno-dim/render-1.webp',
    hasRenders: true,
  },
  {
    slug: 'maetok',
    name: 'ЖК Маєток Винниківський',
    stage: 'estimation',
    stageLabel: 'Кошторисна документація',
    location: 'м. Винники, Львівська обл.',
    rendersDir: '/projects/maetok/',
    cardImage: '/projects/maetok/render-1.webp',
    hasRenders: true,
  },
  {
    slug: 'nterest',
    name: 'Дохідний дім NTEREST',
    stage: 'permits',
    stageLabel: 'Дозвільна документація',
    location: 'Львів',
    rendersDir: '/projects/nterest/',
    cardImage: '/projects/nterest/render-1.webp',
    hasRenders: true,
  },
  {
    slug: 'pipeline-04',
    name: 'Проект у роботі',
    stage: 'pre-budget',
    stageLabel: 'Прорахунок кошторисної вартості',
    location: 'Назву буде оголошено',
    hasRenders: false,
  },
];

export const getProjectBySlug = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug);
