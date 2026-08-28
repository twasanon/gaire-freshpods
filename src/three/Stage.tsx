import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { Machine, preloadMachine, type MachineDrive } from './Machine';
import { StudioEnv } from './StudioEnv';
import { FloorGlow } from './FloorGlow';
import { FogVeil } from './FogVeil';
import { HelmetLoadVeil } from './HelmetLoadVeil';
import { CycleAtmosphere } from './CycleAtmosphere';
import { Boundary } from './Boundary';
import type { OrbitDriver } from './orbit';
import { FOV, FRAMINGS, solveFraming } from './framing';
import { detectCapability } from '../lib/device';
import { useStage, type Act } from '../state/stage';

const CYCLE_YAW = -0.16;

preloadMachine(detectCapability().tier);

/**
 * The page's single WebGL context. Mounted by StageLoader, which owns the
 * decision about whether this code is fetched at all.
 */
export function Stage() {
  const capability = detectCapability();
  const { act, colorway, live, markLive, markFailed, failed, markTouched, touched, orbit } = useStage();
  const reduced = useReducedMotion();

  orbit.idle = !reduced;

  const drive = useRef<MachineDrive>({ uv: 0, panel: 0, heat: 0 });
  const fog = useRef(0);
  const helmetReveal = useRef(1);
  const interactive = act === 'hero' && live;

  if (failed) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-10 h-svh transition-opacity duration-700"
      style={{ opacity: act && live ? 1 : 0 }}
      aria-hidden="true"
    >
      <Boundary onError={markFailed}>
        <Canvas
          frameloop={act ? 'always' : 'never'}
          dpr={[1, capability.maxDpr]}
          style={{ pointerEvents: 'none' }}
          gl={{
            antialias: capability.tier === 'hi',
            alpha: true,
            powerPreference: 'high-performance',
            // Nothing reads the buffer back, and skipping preservation lets the
            // driver discard it after compositing.
            preserveDrawingBuffer: false,
          }}
          camera={{ fov: FOV, near: 0.1, far: 60, position: [0, 0.2, 4.8] }}
          onCreated={({ gl }) => {
            // Khronos PBR Neutral holds saturated product colour where ACES
            // would wash the yellow cabinet out.
            gl.toneMapping = THREE.NeutralToneMapping;
            gl.toneMappingExposure = 1.02;
            gl.setClearAlpha(0);
          }}
          onError={markFailed}
        >
          <StudioEnv tier={capability.tier} />
          <Suspense fallback={null}>
            <Director act={act} orbit={orbit} reduced={!!reduced}>
              <Machine tier={capability.tier} colorway={colorway} drive={drive} onReady={markLive} />
              <FogVeil drive={fog} />
              <CycleAtmosphere drive={drive} />
              <HelmetLoadVeil drive={helmetReveal} />
            </Director>
          </Suspense>
          <FloorGlow colorway={colorway} />
          <CycleDriver drive={drive} fog={fog} helmetReveal={helmetReveal} />
          <VisibilityGuard active={!!act} />
        </Canvas>
      </Boundary>
      {/*
        Sits above the canvas so drag and swipe reach the orbit driver. The
        canvas itself does not take pointer events — that was swallowing the
        gesture before it got here.
      */}
      <InteractionSurface orbit={orbit} enabled={interactive} onFirstInput={markTouched} faded={touched} />
    </div>
  );
}

/**
 * Transparent layer that receives drag gestures. `touch-action: pan-y` is what
 * keeps a vertical swipe scrolling the page instead of spinning the machine.
 */
