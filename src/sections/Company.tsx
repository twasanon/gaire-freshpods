import { Reveal } from '../components/Reveal';
import { SectionHead } from '../components/ui';
import { useLocale } from '../state/locale';

/**
 * Where the Nepal identity is established — through the company, the
 * province it operates in and who actually answers the phone. No flags, no
 * mountains, no mandalas.
 */
export function Company() {
  const { copy } = useLocale();
  const company = copy.company;
  return (
    <section className="relative z-20 bg-ink-850">
      <div className="measure py-20 md:py-24">
        <SectionHead title={company.heading} lead={company.body} rule={false} />

        <Reveal className="mt-12 grid gap-y-12 md:mt-16 md:grid-12 md:gap-x-10 md:gap-y-0">
          <div className="border-t pt-8 md:col-span-6">
            <h3 className="font-display text-[1.5rem] font-bold tracking-[-0.02em]">{company.visionTitle}</h3>
            <p className="mt-4 max-w-[40ch] text-lead text-fg-muted">{company.vision}</p>
          </div>
          <div className="border-t pt-8 md:col-span-6">
            <h3 className="font-display text-[1.5rem] font-bold tracking-[-0.02em]">{company.missionTitle}</h3>
            <p className="mt-4 max-w-[44ch] text-lead text-fg-muted">{company.mission}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
