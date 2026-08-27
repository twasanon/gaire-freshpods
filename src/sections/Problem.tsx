import { Media } from '../components/Media';
import { Reveal } from '../components/Reveal';
import { useLocale } from '../state/locale';

/**
 * The first bright section. Flipping to document stock here does two things:
 * it separates the argument from the product, and it gives the page a value
 * contrast that dark-on-dark sections cannot.
 */
export function Problem() {
  const { copy } = useLocale();
  const problem = copy.problem;
  const markers = [
    { colour: 'var(--color-way-yellow)', left: '48.2%', top: '27.3%' },
    { colour: 'var(--color-way-blue)', left: '32.1%', top: '52.9%' },
    { colour: 'var(--color-way-red)', left: '64.8%', top: '52.9%' },
  ];
  return (
    <section id="problem" className="relative z-20 bg-paper text-paper-ink">
      <div className="measure py-24 md:py-36">
        <div className="grid gap-y-14 md:grid-12">
          <Reveal className="md:col-span-7">
            <h2 className="type-h2">{problem.heading}</h2>
            <p className="mt-8 max-w-[46ch] text-lead text-paper-muted">{problem.body}</p>
          </Reveal>

          <Reveal step={1} className="md:col-span-5 md:pt-3">
            <figure>
              <div className="relative">
                <Media
                  name="helmet-contamination"
                  alt={problem.imageAlt}
                  sizes="(max-width: 768px) 92vw, 34vw"
                  className="border border-[color:var(--rule-paper)]"
                />
                {markers.map((marker, i) => (
                  <span
                    key={marker.colour}
                    className="contamination-marker absolute size-6 rounded-full border-2 border-paper md:size-8"
                    style={{ color: marker.colour, left: marker.left, top: marker.top, animationDelay: `${i * 0.34}s` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <ul className="mt-4 grid border-t border-t-[color:var(--rule-paper)] sm:grid-cols-3">
                {problem.labels.map((label, i) => (
                  <li
                    key={label}
                    className={`type-data flex items-center gap-3 border-b border-b-[color:var(--rule-paper)] py-3 text-paper-muted ${
                      i > 0 ? 'sm:border-l sm:pl-4' : ''
                    }`}
                  >
                    <span
                      className="contamination-key size-4 shrink-0 rounded-full"
                      style={{ color: markers[i].colour, animationDelay: `${i * 0.34}s` }}
                      aria-hidden="true"
                    />
                    {label}
                  </li>
                ))}
              </ul>
              <figcaption className="mt-4 max-w-[42ch] text-ui leading-relaxed text-paper-muted">
                <span className="font-display font-semibold text-paper-ink">{problem.captionTitle}.</span>{' '}
                {problem.captionBody}
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/*
          Unequal columns follow claim weight, but the third figure is a word
          (“Manual”), not a short numeral, so it gets four columns and 10×
          takes three.
        */}
        <dl className="mt-20 grid gap-y-10 border-t border-t-[color:var(--rule-paper)] pt-10 md:mt-28 md:grid-12">
          {problem.stats.map((stat, i) => (
            <Reveal
              key={stat.figure}
              step={i}
              className={
                i === 0
                  ? 'figure-slot md:col-span-5'
                  : i === 1
                    ? 'figure-slot md:col-span-3 md:border-l md:border-l-[color:var(--rule-paper)] md:pl-10'
                    : 'figure-slot md:col-span-4 md:border-l md:border-l-[color:var(--rule-paper)] md:pl-10'
              }
            >
              <dt className="type-figure text-[clamp(2.5rem,22cqi,6.5rem)] text-paper-ink">{stat.figure}</dt>
              <dd>
                <p className="type-data mt-3 text-paper-ink">{stat.unit}</p>
                <p className="mt-4 max-w-[34ch] text-ui leading-relaxed text-paper-muted">{stat.note}</p>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
