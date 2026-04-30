import { ArrowRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import StagePill from '../components/StagePill';
import ContactForm from '../components/ContactForm';
import ProjectGalleryStrip from '../components/ProjectGalleryStrip';

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
  { src: '/vugoda-web-2/projects/nterest/render-1.webp', alt: 'NTEREST — рендер 1' },
  { src: '/vugoda-web-2/projects/nterest/render-2.webp', alt: 'NTEREST — рендер 2' },
  { src: '/vugoda-web-2/projects/nterest/render-3.webp', alt: 'NTEREST — рендер 3' },
];

const ProjectNterest = () => {
  return (
    <>
      <PageHero
        eyebrow="Pipeline"
        title="Дохідний дім NTEREST"
        lead="Концепт — дохідний дім. У роботі — погодження дозвільної документації. Старт продажів — після отримання дозволу."
        image="/vugoda-web-2/projects/nterest/render-1.webp"
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
                <dt className="text-[10px] uppercase tracking-widest text-text-secondary">
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
        <div className="max-w-5xl mx-auto">
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
