import { useEffect, useRef, useState } from 'react';
import type { ReactNode, Key } from 'react';

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  key?: Key | null;
};

// CSS-driven fade-in via IntersectionObserver. API-compatible with the previous
// motion/react-based component: same {children, delay (seconds), className} props.
// Saves the framer-motion runtime cost for every FadeIn instance.
// Styles live in src/index.css (.fade-in / .fade-in--visible / reduced-motion).
const FadeIn = ({ children, delay = 0, className = '' }: FadeInProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '0px 0px -80px 0px' },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-in${visible ? ' fade-in--visible' : ''}${className ? ' ' + className : ''}`}
      style={delay > 0 ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
};

export default FadeIn;
