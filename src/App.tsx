import { HashRouter, useRoutes } from 'react-router-dom';
import { routes } from './routes';

const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

const App = () => (
  <HashRouter>
    <AppRoutes />
  </HashRouter>
);

export default App;
