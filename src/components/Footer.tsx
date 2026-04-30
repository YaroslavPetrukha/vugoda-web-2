import { Link } from 'react-router-dom';
import Logo from './Logo';

const navColumns = [
  {
    title: 'Сайт',
    items: [
      { label: 'Підхід', to: '/pidkhid' },
      { label: 'Портфель', to: '/portfolio' },
      { label: 'Новини', to: '/novyny' },
    ],
  },
  {
    title: 'Співпраця',
    items: [
      { label: 'Інвесторам', to: '/investoram' },
      { label: 'Партнерам і банкам', to: '/partneram' },
      { label: 'Контакти', to: '/kontakty' },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-bg-deep border-t border-bg-surface text-text-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Logo size={40} />
            <p className="text-text-secondary text-sm mt-5 max-w-xs leading-relaxed">
              Системний девелопмент у Львові.
            </p>
          </div>

          {navColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-text-primary text-xs uppercase tracking-widest font-bold mb-5">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3 text-sm">
                {col.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="hover:text-accent transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-text-primary text-xs uppercase tracking-widest font-bold mb-5">
              Контакт
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a
                  href="mailto:vygoda.sales@gmail.com"
                  className="hover:text-accent transition-colors"
                >
                  vygoda.sales@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://yaroslavpetrukha.github.io/Lakeview/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  Сайт ЖК Lakeview ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/lakeviewlviv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  @lakeviewlviv
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-bg-surface pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-text-secondary">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span>© 2026 ТОВ «БК ВИГОДА ГРУП»</span>
            <span aria-hidden="true">·</span>
            <span>ЄДРПОУ 42016395</span>
            <span aria-hidden="true">·</span>
            <span>Ліцензія від 27.12.2019</span>
          </div>
          <div className="text-text-secondary/80 max-w-md leading-relaxed">
            Інформація про обʼєкти має ознайомлювальний характер. Точні параметри,
            ціни і умови — у договорі та на сайті відповідного ЖК.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
