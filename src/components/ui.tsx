import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { colorways, type ColorwayId } from '../lib/content';
import { useLocale } from '../state/locale';

/* The site has exactly two button treatments. Anything else is a plain link. */

const base =
  'inline-flex items-center justify-center gap-2.5 rounded-[2px] px-6 py-3.5 font-display text-ui ' +
  'font-semibold tracking-[-0.01em] transition-[background-color,color,border-color,transform] duration-160 ' +
  'ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';

export function ActionButton({
  children,
  variant = 'solid',
  className = '',
  ...rest
}: { children: ReactNode; variant?: 'solid' | 'outline' } & ComponentPropsWithoutRef<'button'>) {
  const look =
    variant === 'solid'
      ? 'bg-signal text-white hover:bg-signal-bright'
      : 'border border-ink-500 text-fg hover:border-teal-300 hover:text-teal-300';
  return (
    <button className={`${base} ${look} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ActionLink({
  children,
  variant = 'solid',
  className = '',
  ...rest
}: { children: ReactNode; variant?: 'solid' | 'outline' } & ComponentPropsWithoutRef<'a'>) {
  const look =
    variant === 'solid'
      ? 'bg-signal text-white hover:bg-signal-bright'
      : 'border border-ink-500 text-fg hover:border-teal-300 hover:text-teal-300';
  return (
    <a className={`${base} ${look} ${className}`} {...rest}>
      {children}
    </a>
  );
}

/**
 * Section heading. The optional hairline is the top edge of a section's grid.
 * Product sections that already have a clear start omit it (`rule={false}`).
 */
export function SectionHead({
  id,
  index,
  title,
  lead,
  tone = 'ink',
  rule = true,
  className = '',
}: {
  id?: string;
  /** Short plain-language section name shown beside the rule. */
  index?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: 'ink' | 'paper';
  /** Hairline above the title. Off where the section already has a clear start. */
  rule?: boolean;
  className?: string;
}) {
  const muted = tone === 'paper' ? 'text-paper-muted' : 'text-fg-muted';
  return (
    <header
      id={id}
      className={`${rule ? 'border-t pt-6 md:pt-8' : ''} ${className}`}
      style={{ scrollMarginTop: '5rem' }}
    >
      {index ? <p className={`type-data mb-10 md:mb-16 ${muted}`}>{index}</p> : null}
      <h2 className="type-h2 max-w-[26ch]">{title}</h2>
      {lead ? <p className={`mt-7 max-w-[54ch] text-lead ${muted}`}>{lead}</p> : null}
    </header>
  );
}

/** Label/value row. Used for every spec, fact and figure on the site. */
export function DataRow({
  label,
  value,
  tone = 'ink',
}: {
  label: string;
  value: ReactNode;
  tone?: 'ink' | 'paper';
}) {
  return (
    <div
      className={`flex flex-col gap-1 border-b py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 ${
        tone === 'paper' ? 'border-b-[color:var(--rule-paper)]' : ''
      }`}
    >
      <dt className={`type-data min-w-0 shrink-0 font-medium sm:max-w-[46%] ${tone === 'paper' ? 'text-paper-muted' : 'text-fg-muted'}`}>
        {label}
      </dt>
      <dd className="type-data min-w-0 text-pretty font-semibold sm:text-right">{value}</dd>
    </div>
  );
}

/**
 * The colourway picker: three dots in the actual cabinet finishes. The dot is
 * the control, the name beside it is the label, and selection is expressed with
 * a ring rather than a checkmark.
 */
export function FinishPicker({
  value,
  onChange,
  showNames = false,
  showSelectedName = false,
  size = 'md',
  direction = 'horizontal',
  className = '',
}: {
  value: ColorwayId;
  onChange: (id: ColorwayId) => void;
  showNames?: boolean;
  /** Name of the active finish, centred under the dots. For stacked pickers. */
  showSelectedName?: boolean;
  size?: 'md' | 'lg';
  direction?: 'horizontal' | 'vertical';
  className?: string;
}) {
  const { copy } = useLocale();
  const dot = size === 'lg' ? 'size-11' : 'size-8';
  const directionClass = direction === 'vertical' ? 'flex-col' : showNames ? 'flex-wrap gap-x-6 gap-y-4' : 'gap-3.5';
  return (
    <div
      className={`flex flex-col ${
        direction === 'horizontal' && (showSelectedName || !showNames) ? 'items-center' : ''
      } ${className}`}
    >
      <div
        role="radiogroup"
        aria-label={copy.a11y.cabinetFinish}
        className={`flex items-center justify-center ${directionClass} ${direction === 'vertical' ? 'gap-4' : ''}`}
      >
        {colorways.map((c) => {
          const active = c.id === value;
          return (
            <button
              key={c.id}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(c.id)}
              title={copy.colours.names[c.id]}
              className="group flex items-center gap-2.5 rounded-full outline-offset-4"
            >
              <span
                className={`${dot} relative grid place-items-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105`}
                style={{ backgroundColor: c.hex }}
              >
                <span
                  className="absolute -inset-[5px] rounded-full border transition-opacity duration-300"
                  style={{ borderColor: c.hex, opacity: active ? 1 : 0 }}
                />
              </span>
              {showNames ? (
                <span
                  className={`type-data whitespace-nowrap transition-colors duration-200 ${
                    active ? 'text-fg' : 'text-fg-dim group-hover:text-fg-muted'
                  }`}
                >
                  {copy.colours.names[c.id]}
                </span>
              ) : (
                <span className="sr-only">{copy.colours.names[c.id]}</span>
              )}
            </button>
          );
        })}
      </div>
      {showSelectedName ? (
        <p className="type-data mt-4 text-fg">{copy.colours.names[value]}</p>
      ) : null}
    </div>
  );
}
