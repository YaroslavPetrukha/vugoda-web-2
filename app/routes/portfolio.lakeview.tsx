import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { siteUrl } from '../../src/lib/site-url';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import FadeIn from '../../src/components/FadeIn';
import PageHero from '../../src/components/PageHero';
import SectionHeading from '../../src/components/SectionHeading';
import Button from '../../src/components/Button';
import StagePill from '../../src/components/StagePill';
import ProjectGalleryStrip from '../../src/components/ProjectGalleryStrip';
import Breadcrumb from '../../src/components/Breadcrumb';
import type { ComponentProps } from 'react';

// ContactForm is loaded only when the form section scrolls near the viewport.
// lazy() alone defers the JS parse but triggers a network fetch as soon as the
// component renders — which happens at page load since the section is in the
// initial tree. The IntersectionObserver wrapper below prevents the fetch until
// the section is 200px from the viewport, keeping the lakeview initial payload lean.
const ContactFormLazy = lazy(() => import('../../src/components/ContactForm'));

type ContactFormProps = ComponentProps<typeof ContactFormLazy>;

function LazyContactForm(props: ContactFormProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-[400px]">
      {show ? (
        <Suspense fallback={<div className="bg-bg-surface p-8 md:p-10 min-h-[400px]" />}>
          <ContactFormLazy {...props} />
        </Suspense>
      ) : (
        <div className="bg-bg-surface p-8 md:p-10 min-h-[400px]" />
      )}
    </div>
  );
}

import type { PictureSource } from '../../src/components/ui/Picture';

// Hero — ?preset=hero → AVIF/WebP srcset 480/768/1280/1920w
import lakeviewHero from '../../src/assets/projects/lakeview/hero.jpg?preset=hero';
import lakeviewAerial from '../../src/assets/projects/lakeview/aerial.jpg?preset=hero';

// Рендери — ?preset=gallery → AVIF/WebP srcset 600/1200w
import lakeviewSemiAerial from '../../src/assets/projects/lakeview/semi-aerial.jpg?preset=gallery';
import lakeviewCloseup from '../../src/assets/projects/lakeview/closeup.jpg?preset=gallery';
import lakeviewEntrance from '../../src/assets/projects/lakeview/entrance.jpg?preset=gallery';
import lakeviewLakeBridge from '../../src/assets/projects/lakeview/lake-bridge.jpg?preset=gallery';
import lakeviewTerrace from '../../src/assets/projects/lakeview/terrace.jpg?preset=gallery';

// Будівельні фото — ?preset=construction → AVIF/WebP srcset 400/800w, quality 70
import decImg01 from '../../src/assets/construction/dec-01.jpg?preset=construction';
import decImg02 from '../../src/assets/construction/dec-02.jpg?preset=construction';
import decImg03 from '../../src/assets/construction/dec-03.jpg?preset=construction';
import janImg01 from '../../src/assets/construction/jan-01.jpg?preset=construction';
import janImg02 from '../../src/assets/construction/jan-02.jpg?preset=construction';
import janImg03 from '../../src/assets/construction/jan-03.jpg?preset=construction';
import febImg01 from '../../src/assets/construction/feb-01.jpg?preset=construction';
import febImg02 from '../../src/assets/construction/feb-02.jpg?preset=construction';
import febImg03 from '../../src/assets/construction/feb-03.jpg?preset=construction';
import marImg01 from '../../src/assets/construction/mar-01.jpg?preset=construction';
import marImg02 from '../../src/assets/construction/mar-02.jpg?preset=construction';
import marImg03 from '../../src/assets/construction/mar-03.jpg?preset=construction';

const PARAMETERS = [
  { label: 'Адреса', value: 'вул. Володимира Великого, 2А, Франківський район, Львів' },
  { label: 'Клас', value: 'Бізнес' },
  { label: 'Секцій', value: '4' },
  { label: 'Поверховість', value: 'до 16' },
  { label: 'Площі квартир', value: '44–183 м² (1/2/3-кімнатні)' },
  { label: 'Паркінг', value: '2 рівні підземного' },
  { label: 'Технологія', value: 'Монолітно-каркасна, залізобетон + керамоблоки, мінвата' },
  { label: 'Клас наслідків', value: 'СС3 (найвищий)' },
  { label: 'Термін здачі', value: '2027' },
  { label: 'Стартова ціна', value: 'від $1600 / м²' },
  { label: 'Умови оплати', value: '30% перший внесок + розстрочка на період будівництва' },
  { label: 'Комерція', value: '2 поверхи комерційних приміщень: магазини, кафе, салони' },
];

