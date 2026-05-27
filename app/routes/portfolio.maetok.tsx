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
import maetokRender1 from '../../src/assets/projects/maetok/render-1.webp?preset=hero';

// Рендери — ?preset=gallery → AVIF/WebP srcset 600/1200w
import maetokRender2 from '../../src/assets/projects/maetok/render-2.webp?preset=gallery';

export const meta: MetaFunction = ({ location }) => {
  const title = 'ЖК Маєток Винниківський — новобудова Львів, Винники';
  const description =
    'Житловий комплекс у Винниках, агломерація Львова. Забудовник ВИГОДА на стадії кошторисної документації. Підпишіться на оновлення та умови майбутніх продажів.';
  const image = siteUrl('/og/maetok-v2.png');
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
  { label: 'Розташування', value: 'м. Винники, Львівська обл.' },
  { label: 'Стадія', value: 'Кошторисна документація' },
  { label: 'Площі і поверховість', value: 'Будуть оголошені після затвердження проекту' },
  { label: 'Термін старту продажів', value: 'Буде оголошено' },
];

const RENDERS = [
  { src: maetokRender1 as unknown as PictureSource, alt: 'ЖК Маєток Винниківський — рендер 1' },
  { src: maetokRender2 as unknown as PictureSource, alt: 'ЖК Маєток Винниківський — рендер 2' },
];

const ProjectMaetok = () => {
  const breadcrumbLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: siteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Портфоліо', item: siteUrl('/portfolio') },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'ЖК Маєток Винниківський',
        item: siteUrl('/portfolio/maetok'),
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
          { label: 'ЖК Маєток Винниківський' },
        ]}
      />
      <PageHero
        eyebrow="Pipeline"
        title="ЖК Маєток Винниківський"
        lead="м. Винники, Львівська область. Прораховуємо вартість матеріалів і робіт — до старту продажів, не після."
        image={maetokRender1 as unknown as PictureSource}
        imageAlt=""
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
          <StagePill stage="estimation" label="Кошторисна документація" />
          <span aria-hidden="true">·</span>
          <span>м. Винники</span>
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
              Прорахунок кошторисної документації. Друга фаза нашої методології —
              формування економіки проекту до публічного запуску.
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
              description="Робочі рендери. Архітектурні параметри уточнюються."
            />
          </FadeIn>
          <FadeIn delay={0.05} className="mt-12">
            <ProjectGalleryStrip
              images={RENDERS}
              ariaLabel="Рендери ЖК Маєток Винниківський"
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
            Після завершення кошторисної документації — погодження
            містобудівних умов і дозвільна документація. Дати старту продажів
            повідомимо окремо.
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
                Місто Винники — самостійна міська одиниця впритул до Львова, з
                окремою громадою, але фактично інтегрована в агломерацію. Від
                центру Винників до Личаківського району Львова — менше 10 хвилин
                автомобілем. Поруч — озеро, лісовий масив, тиха вулична мережа
                без транзитного трафіку. Саме ця комбінація — міська доступність
                і природне оточення — визначила вибір локації для проекту з
                малоповерховою логікою забудови, де кожна секція має власний
                масштаб і характер.
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <p>
                Маєток Винниківський розрахований на покупців, які виросли або
                живуть у приватному секторі і не готові відмовлятися від
                відчуття простору — але хочуть сучасний стандарт конструктиву і
                юридично чисту угоду. Очікуваний формат: малоповерховий будинок
                з кількома секціями і просторими плануваннями. Монолітно-каркасна
                технологія тут особливо доречна: вона дозволяє реалізувати
                нестандартні плани без несучих стін усередині квартири.
                Цільова аудиторія — сучасна міська сімʼя, що прагне до власного
                простору з природним оточенням.
              </p>
            </FadeIn>
            <FadeIn delay={0.11}>
              <p>
                Проект перебуває на стадії прорахунку кошторисної документації —
                другій фазі методології ВИГОДА. Це означає, що команда формує
                повну економіку обʼєкта ще до будь-якого публічного запуску:
                вартість матеріалів, будівельних робіт, інженерних систем.
                Наступним кроком стане погодження містобудівних умов і отримання
                дозволів. ВИГОДА не виходить на продажі до завершення дозвільного
                етапу — без винятків. Детально про логіку цих фаз —{' '}
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
              source="project-maetok"
              heading="Повідомити про старт продажів"
              description="Залиште номер. Зателефонуємо, коли проект вийде на стадію продажів."
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

export default ProjectMaetok;
