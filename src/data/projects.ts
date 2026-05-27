import type { Project } from '../types';
import type { PictureSource } from '../components/ui/Picture';

// Карткові зображення — ?preset=card генерує AVIF/WebP srcset 320w + 640w
import lakeviewCard from '../assets/projects/lakeview/aerial.jpg?preset=card';
import etnoDimCard from '../assets/projects/etno-dim/render-1.webp?preset=card';
import maetokCard from '../assets/projects/maetok/render-1.webp?preset=card';
import nterestCard from '../assets/projects/nterest/render-1.webp?preset=card';

export const projects: Project[] = [
  {
    slug: 'lakeview',
    name: 'ЖК Lakeview',
    stage: 'construction',
    stageLabel: 'Будується · здача 2027',
    location: 'вул. Володимира Великого, 2А, Львів',
    externalSite: 'https://yaroslavpetrukha.github.io/Lakeview/',
    rendersDir: '/projects/lakeview/',
    cardImage: lakeviewCard as unknown as PictureSource,
    hasRenders: true,
  },
  {
    slug: 'etno-dim',
    name: 'ЖК Етно Дім',
    stage: 'memorandum',
    stageLabel: 'Меморандум',
    location: 'вул. Судова, Львів',
    rendersDir: '/projects/etno-dim/',
    cardImage: etnoDimCard as unknown as PictureSource,
    hasRenders: true,
  },
  {
    slug: 'maetok',
    name: 'ЖК Маєток Винниківський',
    stage: 'estimation',
    stageLabel: 'Кошторисна документація',
    location: 'м. Винники, Львівська обл.',
    rendersDir: '/projects/maetok/',
    cardImage: maetokCard as unknown as PictureSource,
    hasRenders: true,
  },
  {
    slug: 'nterest',
    name: 'Дохідний дім NTEREST',
    stage: 'permits',
    stageLabel: 'Дозвільна документація',
    location: 'Львів',
    rendersDir: '/projects/nterest/',
    cardImage: nterestCard as unknown as PictureSource,
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

export const getRequiredProject = (slug: string): Project => {
  const p = projects.find((x) => x.slug === slug);
  if (!p) throw new Error(`Project '${slug}' missing from data/projects.ts`);
  return p;
};