const INFRA = [
  'Комерція на двох поверхах: магазини, кафе, салони',
  '2-рівневий підземний паркінг',
  'Охорона, відеоспостереження, контроль доступу',
  'Індивідуальне (автономне) опалення',
];

const RENDERS = [
  { src: lakeviewAerial as unknown as PictureSource, alt: 'Lakeview — аерофотозйомка' },
  { src: lakeviewSemiAerial as unknown as PictureSource, alt: 'Lakeview — оглядовий ракурс' },
  { src: lakeviewCloseup as unknown as PictureSource, alt: 'Lakeview — деталі фасаду' },
  { src: lakeviewEntrance as unknown as PictureSource, alt: 'Lakeview — вхідна група' },
  { src: lakeviewLakeBridge as unknown as PictureSource, alt: 'Lakeview — озеро та міст' },
  { src: lakeviewTerrace as unknown as PictureSource, alt: 'Lakeview — терасна зона' },
];

const CONSTRUCTION_GROUPS = [
  {
    label: 'Грудень 2025',
    items: [
      { src: decImg01 as unknown as PictureSource, alt: 'Грудень 2025 — кадр 1' },
      { src: decImg02 as unknown as PictureSource, alt: 'Грудень 2025 — кадр 2' },
      { src: decImg03 as unknown as PictureSource, alt: 'Грудень 2025 — кадр 3' },
    ],
  },
  {
    label: 'Січень 2026',
    items: [
      { src: janImg01 as unknown as PictureSource, alt: 'Січень 2026 — кадр 1' },
      { src: janImg02 as unknown as PictureSource, alt: 'Січень 2026 — кадр 2' },
      { src: janImg03 as unknown as PictureSource, alt: 'Січень 2026 — кадр 3' },
    ],
  },
  {
    label: 'Лютий 2026',
    items: [
      { src: febImg01 as unknown as PictureSource, alt: 'Лютий 2026 — кадр 1' },
      { src: febImg02 as unknown as PictureSource, alt: 'Лютий 2026 — кадр 2' },
      { src: febImg03 as unknown as PictureSource, alt: 'Лютий 2026 — кадр 3' },
    ],
  },
  {
    label: 'Березень 2026',
    items: [
      { src: marImg01 as unknown as PictureSource, alt: 'Березень 2026 — кадр 1' },
      { src: marImg02 as unknown as PictureSource, alt: 'Березень 2026 — кадр 2' },
      { src: marImg03 as unknown as PictureSource, alt: 'Березень 2026 — кадр 3' },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'Скільки коштує квартира в ЖК Lakeview?',
    a: 'Стартова ціна — $1600/м². Квартири 44–183 м²: від $70 000 за однокімнатну до $290 000+ за трирівневу. Оплата: 30% першого внеску, решта — розстрочка до 2027 без прихованих комісій. Актуальні ціни по поверхах і планувальних рішеннях — в офісі продажу, вул. Володимира Великого, 4, каб. 406.',
  },
  {
    q: 'Коли здача ЖК Lakeview?',
    a: 'Плановий термін введення ЖК Lakeview в експлуатацію — 2027 рік. Будівництво ведеться відповідно до класу наслідків СС3 — найвищого в українській класифікації, що передбачає суворіший технічний нагляд і дотримання нормативів. Хід будівництва фіксується помісячно: фотозвіти за грудень 2025 — березень 2026 доступні на цій сторінці. Повний архів і актуальний стан — на окремому сайті проекту та в Instagram @lakeviewlviv.',
  },
  {
    q: 'Хто забудовник ЖК Lakeview?',
    a: 'Забудовник ЖК Lakeview — ПП «ДІК "Вигода +"», ЄДРПОУ 44876801. Будує житлові та нежитлові будівлі як забудовник — без підрядних посередників. Юридичні документи, статут і дозвільна документація надаються на запит до підписання договору. Офіс продажу — вул. Володимира Великого, 4, поверх 4, кабінет 406, за 200 метрів від будмайданчика.',
  },
  {
    q: 'Яка технологія будівництва і який клас надійності?',
    a: 'ЖК Lakeview будується за монолітно-каркасною технологією: залізобетонний каркас, зовнішні стіни з керамоблоків, утеплення мінватою. Це рішення забезпечує вільне планування, довговічність конструкції і кращу звукоізоляцію порівняно з панельним будівництвом. Обʼєкт проектується за класом наслідків СС3 — найвищим рівнем відповідальності за українським законодавством, обовʼязковим для будинків від 9 поверхів у 4 секціях. Загальна поверховість — до 16 поверхів.',
  },
  {
    q: 'Як купити квартиру в Lakeview через майнові права?',
    a: 'Придбання квартири оформлюється через договір купівлі-продажу майнових прав — прямий договір з ПП «ДІК "Вигода +"» (ЄДРПОУ 44876801) без посередників. Договір фіксує обʼєкт, площу, поверх, ціну та графік оплати. Передбачено право переуступки майнових прав третій особі до введення в експлуатацію. Перший крок — дзвінок 097 990 03 90 або форма на сайті.',
  },
  {
    q: 'Які площі квартир доступні і що є в інфраструктурі комплексу?',
    a: 'У ЖК Lakeview пропонуються 1-, 2- і 3-кімнатні квартири площею 44–183 м² у чотирьох секціях висотою до 16 поверхів. Крім житлових поверхів, комплекс включає два поверхи комерційних приміщень (магазини, кафе, салони), 2-рівневий підземний паркінг, охорону з відеоспостереженням і контролем доступу та індивідуальне автономне опалення. Безпосередньо поряд з комплексом — два природні озера і ресторанний комплекс «Гуцульська Гражда».',
  },
  {
    q: 'Що знаходиться поруч з ЖК Lakeview?',
    a: 'ЖК Lakeview — вул. Володимира Великого, 2А, Франківський район Львова. Комплекс межує з двома природними озерами, від яких отримав назву. Пішохідна доступність — стадіон «Динамо», міські парки, зони відпочинку біля води. Поруч — ресторанний комплекс «Гуцульська Гражда», що працює з 2004 року.',
  },
];

const lakeviewHeroSource = lakeviewHero as unknown as PictureSource;

export const links = () =>
  lakeviewHeroSource.sources.avif
    ? [
        {
          rel: 'preload',
          as: 'image',
          type: 'image/avif',
          imageSrcSet: lakeviewHeroSource.sources.avif,
          imageSizes: '100vw',
        },
      ]
    : [];

export const meta: MetaFunction = ({ location }) => {
  const title = 'ЖК Lakeview Львів — бізнес-клас, Франківський район';
  const description =
    'Вул. Володимира Великого 2А, Франківський район Львова. 4 секції, монолітно-каркасна технологія, від $1600/м². Квартири 44–183 м², розстрочка до 2027.';
  const image = siteUrl('/og/lakeview-v2.png');
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

// JSON-LD constants are computed inside the component (see ProjectLakeview)
// so that siteUrl() resolves at render/prerender time rather than module init.

const LAKEVIEW_SITE = 'https://yaroslavpetrukha.github.io/Lakeview/';
const LAKEVIEW_INSTAGRAM = 'https://www.instagram.com/lakeviewlviv/';

const ProjectLakeview = () => {
  const lakeviewLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    '@id': siteUrl('/portfolio/lakeview/#complex'),
    name: 'ЖК Lakeview',
    alternateName: 'Lakeview',
    description:
      'Житловий комплекс бізнес-класу у Франківському районі Львова. 4 секції, монолітно-каркасна технологія, до 16 поверхів, 2 поверхи комерції, 2-рівневий підземний паркінг. Біля двох природних озер.',
    url: siteUrl('/portfolio/lakeview'),
    image: siteUrl('/og/lakeview-v2.png'),
    developer: { '@id': siteUrl('/#organization') },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'вул. Володимира Великого, 2А',
      addressLocality: 'Львів',
      addressRegion: 'Львівська область',
      postalCode: '79004',
      addressCountry: 'UA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 49.80887,
      longitude: 24.0158,
    },
    numberOfRooms: '1-3',
    floorSize: {
      '@type': 'QuantitativeValue',
      minValue: 44,
      maxValue: 183,
      unitCode: 'MTK',
    },
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Підземний паркінг 2 рівні' },
      { '@type': 'LocationFeatureSpecification', name: 'Охорона і відеоспостереження' },
      { '@type': 'LocationFeatureSpecification', name: 'Автономне опалення' },
      { '@type': 'LocationFeatureSpecification', name: 'Комерція на 2 поверхах' },
    ],
    isAccessibleForFree: false,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: 1600,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        unitText: 'per square meter',
      },
    },
    containedInPlace: {
      '@type': 'Place',
      name: 'Львів, Франківський район',
    },
  });

  const lakeviewFaqLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  });

  const lakeviewBreadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: siteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Портфоліо', item: siteUrl('/portfolio') },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'ЖК Lakeview',
        item: siteUrl('/portfolio/lakeview'),
      },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: lakeviewLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: lakeviewBreadcrumb }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: lakeviewFaqLd }}
      />
      <Breadcrumb
        items={[
          { label: 'Головна', href: '/' },
          { label: 'Портфоліо', href: '/portfolio' },
          { label: 'ЖК Lakeview' },
        ]}
      />
      <PageHero
        eyebrow="Активний обʼєкт"
        title="ЖК Lakeview"
        lead="Житловий комплекс бізнес-класу на вул. Володимира Великого, 2А: автономне опалення, два природні озера поруч, 2 поверхи комерції та 2-рівневий підземний паркінг. Чотири секції, монолітно-каркасна технологія, плановий термін введення в експлуатацію — 2027 рік."
        image={lakeviewHero as unknown as PictureSource}
        imageAlt="ЖК Lakeview — житловий комплекс бізнес-класу на вул. Володимира Великого 2А, Франківський район Львова"
      >
        <Button as="a" href={LAKEVIEW_SITE} external variant="primary" size="lg">
          Перейти на сайт ЖК <ArrowUpRight className="w-4 h-4" />
        </Button>
        <Button as="a" href="#zapys" variant="ghost" size="lg">
          Записатись на огляд
        </Button>
      </PageHero>

      <section className="bg-bg-deep border-b border-bg-surface py-6 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <StagePill stage="construction" label="Будується" />
          <span aria-hidden="true">·</span>
          <span>Здача 2027</span>
          <span aria-hidden="true">·</span>
          <span>СС3</span>
        </div>
      </section>

      {/* PARAMETERS */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-b border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="01" title="Параметри" />
          </FadeIn>
          <dl className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {PARAMETERS.map((p) => (
              <div
                key={p.label}
                className="bg-bg-base p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <dt className="text-[11px] font-medium uppercase tracking-widest text-text-secondary">
                  {p.label}
                </dt>
                <dd className="md:col-span-2 text-text-primary text-sm md:text-base leading-relaxed">
                  {p.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* TERRITORY */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <FadeIn>
              <SectionHeading eyebrow="02" title="Особливість території" />
            </FadeIn>
          </div>
          <FadeIn delay={0.05} className="lg:col-span-7">
            <p className="text-text-secondary text-base md:text-lg leading-relaxed">
              Ділянка знаходиться у Франківському районі Львова — за пішохідною доступністю до стадіону «Динамо», міських парків та зон відпочинку біля води. Безпосередньо межує з двома природними озерами, які дали назву комплексу. Поруч розташований ресторанний комплекс «Гуцульська Гражда», що працює з 2004 року. Для бізнес-класу Львова таке поєднання — вид на воду, пішохідна інфраструктура і гастрономічний обʼєкт в одній локації — зустрічається рідко.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* INFRA */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="03" title="Інфраструктура" />
          </FadeIn>
          <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {INFRA.map((item, i) => (
              <li
                key={i}
                className="bg-bg-base p-6 md:p-8 flex items-start gap-4"
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

      {/* RENDERS */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="04"
              title="Рендери"
              description="Архітектурні візуалізації проекту."
            />
          </FadeIn>
          <FadeIn delay={0.05} className="mt-12">
            <ProjectGalleryStrip images={RENDERS} ariaLabel="Рендери ЖК Lakeview" />
          </FadeIn>
        </div>
      </section>

      {/* CONSTRUCTION PROGRESS */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="05"
              title="Хід будівництва"
              description="Помісячна фотофіксація. Грудень 2025 — березень 2026."
            />
            <p className="mt-5 text-text-secondary max-w-3xl leading-relaxed">
              Оновлення публікуємо щомісяця. Нижче — добірка з останніх чотирьох
              місяців; повний архів і деталі — на сайті ЖК.
            </p>
          </FadeIn>

          <div className="mt-16 space-y-12">
            {CONSTRUCTION_GROUPS.map((g, i) => (
              <FadeIn key={g.label} delay={i * 0.05}>
                <div className="flex items-baseline justify-between mb-5">
                  <h3 className="text-lg md:text-xl font-bold text-text-primary leading-snug uppercase tracking-wider">
                    {g.label}
                  </h3>
                  <span className="text-[11px] font-medium uppercase tracking-widest text-text-secondary">
                    3 кадри
                  </span>
                </div>
                <ProjectGalleryStrip
                  images={g.items}
                  variant="square"
                  ariaLabel={`Хід будівництва — ${g.label}`}
                />
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-12">
            <Button as="a" href={LAKEVIEW_SITE} external variant="ghost" size="md">
              Дивитись повний архів на сайті Lakeview <ArrowUpRight className="w-4 h-4" />
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* DETAILS — TO LAKEVIEW SITE */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="06"
              title="Деталі і планування — на сайті ЖК"
              description="Планування квартир по всіх секціях, паркомісця, актуальні ціни, бронювання — на власному сайті проекту."
            />
          </FadeIn>
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Button as="a" href={LAKEVIEW_SITE} external variant="primary" size="lg">
              Перейти на сайт Lakeview <ArrowUpRight className="w-4 h-4" />
            </Button>
            <Button as="a" href={LAKEVIEW_INSTAGRAM} external variant="ghost" size="lg">
              Instagram @lakeviewlviv <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* LAKEVIEW CONTACTS */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="07"
              title="Контакти ЖК Lakeview"
              description="Це окремі контакти проекту. Корпоративні контакти ВИГОДИ — у розділі /kontakty."
            />
          </FadeIn>
          <dl className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {[
              { label: 'Телефон', value: '097 990 03 90', href: 'tel:+380979900390' },
              { label: 'Email', value: 'vygoda.sales@gmail.com', href: 'mailto:vygoda.sales@gmail.com' },
              { label: 'Офіс продажу', value: 'вул. Володимира Великого, 4, 4-й поверх, каб. 406, Львів' },
              { label: 'Instagram', value: '@lakeviewlviv', href: LAKEVIEW_INSTAGRAM, external: true },
            ].map((c) => (
              <div key={c.label} className="bg-bg-base p-6 md:p-8">
                <dt className="text-[11px] font-medium uppercase tracking-widest text-text-secondary mb-2">
                  {c.label}
                </dt>
                <dd className="text-text-primary text-base md:text-lg leading-relaxed">
                  {c.href ? (
                    <a
                      href={c.href}
                      {...(c.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="hover:text-accent transition-colors"
                    >
                      {c.value}
                    </a>
                  ) : (
                    c.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="FAQ"
              title="Часті питання про ЖК Lakeview"
              description="Найчастіші запити покупців і інвесторів. Якщо вашого питання немає — напишіть, відповімо у робочі дні 10:00–18:00."
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

          {/* Related news / progress reports */}
          <FadeIn delay={0.1} className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-bg-deep border border-bg-surface">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-widest text-accent mb-2">
                  Хроніка будівництва
                </div>
                <p className="text-text-primary font-semibold">
                  Хід будівництва ЖК Lakeview: квітень–травень 2026
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Технічні умови на електропостачання, фасадні роботи, інверсійна покрівля.
                </p>
              </div>
              <Link
                to="/novyny/lakeview-progress-2026-04-05"
                className="inline-flex items-center gap-2 text-accent hover:underline whitespace-nowrap"
              >
                Читати звіт <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FORM */}
      <section id="zapys" className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <LazyContactForm
              source="project-lakeview"
              heading="Записатись на огляд"
              description="Зателефонуємо сьогодні і узгодимо зручний час."
              fields={['email', 'message']}
              submitLabel="Записатись"
              successText="Прийнято. Менеджер Lakeview зателефонує протягом робочого дня."
              disclaimer="Натискаючи «Записатись», ви погоджуєтесь на обробку персональних даних."
            />
          </FadeIn>

          <FadeIn delay={0.1} className="mt-10">
            <Button as="router" href="/kontakty" variant="link">
              Корпоративні контакти ВИГОДИ <ArrowRight className="w-4 h-4" />
            </Button>
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default ProjectLakeview;
