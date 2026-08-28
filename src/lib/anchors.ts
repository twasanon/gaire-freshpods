/**
 * In-page hash navigation with a header offset.
 *
 * Native fragment scrolling ignores the fixed header and can fight
 * `scroll-smooth` on the document. Clicks on `#…` links jump in one frame
 * so Machine, Cycle, The problem, and Specifications land just below the nav.
 * Reloads still start at the top (`src/lib/scroll-start.ts`); a first visit
 * with a hash (a shared link) honours it.
 */

import { isReload } from './scroll-start';

let jumpUntil = 0;

export function isPageJumping() {
  return performance.now() < jumpUntil;
}

export function beginPageJump(ms = 1600) {
  jumpUntil = Math.max(jumpUntil, performance.now() + ms);
}

function headerOffset() {
  const header = document.querySelector('header');
  const height = header?.getBoundingClientRect().height ?? 0;
  return height > 0 ? height : 80;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  beginPageJump();
  const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerOffset());
  document.documentElement.scrollTop = y;
  window.scrollTo(0, y);
  return true;
}

function hashId(href: string) {
  if (!href.startsWith('#') || href.length < 2) return null;
  try {
    return decodeURIComponent(href.slice(1));
  } catch {
    return href.slice(1);
  }
}

export function installAnchorNav() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    const a = target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    const id = hashId(href);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    if (location.hash !== href) history.pushState(null, '', href);
    scrollToId(id);
  };

  const onPop = () => {
    const id = hashId(location.hash);
    if (id) scrollToId(id);
  };

  document.addEventListener('click', onClick, true);
  window.addEventListener('popstate', onPop);

  if (location.hash.length > 1 && !isReload()) {
    beginPageJump();
    requestAnimationFrame(() => {
      const id = hashId(location.hash);
      if (id) scrollToId(id);
    });
  }

  return () => {
    document.removeEventListener('click', onClick, true);
    window.removeEventListener('popstate', onPop);
  };
}
