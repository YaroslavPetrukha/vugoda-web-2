import type { ReactNode, Key } from 'react';
import { motion } from 'motion/react';

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  key?: Key | null;
};

const FadeIn = ({ children, delay = 0, className = '' }: FadeInProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.4, ease: 'linear', delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export default FadeIn;
