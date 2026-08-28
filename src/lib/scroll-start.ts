/**
 * Landing-page load should start at the hero.
 *
 * Phones restore the last scroll on refresh, and in-page links leave `#cycle`
 * or `#demo` in the URL. Either one drops a reload into the chamber or the
 * contact form. Reloads go to the top; a first visit with a hash (a shared
 * link) still honours it.
 */

export function isReload() {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === 'reload';
}

export function shouldStartAtTop() {
  if (isReload()) return true;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const type = nav?.type ?? 'navigate';
  return type === 'navigate' && !location.hash;
}

export function pinScrollStart() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const lock = () => {
    if (!shouldStartAtTop()) return;
    if (isReload() && location.hash) {
      history.replaceState(null, '', `${location.pathname}${location.search}`);
    }
    document.documentElement.scrollTop = 0;
    window.scrollTo(0, 0);
  };

  lock();
  window.addEventListener('pageshow', lock);

  if (isReload()) {
    const started = performance.now();
    const id = window.setInterval(() => {
      lock();
      if (performance.now() - started > 500) window.clearInterval(id);
    }, 50);
  }
}
