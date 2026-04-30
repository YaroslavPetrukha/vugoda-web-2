import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from './Button';

export type ExtraField =
  | 'email'
  | 'message'
  | 'project'
  | 'investor-format'
  | 'org-type'
  | 'goal'
  | 'topic';

export type ContactFormProps = {
  heading: string;
  description?: string;
  fields?: ExtraField[];
  submitLabel?: string;
  successText?: string;
  disclaimer?: string;
  source: string;
  className?: string;
};

const FIELD_LABELS: Record<ExtraField, string> = {
  email: 'Email',
  message: 'Повідомлення',
  project: 'Обʼєкт інтересу',
  'investor-format': 'Формат інтересу',
  'org-type': 'Тип організації',
  goal: 'Ціль запиту',
  topic: 'Тема',
};

const ContactForm = ({
  heading,
  description,
  fields = [],
  submitLabel = 'Надіслати запит',
  successText = 'Прийнято. Зателефонуємо протягом робочого дня.',
  disclaimer = 'Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних відповідно до законодавства України.',
  source,
  className = '',
}: ContactFormProps) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload: Record<string, string> = { source };
    data.forEach((v, k) => {
      payload[k] = String(v);
    });
    // Прототип — без бекенду
    // eslint-disable-next-line no-console
    console.log('[contact-form]', payload);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className={`bg-bg-surface border border-accent p-8 md:p-10 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="w-12 h-12 mb-5 border border-accent flex items-center justify-center">
          <div className="w-2 h-2 bg-accent" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
          Прийнято.
        </h3>
        <p className="text-text-secondary leading-relaxed max-w-md">
          {successText}
        </p>
      </div>
    );
  }

  const headingId = `cf-${source}-heading`;

  return (
    <div
      className={`bg-bg-surface border border-bg-surface p-8 md:p-10 ${className}`}
    >
      <h3
        id={headingId}
        className="text-2xl md:text-3xl font-bold text-text-primary mb-2"
      >
        {heading}
      </h3>
      {description && (
        <p className="text-text-secondary mb-8 text-sm md:text-base leading-relaxed">
          {description}
        </p>
      )}
      <form
        className="flex flex-col gap-7"
        onSubmit={handleSubmit}
        aria-labelledby={headingId}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              Імʼя <span className="text-accent" aria-hidden="true">*</span>
            </span>
            <input
              type="text"
              name="name"
              required
              aria-required="true"
              autoComplete="name"
              placeholder="Як до вас звертатися"
              className="bg-transparent border-b border-bg-surface pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              Телефон <span className="text-accent" aria-hidden="true">*</span>
            </span>
            <input
              type="tel"
              name="phone"
              required
              aria-required="true"
              autoComplete="tel"
              placeholder="+380 ..."
              className="bg-transparent border-b border-bg-surface pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none"
            />
          </label>
        </div>

        {fields.includes('email') && (
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              {FIELD_LABELS.email}
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="bg-transparent border-b border-bg-surface pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none"
            />
          </label>
        )}

        {fields.includes('topic') && (
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              {FIELD_LABELS.topic}
            </span>
            <select
              name="topic"
              defaultValue=""
              className="bg-transparent border-b border-bg-surface pb-3 text-text-primary focus:outline-none focus:border-accent rounded-none"
            >
              <option value="" className="bg-bg-deep">
                Оберіть тему
              </option>
              <option value="investments" className="bg-bg-deep">Інвестиції</option>
              <option value="partnership" className="bg-bg-deep">Партнерство</option>
              <option value="media" className="bg-bg-deep">Медіа</option>
              <option value="career" className="bg-bg-deep">Кар&apos;єра</option>
              <option value="other" className="bg-bg-deep">Інше</option>
            </select>
          </label>
        )}

        {fields.includes('investor-format') && (
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              {FIELD_LABELS['investor-format']}
            </span>
            <select
              name="investor_format"
              defaultValue=""
              className="bg-transparent border-b border-bg-surface pb-3 text-text-primary focus:outline-none focus:border-accent rounded-none"
            >
              <option value="" className="bg-bg-deep">
                Оберіть формат
              </option>
              <option value="property-rights" className="bg-bg-deep">
                Купівля майнових прав
              </option>
              <option value="rental-income" className="bg-bg-deep">
                Дохідна нерухомість
              </option>
              <option value="project-partnership" className="bg-bg-deep">
                Партнерство по проекту
              </option>
            </select>
          </label>
        )}

        {fields.includes('org-type') && (
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              {FIELD_LABELS['org-type']}
            </span>
            <select
              name="org_type"
              defaultValue=""
              className="bg-transparent border-b border-bg-surface pb-3 text-text-primary focus:outline-none focus:border-accent rounded-none"
            >
              <option value="" className="bg-bg-deep">
                Оберіть тип
              </option>
              <option value="bank" className="bg-bg-deep">Банк</option>
              <option value="contractor" className="bg-bg-deep">Підрядник</option>
              <option value="supplier" className="bg-bg-deep">Постачальник</option>
              <option value="legal" className="bg-bg-deep">Юр.фірма</option>
              <option value="other" className="bg-bg-deep">Інше</option>
            </select>
          </label>
        )}

        {fields.includes('goal') && (
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              {FIELD_LABELS.goal}
            </span>
            <input
              type="text"
              name="goal"
              placeholder="Коротко — що саме потрібно"
              className="bg-transparent border-b border-bg-surface pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none"
            />
          </label>
        )}

        {fields.includes('message') && (
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              {FIELD_LABELS.message}
            </span>
            <textarea
              name="message"
              rows={4}
              placeholder="Опишіть запит"
              className="bg-transparent border-b border-bg-surface pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none resize-none"
            />
          </label>
        )}

        <div className="flex flex-col gap-4 pt-2">
          <Button type="submit" variant="primary" size="lg" className="self-start">
            {submitLabel}
          </Button>
          <p className="text-xs text-text-secondary/80 max-w-xl leading-relaxed">
            {disclaimer}
          </p>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
