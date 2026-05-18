import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('../src/components/Layout.tsx', [
    index('routes/_index.tsx'),
    route('pidkhid', 'routes/pidkhid.tsx'),
    route('portfolio', 'routes/portfolio._index.tsx'),
    route('portfolio/lakeview', 'routes/portfolio.lakeview.tsx'),
    route('portfolio/etno-dim', 'routes/portfolio.etno-dim.tsx'),
    route('portfolio/maetok', 'routes/portfolio.maetok.tsx'),
    route('portfolio/nterest', 'routes/portfolio.nterest.tsx'),
    route('portfolio/pipeline-04', 'routes/portfolio.pipeline-04.tsx'),
    route('investoram', 'routes/investoram.tsx'),
    route('partneram', 'routes/partneram.tsx'),
    route('kontakty', 'routes/kontakty.tsx'),
    route('novyny', 'routes/novyny.tsx'),
    route('*', 'routes/$.tsx'),
  ]),
] satisfies RouteConfig;
