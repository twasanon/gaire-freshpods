import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ColorwayId } from '../lib/content';
import { OrbitDriver } from '../three/orbit';

/**
 * The page runs a single WebGL context that two sections borrow in turn: the
 * hero, and the cycle explainer. `act` says which one currently owns it —
 * `null` means no section is on screen and the render loop is stopped.
 */
export type Act = 'hero' | 'cycle' | null;

type StageValue = {
  colorway: ColorwayId;
  setColorway: (id: ColorwayId) => void;

  act: Act;
  claimAct: (act: Exclude<Act, null>, visible: boolean) => void;

  /** True once the GLB has been parsed and the first frame is on screen. */
  live: boolean;
  markLive: () => void;

  /**
   * Set if the 3D layer throws. The poster then stands in permanently, which is
   * also what happens on devices with no WebGL.
   */
  failed: boolean;
  markFailed: () => void;

  /** Set once the user rotates the machine, so the affordance can retire. */
  touched: boolean;
  markTouched: () => void;

  /** 0–1 progress through the cycle section, written by scroll, read in useFrame. */
  cycleProgress: { current: number };
  cyclePhase: number;
  setCyclePhase: (i: number) => void;

  /**
   * Rotation state lives here rather than inside the canvas so the hero's
   * keyboard controls can drive the machine without reaching into three.js.
   */
  orbit: OrbitDriver;
};

const StageContext = createContext<StageValue | null>(null);

export function StageProvider({ children }: { children: ReactNode }) {
  const [colorway, setColorway] = useState<ColorwayId>('yellow');
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [cyclePhase, setCyclePhase] = useState(0);
  const cycleProgress = useRef(0);
  const orbit = useMemo(() => new OrbitDriver(), []);

  // Visibility is reported independently by each section; the hero wins ties so
  // that a fast scroll never leaves the canvas framed on nothing.
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const claimAct = useCallback((which: Exclude<Act, null>, isVisible: boolean) => {
    setVisible((prev) => (prev[which] === isVisible ? prev : { ...prev, [which]: isVisible }));
  }, []);
  const act: Act = visible.hero ? 'hero' : visible.cycle ? 'cycle' : null;

  const value = useMemo<StageValue>(
    () => ({
      colorway,
      setColorway,
      act,
      claimAct,
      // A late failure has to take the machine back off the screen, so the
      // poster returns rather than leaving an empty frame.
      live: live && !failed,
      markLive: () => setLive(true),
      failed,
      markFailed: () => setFailed(true),
      touched,
      markTouched: () => setTouched(true),
      cycleProgress,
      cyclePhase,
      setCyclePhase,
      orbit,
    }),
    [colorway, act, claimAct, live, failed, touched, cyclePhase, orbit]
  );

  return <StageContext.Provider value={value}>{children}</StageContext.Provider>;
}

export function useStage() {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error('useStage must be used inside <StageProvider>');
  return ctx;
}
