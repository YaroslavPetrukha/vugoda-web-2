import { ArrowRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import ContactForm from '../components/ContactForm';

const CORP_CONTACTS = [
  { label: 'Email', value: 'vygoda.sales@gmail.com', link: 'mailto:vygoda.sales@gmail.com' },
  { label: 'Юр.адреса', value: 'Уточнюється — надамо за запитом' },
  { label: 'Корпоративний телефон', value: 'Уточнюється' },
];

const DIRECTIONS = [
  {
    title: 'Інвестиційні запити',
    body: 'Зустрічі, презентації, формати співпраці.',
    channel: 'vygoda.sales@gmail.com або форма у розділі /investoram',
    href: '/investoram',
  },
  {
    title: 'Партнерам, банкам, підрядникам',
    body: 'Документи для due diligence, акредитація, тендери.',
    channel: 'vygoda.sales@gmail.com або форма у розділі /partneram',
    href: '/partneram',
  },
  {
    title: 'Медіа',
    body: 'Коментарі, прес-релізи, запити на інтервʼю.',
    channel: 'vygoda.sales@gmail.com з темою «Медіа»',
  },
  {
    title: 'Карʼєра',
    body: 'Резюме і пропозиції від спеціалістів. Розглядаємо як на штатні позиції, так і на проектну роботу.',
    channel: 'vygoda.sales@gmail.com з темою «Вакансія»',
  },
];

const LAKEVIEW_CONTACTS = [
  { label: 'Телефон', value: '+38 066 990 03 90', link: 'tel:+380669900390' },
  { label: 'Email', value: 'vygoda.plus@gmail.com', link: 'mailto:vygoda.plus@gmail.com' },
  {
    label: 'Офіс продажу',
    value: 'вул. Володимира Великого, 4, 4-й поверх, каб. 406, Львів',
  },
  {
    label: 'Instagram',
    value: '@lakeviewlviv',
    link: 'https://www.instagram.com/lakeviewlviv/',
    external: true,
  },
];

const LEGAL = [
  'ТОВ «БК ВИГОДА ГРУП»',
  'ЄДРПОУ 42016395',
  'Ліцензія на будівництво від 27.12.2019, безстрокова',
];

const Contacts = () => {
  return (
    <>
      <PageHero
        eyebrow="Розділ 06"
        title="Контакти"
        lead="Корпоративні контакти і окремі канали ЖК Lakeview. Якщо не знаєте, куди писати — заповніть форму нижче."
        decorative
      >
        <Button as="a" href="#napysaty" variant="primary" size="lg">
          Написати нам <ArrowRight className="w-4 h-4" />
        </Button>
        <Button as="router" href="/partneram" variant="ghost" size="lg">
          Реквізити
        </Button>
      </PageHero>

      {/* CORPORATE */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-b border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="01" title="Корпоративні контакти" />
          </FadeIn>
          <dl className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-bg-surface border border-bg-surface">
            {CORP_CONTACTS.map((c) => (
              <div key={c.label} className="bg-bg-base p-6 md:p-8">
                <dt className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">
                  {c.label}
                </dt>
                <dd className="text-text-primary text-base md:text-lg leading-relaxed">
                  {c.link ? (
                    <a
                      href={c.link}
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

      {/* DIRECTIONS */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="02" title="Куди писати" />
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {DIRECTIONS.map((d, i) => (
              <FadeIn key={d.title} delay={i * 0.04} className="bg-bg-deep p-8">
                <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4 leading-snug">
                  {d.title}
                </h3>
                <p className="text-text-secondary leading-relaxed mb-5">{d.body}</p>
                <p className="text-sm text-text-secondary border-t border-bg-surface pt-4">
                  <span className="block text-[10px] uppercase tracking-widest text-accent mb-1">
                    Канал
                  </span>
                  {d.channel}
                </p>
                {d.href && (
                  <div className="mt-5">
                    <Button as="router" href={d.href} variant="link">
                      Перейти у розділ <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* LAKEVIEW SEPARATE */}
      <section className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-y border-bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="03"
              title="ЖК Lakeview — окремі контакти"
              description="Це контакти проекту, не корпоративні. Бронювання, перегляди, ціни — за цими каналами."
            />
          </FadeIn>
          <dl className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-surface border border-bg-surface">
            {LAKEVIEW_CONTACTS.map((c) => (
              <div key={c.label} className="bg-bg-base p-6 md:p-8">
                <dt className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">
                  {c.label}
                </dt>
                <dd className="text-text-primary text-base md:text-lg leading-relaxed">
                  {c.link ? (
                    <a
                      href={c.link}
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
          <FadeIn className="mt-10">
            <Button as="router" href="/portfolio/lakeview" variant="ghost" size="md">
              Сторінка проекту <ArrowRight className="w-4 h-4" />
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* LEGAL CARD */}
      <section className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeading eyebrow="04" title="Юридична картка" />
          </FadeIn>
          <ul className="mt-12 divide-y divide-bg-surface border-y border-bg-surface">
            {LEGAL.map((line, i) => (
              <li key={i} className="py-5 text-text-primary text-base md:text-lg">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FORM */}
      <section
        id="napysaty"
        className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface"
      >
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <ContactForm
              source="contacts"
              heading="Написати нам"
              description="Заповніть два поля. Тему і повідомлення — за бажанням."
              fields={['topic', 'message']}
              submitLabel="Надіслати"
              successText="Прийнято. Відповімо протягом робочого дня."
              disclaimer="Натискаючи «Надіслати», ви погоджуєтесь на обробку персональних даних."
            />
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default Contacts;
