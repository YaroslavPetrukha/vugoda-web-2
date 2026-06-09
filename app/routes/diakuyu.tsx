import { useRef, useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { useSearchParams, Link } from 'react-router';
import { siteUrl } from '../../src/lib/site-url';
import { FORM_SOURCES } from '../../shared/contact-schema';

export const meta: MetaFunction = ({ location }) => {
  const url = siteUrl(location.pathname);
  return [
    { title: 'Заявку прийнято — ВИГОДА' },
    { name: 'robots', content: 'noindex,nofollow' },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
};

// UUID prefix: 8–36 hex chars with optional dashes (e.g. first 8 chars of UUID v4).
// Prevents echoing arbitrary user-controlled strings into the DOM.
const UUID_PREFIX_RE = /^[0-9a-f-]{8,36}$/i;

// Contextual related link based on validated source.
const RELATED_LINKS: Record<string, { label: string; href: string }> = {
  'project-lakeview': { label: 'Подивитись Lakeview', href: '/portfolio/lakeview' },
  investors:          { label: 'Наш підхід', href: '/pidkhid' },
};
const DEFAULT_RELATED = { label: 'Наш підхід', href: '/pidkhid' };

const ThankYou = () => {
  const [searchParams] = useSearchParams();

  // Validate source against FORM_SOURCES enum — never echo raw param.
  const rawSource = searchParams.get('source') ?? '';
  const validSource = (FORM_SOURCES as readonly string[]).includes(rawSource)
    ? rawSource
    : null;

  // Validate id as UUID prefix — only show block when valid.
  const rawId = searchParams.get('id') ?? '';
  const validId = UUID_PREFIX_RE.test(rawId) ? rawId : null;
  const requestIdDisplay = validId ? validId.slice(0, 8) : null;

  // Contextual related link.
  const related =
    validSource !== null
      ? (RELATED_LINKS[validSource] ?? DEFAULT_RELATED)
      : DEFAULT_RELATED;

  // Analytics placeholder — StrictMode dedupe via useRef flag.
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    if (typeof window === 'undefined') return;
    // Placeholder for future GA4 / Meta Pixel injection.
    // When tracking is enabled, this is the canonical conversion event point.
    // window.gtag?.('event', 'generate_lead', { source: validSource, lead_id: validId });
    // window.fbq?.('track', 'Lead', { content_name: validSource ?? 'direct' });
  }, []);

  return (
    <main className="min-h-[70vh] bg-bg-deep px-6 lg:px-8 py-24 md:py-36 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">

        {/* Accent marker */}
        <div className="w-10 h-px bg-accent mb-10" aria-hidden="true" />

        {/* Primary heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight mb-6">
          Заявку прийнято
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-12 max-w-md">
          Менеджер зателефонує сьогодні до кінця робочого дня.
        </p>

        {/* Primary fallback CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <a
            href="tel:+380979900390"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-accent text-accent text-sm uppercase tracking-widest font-medium hover:bg-accent hover:text-bg-deep transition-colors"
          >
            Зателефонувати: 097&nbsp;990&nbsp;03&nbsp;90
          </a>
          {/* TODO(client): confirm Telegram URL/username */}
          <a
            href="https://t.me/vygoda_sales"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-border text-text-secondary text-sm uppercase tracking-widest font-medium hover:border-text-primary hover:text-text-primary transition-colors"
          >
            Telegram
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-10" />

        {/* Contextual related content link */}
        <div className="mb-10">
          <span className="block text-[11px] uppercase tracking-widest text-accent mb-3">
            Поки чекаєте
          </span>
          <Link
            to={related.href}
            className="text-text-primary hover:text-accent transition-colors underline underline-offset-4 decoration-bg-surface hover:decoration-accent text-base"
          >
            {related.label}
          </Link>
        </div>

        {/* Request ID — only when valid UUID prefix is present */}
        {requestIdDisplay && (
          <p className="text-xs text-text-secondary mt-4 font-mono">
            Заявка №&nbsp;{requestIdDisplay}
          </p>
        )}

      </div>
    </main>
  );
};

export default ThankYou;
