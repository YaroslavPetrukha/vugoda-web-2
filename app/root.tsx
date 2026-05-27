import type { ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { MotionConfig } from 'motion/react';
import { siteUrl } from '../src/lib/site-url';
import '../src/index.css';

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
        foundingDate: '2019',
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
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationLd }}
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
