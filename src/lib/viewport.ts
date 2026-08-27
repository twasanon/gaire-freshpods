import { useEffect, useState } from 'react';

/**
 * Layout viewport size, debounced to a frame.
 *
 * Uses `documentElement.clientWidth/Height` and the window `resize` event —
 * not `visualViewport`. On a phone the URL bar retracts as you scroll, and
 * that resize was feeding the 3D framing, so the machine pulsed as you moved.
 */
export function useViewport() {
  const read = () => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  });

  const [size, setSize] = useState(() => (typeof document === 'undefined' ? { width: 1440, height: 900 } : read()));

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setSize(read()));
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return size;
}
