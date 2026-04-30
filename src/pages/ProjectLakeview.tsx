import { ArrowRight, ArrowUpRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import StagePill from '../components/StagePill';
import ContactForm from '../components/ContactForm';
import ProjectGalleryStrip from '../components/ProjectGalleryStrip';

const PARAMETERS = [
  { label: 'Адреса', value: 'вул. Володимира Великого, 2А, Франківський район, Львів' },
  { label: 'Клас', value: 'Бізнес' },
  { label: 'Секцій', value: '4' },
  { label: 'Поверховість', value: 'до 15' },
  { label: 'Площі квартир', value: '44–183 м² (1/2/3-кімнатні)' },
  { label: 'Паркінг', value: '2 рівні підземного' },
  { label: 'Технологія', value: 'Монолітно-каркасна, залізобетон + керамоблоки, мінвата' },
  { label: 'Клас наслідків', value: 'СС3 (найвищий)' },
  { label: 'Термін здачі', value: '2027' },
  { label: 'Стартова ціна', value: 'від $1600 / м²' },
  { label: 'Умови оплати', value: '30% перший внесок + розстрочка на період будівництва' },
  { label: 'У вартість входить', value: 'штукатурка стін, броньовані двері, вікна, лічильники, електромережа' },
];

const INFRA = [
  'Комерція на 1 поверсі: магазини, кафе, салони',
  'Укриття у підземному паркінзі',
  'Охорона, відеоспостереження, контроль доступу',
  'Індивідуальне (автономне) опалення',
  'Власний двір і паркова зона',
  'Спортивний/фітнес-центр (плановано)',
];

const RENDERS = [
  { src: '/vugoda-web-2/projects/lakeview/aerial.jpg', alt: 'Lakeview — аерофотозйомка' },
  { src: '/vugoda-web-2/projects/lakeview/semi-aerial.jpg', alt: 'Lakeview — оглядовий ракурс' },
  { src: '/vugoda-web-2/projects/lakeview/closeup.jpg', alt: 'Lakeview — деталі фасаду' },
  { src: '/vugoda-web-2/projects/lakeview/entrance.jpg', alt: 'Lakeview — вхідна група' },
  { src: '/vugoda-web-2/projects/lakeview/lake-bridge.jpg', alt: 'Lakeview — озеро та міст' },
  { src: '/vugoda-web-2/projects/lakeview/terrace.jpg', alt: 'Lakeview — терасна зона' },
];

const CONSTRUCTION_GROUPS = [
  {
    label: 'Грудень 2025',
    items: [
      { src: '/vugoda-web-2/construction/dec-01.jpg', alt: 'Грудень 2025 — кадр 1' },
      { src: '/vugoda-web-2/construction/dec-02.jpg', alt: 'Грудень 2025 — кадр 2' },
      { src: '/vugoda-web-2/construction/dec-03.jpg', alt: 'Грудень 2025 — кадр 3' },
    ],
  },
  {
    label: 'Січень 2026',
    items: [
      { src: '/vugoda-web-2/construction/jan-01.jpg', alt: 'Січень 2026 — кадр 1' },
      { src: '/vugoda-web-2/construction/jan-02.jpg', alt: 'Січень 2026 — кадр 2' },
      { src: '/vugoda-web-2/construction/jan-03.jpg', alt: 'Січень 2026 — кадр 3' },
    ],
  },
  {
    label: 'Лютий 2026',
    items: [
      { src: '/vugoda-web-2/construction/feb-01.jpg', alt: 'Лютий 2026 — кадр 1' },
      { src: '/vugoda-web-2/construction/feb-02.jpg', alt: 'Лютий 2026 — кадр 2' },
      { src: '/vugoda-web-2/construction/feb-03.jpg', alt: 'Лютий 2026 — кадр 3' },
    ],
  },
  {
    label: 'Березень 2026',
    items: [
      { src: '/vugoda-web-2/construction/mar-01.jpg', alt: 'Березень 2026 — кадр 1' },
      { src: '/vugoda-web-2/construction/mar-02.jpg', alt: 'Березень 2026 — кадр 2' },
      { src: '/vugoda-web-2/construction/mar-03.jpg', alt: 'Березень 2026 — кадр 3' },
    ],
  },
];

const LAKEVIEW_SITE = 'https://yaroslavpetrukha.github.io/Lakeview/';
const LAKEVIEW_INSTAGRAM = 'https://www.instagram.com/lakeviewlviv/';

const ProjectLakeview = () => {
  return (
    <>
      <PageHero
        eyebrow="Активний обʼєкт"
        title="ЖК Lakeview"
        lead="Бізнес-клас на вул. Володимира Великого, 2А. Чотири секції, монолітно-каркасна технологія, два рівні підземного паркінгу."
        image="/vugoda-web-2/projects/lakeview/hero.jpg"
        imageAlt=""
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
              Ділянка межує з ресторанним комплексом «Гуцульська Гражда» (працює
              з 2004 року) і двома природними озерами. Звідси — назва Lakeview.
              Серед бізнес-класу Львова поєднання виду на воду і пішохідної
              доступності гастрономічного обʼєкта зустрічається рідко.
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
                  <h3 className="text-lg md:text-xl font-bold text-text-primary uppercase tracking-wider">
                    {g.label}
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-text-secondary">
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
        <div className="max-w-5xl mx-auto">
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
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="07"
              title="Контакти ЖК Lakeview"
              description="Це окремі контакти проекту. Корпоративні контакти ВИГОДИ — у розділі /kontakty."
            />
          </FadeIn>
          <dl className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {[
              { label: 'Телефон', value: '+38 066 990 03 90', href: 'tel:+380669900390' },
              { label: 'Email', value: 'vygoda.plus@gmail.com', href: 'mailto:vygoda.plus@gmail.com' },
              { label: 'Офіс продажу', value: 'вул. Володимира Великого, 4, 4-й поверх, каб. 406, Львів' },
              { label: 'Instagram', value: '@lakeviewlviv', href: LAKEVIEW_INSTAGRAM, external: true },
            ].map((c) => (
              <div key={c.label} className="bg-bg-base p-6 md:p-8">
                <dt className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">
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

      {/* FORM */}
      <section id="zapys" className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <ContactForm
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
