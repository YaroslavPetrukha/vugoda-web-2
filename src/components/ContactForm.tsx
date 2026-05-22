import { useState, useRef, useEffect, useId } from 'react';
import type { FormEvent } from 'react';
import { IMaskInput } from 'react-imask';
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
  const [formToken, setFormToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [messageLen, setMessageLen] = useState(0);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const submitLockRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  // Stable id prefix — avoids hydration mismatch from useId on SSG
  const uid = useId();

  // Fetch time-trap token on mount — required before submission is enabled.
  // Retries up to 3 times with exponential backoff (1s, 3s, 9s) to recover
  // from transient failures (server cold-start, TIME_TRAP_SECRET propagation
  // window after deploy). After final retry fail, formTokenFailed flips true
  // and the UI shows a fallback CTA (tel + Telegram) instead of a dead form.
  const [formTokenFailed, setFormTokenFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const attempt = async (n: number): Promise<void> => {
      try {
        const r = await fetch('/api/form-token');
        const d = (await r.json()) as { ok?: boolean; token?: string } | null;
        if (cancelled) return;
        if (d?.ok && d?.token) {
          setFormToken(d.token);
          return;
        }
        throw new Error('no-token');
      } catch {
        if (cancelled) return;
        if (n >= 3) {
          setFormTokenFailed(true);
          return;
        }
        const delay = Math.pow(3, n) * 1000; // 1s, 3s, 9s
        setTimeout(() => {
          if (!cancelled) void attempt(n + 1);
        }, delay);
      }
    };
    void attempt(0);
    return () => {
      cancelled = true;
    };
  }, []);

  // Countdown timer for rate-limited state.
  // Uses setInterval bound to state.kind so it fires once per rate-limit
  // session (no drift from per-tick effect re-creation, no extra renders).
  useEffect(() => {
    if (state.kind !== 'rate_limited') return;
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.kind !== 'rate_limited') return prev;
        if (prev.secondsLeft <= 1) return { kind: 'idle' };
        return { kind: 'rate_limited', secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.kind]);

  // Per-field Zod validation (used on blur and onChange-after-error)
  const validateField = (fieldName: string, value: unknown) => {
    const fieldSchema = ContactSchema.pick({ [fieldName]: true } as Parameters<
      typeof ContactSchema.pick
    >[0]);
    const result = fieldSchema.safeParse({ [fieldName]: value });
    setErrors((prev) => {
      const next = { ...prev };
      if (result.success) {
        delete next[fieldName];
      } else {
        next[fieldName] = result.error.issues[0]?.message ?? 'Помилка';
      }
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitLockRef.current) return;
    if (state.kind === 'submitting' || state.kind === 'rate_limited') return;
    setErrors({});

    if (!turnstileToken) {
      setState({ kind: 'error', message: 'Завершіть перевірку Turnstile' });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const raw: Record<string, unknown> = { source, turnstileToken, consent: false, formToken: formToken ?? '' };
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
      // Focus first invalid field for accessibility
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    // Lock acquired only when committing to the actual network submit.
    // Validation early-returns above must NOT set the lock — otherwise the
    // form gets permanently disabled (no try/finally on those paths).
    submitLockRef.current = true;
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
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <a
            href="tel:+380969900390"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-accent text-accent text-sm uppercase tracking-widest font-medium hover:bg-accent hover:text-bg-deep transition-colors"
          >
            Зателефонувати: 0969 900 390
          </a>
          {/* TODO(client): confirm Telegram URL/username */}
          <a
            href="https://t.me/vygoda_sales"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-bg-surface text-text-secondary text-sm uppercase tracking-widest font-medium hover:border-text-primary hover:text-text-primary transition-colors"
          >
            Telegram
          </a>
        </div>
      </div>
    );
  }

  const headingId = `cf-${uid}-heading`;
  const isBusy = state.kind === 'submitting';
  const isRateLimited = state.kind === 'rate_limited';
  const secondsLeft = isRateLimited
    ? (state as { kind: 'rate_limited'; secondsLeft: number }).secondsLeft
    : 0;

  // Submit button copy — 5 states (idle, busy, rate-limited, awaiting Turnstile, awaiting time-trap)
  const submitButtonLabel = isBusy
    ? 'Надсилаю...'
    : isRateLimited
      ? `Спробуйте через ${secondsLeft}s`
      : !formToken || !turnstileToken
        ? 'Перевірка безпеки...'
        : submitLabel;
  const isSubmitDisabled = isBusy || isRateLimited || !turnstileToken || !formToken;

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
        ref={formRef}
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
              aria-describedby={errors.name ? `${uid}-name-err` : undefined}
              autoComplete="name"
              placeholder="Як до вас звертатися"
              maxLength={100}
              enterKeyHint="next"
              className={`bg-transparent border-b pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none ${
                errors.name ? 'border-red-500' : 'border-bg-surface'
              }`}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              onChange={(e) => {
                if (errors[e.target.name]) validateField(e.target.name, e.target.value);
              }}
            />
            {errors.name && (
              <span id={`${uid}-name-err`} role="alert" className="text-xs text-red-400">
                {errors.name}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary">
              Телефон{' '}
              <span className="text-accent" aria-hidden="true">
                *
              </span>
            </span>
            <IMaskInput
              mask="+{38\0} (00) 000-00-00"
              lazy={true}
              unmask={false}
              type="tel"
              name="phone"
              required
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
              autoComplete="tel"
              inputMode="tel"
              enterKeyHint="next"
              placeholder="+380 ..."
              className={`bg-transparent border-b pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none ${
                errors.phone ? 'border-red-500' : 'border-bg-surface'
              }`}
              onBlur={(e) => validateField('phone', (e.target as HTMLInputElement).value)}
              onChange={(e) => {
                if (errors.phone) validateField('phone', (e.target as HTMLInputElement).value);
              }}
            />
            {errors.phone && (
              <span id={`${uid}-phone-err`} role="alert" className="text-xs text-red-400">
                {errors.phone}
              </span>
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
              aria-describedby={errors.email ? `${uid}-email-err` : undefined}
              autoComplete="email"
              inputMode="email"
              enterKeyHint="next"
              maxLength={320}
              placeholder="you@example.com"
              className={`bg-transparent border-b pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none ${
                errors.email ? 'border-red-500' : 'border-bg-surface'
              }`}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              onChange={(e) => {
                if (errors[e.target.name]) validateField(e.target.name, e.target.value);
              }}
            />
            {errors.email && (
              <span id={`${uid}-email-err`} role="alert" className="text-xs text-red-400">
                {errors.email}
              </span>
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
              aria-describedby={errors.topic ? `${uid}-topic-err` : undefined}
              autoComplete="off"
              enterKeyHint="next"
              className={`bg-transparent border-b pb-3 text-text-primary focus:outline-none focus:border-accent rounded-none ${
                errors.topic ? 'border-red-500' : 'border-bg-surface'
              }`}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              onChange={(e) => {
                if (errors[e.target.name]) validateField(e.target.name, e.target.value);
              }}
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
              <span id={`${uid}-topic-err`} role="alert" className="text-xs text-red-400">
                {errors.topic}
              </span>
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
              aria-describedby={errors.investor_format ? `${uid}-investor-format-err` : undefined}
              autoComplete="off"
              enterKeyHint="next"
              className={`bg-transparent border-b pb-3 text-text-primary focus:outline-none focus:border-accent rounded-none ${
                errors.investor_format ? 'border-red-500' : 'border-bg-surface'
              }`}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              onChange={(e) => {
                if (errors[e.target.name]) validateField(e.target.name, e.target.value);
              }}
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
              <span
                id={`${uid}-investor-format-err`}
                role="alert"
                className="text-xs text-red-400"
              >
                {errors.investor_format}
              </span>
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
              aria-describedby={errors.org_type ? `${uid}-org-type-err` : undefined}
              autoComplete="off"
              enterKeyHint="next"
              className={`bg-transparent border-b pb-3 text-text-primary focus:outline-none focus:border-accent rounded-none ${
                errors.org_type ? 'border-red-500' : 'border-bg-surface'
              }`}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              onChange={(e) => {
                if (errors[e.target.name]) validateField(e.target.name, e.target.value);
              }}
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
              <span id={`${uid}-org-type-err`} role="alert" className="text-xs text-red-400">
                {errors.org_type}
              </span>
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
              aria-describedby={errors.goal ? `${uid}-goal-err` : undefined}
              autoComplete="off"
              enterKeyHint="next"
              maxLength={500}
              placeholder="Коротко — що саме потрібно"
              className={`bg-transparent border-b pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none ${
                errors.goal ? 'border-red-500' : 'border-bg-surface'
              }`}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              onChange={(e) => {
                if (errors[e.target.name]) validateField(e.target.name, e.target.value);
              }}
            />
            {errors.goal && (
              <span id={`${uid}-goal-err`} role="alert" className="text-xs text-red-400">
                {errors.goal}
              </span>
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
              aria-describedby={errors.message ? `${uid}-message-err` : undefined}
              enterKeyHint="done"
              maxLength={2000}
              placeholder="Опишіть запит"
              className={`bg-transparent border-b pb-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent rounded-none resize-none ${
                errors.message ? 'border-red-500' : 'border-bg-surface'
              }`}
              onChange={(e) => {
                setMessageLen(e.target.value.length);
                if (errors[e.target.name]) validateField(e.target.name, e.target.value);
              }}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
            />
            {messageLen > 1600 && (
              <span aria-live="polite" className="text-xs text-text-secondary/60 mt-1">
                {messageLen} / 2000
              </span>
            )}
            {errors.message && (
              <span id={`${uid}-message-err`} role="alert" className="text-xs text-red-400">
                {errors.message}
              </span>
            )}
          </label>
        )}

        {/* Consent checkbox — visible, unchecked by default, required (GDPR) */}
        <div className="flex flex-col gap-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="consent"
              required
              aria-required="true"
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
              enterKeyHint="done"
              className="mt-1 w-4 h-4 accent-accent flex-none cursor-pointer"
              onBlur={(e) => validateField('consent', e.target.checked)}
              onChange={(e) => {
                if (errors.consent) validateField('consent', e.target.checked);
              }}
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
            <span id={`${uid}-consent-err`} role="alert" className="text-xs text-red-400 ml-7">
              {errors.consent}
            </span>
          )}
        </div>

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
            disabled={isSubmitDisabled}
            aria-disabled={isSubmitDisabled}
          >
            {submitButtonLabel}
          </Button>
          <p className="text-xs text-text-secondary/80 max-w-xl leading-relaxed">
            {disclaimer}
          </p>
          {isRateLimited && (
            <p className="text-xs text-text-secondary/80 leading-relaxed mt-3">
              Або напишіть напряму:{' '}
              <a
                href="tel:+380969900390"
                className="text-text-primary hover:text-accent underline underline-offset-2 transition-colors"
              >
                0969 900 390
              </a>
              {' / '}
              {/* TODO(client): confirm Telegram URL/username */}
              <a
                href="https://t.me/vygoda_sales"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:text-accent underline underline-offset-2 transition-colors"
              >
                Telegram
              </a>
            </p>
          )}
          {formTokenFailed && !formToken && (
            <p className="text-xs text-red-400 leading-relaxed mt-3" role="alert">
              Не вдалось підключитись до сервера. Зателефонуйте напряму:{' '}
              <a
                href="tel:+380969900390"
                className="text-text-primary hover:text-accent underline underline-offset-2 transition-colors"
              >
                0969 900 390
              </a>
              {' / '}
              {/* TODO(client): confirm Telegram URL/username */}
              <a
                href="https://t.me/vygoda_sales"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:text-accent underline underline-offset-2 transition-colors"
              >
                Telegram
              </a>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
