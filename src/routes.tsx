import type { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Approach from './pages/Approach';
import Portfolio from './pages/Portfolio';
import ProjectLakeview from './pages/ProjectLakeview';
import ProjectEtnoDim from './pages/ProjectEtnoDim';
import ProjectMaetok from './pages/ProjectMaetok';
import ProjectNterest from './pages/ProjectNterest';
import ProjectPipeline04 from './pages/ProjectPipeline04';
import Investors from './pages/Investors';
import Partners from './pages/Partners';
import Contacts from './pages/Contacts';
import News from './pages/News';
import NotFound from './pages/NotFound';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'pidkhid', element: <Approach /> },
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'portfolio/lakeview', element: <ProjectLakeview /> },
      { path: 'portfolio/etno-dim', element: <ProjectEtnoDim /> },
      { path: 'portfolio/maetok', element: <ProjectMaetok /> },
      { path: 'portfolio/nterest', element: <ProjectNterest /> },
      { path: 'portfolio/pipeline-04', element: <ProjectPipeline04 /> },
      { path: 'investoram', element: <Investors /> },
      { path: 'partneram', element: <Partners /> },
      { path: 'kontakty', element: <Contacts /> },
      { path: 'novyny', element: <News /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
