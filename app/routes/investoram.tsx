import type { MetaFunction } from 'react-router';
import { siteUrl } from '../../src/lib/site-url';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import FadeIn from '../../src/components/FadeIn';
import InvestorHero from '../../src/components/InvestorHero';
import SectionHeading from '../../src/components/SectionHeading';
import Button from '../../src/components/Button';
import StagePill from '../../src/components/StagePill';
import ContactForm from '../../src/components/ContactForm';

export const meta: MetaFunction = ({ location }) => {
  const title = 'Інвестиції в нерухомість Львів — забудовник ВИГОДА';
  const description =
    'Формати співпраці, схема угоди, юридичний контур. Купівля майнових прав, дохідна нерухомість, партнерство.';
  const image = siteUrl('/og/investors.png');
  const url = siteUrl(location.pathname);
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
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
  'Перевірка юр.документів забудовника (ЄДРПОУ, статутні документи, дозволи).',
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
];

const Investors = () => {
  return (
    <>
      <InvestorHero
        eyebrow="Розділ 04 · інвестиції"
        title="Прямі інвестиції в забудову Львова"
        lead="Активний обʼєкт у продажу — ЖК Lakeview, від $1600/м². Pipeline у дозвільних процедурах — імена і умови після отримання дозволів. Прямий договір з ПП «ДІК Вигода+» — без посередницьких ланцюжків."
      >
        <Button as="a" href="#zustrich" variant="primary" size="lg">
          Записатись на зустріч <ArrowRight className="w-4 h-4" />
        </Button>
        <Button as="router" href="/portfolio" variant="ghost" size="lg">
          Деталі портфеля
        </Button>
      </InvestorHero>

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
        <div className="max-w-7xl mx-auto">
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
            <SectionHeading
              eyebrow="04"
              title="Поточні можливості"
              description="Публічно представляємо проект з повним пакетом дозвільних документів. Решта pipeline — у процедурах; імена і умови — після отримання дозволів."
            />
          </FadeIn>
          <div className="mt-12 max-w-3xl mx-auto border border-bg-surface bg-bg-deep">
            {OPPORTUNITIES.map((o, i) => (
              <FadeIn
                key={o.title}
                delay={i * 0.05}
                className="p-8 md:p-12 flex flex-col"
              >
                <StagePill stage={o.badgeStage} label={o.badge} className="mb-5" />
                <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 leading-snug">
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
