import { useEffect, useRef, useState } from 'react';
import { ActionLink } from './ui';
import { useLocale } from '../state/locale';

export function Nav() {
  const { locale, copy, toggleLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const nextY = Math.max(0, window.scrollY);
      const delta = nextY - lastY.current;
      setScrolled(nextY > 40);
      if (nextY < 72) setVisible(true);
      else if (Math.abs(delta) > 6) setVisible(delta < 0);
      lastY.current = nextY;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The mobile panel is a modal surface: lock the page behind it and let Escape out.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <a
        href="#colours"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-ink-950 focus:px-5 focus:py-3 focus:type-data"
      >
        {copy.a11y.skip}
      </a>

      <header
        className="fixed inset-x-0 top-0 z-90 transition-[background-color,backdrop-filter,border-color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          backgroundColor: scrolled ? 'color-mix(in oklab, var(--color-ink-950) 88%, transparent)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--rule)' : 'transparent'}`,
          transform: visible || open ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="measure flex h-20 items-center justify-between gap-4 md:gap-8">
          <a href="#top" className="flex min-w-0 shrink-0 items-center gap-3 md:gap-3.5" aria-label={copy.a11y.home}>
            <img
              src="/img/mark-96.webp"
              srcSet="/img/mark-96.webp 96w, /img/mark-192.webp 192w"
              sizes="48px"
              width={48}
              height={48}
              alt=""
              className="size-11 rounded-full md:size-12"
            />
            <span className="font-display text-[1.25rem] font-bold tracking-[-0.02em] text-fg md:text-[1.375rem]">
              {locale === 'ne' ? 'गैरे फ्रेशपड्स' : 'Gaire Freshpods'}
            </span>
          </a>

          {/*
            The five section links plus the lockup and the button need about
            1100px before they start wrapping, so the inline nav waits for xl
            and everything below it uses the panel.
          */}
          <nav aria-label={copy.a11y.sections} className="hidden items-center gap-8 xl:flex">
            {copy.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="type-data text-fg-muted transition-colors duration-200 hover:text-fg"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={copy.language.switchLabel}
              title={copy.language.switchLabel}
              className="flex h-11 items-center justify-center gap-2 border border-ink-600 px-3 font-display text-ui font-semibold text-fg transition-colors duration-200 hover:border-teal-300 hover:text-teal-300"
            >
              <span aria-hidden="true" className="text-[1.35rem] leading-none">
                {locale === 'en' ? '🇬🇧' : '🇳🇵'}
              </span>
              <span>{copy.language.short}</span>
            </button>
            {/*
              The wrapper carries the responsive display, not the link: the
              button's own `inline-flex` would race `hidden` in the cascade, and
              a header wider than the phone expands the layout viewport, which
              throws off every fixed element on the page including the canvas.
            */}
            <span className="hidden sm:block">
              <ActionLink href="#demo" className="px-5 py-3">
                {copy.actions.bookDemo}
              </ActionLink>
            </span>
            <button
              onClick={() => setOpen(true)}
              aria-label={copy.a11y.openMenu}
              aria-expanded={open}
              className="grid size-11 place-items-center border border-ink-600 text-fg transition-colors duration-200 hover:border-teal-300 xl:hidden"
            >
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-100 bg-ink-950 xl:hidden" role="dialog" aria-modal="true" aria-label={copy.a11y.sections}>
          <div className="measure flex h-20 items-center justify-between">
            <span className="flex items-center gap-3 md:gap-3.5">
              <img src="/img/mark-96.webp" alt="" className="size-11 rounded-full md:size-12" />
              <span className="font-display text-[1.25rem] font-bold tracking-[-0.02em] md:text-[1.375rem]">
                {locale === 'ne' ? 'गैरे फ्रेशपड्स' : 'Gaire Freshpods'}
              </span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label={copy.a11y.closeMenu}
              autoFocus
              className="grid size-11 place-items-center border border-ink-600 text-fg"
            >
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="square" />
              </svg>
            </button>
          </div>
          <nav aria-label={copy.a11y.sections} className="measure mt-6 flex flex-col border-t">
            {copy.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="type-h3 border-b py-6 font-display text-fg"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#demo"
              onClick={() => setOpen(false)}
              className="type-h3 border-b py-6 font-display text-signal-bright"
            >
              {copy.actions.bookDemo}
            </a>
          </nav>
        </div>
      ) : null}
    </>
  );
}
