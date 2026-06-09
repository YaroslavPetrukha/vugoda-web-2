import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Manual "back to top" affordance for long pages. Client-only: prerendered HTML
// ships with the button hidden (visible=false) → no CLS (fixed, off-flow) and no
// hidden tab-stop. Complements Layout's route-change scrollTo(0,0); this is the
// within-page manual control.
//
// Brand: square (brandbook excludes circular forms — rounded-sm, not a round FAB),
// quiet dark chrome that lights up lime on hover/focus (accent is reserved for
// conversion CTAs, so the utility button doesn't compete with «Заявка»).
// z-30: above <main> (z-10), below the mobile menu (z-40) so it never covers it.

// Show once the user has scrolled roughly one viewport down.
const SHOW_THRESHOLD_PX = 600;

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const update = () => {
      ticking = false;
      setVisible(window.scrollY > SHOW_THRESHOLD_PX);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      // rAF-throttle: at most one state read per frame, avoids scroll jank.
      window.requestAnimationFrame(update);
    };

    update(); // sync initial state (e.g. reload mid-page / restored scroll)
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    // JS smooth-scroll bypasses CSS scroll-behavior, so honour reduced-motion here.
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Прокрутити вгору"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-30 grid h-12 w-12 place-items-center rounded-sm border border-border bg-bg-deep/90 text-text-primary shadow-md backdrop-blur-sm transition-[opacity,transform,color,border-color] duration-200 hover:border-accent hover:text-accent ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};

export default ScrollToTop;
