import { Reveal } from '../components/Reveal';
import { DataRow, SectionHead } from '../components/ui';
import { useLocale } from '../state/locale';

export function Specs() {
  const { copy } = useLocale();
  const specs = copy.specs;
  const half = Math.ceil(specs.rows.length / 2);
  const columns = [specs.rows.slice(0, half), specs.rows.slice(half)];

  return (
    <section id="specs" className="relative z-20 bg-ink-850">
      <div className="measure py-20 md:py-24">
        <SectionHead title={specs.heading} rule={false} />

        <div className="mt-12 grid gap-x-12 gap-y-0 md:mt-16 md:grid-cols-2">
          {columns.map((column, ci) => (
            <Reveal key={ci} step={ci} as="dl" className="border-t">
              {column.map((row) => (
                <DataRow key={row.label} label={row.label} value={row.value} />
              ))}
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-y-12 md:mt-20 md:grid-12">
          {specs.callouts.map((callout, i) => (
            <Reveal
              key={callout.title}
              step={i}
              className={`min-w-0 ${i === 0 ? 'md:col-span-4' : 'md:col-span-4 md:border-l md:pl-10'}`}
            >
              <h3 className="font-display text-[1.5rem] font-bold tracking-[-0.02em]">{callout.title}</h3>
              <p className="mt-4 max-w-[38ch] text-fg-muted">{callout.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
