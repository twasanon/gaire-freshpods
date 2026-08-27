import { Suspense, lazy } from 'react';
import { detectCapability } from '../lib/device';

/**
 * Decides whether the 3D layer is fetched at all.
 *
 * three.js and react-three-fiber are around 330 KB gzipped between them — more
 * than four times the rest of the page. Devices that cannot use them never pay
 * for them: no WebGL, save-data mode or too little memory means the request is
 * never made and the photograph stands in permanently. Capable devices start
 * the fetch on the first paint so the model, not a product render, is what
 * appears in the hero.
 */
const Stage = lazy(() => import('./Stage').then((m) => ({ default: m.Stage })));

export function StageLoader() {
  const capability = detectCapability();
  if (!capability.webgl) return null;

  return (
    <Suspense fallback={null}>
      <Stage />
    </Suspense>
  );
}
