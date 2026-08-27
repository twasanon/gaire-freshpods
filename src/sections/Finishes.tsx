import { Media } from '../components/Media';
import { Reveal } from '../components/Reveal';
import { FinishPicker, SectionHead } from '../components/ui';
import { colorways } from '../lib/content';
import { useViewport } from '../lib/viewport';
import { useStage } from '../state/stage';
import { useLocale } from '../state/locale';

/**
 * The three supplied product photographs, with the selected finish held large
 * and the other two present as companions. Picking a finish here also repaints
 * the live machine in the hero, because both read the same piece of state.
 *
 * Specs live in their own section — this one is colour only.
 */
export function Finishes() {
  const { copy } = useLocale();
  const { colorway, setColorway } = useStage();
  const roomy = useViewport().width >= 640;

  return (
    <section id="colours" className="relative z-20 bg-ink-900">
      <div className="measure py-20 md:py-24">
        <SectionHead title={copy.colours.heading} rule={false} className="text-center [&>h2]:mx-auto" />

        <div className="mt-12 md:mt-16">
          <Reveal className="mx-auto w-full md:w-[58%]">
            <ul className="grid grid-cols-3 items-end gap-3 sm:gap-6">
              {colorways.map((c) => {
                const isActive = c.id === colorway;
                return (
                  <li key={c.id} className="min-w-0">
                    <button
                      onClick={() => setColorway(c.id)}
                      aria-pressed={isActive}
                      className="block w-full origin-bottom transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]"
                      style={{ transform: `scale(${isActive ? 1 : 0.78})`, opacity: isActive ? 1 : 0.42 }}
                    >
                      <Media
                        name={c.image}
                        alt={`${copy.colours.machineAlt} ${copy.colours.names[c.id]}`}
                        sizes="(max-width: 768px) 30vw, 22vw"
                      />
                      <span className="sr-only">
                        {copy.a11y.selectFinish} {copy.colours.names[c.id]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 flex justify-center border-t pt-8">
              <FinishPicker
                value={colorway}
                onChange={setColorway}
                size="lg"
                showNames={roomy}
                showSelectedName={!roomy}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
