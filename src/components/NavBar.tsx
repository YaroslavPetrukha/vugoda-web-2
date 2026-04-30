import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import Button from './Button';

const navLinks = [
  { to: '/portfolio', label: 'Проєкти' },
  { to: '/pidkhid', label: 'Як ми будуємо' },
  { to: '/investoram', label: 'Інвесторам' },
  { to: '/partneram', label: 'Партнерам' },
  { to: '/novyny', label: 'Новини' },
  { to: '/kontakty', label: 'Контакт' },
];

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Esc closes the menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-bg-deep border-b border-bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
        <Link
          to="/"
          onClick={close}
          aria-label="Вигода — на головну"
          className="flex items-center"
        >
          <Logo />
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-text-secondary">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `hover:text-accent transition-colors ${
                  isActive
                    ? 'text-text-primary border-b border-accent pb-1'
                    : ''
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Button as="router" href="/kontakty" variant="primary" size="sm">
            Заявка
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden text-text-primary p-2 -mr-2"
          aria-label={open ? 'Закрити меню' : 'Відкрити меню'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Головне меню"
          className="lg:hidden fixed inset-0 top-20 z-40 bg-bg-deep flex flex-col"
        >
          <div className="flex flex-col p-6 gap-1 overflow-y-auto">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={close}
                className={({ isActive }) =>
                  `text-text-primary text-2xl md:text-3xl font-bold py-4 border-b border-bg-surface transition-colors ${
                    isActive ? 'text-accent' : 'hover:text-accent'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Button
              as="router"
              href="/kontakty"
              variant="primary"
              size="lg"
              className="mt-8 w-full"
            >
              Заявка
            </Button>
            <div className="mt-8 text-xs text-text-secondary/80 leading-relaxed">
              <div>vygoda.sales@gmail.com</div>
              <div className="mt-1">ТОВ «БК ВИГОДА ГРУП» · ЄДРПОУ 42016395</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
