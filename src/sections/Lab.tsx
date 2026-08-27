import { Media } from '../components/Media';
import { Reveal } from '../components/Reveal';
import { useLocale } from '../state/locale';

/**
 * The claims section.
 *
 * Wording here stays inside what the supplied documentation says, and the scope
 * of the single laboratory result is stated in the same visual weight as the
 * result itself — not tucked into a footnote. The 99.9% figure is attributed to
 * the manufacturer wherever it appears.
 */
export function Lab() {
  const { copy } = useLocale();
  const lab = copy.lab;
  const { report, reviewer } = lab;

  return (
    <section id="lab" className="relative z-20 bg-paper text-paper-ink">
      <div className="measure py-20 md:py-24">
        <Reveal>
          <h2 className="type-h2 max-w-[24ch]">{lab.heading}</h2>
        </Reveal>

        <div className="mt-12 grid gap-y-14 md:mt-16 md:grid-12">
          <Reveal step={1} className="md:col-span-6">
            <figure>
              <Media
                name="lab-report"
                alt={lab.imageAlt}
                sizes="(max-width: 768px) 92vw, 42vw"
                className="border border-[color:var(--rule-paper)] bg-white"
              />
              <figcaption className="mt-4 text-ui leading-relaxed text-paper-muted">
                {report.title}, {report.issuer}, {report.department}. {report.location}.
              </figcaption>
            </figure>
          </Reveal>

          <Reveal step={2} className="md:col-span-5 md:col-start-8">
            <dl className="border-t border-t-[color:var(--rule-paper)]">
              {[
                [lab.labels.sample, report.sample],
                [lab.labels.before, report.before],
                [lab.labels.after, report.after],
                [lab.labels.laboratory, report.issuer],
                [lab.labels.microbiologist, report.microbiologist],
                [lab.labels.date, report.date],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 border-b border-b-[color:var(--rule-paper)] py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <dt className="type-data text-paper-muted">{label}</dt>
                  <dd
                    className={`type-data font-semibold sm:text-right ${
                      label === lab.labels.after ? 'text-teal-600' : ''
                    }`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 flex items-start gap-5 border-t border-t-[color:var(--rule-paper)] pt-8">
              <Media
                name="physician"
                alt={reviewer.name}
                sizes="96px"
                className="w-24 shrink-0 border border-[color:var(--rule-paper)]"
              />
              <div>
                <p className="font-display text-[1.25rem] font-bold">{reviewer.name}</p>
                <p className="type-data mt-1 text-paper-muted">{reviewer.registration}</p>
                <p className="mt-2 text-ui leading-snug text-paper-muted">{reviewer.credentials}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
