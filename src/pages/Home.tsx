import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import Button from '../components/Button';
import SectionHeading from '../components/SectionHeading';
import TrustStripe from '../components/TrustStripe';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/projects';

const PRINCIPLES = [
  {
    num: '01',
    title: 'Меморандум',
    body: 'Фіксуємо умови з замовником або партнером — обсяг, відповідальність, графік. До цього кроку проектну роботу не починаємо.',
  },
  {
    num: '02',
    title: 'Кошторис',
    body: 'Прораховуємо вартість матеріалів і робіт до старту продажів, а не після. Ціна квадрата спирається на цифри, не на ринкову позицію.',
  },
  {
    num: '03',
    title: 'Дозвільна документація',
    body: 'Узгоджуємо містобудівні умови, експертизу, дозвіл на будівництво. Без повного пакета на майданчик не виходимо.',
  },
  {
    num: '04',
    title: 'Будівництво',
    body: 'Щомісяця документуємо хід робіт. Кожна фаза — фотозвіт, акти, технагляд.',
  },
];

const AUDIENCES = [
  {
    title: 'Інвестору',
    body: 'Формати співпраці, схема угоди, юридичний контур. Зустрічі — індивідуально, презентація — за запитом.',
    cta: 'Формати співпраці',
    href: '/investoram',
  },
  {
    title: 'Покупцю',
    body: 'Активний обʼєкт — ЖК Lakeview. Планування, ціни, умови розтермінування і контакти відділу продажів — на сайті проекту.',
    cta: 'Перейти до Lakeview',
    href: '/portfolio/lakeview',
  },
  {
    title: 'Партнеру і банку',
    body: 'Юридична картка, ліцензії, дозволи, реквізити. Запит документів для due diligence — за формою.',
    cta: 'Юридична картка',
    href: '/partneram',
  },
];

const lakeview = projects.find((p) => p.slug === 'lakeview')!;
const pipeline = projects.filter((p) => p.slug !== 'lakeview');

const DOCUMENTS = [
  {
    title: 'Зразок договору',
    body: 'Договір купівлі-продажу майнових прав. Стандартна форма, яку підписуємо з кожним покупцем.',
    cta: 'Завантажити PDF',
    href: '/partneram',
    external: false,
  },
  {
    title: 'Ліцензія ДАБІ',
    body: 'Безстрокова, з 27 грудня 2019 року. Перевірити статус — у Держреєстрі за ЄДРПОУ 42016395.',
    cta: 'Відкрити реєстр',
    href: 'https://e-construction.gov.ua/',
    external: true,
  },
  {
    title: 'Пакет для DD',
    body: 'Фінансова звітність, структура власності, історія обʼєктів. Для партнерів та інституційних покупців.',
    cta: 'Запитати пакет',
    href: '/partneram',
    external: false,
  },
] as const;

