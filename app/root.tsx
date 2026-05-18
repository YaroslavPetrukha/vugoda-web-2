import type { ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { MotionConfig } from 'motion/react';
import '../src/index.css';

const ORGANIZATION_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'RealEstateAgent'],
      '@id': 'https://vyhoda.lviv.ua/#organization',
      name: 'ВИГОДА',
      alternateName: 'ПП «ДІК "Вигода +"»',
      legalName: 'ПП «ДІК "Вигода +"»',
      taxID: '44876801',
      foundingDate: '2019',
      url: 'https://vyhoda.lviv.ua',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://vyhoda.lviv.ua/#logo',
        url: 'https://vyhoda.lviv.ua/logo-primary.svg',
        contentUrl: 'https://vyhoda.lviv.ua/logo-primary.svg',
        caption: 'ВИГОДА',
      },
      image: { '@id': 'https://vyhoda.lviv.ua/#logo' },
      description:
        'Системний девелопмент у Львові. Забудовник і генеральний підрядник. Активний обʼєкт — ЖК Lakeview, бізнес-клас, здача 2027.',
      slogan: 'Системний девелопмент, у якому цінність є результатом точних рішень.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Львів',
        addressRegion: 'Львівська область',
        addressCountry: 'UA',
      },
      areaServed: [
        { '@type': 'City', name: 'Львів' },
        { '@type': 'AdministrativeArea', name: 'Львівська область' },
      ],
      email: 'vygoda.sales@gmail.com',
      telephone: '+380969900390',
      identifier: [
        { '@type': 'PropertyValue', propertyID: 'ЄДРПОУ', value: '44876801' },
        {
          '@type': 'PropertyValue',
          propertyID: 'Ліцензія на будівництво',
          value: 'Видана 27.12.2019, безстрокова',
        },
      ],
      sameAs: ['https://www.instagram.com/lakeviewlviv/'],
      knowsLanguage: ['uk'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://vyhoda.lviv.ua/#website',
      url: 'https://vyhoda.lviv.ua',
      name: 'ВИГОДА — системний девелопмент',
      inLanguage: 'uk-UA',
      publisher: { '@id': 'https://vyhoda.lviv.ua/#organization' },
    },
  ],
});

export const links = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'icon', type: 'image/svg+xml', sizes: '32x32', href: '/favicon-32.svg' },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2F3640" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ORGANIZATION_LD }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Outlet />
    </MotionConfig>
  );
}
