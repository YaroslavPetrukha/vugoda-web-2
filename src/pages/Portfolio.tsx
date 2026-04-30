import { ArrowRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/Button';
import { projects } from '../data/projects';

const STAGE_DEFINITIONS = [
  {
    title: 'Меморандум',
    body: 'Зафіксовані наміри і умови з замовником/власником ділянки.',
  },
  {
    title: 'Кошторисна документація',
    body: 'Прораховуємо вартість матеріалів і робіт.',
  },
  {
    title: 'Дозвільна документація',
    body: 'Узгодження містобудівних умов, експертиза, дозвіл на будівництво.',
  },
  {
    title: 'Прорахунок кошторисної вартості',
    body: 'Рання стадія, до повного кошторису. Назва і параметри проекту ще можуть змінюватись.',
  },
  {
    title: 'Будується',
    body: 'Обʼєкт на майданчику, щомісячна фотофіксація.',
  },
];

const lakeview = projects.find((p) => p.slug === 'lakeview')!;
const pipeline = projects.filter((p) => p.slug !== 'lakeview');

const Portfolio = () => {
  return (
    <>
      <PageHero
        eyebrow="Розділ 03"
        title="Портфель і pipeline"
        lead="Один обʼєкт у будівництві, чотири — на стадіях меморандуму, кошторису і дозвільної документації. Нижче — кожен зі своєю стадією."
      >
        <Button as="router" href="/portfolio/lakeview" variant="primary" size="lg">
          Перейти до Lakeview <ArrowRight className="w-4 h-4" />
        </Button>
      </PageHero>

      {/* Filter labels (informational, not interactive — прототип) */}
      <section className="bg-bg-deep border-b border-bg-surface py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 md:gap-4">
          <span className="text-[10px] uppercase tracking-widest text-text-secondary mr-2">
            Фільтр за стадією
          </span>
          {[
            { label: 'Усі', count: 5, active: true },
            { label: 'Будується', count: 1 },
            { label: 'Дозвільна документація', count: 1 },
            { label: 'Кошторисна документація', count: 1 },
            { label: 'Меморандум', count: 1 },
            { label: 'Прорахунок кошторисної вартості', count: 1 },
          ].map((f) => (
            <button
              type="button"
              key={f.label}
              className={`px-3 py-2 text-xs uppercase tracking-widest border transition-colors rounded-none ${
                f.active
                  ? 'bg-accent text-bg-deep border-accent'
                  : 'bg-transparent text-text-secondary border-bg-surface hover:border-accent hover:text-accent'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="bg-bg-base py-16 md:py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Featured */}
          <FadeIn>
            <ProjectCard project={lakeview} variant="featured" />
          </FadeIn>

          {/* Lakeview meta info */}
          <FadeIn delay={0.05}>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">
                  Параметри
                </div>
                <div className="text-text-primary leading-relaxed">
                  Бізнес-клас · 4 секції · до 15 поверхів · 44–183 м² · СС3
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">
                  Адреса
                </div>
                <div className="text-text-primary leading-relaxed">
                  вул. Володимира Великого, 2А, Львів
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">
                  Опис
                </div>
                <div className="text-text-primary leading-relaxed">
                  Активний флагман. Документований хід будівництва оновлюється
                  щомісяця.
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-6">
            <Button as="router" href="/portfolio/lakeview" variant="ghost" size="md">
              Деталі проекту <ArrowRight className="w-4 h-4" />
            </Button>
          </FadeIn>

          {/* Pipeline */}
          <FadeIn className="mt-24">
            <SectionHeading
              eyebrow="Pipeline"
              title="Чотири проекти у роботі"
              description="Стадії — без прикрас. Деталі — на сторінці кожного проекту."
            />
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {pipeline.map((p, i) => (
              <FadeIn key={p.slug} delay={i * 0.05}>
                <ProjectCard project={p} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO READ STAGES */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="06" title="Як читати стадії" />
          </FadeIn>
          <dl className="mt-12 divide-y divide-bg-surface border-y border-bg-surface">
            {STAGE_DEFINITIONS.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.05}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 md:py-7">
                  <dt className="text-text-primary font-bold uppercase text-xs tracking-widest">
                    {s.title}
                  </dt>
                  <dd className="md:col-span-2 text-text-secondary leading-relaxed">
                    {s.body}
                  </dd>
                </div>
              </FadeIn>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
};

export default Portfolio;
