import type { MetaFunction } from 'react-router';
import { siteUrl } from '../../src/lib/site-url';
import { ArrowRight } from 'lucide-react';
import FadeIn from '../../src/components/FadeIn';
import NewsHero from '../../src/components/NewsHero';
import SectionHeading from '../../src/components/SectionHeading';
import Button from '../../src/components/Button';
import NewsCard from '../../src/components/NewsCard';
import ContactForm from '../../src/components/ContactForm';
import { news } from '../../src/data/news';

export const meta: MetaFunction = ({ location }) => {
  const title = 'PILOT · Novyny Hero Preview';
  const description = 'Preview pilot v4-style hero для /novyny — НЕ для production.';
  const url = siteUrl(location.pathname);
  return [
    { title },
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
};

const CATEGORIES = ['Усі', 'Етапи проектів', 'Методологія', 'Прес-релізи'];

const PilotNews = () => {
  return (
    <>
      <div className="bg-accent text-bg-deep px-6 py-2 text-center text-xs font-mono tracking-widest uppercase">
        PILOT PREVIEW · НЕ для production · /pilot-novyny
      </div>

      <NewsHero
        eyebrow="Розділ 07 · хроніка"
        title="Хід будівництва без редактури"
        lead="Що відбувається на майданчиках, які рішення ухвалюємо, що публікуємо офіційно. Без рекламних формулювань — тільки етапи, документи, дати."
        items={news}
      >
        <Button as="a" href="#pidpyska" variant="primary" size="lg">
          Підписатись на оновлення <ArrowRight className="w-4 h-4" />
        </Button>
      </NewsHero>

      {/* CATEGORIES */}
      <section className="bg-bg-deep border-b border-bg-surface py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 md:gap-4">
          <span className="text-[11px] font-medium uppercase tracking-widest text-text-secondary mr-2">
            Категорії
          </span>
          {CATEGORIES.map((c, i) => (
            <button
              type="button"
              key={c}
              aria-pressed={i === 0}
              className={`px-3 py-2 text-xs uppercase tracking-widest border transition-colors rounded-none ${
                i === 0
                  ? 'bg-accent text-bg-deep border-accent'
                  : 'bg-transparent text-text-secondary border-bg-surface hover:border-accent hover:text-accent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* POSTS */}
      <section className="bg-bg-base py-16 md:py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <SectionHeading
              eyebrow="01"
              title="Останні публікації"
              description="Три пости, оновлюються щомісяця."
            />
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((item, i) => (
              <FadeIn key={item.slug} delay={i * 0.05}>
                <NewsCard
                  date={item.date}
                  dateLabel={item.dateLabel}
                  category={item.category}
                  title={item.title}
                  lead={item.excerpt}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SUBSCRIBE FORM */}
      <section
        id="pidpyska"
        className="bg-bg-deep py-24 md:py-32 px-6 lg:px-8 border-t border-bg-surface"
      >
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <ContactForm
              source="news-subscribe"
              heading="Підписатись на оновлення"
              description="Раз на місяць — короткий дайджест про етапи і прес-релізи."
              fields={['email']}
              submitLabel="Підписатись"
              successText="Прийнято. Перший дайджест надішлемо наприкінці місяця."
              disclaimer="Натискаючи «Підписатись», ви погоджуєтесь на обробку персональних даних. Відписатись можна в будь-який момент."
            />
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default PilotNews;
