import { company } from '../lib/content';
import { useLocale } from '../state/locale';

export function Footer() {
  const { copy } = useLocale();
  return (
    <footer className="relative z-20 border-t bg-ink-950">
      <div className="measure py-16">
        <div className="grid gap-y-12 md:grid-12">
          <div className="md:col-span-7">
            <img
              src="/img/lockup-640.webp"
              srcSet="/img/lockup-320.webp 320w, /img/lockup-640.webp 640w"
              sizes="(min-width: 768px) 520px, 256px"
              width={520}
              height={102}
              alt="Gaire Freshpods"
              loading="lazy"
              className="h-16 w-auto md:h-24 lg:h-32"
            />
            <p className="mt-6 max-w-[34ch] text-ui leading-relaxed text-fg-muted">
              {copy.footer.companyLine} {copy.company.legalName}, {copy.company.address}.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-2 md:col-start-9">
            <ul className="flex flex-col gap-3">
              {copy.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="type-data text-fg-muted transition-colors hover:text-fg">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#demo" className="type-data text-fg-muted transition-colors hover:text-fg">
                  {copy.actions.bookDemo}
                </a>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3 md:col-start-11">
            <ul className="flex flex-col gap-3">
              <li>
                <a href={`tel:${company.mobiles[0]}`} className="type-data link-rule">
                  {company.mobiles[0]}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.emails[0]}`} className="type-data link-rule break-all">
                  {company.emails[0]}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/*
          Standing note on claims. Kept in the footer so it applies to the whole
          page rather than only to the section where a figure appears.
        */}
        <div className="mt-14 border-t pt-8">
          <p className="max-w-[86ch] text-ui leading-relaxed text-fg-dim">
            {copy.footer.productNote}
          </p>
          <p className="mt-6 text-ui text-fg-dim">
            © {new Date().getFullYear()} {copy.company.legalName}. {copy.footer.tagline}.
          </p>
        </div>
      </div>
    </footer>
  );
}
