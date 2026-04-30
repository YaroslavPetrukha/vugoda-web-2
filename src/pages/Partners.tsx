import { ArrowRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import ContactForm from '../components/ContactForm';

type Requisite = {
  label: string;
  value: string;
  link?: string;
};

const REQUISITES: Requisite[] = [
  {
    label: 'Повна назва',
    value:
      'ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «БУДІВЕЛЬНА КОМПАНІЯ "ВИГОДА ГРУП"»',
  },
  { label: 'Скорочена назва', value: 'ТОВ «БК ВИГОДА ГРУП»' },
  { label: 'ЄДРПОУ', value: '42016395' },
  { label: 'Email', value: 'vygoda.sales@gmail.com', link: 'mailto:vygoda.sales@gmail.com' },
  {
    label: 'Сфера діяльності',
    value: 'Будівництво житлових і нежитлових будівель, генеральне підрядництво',
  },
  { label: 'Юр.адреса', value: 'Уточнюється — надамо за запитом' },
];

const LICENSES = [
  'Ліцензія на провадження господарської діяльності з будівництва — видана 27 грудня 2019 року, безстрокова.',
  'Дозвільна документація по конкретних обʼєктах — надається за запитом, відповідно до стадії проекту.',
  'Сертифікати якості матеріалів і висновки експертизи — у складі проектної документації обʼєктів.',
];

const FOR_BANKS = [
  'Готові надати пакет документів для акредитації обʼєкта (юр.картка, фінзвітність, дозволи, проектна документація).',
  'Контактна особа для юристів і кредитних офіцерів — на email vygoda.sales@gmail.com.',
  'Працюємо з програмами державного субсидування іпотеки — статус акредитації по конкретних проектах надамо окремо.',
];

const FOR_CONTRACTORS = [
  'Розглядаємо комерційні пропозиції від виробників матеріалів і субпідрядних організацій.',
  'Запит на тендер або співпрацю — за формою нижче, з зазначенням типу організації і профілю.',
  'Базові умови співпраці — типовий договір підряду/поставки, оплата за актами виконаних робіт.',
];

const Partners = () => {
  return (
    <>
      <PageHero
        eyebrow="Розділ 05"
        title="Партнерам і банкам"
        lead="Юридична картка, ліцензії, реквізити. Документи для due diligence — за запитом."
        decorative
      >
        <Button as="a" href="#zapyt" variant="primary" size="lg">
          Запит документів <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          as="a"
          href="mailto:vygoda.sales@gmail.com"
          variant="ghost"
          size="lg"
        >
          vygoda.sales@gmail.com
        </Button>
      </PageHero>

      {/* REQUISITES */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-b border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="01" title="Реквізити" />
          </FadeIn>
          <dl className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {REQUISITES.map((r) => (
              <div
                key={r.label}
                className="bg-bg-base p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <dt className="text-[10px] uppercase tracking-widest text-text-secondary">
                  {r.label}
                </dt>
                <dd className="md:col-span-2 text-text-primary text-sm md:text-base leading-relaxed">
                  {r.link ? (
                    <a
                      href={r.link}
                      className="hover:text-accent transition-colors"
                    >
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* LICENSES */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="02" title="Ліцензії та дозволи" />
          </FadeIn>
          <ul className="mt-12 divide-y divide-bg-surface border-y border-bg-surface">
            {LICENSES.map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <li className="flex gap-6 py-6 md:py-7">
                  <span className="text-accent font-mono text-xs tracking-widest pt-1 flex-none w-10">
                    //{String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-text-primary text-base md:text-lg leading-relaxed">
                    {item}
                  </span>
                </li>
              </FadeIn>
            ))}
          </ul>
        </div>
      </section>

      {/* FOR BANKS */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <FadeIn>
              <SectionHeading eyebrow="03" title="Для банків" />
            </FadeIn>
          </div>
          <div className="lg:col-span-7 space-y-5 text-text-secondary text-base md:text-lg leading-relaxed">
            {FOR_BANKS.map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <p className="border-l border-accent/40 pl-6">{item}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FOR CONTRACTORS */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <FadeIn>
              <SectionHeading
                eyebrow="04"
                title="Для підрядників і постачальників"
              />
            </FadeIn>
          </div>
          <div className="lg:col-span-7 space-y-5 text-text-secondary text-base md:text-lg leading-relaxed">
            {FOR_CONTRACTORS.map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <p className="border-l border-accent/40 pl-6">{item}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section
        id="zapyt"
        className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface"
      >
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <ContactForm
              source="partners"
              heading="Запит документів"
              description="Вкажіть тип організації і ціль — підготуємо релевантний пакет."
              fields={['org-type', 'goal']}
              submitLabel="Надіслати запит"
              successText="Прийнято. Підготуємо пакет документів і відповімо протягом робочого дня."
              disclaimer="Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних. Документи передаються на email, вказаний у запиті."
            />
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default Partners;
