import type { MetaFunction } from 'react-router';
import { siteUrl } from '../../src/lib/site-url';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import FadeIn from '../../src/components/FadeIn';
import PageHero from '../../src/components/PageHero';
import SectionHeading from '../../src/components/SectionHeading';
import Button from '../../src/components/Button';
import StagePill from '../../src/components/StagePill';
import ContactForm from '../../src/components/ContactForm';
import ProjectGalleryStrip from '../../src/components/ProjectGalleryStrip';
import Breadcrumb from '../../src/components/Breadcrumb';
import type { PictureSource } from '../../src/components/ui/Picture';

// Hero — ?preset=hero → AVIF/WebP srcset 480–1920w
import render1 from '../../src/assets/projects/etno-dim/render-1.webp?preset=hero';

// Рендери — ?preset=gallery → AVIF/WebP srcset 600/1200w
import render2 from '../../src/assets/projects/etno-dim/render-2.webp?preset=gallery';
import render3 from '../../src/assets/projects/etno-dim/render-3.webp?preset=gallery';
import render4 from '../../src/assets/projects/etno-dim/render-4.webp?preset=gallery';
import render5 from '../../src/assets/projects/etno-dim/render-5.webp?preset=gallery';
import render6 from '../../src/assets/projects/etno-dim/render-6.webp?preset=gallery';
import render7 from '../../src/assets/projects/etno-dim/render-7.webp?preset=gallery';
import render8 from '../../src/assets/projects/etno-dim/render-8.webp?preset=gallery';

const etnoDimHeroSource = render1 as unknown as PictureSource;

export const links = () =>
  etnoDimHeroSource.sources.avif
    ? [
        {
          rel: 'preload',
          as: 'image',
          type: 'image/avif',
          imageSrcSet: etnoDimHeroSource.sources.avif,
          imageSizes: '100vw',
        },
      ]
    : [];

export const meta: MetaFunction = ({ location }) => {
  const title = 'ЖК Етно Дім Львів — дохідна нерухомість, Судова';
  const description =
    'Дохідна нерухомість, вул. Судова, Львів. ЖК Етно Дім від ВИГОДА: стадія меморандуму про відновлення будівництва. Підпишіться на старт продажів і умови участі.';
  const image = siteUrl('/og/etno-dim-v2.png');
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
    { name: 'robots', content: 'noindex, follow' },
  ];
};

const PARAMETERS = [
  { label: 'Розташування', value: 'вул. Судова, Львів' },
  { label: 'Стадія', value: 'Меморандум про відновлення будівництва' },
  { label: 'Тип продукту', value: 'Уточнюється (можливо — дохідний дім)' },
  { label: 'Площі і поверховість', value: 'Будуть оголошені після затвердження проекту' },
  { label: 'Термін старту продажів', value: 'Буде оголошено' },
];

const RENDERS = [
  { src: render1 as unknown as PictureSource, alt: 'ЖК Етно Дім — рендер 1' },
  { src: render2 as unknown as PictureSource, alt: 'ЖК Етно Дім — рендер 2' },
  { src: render3 as unknown as PictureSource, alt: 'ЖК Етно Дім — рендер 3' },
  { src: render4 as unknown as PictureSource, alt: 'ЖК Етно Дім — рендер 4' },
  { src: render5 as unknown as PictureSource, alt: 'ЖК Етно Дім — рендер 5' },
  { src: render6 as unknown as PictureSource, alt: 'ЖК Етно Дім — рендер 6' },
  { src: render7 as unknown as PictureSource, alt: 'ЖК Етно Дім — рендер 7' },
  { src: render8 as unknown as PictureSource, alt: 'ЖК Етно Дім — рендер 8' },
];

