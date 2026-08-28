import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { Media } from '../components/Media';
import { Reveal } from '../components/Reveal';
import { SectionHead } from '../components/ui';
import { useStage } from '../state/stage';
import { useLocale } from '../state/locale';

/**
 * A held close-up of the chamber, scrubbed by native page scroll.
 *
 * The browser owns scrolling. This section only maps how far the visitor has
 * travelled through the track onto the machine and the copy. A tall track
 * plus plateau mapping means a normal swipe almost always sees every stage;
 * a violent flick is allowed to leave.
 *
 * Visual progress eases toward scroll with a hard cap (~500 ms for a full-range
 * jump) so a flick walks through Load → Disinfection → Aroma → Dry instead of
 * teleporting, without ever spending seconds catching up. The rAF catch-up
 * loop only runs while the track is on screen and visual is behind scroll;
 * off-screen Cycle work is zero.
 */

/** Long holds, short blends. Values are scroll 0–1. Tune by eye, not as sacred. */
const STORY_SPANS = [
  [0.0, 0.18, 0.0, 0.18],
  [0.18, 0.25, 0.18, 0.28],
  [0.25, 0.43, 0.28, 0.48],
  [0.43, 0.5, 0.48, 0.52],
  [0.5, 0.68, 0.52, 0.7],
  [0.68, 0.75, 0.7, 0.78],
  [0.75, 0.95, 0.78, 0.96],
  [0.95, 1.0, 0.96, 1.0],
] as const;

const PLATEAU_SCROLL = [0.09, 0.34, 0.59, 0.85];
const CATCH_UP_MS = 500;

function storyFromScroll(scroll: number) {
  const s = Math.min(1, Math.max(0, scroll));
  for (const [s0, s1, t0, t1] of STORY_SPANS) {
    if (s <= s1) {
      const u = s1 === s0 ? 1 : (s - s0) / (s1 - s0);
      return t0 + u * (t1 - t0);
    }
  }
  return 1;
}

