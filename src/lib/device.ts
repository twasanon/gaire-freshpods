/**
 * Capability probe, run once. Decides whether the live machine renders, at
 * which quality tier, and when the supplied product renders should stand in
 * instead. Anything uncertain resolves toward the static path — a well-framed
 * poster is a better outcome than a stuttering canvas.
 */

export type Tier = 'hi' | 'lo';

export type Capability = {
  /** False means the page never creates a WebGL context. */
  webgl: boolean;
  tier: Tier;
  /** Upper bound on device pixel ratio, to keep fill rate sane on phones. */
  maxDpr: number;
  reason: 'ok' | 'no-webgl' | 'save-data' | 'low-memory';
};

const STATIC: Omit<Capability, 'reason'> = { webgl: false, tier: 'lo', maxDpr: 1 };

let cached: Capability | null = null;

export function detectCapability(): Capability {
  if (cached) return cached;
  cached = probe();
  return cached;
}

function probe(): Capability {
  if (typeof window === 'undefined') return { ...STATIC, reason: 'no-webgl' };

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData) return { ...STATIC, reason: 'save-data' };

  // deviceMemory is a coarse signal but the only one available: 1 GB or less is
  // a device that will thrash on a 20 MB texture budget.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === 'number' && memory <= 1) return { ...STATIC, reason: 'low-memory' };

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  try {
    const canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
  } catch {
    gl = null;
  }
  if (!gl) return { ...STATIC, reason: 'no-webgl' };

  const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.matchMedia('(max-width: 900px)').matches;

  // Release the probe context immediately; browsers cap concurrent contexts.
  gl.getExtension('WEBGL_lose_context')?.loseContext();

  if (maxTexture < 2048) return { ...STATIC, reason: 'no-webgl' };

  const modest = coarse || narrow || cores <= 4 || (typeof memory === 'number' && memory <= 4);

  return {
    webgl: true,
    tier: modest ? 'lo' : 'hi',
    // 2 is plenty on desktop; 1.6 keeps a 3x phone from rendering 9x the pixels.
    maxDpr: modest ? 1.6 : 2,
    reason: 'ok',
  };
}

export const modelUrl = (tier: Tier) => `/models/machine-${tier}.glb`;

/**
 * Start the GLB download without importing three.js.
 *
 * Stage is a lazy chunk (~330 KB). If we waited for `useGLTF` inside it, the
 * model would not even begin until that chunk had finished. This fetch runs
 * from first paint, in parallel, and lands in the HTTP cache for `useGLTF`.
 */
export function prefetchMachineModel() {
  if (typeof window === 'undefined') return;
  const cap = detectCapability();
  if (!cap.webgl) return;
  void fetch(modelUrl(cap.tier), { credentials: 'same-origin' });
}