const ProjectEtnoDim = () => {
  const breadcrumbLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: siteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Портфоліо', item: siteUrl('/portfolio') },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'ЖК Етно Дім',
        item: siteUrl('/portfolio/etno-dim'),
      },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbLd }}
      />
      <Breadcrumb
        items={[
          { label: 'Головна', href: '/' },
          { label: 'Портфоліо', href: '/portfolio' },
          { label: 'ЖК Етно Дім' },
        ]}
      />
      <PageHero
        eyebrow="Pipeline"
        title="ЖК Етно Дім"
        lead="Львів, вул. Судова. Зафіксовані наміри з власником ділянки. Готуємо проектну і кошторисну документацію."
        image={render1 as unknown as PictureSource}
        imageAlt="ЖК Етно Дім — архітектурна візуалізація, вул. Судова, Львів"
      >
        <Button as="a" href="#pidpyska" variant="primary" size="lg">
          Повідомити про старт продажів <ArrowRight className="w-4 h-4" />
        </Button>
        <Button as="router" href="/pidkhid" variant="ghost" size="lg">
          Як ми працюємо
        </Button>
      </PageHero>

      <section className="bg-bg-deep border-b border-bg-surface py-6 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <StagePill stage="memorandum" label="Меморандум про відновлення будівництва" />
          <span aria-hidden="true">·</span>
          <span>вул. Судова, Львів</span>
        </div>
      </section>

      {/* STAGE */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-b border-bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <FadeIn>
              <SectionHeading eyebrow="01" title="Стадія" />
            </FadeIn>
          </div>
          <FadeIn delay={0.05} className="lg:col-span-7">
            <p className="text-text-secondary text-base md:text-lg leading-relaxed">
              Меморандум про відновлення будівництва підписано. Це перша з
              чотирьох фаз нашої методології — фіксація умов і обсягу робіт.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* PARAMETERS */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="02" title="Параметри" />
          </FadeIn>
          <dl className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {PARAMETERS.map((p) => (
              <div
                key={p.label}
                className="bg-bg-deep p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4"
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

      {/* RENDERS */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="03"
              title="Візуалізація"
              description="Робочі рендери. Фінальне рішення формується разом із проектною документацією."
            />
          </FadeIn>
          <FadeIn delay={0.05} className="mt-12">
            <ProjectGalleryStrip
              images={RENDERS}
              ariaLabel="Рендери ЖК Етно Дім"
            />
          </FadeIn>
        </div>
      </section>

      {/* WHAT NEXT */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="04" title="Що далі" />
          </FadeIn>
          <p className="mt-8 text-text-secondary text-base md:text-lg leading-relaxed">
            Наступний крок — кошторисна документація. Після — погодження
            дозвільної документації. Старт продажів — після отримання дозволу
            на будівельні роботи.
          </p>
        </div>
      </section>

      {/* LOCATION & CONCEPT */}
      <section id="lokatsiia" className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <FadeIn>
              <SectionHeading eyebrow="Контекст" title="Локація і концепція" />
            </FadeIn>
          </div>
          <div className="lg:col-span-7 space-y-6 text-text-secondary text-base md:text-lg leading-relaxed">
            <FadeIn delay={0.05}>
              <p>
                Вулиця Судова знаходиться у Залізничному районі Львова — зоні
                активної трансформації між історичним центром і новими житловими
                масивами. Поруч — залізничний вокзал (пішки 10–12 хвилин),
                зупинки громадського транспорту, банки, продуктові мережі.
                Ділянка вписана у щільну міську тканину, де запит на компактне
                житло з розвиненою інфраструктурою є стабільним. Саме тут ВИГОДА
                побачила потенціал для проекту з виразною архітектурою в
                локальному дусі.
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <p>
                Концепт Етно Дім орієнтований на покупців, яким важливе відчуття
                місця — мешканців, що цінують архітектуру зі спадщиною, а не
                типову панель. Очікуваний формат — компактний будинок з
                невеликою кількістю секцій і планувальними рішеннями для сімей.
                Технологія будівництва — монолітно-каркасна: вона дає гнучкість
                у плануваннях і надійну конструктиву. Для Залізничного району,
                де переважає стара забудова, подібний формат закриває дефіцит
                нового якісного житла.
              </p>
            </FadeIn>
            <FadeIn delay={0.11}>
              <p>
                На сьогодні підписано меморандум про відновлення будівництва —
                це перша фаза з чотирьох у методології ВИГОДА. Наступний крок:
                формування кошторисної документації та визначення економіки
                проекту. Старт продажів відбудеться виключно після отримання
                повного пакету дозвільних документів — ця вимога є незмінною
                для всіх обʼєктів компанії. Як саме ВИГОДА проходить кожну з
                фаз до відкриття продажів —{' '}
                <Link to="/pidkhid" className="text-accent hover:underline">
                  читайте про наш підхід
                </Link>
                .
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section
        id="pidpyska"
        className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface"
      >
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <ContactForm
              source="project-etno-dim"
              heading="Повідомити про старт продажів"
              description="Залиште номер. Напишемо й зателефонуємо, коли проект вийде на стадію продажів."
              fields={['email']}
              submitLabel="Підписатись на оновлення"
              successText="Прийнято. Внесли вас у список — повідомимо першими."
              disclaimer="Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних."
            />
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default ProjectEtnoDim;
