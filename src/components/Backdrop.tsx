import { colorways } from '../lib/content';
import { useStage } from '../state/stage';

/**
 * The page's ground plane.
 *
 * Sits under the WebGL canvas and provides the ink field plus its grain, so the
 * two sections that show the live machine can keep transparent backgrounds and
 * let the canvas through. The pool behind the cabinet is the studio light the
 * 3D scene is actually lit by, and it retints with the selected finish — not a
 * decorative orb, the colour of the object in the room.
 *
 * Stacking order for the whole page, in one place:
 *   0   backdrop
 *   5   hero wordmark (the machine passes in front of it)
 *   10  WebGL canvas
 *   20  ordinary sections
 *   30  foreground copy inside the 3D sections
 *   90  header
 *   100 mobile menu
 */
const POOLS: Record<(typeof colorways)[number]['id'], string> = {
  yellow: 'color-mix(in oklab, var(--color-pool-yellow) 38%, transparent)',
  blue: 'color-mix(in oklab, var(--color-pool-blue) 42%, transparent)',
  red: 'color-mix(in oklab, var(--color-pool-red) 34%, transparent)',
};

export function Backdrop() {
  const { colorway, act } = useStage();
  const pool = POOLS[colorway];

  return (
    <div className="grain pointer-events-none fixed inset-0 z-0 overflow-clip bg-ink-950" aria-hidden="true">
      <div
        className="absolute left-1/2 top-[46%] h-[130vmin] w-[110vmin] -translate-x-1/2 -translate-y-1/2 transition-[background,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          background: `radial-gradient(closest-side, ${pool}, transparent 74%)`,
          opacity: act ? 1 : 0.35,
        }}
      />
    </div>
  );
}
