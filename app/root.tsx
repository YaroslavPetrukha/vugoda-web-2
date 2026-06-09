import { useEffect, type ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { MotionConfig } from 'motion/react';
import { siteUrl } from '../src/lib/site-url';
import Splash from '../src/components/Splash';
import '../src/index.css';

// Inline критичний CSS — темний фон на <html> до завантаження stylesheet
// (anti-white-flash перед тим, як намалюється dark preloader overlay).
const SPLASH_BG_CSS = 'html{background-color:#020A0A}';

// Sync pre-paint скрипт: «раз на сесію». Читає прапорець синхронно ДО paint;
// якщо вже бачили цієї сесії — додає клас vg-seen (CSS пропустить build-анімацію
// й швидко згасить overlay). Інакше ставить прапорець для наступних load-ів.
// try/catch — sessionStorage може кидати у private mode → graceful (грає щоразу).
const SPLASH_SEEN_SCRIPT =
  "try{if(sessionStorage.getItem('vg_splash')){document.documentElement.className+=' vg-seen'}else{sessionStorage.setItem('vg_splash','1')}}catch(e){}";

export const links = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'icon', type: 'image/svg+xml', sizes: '32x32', href: '/favicon-32.svg' },
];

export function Layout({ children }: { children: ReactNode }) {
  const organizationLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'RealEstateAgent'],
        '@id': siteUrl('/#organization'),
        name: 'ВИГОДА',
        alternateName: ['Vyhoda', 'ПП «ДІК "Вигода +"»', 'ДІК Вигода+', 'Вигода Плюс'],
        legalName: 'ПП «ДІК "Вигода +"»',
        taxID: '44876801',
        url: siteUrl('/'),
        logo: {
          '@type': 'ImageObject',
          '@id': siteUrl('/#logo'),
          url: siteUrl('/logo-primary.svg'),
          contentUrl: siteUrl('/logo-primary.svg'),
          caption: 'ВИГОДА',
        },
        image: { '@id': siteUrl('/#logo') },
        description:
          'Системний девелопмент у Львові. Активний обʼєкт — ЖК Lakeview, бізнес-клас, здача 2027.',
        slogan: 'Системний девелопмент, у якому цінність є результатом точних рішень.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'вул. Володимира Великого, 4, 4-й поверх, каб. 406',
          addressLocality: 'Львів',
          addressRegion: 'Львівська область',
          postalCode: '79004',
          addressCountry: 'UA',
        },
        areaServed: [
          { '@type': 'City', name: 'Львів' },
          { '@type': 'AdministrativeArea', name: 'Львівська область' },
        ],
        email: 'vygoda.sales@gmail.com',
        telephone: '+380979900390',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '10:00',
            closes: '18:00',
          },
        ],
        identifier: [
          { '@type': 'PropertyValue', propertyID: 'ЄДРПОУ', value: '44876801' },
        ],
        sameAs: ['https://www.instagram.com/lakeviewlviv/'],
        knowsLanguage: ['uk'],
      },
      {
        '@type': 'WebSite',
        '@id': siteUrl('/#website'),
        url: siteUrl('/'),
        name: 'ВИГОДА — системний девелопмент',
        inLanguage: 'uk-UA',
        publisher: { '@id': siteUrl('/#organization') },
      },
    ],
  });

  return (
    <html lang="uk">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2F3640" />
        <style dangerouslySetInnerHTML={{ __html: SPLASH_BG_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: SPLASH_SEEN_SCRIPT }} />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationLd }}
        />
      </head>
      <body>
        <Splash />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // Failsafe: гарантовано прибрати preloader, якщо CSS-вихід чомусь не спрацював
  // (наприклад, анімації вимкнено на рівні ОС). CSS вже ховає overlay ~1.65s;
  // цей таймер — запасний на 3s, щоб сплеш ніколи не «застрягав».
  useEffect(() => {
    const el = document.getElementById('vg-splash');
    if (!el) return;
    const t = window.setTimeout(() => {
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
    }, 3000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Outlet />
    </MotionConfig>
  );
}
