import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
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
    "Купівля майнових прав у Львові: формати співпраці, юридичний контур угоди, розстрочка. ВИГОДА — забудовник з активним об'єктом ЖК Lakeview, здача 2027.";
  const image = siteUrl('/og/investors.png');
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

const FAQ_ITEMS = [
  {
    q: 'Які формати співпраці пропонує ВИГОДА інвесторам?',
    a: 'ВИГОДА пропонує три формати інвестиційної участі. Перший — купівля майнових прав на конкретну квартиру або комерційне приміщення з правом переуступки, підходить для приватних покупців і інвесторів. Другий — дохідна нерухомість у форматі «дохідний дім», орієнтована на оренду, розглядається для нових проектів після виходу на стадію продажів. Третій — партнерство по проекту: спільне фінансування окремого обʼєкта з індивідуальними умовами, гарантіями і графіком звітності. Всі три формати — прямий договір з ПП «ДІК "Вигода +"», ЄДРПОУ 44876801, без посередників.',
  },
  {
    q: 'Як працює угода через майнові права і що підписується?',
    a: 'Угода через майнові права — це договір купівлі-продажу майнових прав на конкретний обʼєкт нерухомості, укладений до введення будинку в експлуатацію. Покупець отримує юридично оформлений документ, що фіксує: адресу обʼєкта, площу, поверх, секцію, ціну і графік оплати. До підписання інвестор отримує повний пакет юридичних документів забудовника: статутні документи, ЄДРПОУ 44876801, дозвіл на будівництво, технічні умови. Договір передбачає право переуступки — тобто майнові права можна відступити третій особі до здачі будинку.',
  },
  {
    q: 'Яка мінімальна сума інвестиції в ЖК Lakeview?',
    a: 'Мінімальна точка входу у ЖК Lakeview розраховується від стартової ціни $1600/м² і мінімальної площі однокімнатної квартири 44 м² — орієнтовно від $70 000. Умови оплати: 30% першого внеску при підписанні договору, решта розподіляється на розстрочку до 2027 року за погодженим графіком. Конкретна сума залежить від обраного поверху, секції і наявності. Актуальний прайс надається на особистій зустрічі або після заявки — контакти відділу продажів: 097 990 03 90.',
  },
  {
    q: 'Як переуступити майнові права до здачі будинку?',
    a: 'Переуступка майнових прав — це передача прав на обʼєкт від первісного покупця третій особі до введення будинку в експлуатацію. Договір купівлі-продажу майнових прав з ПП «ДІК "Вигода +"» (ЄДРПОУ 44876801) передбачає це право для всіх інвесторів. Процедура передбачає підписання договору переуступки між первісним покупцем, новим покупцем і забудовником або нотаріальне оформлення передачі прав. Для уточнення процедури і поточних умов — зверніться до офісу продажу або менеджера, закріпленого за угодою.',
  },
  {
    q: 'Який очікуваний дохід від інвестиції в нерухомість Lakeview?',
    a: 'Дохідність від інвестиції у нерухомість на стадії будівництва складається з двох складових: приріст вартості від ціни входу до ринкової ціни після введення в експлуатацію, і орендний дохід від здачі квартири. Для бізнес-класу у Франківському районі Львова приріст вартості квадратного метра від стадії котловану до здачі становить, за аналітикою ринку 2023–2025 рр., 25–40%. Орендна прибутковість у цьому сегменті — 6–9% річних. Конкретна фінансова модель під ваш бюджет готується на особистій зустрічі з ВИГОДА.',
  },
  {
    q: 'Які гарантії отримує інвестор і як контролюється будівництво?',
    a: 'Інвестор отримує прямий договір з забудовником ПП «ДІК "Вигода +"» (ЄДРПОУ 44876801) з фіксованим графіком оплати і предметом угоди. До підписання надається повний пакет юридичних документів: статут, дозвіл на будівництво, технічні умови. Протягом усього циклу — від підписання до введення в експлуатацію — інвестор отримує помісячний фотозвіт про хід будівництва і має закріпленого менеджера. Передбачена можливість особистого візиту на будмайданчик для перевірки стану робіт.',
  },
  {
    q: 'Чи можна вийти з угоди і які умови розірвання?',
    a: 'Умови дострокового розірвання договору купівлі-продажу майнових прав визначаються індивідуально і фіксуються в договорі до підписання. Стандартно договір передбачає можливість переуступки прав третій особі — що дозволяє фактично вийти з інвестиції без формального розірвання, зберігаючи накопичений приріст вартості. Умови повернення коштів у разі ініціативи покупця і форс-мажорних обставин обговорюються на етапі переговорів до підписання. Рекомендуємо уточнити деталі у ВИГОДА до підписання, щоб умови виходу були зрозумілі з першого дня.',
  },
];

const Investors = () => {
  const investorFaqLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: investorFaqLd }}
      />
      <InvestorHero
        eyebrow="Розділ 04 · інвестиції"
        title="Прямі інвестиції в забудову Львова"
        lead="Активний обʼєкт — ЖК Lakeview, від $1600/м². Прямий договір з ПП «ДІК Вигода+» — без посередницьких ланцюжків."
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

      {/* FAQ */}
      <section id="faq" className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="FAQ"
              title="Часті питання інвесторів"
              description="Найчастіші запити перед підписанням договору. Якщо вашого питання немає — заповніть форму нижче або зателефонуйте."
            />
          </FadeIn>
          <div className="mt-12 divide-y divide-bg-surface border-y border-bg-surface">
            {FAQ_ITEMS.map((item, i) => (
              <FadeIn key={item.q} delay={i * 0.03}>
                <details className="group py-6">
                  <summary className="flex items-start gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="text-accent font-mono text-xs tracking-widest pt-1.5 flex-none w-10">
                      //{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-text-primary text-lg md:text-xl font-bold leading-snug flex-1">
                      {item.q}
                    </span>
                    <span aria-hidden="true" className="text-accent text-xl flex-none transition-transform group-open:rotate-45 pt-1">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 ml-14 text-text-secondary text-base leading-relaxed">
                    {item.a}
                  </p>
                </details>
              </FadeIn>
            ))}
          </div>

          {/* Related guide for due diligence */}
          <FadeIn delay={0.1} className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-bg-deep border border-bg-surface">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-widest text-accent mb-2">
                  Практичний гайд
                </div>
                <p className="text-text-primary font-semibold">
                  Як перевірити забудовника перед купівлею: 8 пунктів
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Чек-лист для due diligence: ЄДРПОУ, дозволи, договір, репутація.
                </p>
              </div>
              <Link
                to="/novyny/chek-list-pereveryty-zabudovnyka"
                className="inline-flex items-center gap-2 text-accent hover:underline whitespace-nowrap"
              >
                Читати гайд <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
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
