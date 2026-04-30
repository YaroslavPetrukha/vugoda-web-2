import { ArrowRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import StagePill from '../components/StagePill';
import ContactForm from '../components/ContactForm';
import IsometricCubePlaceholder from '../components/IsometricCubePlaceholder';

const NO_NAME_REASONS = [
  'Назва і ідентичність проекту зʼявляються після рішення інвестора і затвердження концепту.',
  'До того моменту — не вигадуємо «тимчасові» назви для маркетингу.',
  'На сайті лишається коректна стадія і чесний візуальний placeholder — каркасний куб з нашого брендбуку.',
];

const ProjectPipeline04 = () => {
  return (
    <>
      <PageHero
        eyebrow="Pipeline"
        title="Проект у роботі"
        lead="Рання стадія. Прораховуємо економіку. Назва, адреса і параметри зʼявляться, коли буде що показати."
        decorative
      >
        <Button as="a" href="#pidpyska" variant="primary" size="lg">
          Підписатись на оновлення <ArrowRight className="w-4 h-4" />
        </Button>
        <Button as="router" href="/pidkhid" variant="ghost" size="lg">
          Як ми працюємо
        </Button>
      </PageHero>

      <section className="bg-bg-deep border-b border-bg-surface py-6 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <StagePill stage="pre-budget" label="Прорахунок кошторисної вартості" />
        </div>
      </section>

      {/* HERO PLACEHOLDER */}
      <section className="bg-bg-deep py-16 md:py-24 px-6 lg:px-8 border-b border-bg-surface">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center">
          <IsometricCubePlaceholder
            className="w-[280px] md:w-[400px] lg:w-[480px] opacity-60 mb-10"
            ariaLabel="Каркасний знак ВИГОДА — placeholder проекту без назви"
          />
          <p className="text-text-secondary text-sm uppercase tracking-widest">
            Назва — після узгодження з інвестором
          </p>
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
        <div className="max-w-5xl mx-auto">
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
        <div className="max-w-5xl mx-auto">
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
