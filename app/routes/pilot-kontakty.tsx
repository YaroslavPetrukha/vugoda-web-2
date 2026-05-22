import type { MetaFunction } from 'react-router';
import { siteUrl } from '../../src/lib/site-url';
import { ArrowRight } from 'lucide-react';
import FadeIn from '../../src/components/FadeIn';
import ContactsHero from '../../src/components/ContactsHero';
import SectionHeading from '../../src/components/SectionHeading';
import Button from '../../src/components/Button';
import ContactForm from '../../src/components/ContactForm';

export const meta: MetaFunction = ({ location }) => {
  const title = 'PILOT · Kontakty Hero Preview';
  const description = 'Preview pilot v4-style hero для /kontakty — НЕ для production.';
  const url = siteUrl(location.pathname);
  return [
    { title },
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
};

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
  { label: 'Телефон', value: '0969900390', link: 'tel:+380969900390' },
  { label: 'Email', value: 'vygoda.sales@gmail.com', link: 'mailto:vygoda.sales@gmail.com' },
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

const PilotContacts = () => {
  return (
    <>
      <div className="bg-accent text-bg-deep px-6 py-2 text-center text-xs font-mono tracking-widest uppercase">
        PILOT PREVIEW · НЕ для production · /pilot-kontakty
      </div>

      <ContactsHero
        eyebrow="Розділ 06 · контакти"
        title="Зв'язатись напряму"
        lead="Корпоративні канали забудовника. Email, телефон і офіс продажу — без посередників. Якщо не знаєте, куди писати — заповніть форму нижче."
      >
        <Button as="a" href="#napysaty" variant="primary" size="lg">
          Написати нам <ArrowRight className="w-4 h-4" />
        </Button>
        <Button as="router" href="/partneram" variant="ghost" size="lg">
          Юр. реквізити
        </Button>
      </ContactsHero>

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
                <p className="text-sm text-text-secondary leading-relaxed border-t border-bg-surface pt-4">
                  <span className="block text-[11px] uppercase tracking-widest text-accent mb-1">
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
                <dt className="text-[11px] font-medium uppercase tracking-widest text-text-secondary mb-2">
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

      {/* FORM */}
      <section
        id="napysaty"
        className="bg-bg-base py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface"
      >
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <ContactForm
              source="kontakty"
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

export default PilotContacts;
