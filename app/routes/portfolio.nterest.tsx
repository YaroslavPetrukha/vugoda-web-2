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
import nterestRender1 from '../../src/assets/projects/nterest/render-1.webp?preset=hero';

// Рендери — ?preset=gallery → AVIF/WebP srcset 600/1200w
import nterestRender2 from '../../src/assets/projects/nterest/render-2.webp?preset=gallery';
import nterestRender3 from '../../src/assets/projects/nterest/render-3.webp?preset=gallery';

export const meta: MetaFunction = ({ location }) => {
  const title = 'Дохідний дім NTEREST — інвестиційна нерухомість Львів';
  const description =
    'Дохідна нерухомість NTEREST у Львові від ВИГОДА. Стадія погодження дозвільної документації. Підпишіться — повідомимо про умови і старт продажів першими.';
  const image = siteUrl('/og/nterest.png');
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

const PARAMETERS = [
  { label: 'Розташування', value: 'Львів (адреса буде оголошена)' },
  { label: 'Стадія', value: 'Погодження дозвільної документації' },
  { label: 'Тип продукту', value: 'Дохідний дім' },
  {
    label: 'Інвестиційний формат',
    value: 'Орієнтований на інвестора, що шукає пасивний дохід',
  },
  { label: 'Термін старту продажів', value: 'Буде оголошено' },
];

const RENDERS = [
  { src: nterestRender1 as unknown as PictureSource, alt: 'NTEREST — рендер 1' },
  { src: nterestRender2 as unknown as PictureSource, alt: 'NTEREST — рендер 2' },
  { src: nterestRender3 as unknown as PictureSource, alt: 'NTEREST — рендер 3' },
];

const ProjectNterest = () => {
  const breadcrumbLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: siteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Портфоліо', item: siteUrl('/portfolio') },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Дохідний дім NTEREST',
        item: siteUrl('/portfolio/nterest'),
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
          { label: 'Дохідний дім NTEREST' },
        ]}
      />
      <PageHero
        eyebrow="Pipeline"
        title="Дохідний дім NTEREST"
        lead="Концепт — дохідний дім. У роботі — погодження дозвільної документації. Старт продажів — після отримання дозволу."
        image={nterestRender1 as unknown as PictureSource}
        imageAlt=""
      >
        <Button as="a" href="#pidpyska" variant="primary" size="lg">
          Повідомити про старт продажів <ArrowRight className="w-4 h-4" />
        </Button>
        <Button as="router" href="/investoram" variant="ghost" size="lg">
          Інвесторам
        </Button>
      </PageHero>

      <section className="bg-bg-deep border-b border-bg-surface py-6 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <StagePill stage="permits" label="Дозвільна документація" />
          <span aria-hidden="true">·</span>
          <span>Львів</span>
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
              Погодження дозвільної документації. Третя фаза нашої методології —
              на майданчик не виходимо без повного пакета дозволів.
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
              description="Робочі рендери проекту."
            />
          </FadeIn>
          <FadeIn delay={0.05} className="mt-12">
            <ProjectGalleryStrip
              images={RENDERS}
              ariaLabel="Рендери NTEREST"
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
            Після отримання дозволу на будівельні роботи — старт будівництва і
            відкриття продажів. Інвесторам, що цікавляться форматом дохідної
            нерухомості, — окремий розділ.
          </p>
          <div className="mt-10">
            <Button as="router" href="/investoram" variant="ghost" size="md">
              Розділ для інвесторів <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
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
                Точна адреса NTEREST буде оголошена після завершення дозвільного
                процесу — це стандартна практика ВИГОДА для обʼєктів на фазі
                погодження. За концепцією проект орієнтований на ущільнену
                міську локацію у Шевченківському або Франківському районі
                Львова: пішохідна доступність до університетів, офісних
                кластерів, зупинок громадського транспорту. Саме така локація
                формує стабільний орендний попит — що є ключовим для дохідного
                формату.
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <p>
                NTEREST — концепт, орієнтований передусім на інвестора, що шукає
                пасивний дохід від оренди, а не на кінцевого мешканця. Очікуваний
                продуктовий формат: студії та компактні 1-кімнатні квартири
                площею орієнтовно 25–45 м², зосереджені в одному будинку з
                єдиним управлінням. Монолітно-каркасна технологія забезпечить
                клас CC3 за конструктивними характеристиками. Такий формат
                відповідає зростаючому сегменту приватних орендодавців, які
                хочуть керувати активом без операційного навантаження.
              </p>
            </FadeIn>
            <FadeIn delay={0.11}>
              <p>
                NTEREST перебуває на третій — найближчій до старту — фазі:
                погодження дозвільної документації. Після отримання дозволу на
                будівельні роботи відкриються продажі, а будівництво розпочнеться
                паралельно з першою хвилею угод. ВИГОДА не практикує продажів
                без повного дозвільного пакету — це принципова позиція, що
                захищає і покупця, й репутацію забудовника. Про те, як улаштована
                ця система дисципліни по фазах —{' '}
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
              source="project-nterest"
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

export default ProjectNterest;
