import { ArrowRight, ArrowUpRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import StagePill from '../components/StagePill';
import ContactForm from '../components/ContactForm';

const FORMATS = [
  {
    title: 'Купівля майнових прав',
    body: 'Класична модель: договір купівлі-продажу майнових прав на конкретну квартиру або комерційне приміщення. З правом переуступки.',
  },
  {
    title: 'Дохідна нерухомість',
    body: 'Інвестиція в одиниці продукту, орієнтованого на оренду. Формат розглядається для проектів типу «дохідний дім» — після виходу на стадію продажів.',
  },
  {
    title: 'Партнерство по проекту',
    body: 'Спільна участь у фінансуванні окремого проекту або обʼєкта. Умови, гарантії й періодичність звітності — обговорюються індивідуально.',
  },
];

const STEPS = [
  'Заявка на сайті або дзвінок.',
  'Брифінг: формат, обсяг, очікування інвестора.',
  'Презентація проекту і фінансової моделі.',
  'Перевірка юр.документів забудовника (ЄДРПОУ, ліцензія, дозволи).',
  'Узгодження умов угоди.',
  'Підписання договору купівлі-продажу майнових прав.',
  'Оплата за графіком.',
  'Регулярна звітність про хід будівництва до введення в експлуатацію.',
];

const RECEIVES = [
  'Прямий договір з забудовником, без посередників.',
  'Доступ до пакета юр.документів проекту.',
  'Право переуступки.',
  'Помісячний фотозвіт про хід будівництва.',
  'Закріпленого менеджера на період до здачі.',
  'Прозорі умови оплати — графік фіксується у договорі.',
  'Можливість зустрічі на майданчику.',
];

const OPPORTUNITIES = [
  {
    title: 'ЖК Lakeview',
    badge: 'Активний продаж',
    badgeStage: 'construction' as const,
    body: 'Бізнес-клас, від $1600/м². Розстрочка до 2027.',
    cta: 'Деталі проекту',
    href: '/portfolio/lakeview',
  },
  {
    title: 'Дохідний дім NTEREST',
    badge: 'Дозвільна документація',
    badgeStage: 'permits' as const,
    body: 'Концепт дохідної нерухомості. Перші угоди — після отримання дозволу на будівельні роботи.',
    cta: 'Підписатись на оновлення',
    href: '/portfolio/nterest',
  },
  {
    title: 'Інші проекти pipeline',
    badge: 'Pre-construction',
    badgeStage: 'memorandum' as const,
    body: 'Етно Дім, Маєток Винниківський, проект без назви — на ранніх стадіях. Інвестиційні умови — за запитом.',
    cta: 'Переглянути портфель',
    href: '/portfolio',
  },
];

const Investors = () => {
  return (
    <>
      <PageHero
        eyebrow="Розділ 04"
        title="Інвесторам"
        lead="Формати співпраці, схема угоди, юридичний контур. Кожна співпраця — індивідуально, з документами на руках."
        decorative
      >
        <Button as="a" href="#zustrich" variant="primary" size="lg">
          Записатись на зустріч <ArrowRight className="w-4 h-4" />
        </Button>
        <Button as="router" href="/pidkhid" variant="ghost" size="lg">
          Як ми працюємо
        </Button>
      </PageHero>

      {/* FORMATS */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-b border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="01" title="Формати співпраці" />
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-bg-surface border border-bg-surface">
            {FORMATS.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.05} className="bg-bg-base p-8">
                <span className="block text-accent font-mono text-xs tracking-widest mb-4">
                  //{String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4 leading-snug">
                  {f.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">{f.body}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="02" title="Як виглядає угода" />
          </FadeIn>
          <ol className="mt-12 divide-y divide-bg-surface border-y border-bg-surface">
            {STEPS.map((step, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <li className="flex gap-6 py-6">
                  <span className="text-accent font-mono text-xs tracking-widest pt-1 flex-none w-10">
                    //{String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-text-primary text-base md:text-lg leading-relaxed">
                    {step}
                  </span>
                </li>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>

      {/* WHAT INVESTOR RECEIVES */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="03" title="Що отримує інвестор" />
          </FadeIn>
          <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {RECEIVES.map((item, i) => (
              <li
                key={i}
                className="bg-bg-base p-6 md:p-7 flex items-start gap-4"
              >
                <span className="text-accent font-mono text-xs tracking-widest pt-1 flex-none">
                  //{String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-text-primary leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="04" title="Поточні можливості" />
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-bg-surface border border-bg-surface">
            {OPPORTUNITIES.map((o, i) => (
              <FadeIn
                key={o.title}
                delay={i * 0.05}
                className="bg-bg-deep p-8 flex flex-col"
              >
                <StagePill stage={o.badgeStage} label={o.badge} className="mb-5" />
                <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3 leading-snug">
                  {o.title}
                </h3>
                <p className="text-text-secondary leading-relaxed mb-6 flex-1">
                  {o.body}
                </p>
                <Button as="router" href={o.href} variant="link" className="self-start">
                  {o.cta} <ArrowUpRight className="w-4 h-4" />
                </Button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* LEGAL */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="05" title="Юридичний контур" />
          </FadeIn>
          <div className="mt-12 space-y-4 text-text-secondary text-base md:text-lg leading-relaxed">
            <p>ТОВ «БК ВИГОДА ГРУП», ЄДРПОУ 42016395.</p>
            <p>Ліцензія на будівництво від 27.12.2019, безстрокова.</p>
            <p>
              Договірна модель — купівля-продаж майнових прав з правом
              переуступки.
            </p>
            <p>
              Корпоративна пошта для запитів інвесторів:{' '}
              <a
                href="mailto:vygoda.sales@gmail.com"
                className="text-text-primary underline decoration-accent decoration-1 underline-offset-4 hover:text-accent transition-colors"
              >
                vygoda.sales@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="zustrich" className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <ContactForm
              source="investors"
              heading="Записатись на зустріч"
              description="Розкажіть про формат і обсяг — підготуємо персональну презентацію."
              fields={['investor-format', 'message']}
              submitLabel="Записатись на зустріч"
              successText="Прийнято. Менеджер звʼяжеться протягом робочого дня для узгодження часу."
              disclaimer="Натискаючи «Записатись на зустріч», ви погоджуєтесь на обробку персональних даних. Бюджет і чутлива інформація обговорюються лише при особистій комунікації."
            />
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default Investors;