function InteractionSurface({
  orbit,
  enabled,
  onFirstInput,
  faded,
}: {
  orbit: OrbitDriver;
  enabled: boolean;
  onFirstInput: () => void;
  faded: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !enabled) return;
    return orbit.attach(ref.current, onFirstInput);
  }, [orbit, enabled, onFirstInput]);

  // Custom ring follows the pointer by writing a transform, not by setting
  // React state — a setState on every move would compete with the render loop.
  useEffect(() => {
    const surface = ref.current;
    const ring = cursor.current;
    if (!surface || !ring) return;
    if (!matchMedia('(pointer: fine)').matches) return;

    const onMove = (e: PointerEvent) => {
      ring.style.opacity = '1';
      ring.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };
    const onLeave = () => {
      ring.style.opacity = '0';
    };
    surface.addEventListener('pointermove', onMove);
    surface.addEventListener('pointerleave', onLeave);
    return () => {
      surface.removeEventListener('pointermove', onMove);
      surface.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  return (
    <>
      <div
        ref={ref}
        className="absolute inset-0 z-10"
        style={{
          touchAction: 'pan-y',
          cursor: enabled ? (matchMedia('(pointer: fine)').matches ? 'none' : 'grab') : 'auto',
          pointerEvents: enabled ? 'auto' : 'none',
        }}
      />
      <div
        ref={cursor}
        className="pointer-events-none fixed top-0 left-0 z-20 hidden md:block"
        style={{
          opacity: 0,
          visibility: enabled ? 'visible' : 'hidden',
          willChange: 'transform, opacity',
        }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 72 72" className="size-[72px] text-fg" fill="none" style={{ opacity: faded ? 0.35 : 0.85 }}>
          <circle cx="36" cy="36" r="22" stroke="currentColor" strokeWidth="1.2" />
          <path d="M36 10v6M36 56v6M10 36h6M56 36h6" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>
    </>
  );
}

/**
 * Owns the camera and the machine's rotation.
 *
 * Framing is solved from a locked layout size, not the canvas's live drawing
 * buffer: on a phone the URL bar retracts as you scroll and that used to
 * rescale the machine every frame. Switching shots snaps the camera so a
 * scroll through the cycle cannot dolly the cabinet.
 */
function Director({
  act,
  orbit,
  reduced,
  children,
}: {
  act: Act;
  orbit: OrbitDriver;
  reduced: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const settled = useRef(false);
  const lastAct = useRef(act);
  const frame = useStableFrameSize(size.width, size.height);

  const desired = useMemo(() => {
    const name = act ?? 'hero';
    const framing = FRAMINGS[name];
    const solved = solveFraming(name, frame.width, frame.height);

    // Composing by translating the camera rather than the model keeps the
    // machine's own axis of rotation intact.
    const target = new THREE.Vector3(...framing.target).add(new THREE.Vector3(solved.pan[0], solved.pan[1], 0));
    const direction = new THREE.Vector3(...framing.offset).normalize();
    const position = target.clone().addScaledVector(direction, solved.distance);
    return { position, target };
  }, [act, frame.width, frame.height]);

  useFrame((_, delta) => {
    const actChanged = lastAct.current !== act;
    if (actChanged) settled.current = false;

    if (act === 'cycle' && actChanged) {
      // Snap. Lerping from an idle yaw that has been turning for a minute is
      // what made the cabinet spin a dozen times on the way into this shot.
      orbit.halt(CYCLE_YAW);
      if (group.current) {
        group.current.rotation.set(0, CYCLE_YAW, 0);
      }
    }

    const k = settled.current ? 1 - Math.pow(0.0009, Math.min(delta, 0.05)) : 1;
    camera.position.lerp(desired.position, k);
    camera.lookAt(desired.target);
    settled.current = true;
    lastAct.current = act;

    if (act === 'cycle') {
      if (group.current) {
        group.current.rotation.y = CYCLE_YAW;
        group.current.rotation.x = 0;
      }
      return;
    }

    orbit.idle = !reduced;
    orbit.update(delta);
    if (group.current) {
      group.current.rotation.y = orbit.yaw;
      group.current.rotation.x = orbit.pitch;
    }
  });

  return <group ref={group}>{children}</group>;
}

/**
 * Ignore the drawing-buffer flicker that comes from mobile chrome and from a
 * scrollbar appearing. Re-solve only on a real resize or a rotation.
 */
function useStableFrameSize(width: number, height: number) {
  const locked = useRef({ width, height });
  const coarse = useRef(typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches);
  const dw = Math.abs(width - locked.current.width);
  const dh = Math.abs(height - locked.current.height);
  if (coarse.current) {
    if (dw >= 40) locked.current = { width, height };
  } else if (dw >= 24 || dh >= 48) {
    locked.current = { width, height };
  }
  return locked.current;
}

/** Maps cycle scroll progress onto the chamber lamps, LCD and fog. */
function CycleDriver({
  drive,
  fog,
  helmetReveal,
}: {
  drive: { current: MachineDrive };
  fog: { current: number };
  helmetReveal: { current: number };
}) {
  const { act, cycleProgress } = useStage();
  const displayed = useRef(0);
  const inCycle = useRef(false);

  useFrame((_, delta) => {
    if (act !== 'cycle') {
      inCycle.current = false;
      displayed.current = 0;
      drive.current.uv = 0;
      drive.current.panel = 0;
      drive.current.heat = 0;
      fog.current = 0;
      helmetReveal.current = 1;
      return;
    }
    if (!inCycle.current) {
      displayed.current = cycleProgress.current;
      inCycle.current = true;
    }
    displayed.current += (cycleProgress.current - displayed.current) * (1 - Math.exp(-10 * delta));
    const t = displayed.current;
    // Load 0–0.25 · Disinfect 0.25–0.5 · Aroma 0.5–0.75 · Dry 0.75–1
    drive.current.uv = band(t, 0.22, 0.28, 0.48, 0.55);
    drive.current.panel = band(t, 0.04, 0.12, 0.94, 1.0);
    drive.current.heat = band(t, 0.72, 0.78, 0.96, 1.0);
    fog.current = band(t, 0.43, 0.52, 0.7, 0.8);
    helmetReveal.current = smoothstep(t, 0.1, 0.24);
  });

  return null;
}

function smoothstep(value: number, edge0: number, edge1: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** A trapezoid ramp: 0 before `a`, 1 between `b` and `c`, 0 after `d`. */
function band(t: number, a: number, b: number, c: number, d: number) {
  if (t <= a || t >= d) return 0;
  if (t < b) return (t - a) / (b - a);
  if (t > c) return (d - t) / (d - c);
  return 1;
}

/** Stops the loop when the tab is hidden, and frees GPU memory on unmount. */
function VisibilityGuard({ active }: { active: boolean }) {
  const gl = useThree((s) => s.gl);
  const setFrameloop = useThree((s) => s.setFrameloop);

  useEffect(() => {
    const apply = () => setFrameloop(document.hidden || !active ? 'never' : 'always');
    apply();
    document.addEventListener('visibilitychange', apply);
    return () => document.removeEventListener('visibilitychange', apply);
  }, [active, setFrameloop]);

  useEffect(() => () => gl.dispose(), [gl]);
  return null;
}
