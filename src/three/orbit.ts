/**
 * Rotation control for the machine.
 *
 * Deliberately not OrbitControls. On a phone, OrbitControls claims the whole
 * gesture space and the page stops scrolling; here the rule is:
 *
 *   - touch: horizontal drag turns the machine, vertical drag scrolls the page
 *     (the element carries `touch-action: pan-y`, so the browser arbitrates and
 *     we only ever read deltaX)
 *   - mouse / pen: drag turns and tilts, with the tilt clamped and self-centring
 *   - wheel is never captured
 *
 * Yaw carries momentum after release and settles back into a slow idle turn.
 * It is kept in [-π, π] so handing the pose to another shot cannot unwind
 * dozens of accumulated turns.
 */

const IDLE_SPEED = 0.19; // rad/s
const YAW_PER_PX = 0.0085;
const PITCH_PER_PX = 0.0042;
const PITCH_LIMIT = 0.26;
const FRICTION = 2.9;

export class OrbitDriver {
  yaw: number;
  pitch = 0;
  /** Set false for prefers-reduced-motion: the machine then only moves on input. */
  idle = true;
  /** +1 is the default idle turn; a drag or nudge can reverse it. */
  private idleSign = 1;

  private velocity = 0;
  private dragging = false;
  private pointerId: number | null = null;
  private lastX = 0;
  private lastY = 0;
  private lastMoveAt = 0;
  private coarse = false;
  private onFirstInput?: () => void;
  private el: HTMLElement | null = null;

  constructor(initialYaw = -0.52) {
    this.yaw = initialYaw;
  }

  attach(el: HTMLElement, onFirstInput?: () => void) {
    this.el = el;
    this.onFirstInput = onFirstInput;
    el.addEventListener('pointerdown', this.down);
    el.addEventListener('pointermove', this.move);
    el.addEventListener('pointerup', this.up);
    el.addEventListener('pointercancel', this.up);
    el.addEventListener('lostpointercapture', this.up);
    return () => {
      el.removeEventListener('pointerdown', this.down);
      el.removeEventListener('pointermove', this.move);
      el.removeEventListener('pointerup', this.up);
      el.removeEventListener('pointercancel', this.up);
      el.removeEventListener('lostpointercapture', this.up);
      this.el = null;
    };
  }

  private down = (e: PointerEvent) => {
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.dragging = true;
    this.coarse = e.pointerType === 'touch';
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.lastMoveAt = performance.now();
    this.velocity = 0;
    // Capture only for precise pointers. Capturing a touch would steal the
    // vertical gesture from the scroller.
    if (!this.coarse) this.el?.setPointerCapture(e.pointerId);
    if (this.el) this.el.style.cursor = 'grabbing';
  };

  private move = (e: PointerEvent) => {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) this.reportInput();

    const now = performance.now();
    const dt = Math.max(8, now - this.lastMoveAt) / 1000;
    this.lastMoveAt = now;

    this.yaw += dx * YAW_PER_PX;
    this.velocity = (dx * YAW_PER_PX) / dt;
    if (Math.abs(dx) > 0.5) this.idleSign = Math.sign(dx) || this.idleSign;

    if (!this.coarse) {
      this.pitch = clamp(this.pitch + dy * PITCH_PER_PX, -PITCH_LIMIT, PITCH_LIMIT);
    }
  };

  private up = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    this.dragging = false;
    this.pointerId = null;
    if (this.el) this.el.style.cursor = 'grab';
  };

  private reportInput() {
    if (!this.onFirstInput) return;
    const fn = this.onFirstInput;
    this.onFirstInput = undefined;
    fn();
  }

  /** Nudge by a fixed step. Used by the keyboard controls. */
  nudge(direction: -1 | 1) {
    this.yaw += direction * 0.32;
    this.velocity = 0;
    this.idleSign = direction;
    this.wrapYaw();
    this.reportInput();
  }

  /** Fold unbounded yaw back into [-π, π] so a later lerp cannot spin the cabinet. */
  wrapYaw() {
    this.yaw = Math.atan2(Math.sin(this.yaw), Math.cos(this.yaw));
  }

  /** Stop idle, momentum and tilt. Used when another shot takes the machine. */
  halt(yaw?: number) {
    if (typeof yaw === 'number') this.yaw = yaw;
    else this.wrapYaw();
    this.velocity = 0;
    this.pitch = 0;
    this.dragging = false;
  }

  update(delta: number) {
    if (this.dragging) return;

    // Momentum, then a slow idle turn in the last direction the visitor used.
    if (Math.abs(this.velocity) > 0.001) {
      this.yaw += this.velocity * delta;
      this.velocity *= Math.exp(-FRICTION * delta);
      if (Math.abs(this.velocity) > 0.04) this.idleSign = Math.sign(this.velocity) || this.idleSign;
    } else if (this.idle) {
      this.yaw += this.idleSign * IDLE_SPEED * delta;
    }

    // Tilt always returns to eye level.
    this.pitch += (0 - this.pitch) * (1 - Math.pow(0.08, delta));
    this.wrapYaw();
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
