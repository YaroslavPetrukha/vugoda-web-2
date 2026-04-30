import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans flex flex-col">
      {/* Decorative vertical lines */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-[10%] top-0 bottom-0 w-px bg-accent opacity-[0.07]" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent opacity-[0.07] hidden md:block" />
        <div className="absolute right-[10%] top-0 bottom-0 w-px bg-accent opacity-[0.07]" />
      </div>

      <NavBar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
