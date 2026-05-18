import type { ReactNode, Key } from 'react';
import { motion } from 'motion/react';

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  key?: Key | null;
};

// initial={false} — не застосовує початковий стан під час першого рендеру (SSR-safe).
// Контент видимий одразу; анімація запускається лише коли елемент входить у viewport.
const FadeIn = ({ children, delay = 0, className = '' }: FadeInProps) => (
  <motion.div
    initial={false}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default FadeIn;
