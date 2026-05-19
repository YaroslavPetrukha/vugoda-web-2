import { useState, useRef, useEffect, useId } from 'react';
import type { FormEvent } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import Button from './Button';
import {
  ContactSchema,
  type FormSource,
  type ContactResponse,
} from '../../shared/contact-schema';

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
  source: FormSource;
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

type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }
  | { kind: 'rate_limited'; secondsLeft: number };

// VITE_TURNSTILE_SITE_KEY is injected at build time via CF Pages env.
// Fallback to Cloudflare test key (always passes) for local dev without .dev.vars.
const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ??
  '1x00000000000000000000AA';

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
  const [state, setState] = useState<FormState>({ kind: 'idle' });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const turnstileRef = useRef<TurnstileInstance>(null);
  const submitLockRef = useRef(false);
  // Stable id prefix — avoids hydration mismatch from useId on SSG
  const uid = useId();

  // Countdown timer for rate-limited state
  useEffect(() => {
    if (state.kind !== 'rate_limited') return;
    if (state.secondsLeft <= 0) {
      setState({ kind: 'idle' });
      return;
    }
    const t = setTimeout(() => {
      setState((prev) =>
        prev.kind === 'rate_limited'
          ? { kind: 'rate_limited', secondsLeft: prev.secondsLeft - 1 }
          : prev,
      );
    }, 1000);
    return () => clearTimeout(t);
  }, [state]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitLockRef.current) return;
    if (state.kind === 'submitting' || state.kind === 'rate_limited') return;
    submitLockRef.current = true;
    setErrors({});

    if (!turnstileToken) {
      setState({ kind: 'error', message: 'Завершіть перевірку Turnstile' });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const raw: Record<string, unknown> = { source, turnstileToken, consent: false };
    formData.forEach((v, k) => {
      if (k === 'consent') {
        raw.consent = v === 'on';
      } else {
        raw[k] = String(v);
      }
    });

    // Client-side validation mirrors server schema
    const parsed = ContactSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = String(issue.path[0] ?? '_form');
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setState({ kind: 'submitting' });

    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      let data: ContactResponse | null = null;
      try {
        data = (await r.json()) as ContactResponse;
      } catch {
        // JSON parse failed — treat as server error below
      }

      if (data && data.ok === true) {
        setState({ kind: 'success' });
        return;
      }

      if (r.status === 429 && data?.ok === false) {
        setState({ kind: 'rate_limited', secondsLeft: data.retryAfter ?? 60 });
        return;
      }

      if (data && data.ok === false) {
        // Turnstile token is single-use — reset widget on any failure
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        setState({ kind: 'error', message: data.message });
        return;
      }

      // Catch-all: malformed or unexpected response (no ok field, JSON parse failure, etc.)
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setState({
        kind: 'error',
        message: 'Несподівана відповідь сервера. Зателефонуйте напряму: 0969 900 390',
      });
    } catch {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setState({
        kind: 'error',
        message:
          'Не вдалось підключитись до сервера. Спробуйте ще раз або зателефонуйте: 0969 900 390',
      });
    } finally {
      submitLockRef.current = false;
    }
  };

  if (state.kind === 'success') {
    return (
      <div
        className={`bg-bg-surface border border-accent p-8 md:p-10 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="w-12 h-12 mb-5 border border-accent flex items-center justify-center">
          <div className="w-2 h-2 bg-accent" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-text-primary leading-snug mb-3">
          Прийнято.
        </h3>
        <p className="text-text-secondary leading-relaxed max-w-md">{successText}</p>
      </div>
    );
  }

  const headingId = `cf-${uid}-heading`;
  const isBusy = state.kind === 'submitting';
  const isRateLimited = state.kind === 'rate_limited';
  const secondsLeft = isRateLimited
    ? (state as { kind: 'rate_limited'; secondsLeft: number }).secondsLeft
    : 0;

  return (
    <div className={`bg-bg-surface border border-bg-surface p-8 md:p-10 ${className}`}>
      <h3
        id={headingId}
        className="text-2xl md:text-3xl font-bold text-text-primary leading-snug mb-2"
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
        noValidate
      >
        {/* Honeypot — positioned off-screen; real users never see or fill it */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] w-px h-px overflow-hidden opacity-0 pointer-events-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              Імʼя{' '}
              <span className="text-accent" aria-hidden="true">
                *
              </span>
            </span>
            <input
              type="text"
              name="name"
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              autoComplete="name"
              placeholder="Як до вас звертатися"
              className={`bg-transparent border-b pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none ${
                errors.name ? 'border-red-500' : 'border-bg-surface'
              }`}
            />
            {errors.name && (
              <span className="text-xs text-red-400">{errors.name}</span>
            )}
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              Телефон{' '}
              <span className="text-accent" aria-hidden="true">
                *
              </span>
            </span>
            <input
              type="tel"
              name="phone"
              required
              aria-required="true"
              aria-invalid={!!errors.phone}
              autoComplete="tel"
              placeholder="+380 ..."
              className={`bg-transparent border-b pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none ${
                errors.phone ? 'border-red-500' : 'border-bg-surface'
              }`}
            />
            {errors.phone && (
              <span className="text-xs text-red-400">{errors.phone}</span>
            )}
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
              aria-invalid={!!errors.email}
              autoComplete="email"
              placeholder="you@example.com"
              className={`bg-transparent border-b pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none ${
                errors.email ? 'border-red-500' : 'border-bg-surface'
              }`}
            />
            {errors.email && (
              <span className="text-xs text-red-400">{errors.email}</span>
            )}
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
              aria-invalid={!!errors.topic}
              className={`bg-transparent border-b pb-3 text-text-primary focus:outline-none focus:border-accent rounded-none ${
                errors.topic ? 'border-red-500' : 'border-bg-surface'
              }`}
            >
              <option value="" className="bg-bg-deep">
                Оберіть тему
              </option>
              <option value="investments" className="bg-bg-deep">
                Інвестиції
              </option>
              <option value="partnership" className="bg-bg-deep">
                Партнерство
              </option>
              <option value="media" className="bg-bg-deep">
                Медіа
              </option>
              <option value="career" className="bg-bg-deep">
                Кар&apos;єра
              </option>
              <option value="other" className="bg-bg-deep">
                Інше
              </option>
            </select>
            {errors.topic && (
              <span className="text-xs text-red-400">{errors.topic}</span>
            )}
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
              aria-invalid={!!errors.investor_format}
              className={`bg-transparent border-b pb-3 text-text-primary focus:outline-none focus:border-accent rounded-none ${
                errors.investor_format ? 'border-red-500' : 'border-bg-surface'
              }`}
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
            {errors.investor_format && (
              <span className="text-xs text-red-400">{errors.investor_format}</span>
            )}
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
              aria-invalid={!!errors.org_type}
              className={`bg-transparent border-b pb-3 text-text-primary focus:outline-none focus:border-accent rounded-none ${
                errors.org_type ? 'border-red-500' : 'border-bg-surface'
              }`}
            >
              <option value="" className="bg-bg-deep">
                Оберіть тип
              </option>
              <option value="bank" className="bg-bg-deep">
                Банк
              </option>
              <option value="contractor" className="bg-bg-deep">
                Підрядник
              </option>
              <option value="supplier" className="bg-bg-deep">
                Постачальник
              </option>
              <option value="legal" className="bg-bg-deep">
                Юр.фірма
              </option>
              <option value="other" className="bg-bg-deep">
                Інше
              </option>
            </select>
            {errors.org_type && (
              <span className="text-xs text-red-400">{errors.org_type}</span>
            )}
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
              aria-invalid={!!errors.goal}
              placeholder="Коротко — що саме потрібно"
              className={`bg-transparent border-b pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none ${
                errors.goal ? 'border-red-500' : 'border-bg-surface'
              }`}
            />
            {errors.goal && (
              <span className="text-xs text-red-400">{errors.goal}</span>
            )}
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
              aria-invalid={!!errors.message}
              placeholder="Опишіть запит"
              className={`bg-transparent border-b pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none resize-none ${
                errors.message ? 'border-red-500' : 'border-bg-surface'
              }`}
            />
            {errors.message && (
              <span className="text-xs text-red-400">{errors.message}</span>
            )}
          </label>
        )}

        {/* Consent checkbox — visible, unchecked by default, required (GDPR) */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="consent"
            required
            aria-required="true"
            aria-invalid={!!errors.consent}
            className="mt-1 w-4 h-4 accent-accent flex-none cursor-pointer"
          />
          <span className="text-xs text-text-secondary/80 leading-relaxed">
            Я погоджуюсь на обробку моїх персональних даних відповідно до законодавства
            України.{' '}
            <span className="text-accent" aria-hidden="true">
              *
            </span>
          </span>
        </label>
        {errors.consent && (
          <span className="text-xs text-red-400 -mt-3">{errors.consent}</span>
        )}

        {/* Cloudflare Turnstile widget — Managed mode (default).
            In Managed mode Cloudflare silently completes the challenge for
            browsers it already trusts (good bot signals, prior cookies, etc.)
            and fires onSuccess within ~100 ms of widget mount. This means the
            submit button may appear enabled on first paint for most real users
            — this is expected and correct behaviour, not a bug. The button
            starts disabled (turnstileToken initialises as null) and becomes
            enabled only after Cloudflare issues a token. */}
        <div className="flex flex-col gap-2">
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={setTurnstileToken}
            onError={() => setTurnstileToken(null)}
            onExpire={() => setTurnstileToken(null)}
            options={{ theme: 'dark', size: 'normal', language: 'uk' }}
          />
          {errors.turnstileToken && (
            <span className="text-xs text-red-400">{errors.turnstileToken}</span>
          )}
        </div>

        {/* Form-level error display */}
        {state.kind === 'error' && (
          <div className="text-sm text-red-400 leading-relaxed" role="alert">
            {state.message}
          </div>
        )}

        <div className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="self-start"
            disabled={isBusy || isRateLimited || !turnstileToken}
            aria-disabled={isBusy || isRateLimited || !turnstileToken}
          >
            {isBusy
              ? 'Надсилаю...'
              : isRateLimited
                ? `Спробуйте через ${secondsLeft}s`
                : submitLabel}
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