const Home = () => {
  return (
    <>
      {/* HERO */}
      <section
        aria-labelledby="hero-heading"
        className="relative min-h-[640px] md:min-h-[680px] lg:min-h-[720px] w-full overflow-hidden bg-bg-deep flex flex-col"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="/vugoda-web-2/projects/lakeview/aerial.jpg"
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/40 via-bg-deep/55 to-bg-deep" />
          <img
            src="/vugoda-web-2/isometric-grid.svg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.06] mix-blend-overlay pointer-events-none"
          />
        </div>

        {/* Background wordmark — водяний знак, desktop only, нижній правий безпечний регіон */}
        <div
          aria-hidden="true"
          className="hidden md:block absolute bottom-0 right-0 w-full text-right z-0 pointer-events-none select-none overflow-hidden translate-y-[12%]"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="block text-[22vw] lg:text-[18vw] font-bold leading-none tracking-tighter text-text-primary/[0.04] uppercase"
          >
            ВИГОДА
          </motion.span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-7xl mx-auto w-full px-6 lg:px-8 pt-24 md:pt-32 pb-20 md:pb-24">
          <FadeIn className="max-w-3xl">
            <span className="inline-block text-xs font-mono tracking-[0.18em] text-accent uppercase mb-4">
              // Львів · 2026
            </span>
            <h1
              id="hero-heading"
              className="text-[clamp(2.25rem,4.6vw,4rem)] leading-[1.08] tracking-tight font-bold text-text-primary mb-8"
            >
              Системний девелопмент, у якому цінність є результатом точних рішень.
            </h1>
            <p className="text-text-secondary text-base md:text-lg mb-12 max-w-xl leading-relaxed">
              Будуємо у Львові й області. На сьогодні — один активний обʼєкт
              (Lakeview, здача 2027) і чотири проекти у pre-construction. Кожне
              рішення — задокументоване.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                as="router"
                href="/portfolio"
                variant="primary"
                size="lg"
                className="text-base"
              >
                Переглянути портфель
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </Button>
              <Button as="router" href="/investoram" variant="ghost" size="md">
                Для інвесторів
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TRUST STRIPE */}
      <TrustStripe />

      {/* WHO WE ARE */}
      <section className="bg-bg-base py-20 md:py-24 px-6 lg:px-8 border-b border-bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <FadeIn>
              <SectionHeading eyebrow="01" title="Хто ми" />
            </FadeIn>
            <FadeIn delay={0.1}>
              <dl className="mt-10 border-t border-bg-surface divide-y divide-bg-surface">
                <div className="grid grid-cols-[120px_1fr] py-4 gap-4">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.18em] text-text-secondary self-center">
                    Засновано
                  </dt>
                  <dd className="text-text-primary font-medium tabular-nums">2019</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] py-4 gap-4">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.18em] text-text-secondary self-center">
                    Локація
                  </dt>
                  <dd className="text-text-primary font-medium">Львів і область</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] py-4 gap-4">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.18em] text-text-secondary self-center">
                    Роль
                  </dt>
                  <dd className="text-text-primary font-medium">Забудовник, ген.підрядник</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] py-4 gap-4">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.18em] text-text-secondary self-center">
                    Сектор
                  </dt>
                  <dd className="text-text-primary font-medium">Житло, дохідні доми</dd>
                </div>
              </dl>
            </FadeIn>
          </div>
          <div className="lg:col-span-8 lg:pl-8 space-y-6 leading-relaxed">
            <FadeIn delay={0.05}>
              <p className="text-xl md:text-2xl text-text-primary leading-snug font-medium">
                ТОВ «БК ВИГОДА ГРУП» — забудовник і генеральний підрядник зі
                Львова.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-text-secondary text-base md:text-lg">
                Працюємо з власними новими обʼєктами і приймаємо проекти на
                відновлення будівництва від інших замовників. Ліцензія Державної
                архітектурно-будівельної інспекції — безстрокова, з 27 грудня
                2019 року.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SYSTEMIC DEVELOPMENT — 4 PRINCIPLES */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8 relative overflow-hidden">
        <img
          src="/vugoda-web-2/isometric-grid.svg"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] mix-blend-overlay pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="02"
              title="Що означає системний девелопмент"
              description="Чотири фази, через які проходить кожен проект до запуску продажів. Без скорочень і обходів."
            />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface mt-16 border border-bg-surface">
            {PRINCIPLES.map((p, i) => (
              <FadeIn
                key={p.num}
                delay={i * 0.06}
                className="bg-bg-deep p-6 md:p-10 transition-colors duration-300 group relative
                           before:absolute before:inset-x-0 before:top-0 before:h-px
                           before:bg-accent before:scale-x-0 before:origin-left
                           hover:before:scale-x-100 before:transition-transform before:duration-500
                           hover:bg-bg-surface/40"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <span className="text-accent font-mono text-sm font-semibold tracking-[0.18em] tabular-nums">
                      //{p.num}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-bg-surface group-hover:bg-accent/30 transition-colors duration-500"
                    />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-text-primary">
                    {p.title}
                  </h3>
                  <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-px border-t border-bg-surface pt-8 md:pt-10 flex justify-end">
            <Button as="router" href="/pidkhid" variant="ghost" size="md">
              Детально про підхід <ArrowRight aria-hidden="true" className="w-4 h-4" />
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* CURRENT FOCUS — PORTFOLIO */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="03"
              title="Поточний фокус"
              description="Один обʼєкт у будівництві, чотири — у pre-construction."
            />
          </FadeIn>

          <div className="mt-12 space-y-6">
            {/* Featured: Lakeview — full-width hero */}
            <FadeIn delay={0.05}>
              <ProjectCard project={lakeview} variant="featured" />
            </FadeIn>

            {/* Pipeline: 2×2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pipeline.map((p, i) => (
                <FadeIn key={p.slug} delay={0.1 + i * 0.05}>
                  <ProjectCard project={p} />
                </FadeIn>
              ))}
            </div>
          </div>

          <FadeIn className="mt-px border-t border-bg-surface pt-8 md:pt-10 flex justify-end">
            <Button as="router" href="/portfolio" variant="ghost" size="md">
              Дивитись усі проекти <ArrowRight aria-hidden="true" className="w-4 h-4" />
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="04"
              title="Для кого ми працюємо"
              description="Сайт — фільтр довіри. Деталі для кожного сценарію — у спеціалізованих розділах."
            />
          </FadeIn>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-bg-surface border border-bg-surface">
            {AUDIENCES.map((a, i) => (
              <FadeIn key={a.title} delay={i * 0.06}>
                <Link
                  to={a.href}
                  className="group flex flex-col h-full bg-bg-deep p-8 md:p-10
                             hover:bg-bg-surface/40 transition-colors duration-500
                             relative
                             before:absolute before:inset-x-0 before:top-0 before:h-px
                             before:bg-accent before:scale-x-0 before:origin-left
                             hover:before:scale-x-100 before:transition-transform before:duration-500"
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-text-primary group-hover:text-accent transition-colors duration-500 mb-4">
                    {a.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed mb-8 flex-1">
                    {a.body}
                  </p>
                  <span className="inline-flex items-center gap-2 text-accent text-xs font-mono uppercase tracking-[0.18em] group-hover:gap-3 transition-all duration-300 self-start">
                    {a.cta}
                    <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* DOCUMENTS & FACTS */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="05"
              title="Документи та факти"
              description="Поточний портфель: 0 зданих · 1 у будівництві · 4 у pipeline. Документи — у відкритому доступі."
            />
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-bg-surface border border-bg-surface">
            {DOCUMENTS.map((doc, i) => {
              const cardClass = `group flex flex-col h-full bg-bg-base p-8 md:p-10
                                 hover:bg-bg-surface/40 transition-colors duration-500
                                 relative
                                 before:absolute before:inset-x-0 before:top-0 before:h-px
                                 before:bg-accent before:scale-x-0 before:origin-left
                                 hover:before:scale-x-100 before:transition-transform before:duration-500`;
              const inner = (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-text-primary group-hover:text-accent transition-colors duration-500 mb-3">
                    {doc.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-6 flex-1">
                    {doc.body}
                  </p>
                  <span className="inline-flex items-center gap-2 text-accent text-xs font-mono uppercase tracking-[0.18em] group-hover:gap-3 transition-all duration-300 self-start">
                    {doc.cta}
                    {doc.external ? (
                      <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
                    ) : (
                      <ArrowRight aria-hidden="true" className="w-4 h-4" />
                    )}
                  </span>
                </>
              );

              return (
                <FadeIn key={doc.title} delay={i * 0.06}>
                  {doc.external ? (
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClass}
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link to={doc.href} className={cardClass}>
                      {inner}
                    </Link>
                  )}
                </FadeIn>
              );
            })}
          </div>

          <FadeIn className="mt-10">
            <p className="text-xs text-text-secondary text-center tracking-wide">
              ТОВ «БК ВИГОДА ГРУП» · ЄДРПОУ 42016395 · Дані звіряються з державними
              реєстрами за запитом.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* CTA TO CONTACT */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <SectionHeading
              eyebrow="06"
              title="Залишилось питання"
              description="Залиште номер — зателефонуємо сьогодні. Без скриптів і тиску — відповідаємо на конкретні питання щодо документів, ціни, термінів."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="md:justify-self-end w-full md:w-auto">
            <div className="flex flex-col gap-4 md:items-end">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  as="router"
                  href="/kontakty"
                  variant="primary"
                  size="lg"
                  className="text-base"
                >
                  Замовити дзвінок
                  <ArrowRight aria-hidden="true" className="w-4 h-4" />
                </Button>
                <Button
                  as="a"
                  href="mailto:vygoda.sales@gmail.com"
                  variant="ghost"
                  size="lg"
                >
                  <Mail aria-hidden="true" className="w-4 h-4" />
                  Написати на email
                </Button>
              </div>
              <p className="text-xs text-text-secondary/80 font-mono tracking-wide mt-2">
                Відповідаємо у робочі години · Пн–Пт 09:00–19:00
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default Home;
