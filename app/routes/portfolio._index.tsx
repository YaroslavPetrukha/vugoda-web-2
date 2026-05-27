import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { siteUrl } from '../../src/lib/site-url';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import FadeIn from '../../src/components/FadeIn';
import PortfolioHero from '../../src/components/PortfolioHero';
import ProjectCard from '../../src/components/ProjectCard';
import Button from '../../src/components/Button';
import { getRequiredProject } from '../../src/data/projects';

export const meta: MetaFunction = ({ location }) => {
  const title = 'Портфоліо нерухомості Львів — забудовник ВИГОДА';
  const description =
    "ЖК Lakeview — активний обʼєкт у Львові: бізнес-клас, Франківський район, монолітно-каркас, здача 2027. ВИГОДА — системний девелопмент повним циклом.";
  const image = siteUrl('/og/portfolio.png');
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
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
};

const lakeview = getRequiredProject('lakeview');

const Portfolio = () => {
  return (
    <>
      <PortfolioHero
        eyebrow="Розділ 03"
        title="Один обʼєкт. Повний цикл."
        lead="Системний девелопмент означає не масштабувати кількість, а тримати якість від проектування до здачі."
      >
        <Button as="router" href="/portfolio/lakeview" variant="primary" size="md">
          Перейти до Lakeview <ArrowRight className="w-4 h-4" />
        </Button>
        <Link
          to="/kontakty"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-accent transition-colors border-b border-text-secondary/30 hover:border-accent pb-0.5"
        >
          Залишити заявку <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </PortfolioHero>

      {/* === Capacity statement — позиція в портфелі === */}
      <section className="bg-bg-deep border-b border-bg-surface py-12 md:py-16 px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12">
            <div>
              <span className="text-xs font-mono tracking-[0.18em] text-accent uppercase">
                <span aria-hidden="true">// </span>Позиція в портфелі
              </span>
            </div>
            <div className="flex flex-col gap-5">
              <p className="text-xl md:text-2xl font-bold text-text-primary leading-snug max-w-2xl">
                Один активний обʼєкт — не обмеження, а принцип.
              </p>
              <p className="text-base text-text-secondary leading-relaxed max-w-2xl">
                Системний девелопмент означає не масштабувати кількість, а тримати якість від проектування до здачі. Повний фокус команди — на живому обʼєкті.
              </p>
              <p className="text-base text-text-secondary leading-relaxed max-w-2xl">
                Наступні проекти — у підготовці дозвільної документації. Публічний анонс — після завершення процедур.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* === Lakeview featured + meta === */}
      <section className="bg-bg-base py-16 md:py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <ProjectCard project={lakeview} variant="featured" />
          </FadeIn>

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

          {/* Related location analysis */}
          <FadeIn delay={0.15} className="mt-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-bg-deep border border-bg-surface">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-widest text-accent mb-2">
                  Аналіз локації
                </div>
                <p className="text-text-primary font-semibold">
                  Чому ми будуємо у Франківському районі Львова
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Інфраструктура, демографія, ринок нерухомості — чому саме ця локація.
                </p>
              </div>
              <Link
                to="/novyny/frankivskyi-raion-lokatsiia-lviv"
                className="inline-flex items-center gap-2 text-accent hover:underline whitespace-nowrap"
              >
                Читати аналіз <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default Portfolio;
