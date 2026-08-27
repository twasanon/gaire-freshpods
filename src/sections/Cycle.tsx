import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Media } from '../components/Media';
import { Reveal } from '../components/Reveal';
import { SectionHead } from '../components/ui';
import { useStage } from '../state/stage';
import { useLocale } from '../state/locale';

/**
 * A held close-up of the chamber, scrubbed by scroll.
 *
 * The machine does not turn here — idle yaw from the hero is snapped away so
 * the cabinet cannot unwind a minute of spinning. Lights, fog and the LCD
 * are the only motion. Copy sits on its own ground so it never collides with
 * the window, and a fade at the bottom of the frame crops the cabinet body.
 */
export function Cycle() {
  const { copy } = useLocale();
  const phases = copy.cycle.phases;
  const track = useRef<HTMLDivElement>(null);
  const { claimAct, cycleProgress } = useStage();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const desiredPhase = useRef(0);
  const phaseRef = useRef(0);
  const unlocking = useRef(false);
  const engaged = useRef(false);
  const lastTouchY = useRef<number | null>(null);
  const scrollProgress = useRef(0);
  const phaseMotion = useMotionValue(0);
  const lastUserInput = useRef(performance.now());
  const autoplay = useRef(false);
  const autoplayClock = useRef(performance.now());
  const autoplayOriginP = useRef<number | null>(null);
  const wasSticky = useRef(false);
  const gestureDir = useRef<0 | 1 | -1>(0);
  const releasedAt = useRef(0);
  const driveProgress = useMotionValue(0);

  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });

  useEffect(() => {
    phaseRef.current = phase;
    phaseMotion.set(phase);
  }, [phase, phaseMotion]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (autoplay.current) return;
    // After autoplay pauses, a lagging scroll event would rewind the playhead
    // (Aroma jumping back to empty). Honour a rewind only when the visitor is
    // actually scrolling up.
    const prev = scrollProgress.current;
    if (v < prev - 0.012 && gestureDir.current !== -1 && performance.now() - releasedAt.current < 800) {
      const raw = Math.min(phases.length - 1, Math.max(0, Math.floor(prev * phases.length + 0.12)));
      const shown = phaseRef.current;
      desiredPhase.current = Math.min(shown + 1, Math.max(shown - 1, raw));
      return;
    }
    scrollProgress.current = v;
    driveProgress.set(v);
    // Bias forward slightly so the copy changes as the visual starts to change,
    // not after it has finished. Desired is clamped to ±1 of the shown step so
    // a flick cannot queue Load → Dry.
    const raw = Math.min(phases.length - 1, Math.max(0, Math.floor(v * phases.length + 0.12)));
    const shown = phaseRef.current;
    desiredPhase.current = Math.min(shown + 1, Math.max(shown - 1, raw));
  });

  useEffect(() => {
    const stepMs = reduced ? 80 : 280;
    const id = window.setInterval(() => {
      setPhase((prev) => {
        const next = desiredPhase.current;
        if (prev === next) return prev;
        return prev + (next > prev ? 1 : -1);
      });
    }, stepMs);
    return () => window.clearInterval(id);
  }, [reduced]);

  /**
   * While the track is on screen, a gesture may only reach the neighbouring
   * phase. Fast mobile flicks otherwise carry past Dry before the stepper runs.
   * If the visitor sits still on Load, the same loop eases the track forward
   * so the bars and chamber keep moving.
   */
  useEffect(() => {
    const snapToDriven = () => {
      const node = track.current;
      if (!node) return;
      const scrollable = Math.max(1, node.offsetHeight - window.innerHeight);
      const trackTop = node.getBoundingClientRect().top + window.scrollY;
      const y = trackTop + scrollable * scrollProgress.current;
      document.documentElement.scrollTop = y;
      window.scrollTo(0, y);
    };

    const noteUser = () => {
      if (autoplay.current) {
        snapToDriven();
        releasedAt.current = performance.now();
      }
      lastUserInput.current = performance.now();
      autoplay.current = false;
      autoplayOriginP.current = null;
    };

    const gate = (direction: 1 | -1) => {
      const el = track.current;
      if (!el || unlocking.current || autoplay.current) return null;
      const section = el.closest('#cycle');
      const bounds = (section ?? el).getBoundingClientRect();
      const inSection = bounds.bottom >= 48 && bounds.top <= window.innerHeight - 48;
      if (inSection) engaged.current = true;
      if (!engaged.current) return null;

      const scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
      const trackTop = el.getBoundingClientRect().top + window.scrollY;
      const shown = phaseRef.current;
      const last = phases.length - 1;
      const yFor = (p: number, bias: number) => trackTop + scrollable * ((p + bias) / phases.length);

      if (direction > 0 && shown >= last) {
        engaged.current = false;
        return null;
      }
      if (direction < 0 && shown <= 0) {
        const loadStart = yFor(0, 0.08);
        if (window.scrollY <= loadStart + 8) {
          engaged.current = false;
          return null;
        }
        return loadStart;
      }

      return direction > 0 ? yFor(shown + 1, 0.12) : yFor(shown - 1, 0.88);
    };

    const onScroll = () => {
      const down = gate(1);
      if (down != null && window.scrollY > down + 0.5) window.scrollTo(0, down);
      const up = gate(-1);
      if (up != null && window.scrollY < up - 0.5) window.scrollTo(0, up);
    };

    const tickAutoplay = (now: number) => {
      if (reduced) return;
      const el = track.current;
      if (!el) return;

      const scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
      const rect = el.getBoundingClientRect();
      const trackTop = rect.top + window.scrollY;
      const p = (window.scrollY - trackTop) / scrollable;
      const sticky = rect.top <= 96 && rect.bottom >= window.innerHeight * 0.6;
      if (sticky && !wasSticky.current && !autoplay.current) lastUserInput.current = now;
      wasSticky.current = sticky;

      const leftSection = rect.bottom < 48 || rect.top > window.innerHeight - 48;
      if (!autoplay.current && (!sticky || p < -0.01 || p >= 0.97 || leftSection)) return;
      if (autoplay.current && leftSection) {
        autoplay.current = false;
        autoplayOriginP.current = null;
        return;
      }
      if (!autoplay.current && now - lastUserInput.current < 900) return;

      if (!autoplay.current) {
        autoplay.current = true;
        engaged.current = true;
        // Resume from the visual playhead, not window.scrollY — iOS often
        // lags behind, which made a phase restart from empty after a flick.
        autoplayOriginP.current = Math.min(0.97, Math.max(0, scrollProgress.current));
        autoplayClock.current = now;
      }

      // 5s per phase — half of the ~10s each phase was taking on a phone.
      // Drive the bars and chamber from wall-clock so a dropped scrollTo
      // cannot stretch a phase; keep the page scrolled to match.
      const originP = autoplayOriginP.current ?? 0;
      const driven = Math.min(0.97, originP + (now - autoplayClock.current) / 1000 / (phases.length * 5));
      scrollProgress.current = driven;
      driveProgress.set(driven);
      const raw = Math.min(phases.length - 1, Math.max(0, Math.floor(driven * phases.length + 0.12)));
      desiredPhase.current = Math.min(phaseRef.current + 1, Math.max(phaseRef.current - 1, raw));
      const y = trackTop + scrollable * driven;
      document.documentElement.scrollTop = y;
      window.scrollTo(0, y);
    };

    let raf = 0;
    const tick = (now: number) => {
      onScroll();
      tickAutoplay(now);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      gestureDir.current = e.deltaY > 0 ? 1 : -1;
      noteUser();
      const limit = gate(e.deltaY > 0 ? 1 : -1);
      if (limit == null) return;
      if (e.deltaY > 0 && window.scrollY >= limit - 1) {
        e.preventDefault();
        window.scrollTo(0, limit);
      } else if (e.deltaY < 0 && window.scrollY <= limit + 1) {
        e.preventDefault();
        window.scrollTo(0, limit);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      noteUser();
      lastTouchY.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      noteUser();
      const y = e.touches[0]?.clientY;
      if (y == null || lastTouchY.current == null) return;
      const goingDown = lastTouchY.current - y > 0;
      gestureDir.current = goingDown ? 1 : -1;
      lastTouchY.current = y;
      const limit = gate(goingDown ? 1 : -1);
      if (limit == null) return;
      if (goingDown && window.scrollY >= limit - 12) {
        e.preventDefault();
        window.scrollTo(0, limit);
      } else if (!goingDown && window.scrollY <= limit + 12) {
        e.preventDefault();
        window.scrollTo(0, limit);
      }
    };

    const onTouchEnd = () => {
      lastTouchY.current = null;
    };

    const onHash = () => {
      if (location.hash === '#cycle') return;
      unlocking.current = true;
      engaged.current = false;
      autoplay.current = false;
      autoplayOriginP.current = null;
      window.setTimeout(() => {
        unlocking.current = false;
      }, 900);
    };

    window.addEventListener('hashchange', onHash);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [driveProgress, phases.length, reduced]);

  useEffect(() => {
    let raf = 0;
    const n = phases.length;
    const loop = () => {
      const start = phaseRef.current / n;
      const end = (phaseRef.current + 1) / n;
      cycleProgress.current = Math.min(end, Math.max(start, scrollProgress.current));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cycleProgress, phases.length]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => claimAct('cycle', entries[0].isIntersecting), {
      threshold: 0,
      rootMargin: '0px',
    });
    io.observe(el);
    return () => {
      io.disconnect();
      claimAct('cycle', false);
    };
  }, [claimAct]);

  const goToPhase = (i: number) => {
    const el = track.current;
    if (!el) return;
    unlocking.current = true;
    autoplay.current = false;
    autoplayOriginP.current = null;
    lastUserInput.current = performance.now();
    desiredPhase.current = i;
    phaseRef.current = i;
    setPhase(i);
    const scrollable = el.offsetHeight - window.innerHeight;
    const trackTop = el.getBoundingClientRect().top + window.scrollY;
    const y = trackTop + scrollable * ((i === 0 ? 0.01 : i + 0.08) / phases.length);
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    window.setTimeout(() => {
      unlocking.current = false;
    }, 900);
  };

  const active = phases[phase];

  return (
    <section id="cycle" className="relative" style={{ scrollMarginTop: '4rem', overflowAnchor: 'none' }}>
      <div className="relative z-30 bg-ink-950 pb-16 pt-20 md:pb-24 md:pt-24">
        <div className="measure">
          <SectionHead title={copy.cycle.heading} lead={copy.cycle.lead} rule={false} />
        </div>
      </div>

      <div ref={track} className="relative z-30 h-[360svh] md:h-[280svh]">
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
