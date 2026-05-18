import { ArrowRight } from 'lucide-react';
import FadeIn from '../../src/components/FadeIn';
import PageHero from '../../src/components/PageHero';
import SectionHeading from '../../src/components/SectionHeading';
import Button from '../../src/components/Button';
import StagePill from '../../src/components/StagePill';
import ContactForm from '../../src/components/ContactForm';
import ProjectGalleryStrip from '../../src/components/ProjectGalleryStrip';
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
  return (
    <>
      <PageHero
        eyebrow="Pipeline"
        title="ЖК Етно Дім"
        lead="Львів, вул. Судова. Зафіксовані наміри з власником ділянки. Готуємо проектну і кошторисну документацію."
        image={render1 as unknown as PictureSource}
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
