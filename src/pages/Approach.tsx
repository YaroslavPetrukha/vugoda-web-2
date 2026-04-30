import { ArrowRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';

const PHASES = [
  {
    num: '01',
    title: 'Меморандум',
    body: 'Фіксуємо умови з замовником або власником ділянки: обсяг робіт, відповідальність сторін, графік, фінансову модель.',
    docs: 'меморандум, протокол намірів, попередній графік',
    duration: '1–3 місяці',
  },
  {
    num: '02',
    title: 'Кошторисна документація',
    body: 'Рахуємо вартість матеріалів, робіт, інженерних мереж до старту продажів. Це формує базову економіку проекту і ціну квадрата.',
    docs: 'кошторис у обсязі ДСТУ, специфікації, зведений розрахунок',
    duration: '2–4 місяці',
  },
  {
    num: '03',
    title: 'Дозвільна документація',
    body: 'Узгоджуємо містобудівні умови, проектну документацію, експертизу, отримуємо дозвіл на виконання будівельних робіт.',
    docs: 'МУО, проект, експертний висновок, дозвіл ДІАМ',
    duration: '4–9 місяців',
  },
  {
    num: '04',
    title: 'Будівництво і документування',
    body: 'Виходимо на майданчик. Щомісяця фіксуємо хід робіт фотозвітом, актами і даними технагляду.',
    docs: 'акти КБ-2, КБ-3, журнали робіт, фотофіксація',
    duration: 'за графіком проекту, до введення в експлуатацію',
  },
];

const PRINCIPLES = [
  {
    title: 'Цифри до обіцянок',
    body: 'Кошторис рахуємо до старту продажів, а не після.',
  },
  {
    title: 'Документ до дії',
    body: 'На майданчик заходимо з повним пакетом дозволів.',
  },
  {
    title: 'Один генпідрядник — одна відповідальність',
    body: 'ВИГОДА — і забудовник, і генпідрядник.',
  },
  {
    title: 'Клас наслідків СС3 як стандарт',
    body: 'Розраховуємо конструкцію за найвищим класом, де це доцільно.',
  },
  {
    title: 'Помісячна фотофіксація',
    body: 'Хід робіт публікуємо без редактури.',
  },
  {
    title: 'Прямий продаж від забудовника',
    body: 'Без посередників, без багаторівневих агентських схем.',
  },
];

const NOT_DOING = [
  'Не запускаємо продажі без затвердженого кошторису.',
  'Не виходимо на майданчик без дозволу на будівельні роботи.',
  'Не імітуємо досвід, якого немає: компанія молода, портфель формується.',
  'Не використовуємо рекламний словник «мрії» і «преміального стилю». Замість цього — параметри, документи, дати.',
  'Не публікуємо облич і імен команди — довіра будується через юридичний фактаж.',
];

const Approach = () => {
  return (
    <>
      <PageHero
        eyebrow="Розділ 02"
        title="Як ми ухвалюємо рішення"
        lead="Проект проходить чотири фази до старту продажів. Кожна — з конкретними документами і строками. Нижче — як це виглядає на практиці."
        decorative
      >
        <Button as="router" href="/portfolio" variant="primary" size="lg">
          Переглянути портфель <ArrowRight className="w-4 h-4" />
        </Button>
        <Button as="router" href="/partneram" variant="ghost" size="lg">
          Запит для партнерів
        </Button>
      </PageHero>

      {/* PHASES */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-b border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="01" title="Чотири фази проекту" />
          </FadeIn>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {PHASES.map((p, i) => (
              <FadeIn
                key={p.num}
                delay={i * 0.06}
                className="bg-bg-base p-8 md:p-12"
              >
                <span className="text-accent font-mono text-sm tracking-widest mb-6 block">
                  //{p.num}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                  {p.num}. {p.title}
                </h3>
                <p className="text-text-secondary leading-relaxed mb-8">
                  {p.body}
                </p>
                <dl className="border-t border-bg-surface pt-6 grid grid-cols-1 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <dt className="text-[10px] uppercase tracking-widest text-text-secondary">
                      Документи
                    </dt>
                    <dd className="text-text-primary">{p.docs}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-[10px] uppercase tracking-widest text-text-secondary">
                      Тривалість
                    </dt>
                    <dd className="text-text-primary">{p.duration}</dd>
                  </div>
                </dl>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="02" title="Принципи, яких тримаємось" />
          </FadeIn>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-bg-surface border border-bg-surface">
            {PRINCIPLES.map((p, i) => (
              <FadeIn
                key={p.title}
                delay={i * 0.04}
                className="bg-bg-deep p-8"
              >
                <span className="block text-accent font-mono text-xs tracking-widest mb-4">
                  //{String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-bold text-text-primary mb-3 leading-snug">
                  {p.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {p.body}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* NOT DOING */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="03" title="Чого ми не робимо" />
          </FadeIn>
          <ul className="mt-12 divide-y divide-bg-surface border-y border-bg-surface">
            {NOT_DOING.map((item, i) => (
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

      {/* LEGAL FOUNDATION */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="04" title="Юридичний фундамент" />
          </FadeIn>
          <div className="mt-12 space-y-4 text-text-secondary text-base md:text-lg leading-relaxed max-w-3xl">
            <p>ТОВ «БК ВИГОДА ГРУП», ЄДРПОУ 42016395.</p>
            <p>
              Ліцензія на провадження господарської діяльності з будівництва — від
              27 грудня 2019 року, безстрокова.
            </p>
            <p>Працюємо як забудовник і генеральний підрядник.</p>
            <p>
              Договірна модель: купівля-продаж майнових прав, можливість
              переуступки.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="05"
              title="Що далі"
              description="Якщо ви інвестор або партнер — нижче короткі шляхи у відповідні розділи."
            />
          </FadeIn>
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Button as="router" href="/portfolio" variant="primary" size="lg">
              Портфель і pipeline <ArrowRight className="w-4 h-4" />
            </Button>
            <Button as="router" href="/partneram" variant="ghost" size="lg">
              Партнерам і банкам
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Approach;
