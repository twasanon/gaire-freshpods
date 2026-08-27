import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ActionLink, FinishPicker } from '../components/ui';
import { useViewport } from '../lib/viewport';
import { isStacked } from '../three/framing';
import { useStage } from '../state/stage';
import { useLocale } from '../state/locale';

/**
 * First screen is the machine. Type sits behind it. Controls sit on the floor
 * of the frame. The pitch — what the machine is, and what to do next — waits
 * in the band below, so the cabinet does not have to share pixels with a
 * paragraph.
 *
 * On a phone the same three parts stack: wordmark, cabinet, then the pitch on
 * its own opaque ground. The cabinet still gets the first screen to itself.
 */
export function Hero() {
  const { copy } = useLocale();
  const { colorway, setColorway, claimAct } = useStage();
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const viewport = useViewport();
  const stacked = isStacked(viewport.width, viewport.height);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => claimAct('hero', entries[0].isIntersecting), {
      threshold: 0,
      rootMargin: '-8% 0px -8% 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, [claimAct]);

  const rise = reduced ? {} : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 } };
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section ref={section} id="top" className="relative" style={{ overflowAnchor: 'none' }}>
      <div
        className={`pointer-events-none relative flex flex-col ${stacked ? 'h-svh' : 'min-h-svh'}`}
      >
        {/*
          Behind the canvas. The outlined second line is meant to run through
          the cabinet; the solid first line sits above it so the name of the
          product is never unreadable.
        */}
        <div
          className={`relative z-5 flex flex-1 flex-col ${
            stacked ? 'justify-start pt-24' : 'pointer-events-none justify-start pt-[clamp(7rem,15vh,9.5rem)]'
          }`}
        >
          <div className="measure">
            <motion.h1
              className="type-monument text-fg md:text-[clamp(4rem,7.2vw,8.5rem)]"
              {...rise}
              transition={{ duration: 1.15, ease, delay: 0.08 }}
            >
              {copy.hero.line1}
            </motion.h1>
            <motion.p
              className="type-monument type-hollow mt-[0.02em] md:text-[clamp(4rem,7.2vw,8.5rem)]"
              aria-hidden="true"
              {...rise}
              transition={{ duration: 1.15, ease, delay: 0.18 }}
            >
              {copy.hero.line2}
            </motion.p>
            <span className="sr-only">{copy.hero.line2}</span>
          </div>
        </div>

        <motion.div
          className="pointer-events-auto absolute right-[var(--gutter)] top-[52%] z-30 -translate-y-1/2 md:right-[max(var(--gutter),6vw)]"
          {...rise}
          transition={{ duration: 0.9, ease, delay: 0.42 }}
        >
          <FinishPicker value={colorway} onChange={setColorway} size="lg" direction="vertical" />
        </motion.div>
      </div>

      <div className="pointer-events-auto relative z-30 bg-ink-950">
        <div className="measure grid gap-y-8 border-t py-10 md:grid-12 md:items-end md:py-12">
          <motion.p
            className="max-w-[44ch] text-lead text-fg-muted md:col-span-6"
            {...rise}
            transition={{ duration: 0.9, ease, delay: 0.28 }}
          >
            {copy.hero.lead}
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center gap-3 md:col-span-5 md:col-start-8 md:justify-self-end"
            {...rise}
            transition={{ duration: 0.9, ease, delay: 0.38 }}
          >
            <ActionLink href="#demo">{copy.actions.bookDemo}</ActionLink>
            <ActionLink href="#cycle" variant="outline">
              {copy.actions.watchCycle}
            </ActionLink>
          </motion.div>
        </div>

        <motion.dl
          className="measure grid grid-cols-2 border-t sm:grid-cols-4"
          {...rise}
          transition={{ duration: 0.9, ease, delay: 0.48 }}
        >
          {copy.hero.quickFacts.map((fact, i) => (
            <div
              key={fact.label}
              className={`flex flex-col py-6 md:py-7 ${i % 2 === 1 ? 'border-l pl-5 sm:pl-7' : ''} ${
                i > 0 ? 'sm:border-l sm:pl-7' : ''
              }`}
            >
              <dt className="type-data text-fg-dim">{fact.label}</dt>
              <dd className="type-data mt-auto pt-2 text-[1.3125rem] font-bold text-fg">{fact.value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
