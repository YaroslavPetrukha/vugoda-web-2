import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import Button from '../components/Button';
import SectionHeading from '../components/SectionHeading';
import TrustStripe from '../components/TrustStripe';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/projects';

const PRINCIPLES = [
  {
    num: '01',
    title: 'Меморандум',
    body: 'Фіксуємо умови з замовником або партнером — обсяг, відповідальність, графік. До цього кроку проектну роботу не починаємо.',
  },
  {
    num: '02',
    title: 'Кошторис',
    body: 'Прораховуємо вартість матеріалів і робіт до старту продажів, а не після. Ціна квадрата спирається на цифри, не на ринкову позицію.',
  },
  {
    num: '03',
    title: 'Дозвільна документація',
    body: 'Узгоджуємо містобудівні умови, експертизу, дозвіл на будівництво. Без повного пакета на майданчик не виходимо.',
  },
  {
    num: '04',
    title: 'Будівництво',
    body: 'Щомісяця документуємо хід робіт. Кожна фаза — фотозвіт, акти, технагляд.',
  },
];

const AUDIENCES = [
  {
    title: 'Інвестору',
    body: 'Формати співпраці, схема угоди, юридичний контур. Зустрічі — індивідуально, презентація — за запитом.',
    cta: 'Відкрити розділ',
    href: '/investoram',
  },
  {
    title: 'Покупцю',
    body: 'Активний обʼєкт — ЖК Lakeview. Планування, ціни, умови розтермінування і контакти відділу продажів — на сайті проекту.',
    cta: 'Перейти до Lakeview',
    href: '/portfolio/lakeview',
  },
  {
    title: 'Партнеру і банку',
    body: 'Юридична картка, ліцензії, дозволи, реквізити. Запит документів для due diligence — за формою.',
    cta: 'Відкрити розділ',
    href: '/partneram',
  },
];

const lakeview = projects.find((p) => p.slug === 'lakeview')!;
const pipeline = projects.filter((p) => p.slug !== 'lakeview');

