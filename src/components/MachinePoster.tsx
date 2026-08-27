import { Media } from './Media';
import { colorways } from '../lib/content';
import { detectCapability } from '../lib/device';
import { useViewport } from '../lib/viewport';
import { isStacked, solveFraming } from '../three/framing';
import { useStage } from '../state/stage';
import { useLocale } from '../state/locale';

/**
 * Permanent stand-in for the machine on devices that cannot run WebGL, and
 * the recovery visual if the live scene throws. Capable devices never mount
 * this photograph — not even hidden — so it cannot flash before the model.
 */
export function MachinePoster() {
  const { copy } = useLocale();
  const { act, colorway, failed } = useStage();
  const capability = detectCapability();
  const viewport = useViewport();

  const fallback = !capability.webgl || failed;
  if (!fallback) return null;

  const finish = colorways.find((c) => c.id === colorway) ?? colorways[0];
  const visible = act !== null;
  const stacked = isStacked(viewport.width, viewport.height);

  const shot = solveFraming(act ?? 'hero', viewport.width, viewport.height);
  const [offsetX, offsetY] = shot.offsetFraction;

  const height =
    act === 'cycle'
      ? stacked
        ? '38svh'
        : '54svh'
      : `${solveFraming('hero', viewport.width, viewport.height).heightFraction * 100}svh`;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-7 flex h-svh items-center justify-center transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translate(${offsetX * 100}vw, ${-offsetY * 100}svh)`,
        visibility: visible ? 'visible' : 'hidden',
        transitionProperty: 'opacity, visibility',
      }}
      aria-hidden={!visible}
    >
      <div style={{ height }} className="max-h-[86svh]">
        <Media
          key={finish.image}
          name={finish.image}
          alt={`${copy.colours.machineAlt} ${copy.colours.names[finish.id]}`}
          sizes="(max-width: 768px) 50vw, 26vw"
          priority
          reserve={false}
          className="h-full w-auto [&_img]:h-full [&_img]:w-auto"
        />
      </div>
    </div>
  );
}
