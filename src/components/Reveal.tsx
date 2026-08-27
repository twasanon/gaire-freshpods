import { motion, useReducedMotion } from 'motion/react';
import { createElement, type ReactNode } from 'react';

type Tag = 'div' | 'li' | 'dl' | 'ul' | 'figure' | 'section';

type Props = {
  children: ReactNode;
  /** Index within a group, used to stagger a set of siblings. */
  step?: number;
  as?: Tag;
  className?: string;
};

/**
 * The site's single entrance animation: a short rise into place, fired once when
 * a block first enters view. Staggering siblings via `step` is the only
 * variation — there is no per-element choreography, on purpose.
 */
export function Reveal({ children, step = 0, as = 'div', className }: Props) {
  const reduced = useReducedMotion();

  if (reduced) return createElement(as, { className }, children);

  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: step * 0.08 }}
    >
      {children}
    </Component>
  );
}
