import { ArrowRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/Button';
import { projects } from '../data/projects';

const lakeview = projects.find((p) => p.slug === 'lakeview')!;

const Portfolio = () => {
  return (
    <>
      <PageHero
        eyebrow="Розділ 03"
        title="Портфель і pipeline"
        lead="Зараз у портфелі один активний обʼєкт — ЖК Lakeview у стадії будівництва. Нові обʼєкти у підготовці."
      >
        <Button as="router" href="/portfolio/lakeview" variant="primary" size="lg">
          Перейти до Lakeview <ArrowRight className="w-4 h-4" />
        </Button>
      </PageHero>

      {/* Filter labels (informational, not interactive — прототип) */}
      <section className="bg-bg-deep border-b border-bg-surface py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 md:gap-4">
          <span className="text-[11px] font-medium uppercase tracking-widest text-text-secondary mr-2">
            Фільтр за стадією
          </span>
          {[
            { label: 'Усі', count: 5, active: true },
            { label: 'Будується', count: 1 },
            { label: 'Дозвільна документація', count: 1 },
            { label: 'Проєктні роботи', count: 1 },
            { label: 'Відкриті продажі', count: 1 },
            { label: 'Попереднє бронування квартир', count: 1 },
          ].map((f) => (
            <button
              type="button"
              key={f.label}
              aria-pressed={f.active ?? false}
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
                <div className="text-[11px] font-medium uppercase tracking-widest text-text-secondary mb-2">
                  Параметри
                </div>
                <div className="text-text-primary leading-relaxed">
                  Бізнес-клас · 4 секції · 16 поверхів + 2-рівневий паркінг, 2 поверхи комерції · 44–183 м² · СС3
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-widest text-text-secondary mb-2">
                  Адреса
                </div>
                <div className="text-text-primary leading-relaxed">
                  вул. Володимира Великого, 2А, Львів
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="text-[11px] font-medium uppercase tracking-widest text-text-secondary mb-2">
                  Опис
                </div>
                <div className="text-text-primary leading-relaxed">
                  Житловий комплекс бізнес-класу з автономним опаленням у Франківському районі, за кроком від двох природних озер. Здача — 2027 рік.
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-6">
            <Button as="router" href="/portfolio/lakeview" variant="ghost" size="md">
              Деталі проекту <ArrowRight className="w-4 h-4" />
            </Button>
          </FadeIn>

        </div>
      </section>
    </>
  );
};

export default Portfolio;
