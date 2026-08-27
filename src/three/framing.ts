/**
 * Shot definitions for the two moments the page shows the machine, solved from
 * real geometry rather than tuned by eye. The cabinet spans y −0.928…0.990 in
 * model units, and the chamber window is a 0.59 × 0.575 opening centred at
 * (0, 0.430, 0.338).
 *
 * This module is the single source of truth for both the three.js camera and
 * the CSS-positioned poster that stands in before the model arrives — which is
 * what lets the hand-off be a substitution instead of a jump.
 *
 * Landscape and portrait are solved by different rules, because the constraint
 * is different. In landscape the machine shares the frame with the copy beside
 * it, so the shot is a fraction of the window's height. In portrait the copy is
 * below the machine, so the shot has to fit the band of empty space between the
 * type above it and the copy beneath it — a band that is 575px tall on a large
 * phone and 390px on a small one. Solving portrait as a fraction of the window
 * instead is what makes a cabinet swallow the wordmark on a 640px screen.
 */

export const FOV = 31;

export type ActName = 'hero' | 'cycle';

/** True when the page should stack the machine above the copy rather than beside it. */
export function isStacked(width: number, _height?: number) {
  void _height;
  // Width only. Height flickers on a phone as the URL bar retracts, and using
  // it here used to flip the layout — and the 3D framing — while you scrolled.
  return width < 768;
}

export type Framing = {
  /** Height of the subject, in model units. */
  subject: number;
  /** Point the camera looks at. */
  target: [number, number, number];
  /** Camera direction from the target; normalised when solved. */
  offset: [number, number, number];

  landscape: {
    /** Fraction of the window's height the subject fills. */
    fill: number;
    /**
     * Where the subject sits in frame, as a fraction from centre: positive x is
     * right, positive y is up.
     */
    shift: [number, number];
  };

  portrait: {
    /**
     * Top of the band the subject is fitted into, in CSS pixels from the top of
     * the window. A function because the hero's band starts below the wordmark,
     * which is sized against the viewport.
     */
    top: (width: number) => number;
    /** Bottom of that band, as a fraction of the window's height. */
    bottom: number;
    /** How much of the band the subject fills. */
    fill: number;
    /** Horizontal composition, as a fraction from centre. */
    shiftX: number;
    /** Extra vertical composition. Positive is up. Hero uses a small downward nudge on phones. */
    shiftY?: number;
  };
};

/**
 * Height of the two-line hero wordmark, including the space above it.
 *
 * Mirrors the `type-monument` clamp and the hero's top padding in index.css.
 * The duplication is deliberate and belongs here: this module exists to keep
 * the type and the camera locked together, and the cabinet has to be placed
 * against the type's real height rather than a guess at it.
 */
function wordmarkBottom(width: number) {
  const size = Math.min(192, Math.max(52, 0.096 * width));
  return 80 + 1.7 * 0.82 * size;
}

export const FRAMINGS: Record<ActName, Framing> = {
  hero: {
    subject: 1.918,
    target: [0, 0.02, 0],
    offset: [0, 0.07, 1],
    landscape: {
      fill: 0.78,
      // Slightly right of centre so the composition is not a poster, and low
      // enough that the cabinet crosses the outlined second line.
      shift: [0.2, -0.02],
    },
    portrait: {
      top: (width) => wordmarkBottom(width) + 4,
      // Band runs most of the way to the pitch, with a little ink under the
      // casters so the wheels stay on-screen and the rule does not clip them.
      bottom: 0.9,
      fill: 0.93,
      // Leave a clear touch-sized lane for the vertical finish dots.
      shiftX: -0.05,
      // A little lower so the casters sit in the spare ink without eating the wordmark.
      shiftY: -0.028,
    },
  },
  cycle: {
    subject: 0.575,
    target: [0, 0.46, 0.12],
    // Flatter than the hero so we look into the window, not down the cabinet.
    offset: [0.12, 0.03, 1],
    landscape: {
      // Leave enough context around the chamber to keep the whole helmet and
      // its lower edge visible, including on compact desktop windows.
      fill: 0.54,
      shift: [-0.28, 0.02],
    },
    portrait: {
      // Below the header; there is no wordmark in this section.
      top: () => 96,
      // Where the phase copy's opaque ground begins.
      bottom: 0.52,
      fill: 1,
      // The three-quarter camera angle puts the chamber left of the frame's
      // centre, so the subject is nudged back to the right.
      shiftX: 0.04,
    },
  },
};

export type Solved = {
  distance: number;
  /** Camera translation applied to both eye and target, composing the shot. */
  pan: [number, number];
  /** Subject height as a fraction of viewport height, for the CSS poster. */
  heightFraction: number;
  /** Subject offset from centre, as viewport fractions. */
  offsetFraction: [number, number];
};

export function solveFraming(act: ActName, width: number, height: number): Solved {
  const aspect = width / Math.max(1, height);
  const framing = FRAMINGS[act];

  let heightFraction: number;
  let shift: [number, number];

  if (isStacked(width, height)) {
    const { top, bottom, fill, shiftX, shiftY = 0 } = framing.portrait;
    const bandTop = top(width);
    const bandBottom = bottom * height;
    const band = Math.max(160, bandBottom - bandTop);
    const centre = (bandTop + bandBottom) / 2;
    heightFraction = (band * fill) / height;
    shift = [shiftX, (height / 2 - centre) / height + shiftY];
  } else {
    // Between square and 4:3 the window is landscape but still cramped, so the
    // subject is given a little more room than a wide window needs.
    const relief = aspect < 1.3 ? 1.12 : 1;
    heightFraction = framing.landscape.fill / relief;
    shift = framing.landscape.shift;
  }

  const visibleHeight = framing.subject / heightFraction;
  const visibleWidth = visibleHeight * aspect;
  const distance = visibleHeight / 2 / Math.tan((FOV * Math.PI) / 360);
  const [sx, sy] = shift;

  return {
    distance,
    pan: [-sx * visibleWidth, -sy * visibleHeight],
    heightFraction,
    offsetFraction: [sx, sy],
  };
}