const Home = () => {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[88vh] md:min-h-[640px] w-full overflow-hidden bg-bg-deep flex flex-col">
        <div className="absolute inset-0 z-0">
          <img
            src="/vugoda-web-2/projects/lakeview/aerial.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/60 via-bg-deep/65 to-bg-deep" />
          <img
            src="/vugoda-web-2/isometric-grid.svg"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.06] mix-blend-overlay pointer-events-none"
          />
        </div>

        {/* Massive background wordmark */}
        <div
          aria-hidden="true"
          className="absolute top-[12%] left-0 w-full text-center z-0 pointer-events-none select-none overflow-hidden"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="block text-[18vw] font-bold leading-none tracking-tighter text-text-primary/60 mix-blend-overlay uppercase"
          >
            ВИГОДА
          </motion.span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-7xl mx-auto w-full px-6 lg:px-8 pb-16 pt-32">
          <FadeIn className="max-w-4xl">
            <span className="inline-block text-xs font-mono tracking-widest text-accent uppercase mb-6">
              // Системний девелопмент
            </span>
            <h1 className="text-[clamp(2.25rem,5.4vw,5rem)] leading-[1.05] tracking-tight font-bold text-text-primary mb-6">
              Системний девелопмент, у якому цінність є результатом точних рішень.
            </h1>
            <p className="text-text-secondary text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
              Будуємо у Львові й області. На сьогодні — один активний обʼєкт
              (Lakeview, здача 2027) і чотири проекти у pre-construction. Кожне
              рішення — задокументоване.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button as="router" href="/portfolio" variant="primary" size="lg">
                Переглянути портфель <ArrowRight className="w-4 h-4" />
              </Button>
              <Button as="router" href="/investoram" variant="ghost" size="lg">
                Для інвесторів
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TRUST STRIPE */}
      <TrustStripe />

      {/* WHO WE ARE */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-b border-bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <FadeIn>
              <SectionHeading eyebrow="01" title="Хто ми" />
            </FadeIn>
          </div>
          <div className="lg:col-span-7 space-y-5 text-text-secondary text-base md:text-lg leading-relaxed">
            <FadeIn delay={0.05}>
              <p>
                ТОВ «БК ВИГОДА ГРУП» — забудовник і генеральний підрядник зі
                Львова.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p>
                Ліцензія на будівництво — від 27 грудня 2019 року, безстрокова.
                ЄДРПОУ 42016395.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p>
                Працюємо з власними новими обʼєктами і приймаємо проекти на
                відновлення будівництва від інших замовників.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SYSTEMIC DEVELOPMENT — 4 PRINCIPLES */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8 relative overflow-hidden">
        <img
          src="/vugoda-web-2/isometric-grid.svg"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] mix-blend-overlay pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="02"
              title="Що означає системний девелопмент"
              description="Чотири фази, через які проходить кожен проект до запуску продажів. Без скорочень і обходів."
            />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface mt-16 border border-bg-surface">
            {PRINCIPLES.map((p, i) => (
              <FadeIn
                key={p.num}
                delay={i * 0.06}
                className="bg-bg-deep p-8 md:p-12 hover:bg-bg-surface/40 transition-colors group"
              >
                <div className="flex items-start gap-6">
                  <span className="text-accent font-mono text-sm tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
                    //{p.num}
                  </span>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3">
                      {p.title}
                    </h3>
                    <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                      {p.body}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-12">
            <Button as="router" href="/pidkhid" variant="ghost" size="md">
              Детально про підхід <ArrowRight className="w-4 h-4" />
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* CURRENT FOCUS — PORTFOLIO */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="03"
              title="Поточний фокус"
              description="Один обʼєкт у будівництві, чотири — у pre-construction."
            />
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeIn delay={0.05} className="lg:row-span-2">
              <ProjectCard project={lakeview} variant="featured" />
            </FadeIn>
            {pipeline.map((p, i) => (
              <FadeIn key={p.slug} delay={0.1 + i * 0.05}>
                <ProjectCard project={p} />
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-12">
            <Button as="router" href="/portfolio" variant="ghost" size="md">
              Дивитись усі проекти <ArrowRight className="w-4 h-4" />
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="04" title="Для кого ми працюємо" />
          </FadeIn>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-bg-surface border border-bg-surface">
            {AUDIENCES.map((a, i) => (
              <FadeIn
                key={a.title}
                delay={i * 0.06}
                className="bg-bg-deep p-8 md:p-10 group flex flex-col"
              >
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  {a.title}
                </h3>
                <p className="text-text-secondary leading-relaxed mb-8 flex-1">
                  {a.body}
                </p>
                <Button as="router" href={a.href} variant="link" className="self-start">
                  {a.cta} <ArrowUpRight className="w-4 h-4" />
                </Button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST FACTAGE */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="05"
              title="Юридичний фактаж"
              description="Портфель формується. Не приховуємо стадії — це частина методології."
            />
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {[
              { label: 'Юр.особа', value: 'ТОВ «БК ВИГОДА ГРУП»' },
              { label: 'ЄДРПОУ', value: '42016395' },
              { label: 'Ліцензія', value: 'від 27.12.2019, безстрокова' },
              { label: 'Статус', value: '0 зданих · 1 будується · 4 у pipeline' },
            ].map((f) => (
              <div key={f.label} className="bg-bg-base p-6 md:p-8">
                <div className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">
                  {f.label}
                </div>
                <div className="text-base md:text-lg font-bold text-text-primary">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA TO CONTACT */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <SectionHeading
              eyebrow="06"
              title="Залишилось питання"
              description="Залиште номер — зателефонуємо сьогодні. Якщо треба швидше, напишіть на vygoda.sales@gmail.com."
            />
          </FadeIn>
          <FadeIn delay={0.1} className="md:justify-self-end">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button as="router" href="/kontakty" variant="primary" size="lg">
                Написати нам <ArrowRight className="w-4 h-4" />
              </Button>
              <Button as="a" href="mailto:vygoda.sales@gmail.com" variant="ghost" size="lg">
                Email
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default Home;
