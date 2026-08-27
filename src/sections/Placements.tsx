import { Media } from '../components/Media';
import { Reveal } from '../components/Reveal';
import { SectionHead } from '../components/ui';
import type { MediaName } from '../generated/media';
import { useLocale } from '../state/locale';

export function Placements() {
  const { copy } = useLocale();
  const placements = copy.placements;
  return (
    <section className="relative z-20 bg-ink-900">
      <div className="measure py-20 md:py-24">
        <SectionHead title={placements.heading} rule={false} />

        {/*
          Six contexts on a ruled grid. The rules are the layout — no cards, no
          shadows, and the photographs stay small because the label is the point.
        */}
        <ul className="mt-12 grid border-t sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {placements.items.map((item, i) => (
            <Reveal
              key={item.key}
              as="li"
              step={i % 3}
              className={`flex items-center gap-6 border-b py-7 sm:odd:pr-8 sm:even:border-l sm:even:pl-8 lg:even:border-l-0 lg:even:pl-0 lg:[&:nth-child(3n+2)]:border-l lg:[&:nth-child(3n+2)]:pl-8 lg:[&:nth-child(3n+3)]:border-l lg:[&:nth-child(3n+3)]:pl-8`}
            >
              <Media
                name={`place-${item.key}` as MediaName}
                alt=""
                sizes="88px"
                className="w-[88px] shrink-0 border"
              />
              <div>
                <h3 className="font-display text-[1.3125rem] font-bold leading-tight tracking-[-0.02em]">
                  {item.name}
                </h3>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