function copyIndex(story: number) {
  if (story < 0.25) return 0;
  if (story < 0.5) return 1;
  if (story < 0.75) return 2;
  return 3;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function readRaw(node: HTMLDivElement | null) {
  if (!node) return 0;
  const scrollable = Math.max(1, node.offsetHeight - window.innerHeight);
  const top = node.getBoundingClientRect().top + window.scrollY;
  return clamp01((window.scrollY - top) / scrollable);
}

export function Cycle() {
  const { copy } = useLocale();
  const phases = copy.cycle.phases;
  const track = useRef<HTMLDivElement>(null);
  const { claimAct, cycleProgress } = useStage();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const phaseMotion = useMotionValue(0);
  const driveProgress = useMotionValue(0);
  const visualScroll = useRef(0);

  useEffect(() => {
    let raf = 0;
    let scheduled = 0;
    let last = performance.now();
    let inView = false;
    const maxRate = 1 / (CATCH_UP_MS / 1000);

    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const publish = (visual: number) => {
      visualScroll.current = visual;
      const story = storyFromScroll(visual);
      driveProgress.set(story);
      cycleProgress.current = story;
      const next = copyIndex(story);
      if (next === phaseRef.current) return;
      phaseRef.current = next;
      phaseMotion.set(next);
      setPhase(next);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      const raw = readRaw(track.current);
      if (!inView) {
        publish(raw);
        stop();
        return;
      }
      const err = raw - visualScroll.current;
      const step = maxRate * dt;
      if (Math.abs(err) <= Math.max(step, 0.008)) {
        publish(raw);
        stop();
        return;
      }
      publish(visualScroll.current + Math.sign(err) * step);
      raf = requestAnimationFrame(tick);
    };

    const onProgress = () => {
      const raw = readRaw(track.current);
      if (!inView || reduced) {
        publish(raw);
        stop();
        return;
      }
      if (Math.abs(raw - visualScroll.current) <= 0.008) {
        publish(raw);
        stop();
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = requestAnimationFrame(() => {
        scheduled = 0;
        onProgress();
      });
    };

    const listen = () => {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('scrollend', onProgress, { passive: true });
    };

    const unlisten = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', onProgress);
      if (scheduled) {
        cancelAnimationFrame(scheduled);
        scheduled = 0;
      }
    };

    const el = track.current;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        inView = visible;
        claimAct('cycle', visible);
        unlisten();
        if (visible) {
          listen();
          onProgress();
        } else {
          publish(readRaw(track.current));
          stop();
        }
      },
      { threshold: 0, rootMargin: '0px' },
    );
    if (el) io.observe(el);

    return () => {
      stop();
      unlisten();
      io.disconnect();
      claimAct('cycle', false);
    };
  }, [claimAct, cycleProgress, driveProgress, phaseMotion, reduced]);

  const goToPhase = (i: number) => {
    const el = track.current;
    if (!el) return;
    const scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
    const trackTop = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, trackTop + scrollable * PLATEAU_SCROLL[i]);
  };

  const active = phases[phase];

  return (
    <section id="cycle" className="relative" style={{ overflowAnchor: 'none' }}>
      <div className="relative z-30 bg-ink-950 pb-16 pt-20 md:pb-24 md:pt-24">
        <div className="measure">
          <SectionHead title={copy.cycle.heading} lead={copy.cycle.lead} rule={false} />
        </div>
      </div>

      <div ref={track} className="relative z-30 h-[520svh] md:h-[420svh]">
        <div className="sticky top-20 h-[calc(100svh-5rem)] overflow-hidden">
          {/* A shallow floor fade grounds the cabinet without obscuring the helmet. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[24%] bg-gradient-to-t from-ink-950 from-25% via-ink-950/65 to-transparent md:h-[18%]"
            aria-hidden="true"
          />

          <div className="measure relative grid h-full md:grid-12">
            <div className="relative z-20 col-span-12 flex flex-col justify-end md:col-span-5 md:col-start-8 md:h-full md:justify-center md:bg-ink-950 md:pl-10">
              {/*
                Solid ground behind the copy, stretched to the viewport's right
                edge so the type never sits on the yellow cabinet.
              */}
              <div
                className="pointer-events-none absolute inset-y-0 -left-8 hidden bg-ink-950 md:block"
                style={{ right: 'calc(-1 * var(--gutter))', boxShadow: '-2.5rem 0 2.5rem #031215, 100vw 0 0 0 #031215' }}
                aria-hidden="true"
              />
              <div className="relative isolate border-t bg-ink-950 pb-12 pt-8 before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-ink-950 md:border-0 md:bg-transparent md:pb-0 md:pt-0 md:before:hidden">
                  <ol className="mb-8 flex gap-2" aria-label={copy.a11y.cycleStages}>
                    {phases.map((p, i) => (
                      <PhaseMeter
                        key={p.key}
                        index={i}
                        label={p.label}
                        count={phases.length}
                        phase={phaseMotion}
                        progress={driveProgress}
                        current={i === phase}
                        onJump={() => goToPhase(i)}
                      />
                    ))}
                  </ol>

                  <div className="relative min-h-[13rem] sm:min-h-[16rem] md:min-h-[19rem]">
                    {phases.map((p, i) => (
                      <motion.div
                        key={p.key}
                        className="absolute inset-0"
                        initial={false}
                        animate={{ opacity: i === phase ? 1 : 0, y: reduced ? 0 : i === phase ? 0 : 14 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{ pointerEvents: i === phase ? 'auto' : 'none' }}
                        aria-hidden={i !== phase}
                      >
                        <h3 className="type-h3 font-display">{p.title}</h3>
                        <p className="mt-5 max-w-[44ch] text-lead text-fg-muted">{p.body}</p>
                      </motion.div>
                    ))}
                  </div>

                  <p className="sr-only" aria-live="polite">
                    {copy.a11y.stage} {phase + 1} {copy.a11y.of} {phases.length}: {active.label}. {active.title}
                  </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-30 bg-ink-950 pt-4 md:pt-8">
        <div className="measure grid gap-y-10 pb-16 md:grid-12 md:items-center md:pb-24">
          <Reveal className="md:col-span-5">
            <Media
              name="panel"
              alt={copy.cycle.panelAlt}
              sizes="(max-width: 768px) 88vw, 34vw"
              className="border"
            />
          </Reveal>
          <Reveal step={1} className="md:col-span-6 md:col-start-7">
            <p className="max-w-[46ch] text-lead text-fg-muted">{copy.cycle.panelCaption}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PhaseMeter({
  index,
  label,
  count,
  phase,
  progress,
  current,
  onJump,
}: {
  index: number;
  label: string;
  count: number;
  phase: MotionValue<number>;
  progress: MotionValue<number>;
  current: boolean;
  onJump: () => void;
}) {
  const fill = useTransform([progress, phase], (values) => {
    const v = values[0] as number;
    const shown = values[1] as number;
    if (index < shown) return 1;
    if (index > shown) return 0;
    return Math.min(1, Math.max(0, v * count - index));
  });

  return (
    <li className="flex-1">
      <button onClick={onJump} aria-current={current ? 'step' : undefined} className="group block w-full text-left">
        <span className="block h-[3px] w-full overflow-hidden bg-ink-700">
          <motion.span className="block h-full origin-left bg-teal-300" style={{ scaleX: fill }} />
        </span>
        <span
          className={`type-data mt-3 block transition-colors duration-300 ${
            current ? 'text-fg' : 'text-fg-dim group-hover:text-fg-muted'
          }`}
        >
          {label}
        </span>
      </button>
    </li>
  );
}
