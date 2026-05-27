import type { MetaFunction } from 'react-router';
import { siteUrl } from '../../src/lib/site-url';
import { ArrowRight } from 'lucide-react';
import FadeIn from '../../src/components/FadeIn';
import PipelineHero from '../../src/components/PipelineHero';
import SectionHeading from '../../src/components/SectionHeading';
import Button from '../../src/components/Button';
import StagePill from '../../src/components/StagePill';
import ContactForm from '../../src/components/ContactForm';

export const meta: MetaFunction = ({ location }) => {
  const title = 'Новий проект ВИГОДА у підготовці';
  const description =
    'Закритий pipeline-проект на стадії прорахунку кошторисної вартості. Деталі — після рішення інвестора.';
  const image = siteUrl('/og/pipeline-04-v2.png');
  const url = siteUrl(location.pathname);
  return [
    { title },
    { name: 'robots', content: 'noindex, follow' },
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
  ];
};

const NO_NAME_REASONS = [
  'Назва і ідентичність проекту зʼявляються після рішення інвестора і затвердження концепту.',
  'До того моменту — не вигадуємо «тимчасові» назви для маркетингу.',
  'На сайті лишається коректна стадія і чесний візуальний placeholder — каркасний куб з нашого брендбуку.',
];

const ProjectPipeline04 = () => {
  return (
    <>
      <PipelineHero
        eyebrow="Pipeline · 04"
        title="Поки без імені. До затвердження концепту."
        lead="Не вигадуємо тимчасові назви для маркетингу. Назва, рендери і параметри з'являться після затвердження концепту і кошторису — не раніше. Підпишіться, щоб дізнатись першими."
        caption="каркасний знак ВИГОДА — placeholder проекту без назви"
      >
        <Button as="a" href="#pidpyska" variant="primary" size="lg">
          Підписатись на оновлення <ArrowRight className="w-4 h-4" />
        </Button>
        <Button as="router" href="/pidkhid" variant="link" size="md">
          Як ми працюємо →
        </Button>
      </PipelineHero>

      <section className="bg-bg-deep border-b border-bg-surface py-6 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <StagePill stage="pre-budget" label="Прорахунок кошторисної вартості" />
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
              Прорахунок кошторисної вартості — найраніша точка нашої
              методології. До цієї стадії проект ще не публікується. Ми робимо
              інакше: показуємо, що проект є, навіть коли він без назви.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* WHY NO NAME */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="02" title="Чому без назви" />
          </FadeIn>
          <ul className="mt-12 divide-y divide-bg-surface border-y border-bg-surface">
            {NO_NAME_REASONS.map((reason, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <li className="flex gap-6 py-6 md:py-7">
                  <span className="text-accent font-mono text-xs tracking-widest pt-1 flex-none w-10">
                    //{String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-text-primary text-base md:text-lg leading-relaxed">
                    {reason}
                  </span>
                </li>
              </FadeIn>
            ))}
          </ul>
        </div>
      </section>

      {/* WHAT NEXT */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="03" title="Що далі" />
          </FadeIn>
          <p className="mt-8 text-text-secondary text-base md:text-lg leading-relaxed">
            Наступний крок — повна кошторисна документація і затвердження
            архітектурного концепту. Після — оголошення назви, рендери,
            параметри.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section id="pidpyska" className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <ContactForm
              source="project-pipeline-04"
              heading="Підписатись на оновлення"
              description="Залиште номер. Першими дізнаєтесь про назву, концепт і дату старту продажів."
              fields={['email']}
              submitLabel="Підписатись"
              successText="Прийнято. Повідомимо, щойно проект отримає назву і відкриту стадію."
              disclaimer="Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних."
            />
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default ProjectPipeline04;
