/**
 * In-page hash navigation that the cycle scroll gate cannot intercept.
 *
 * The cycle track is several viewports tall and clamps scroll to the next
 * phase. A native jump from the footer to Colours, or from the hero to The
 * problem, has to pass through that track. The gate then treats the jump as a
 * gesture and parks the visitor in the chamber. Clicks on `#…` links are
 * therefore handled here: pause the gate, jump in one frame, then release.
 */

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

  if (location.hash.length > 1) {
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
