import { useState, type FormEvent } from 'react';
import { Reveal } from '../components/Reveal';
import { ActionButton, FinishPicker, SectionHead } from '../components/ui';
import { colorways, company } from '../lib/content';
import { useStage } from '../state/stage';
import { useLocale } from '../state/locale';

/**
 * Demo request form.
 *
 * With no server in this project, submission has an honest fallback: if a
 * collection endpoint is configured it is POSTed to, and if not the form hands
 * a fully composed message to the visitor's mail client and says so. It never
 * pretends to have sent something it did not send.
 */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

type Status = 'idle' | 'sending' | 'sent' | 'handed-off' | 'error';

export function Demo() {
  const { copy } = useLocale();
  const demoCopy = copy.demo;
  const { colorway, setColorway } = useStage();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const finish = colorways.find((c) => c.id === colorway) ?? colorways[0];
  const finishName = copy.colours.names[finish.id];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    const found: Record<string, string> = {};
    if (!data.name?.trim()) found.name = demoCopy.errors.name;
    if (!/^[\d\s+\-()]{7,}$/.test(data.phone ?? '')) found.phone = demoCopy.errors.phone;
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) found.email = demoCopy.errors.email;
    if (!data.city?.trim()) found.city = demoCopy.errors.city;
    setErrors(found);
    if (Object.keys(found).length > 0) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }

    const summary = [
      `Name: ${data.name}`,
      data.organisation ? `Organisation: ${data.organisation}` : null,
      `Phone: ${data.phone}`,
      data.email ? `Email: ${data.email}` : null,
      `City: ${data.city}`,
      `Location type: ${data.locationType}`,
      `Preferred finish: ${finishName}`,
      '',
      data.message || '(no additional message)',
    ]
      .filter(Boolean)
      .join('\n');

    if (ENDPOINT) {
      setStatus('sending');
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, finish: finishName, summary }),
        });
        if (!res.ok) throw new Error(String(res.status));
        setStatus('sent');
        form.reset();
      } catch {
        setStatus('error');
      }
      return;
    }

    window.location.href =
      `mailto:${company.emails[0]}` +
      `?subject=${encodeURIComponent(`Freshpods demo request, ${data.city}`)}` +
      `&body=${encodeURIComponent(summary)}`;
    setStatus('handed-off');
  }

  if (status === 'sent') {
    return (
      <ContactShell>
        <Confirmation
          title={demoCopy.status.sentTitle}
          body={`${demoCopy.status.sent} ${company.mobiles[0]}.`}
          onReset={() => setStatus('idle')}
        />
      </ContactShell>
    );
  }

  return (
    <ContactShell>
      <Reveal step={1} className="md:col-span-6 md:col-start-7">
        <form onSubmit={onSubmit} noValidate className="border-t pt-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={demoCopy.form.name} name="name" error={errors.name} autoComplete="name" required />
            <Field label={demoCopy.form.organisation} name="organisation" hint={demoCopy.form.optional} autoComplete="organization" />
            <Field label={demoCopy.form.phone} name="phone" type="tel" error={errors.phone} autoComplete="tel" required />
            <Field label={demoCopy.form.email} name="email" type="email" hint={demoCopy.form.optional} error={errors.email} autoComplete="email" />
            <Field label={demoCopy.form.city} name="city" error={errors.city} autoComplete="address-level2" required />
            <label className="block">
              <span className="type-data mb-2 block text-fg-muted">{demoCopy.form.locationType}</span>
              <select name="locationType" defaultValue={demoCopy.locationTypes[0]} className="field">
                {demoCopy.locationTypes.map((t) => (
                  <option key={t} value={t} className="bg-ink-900">
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-5 block">
              <span className="type-data mb-2 block text-fg-muted">{demoCopy.form.notes}</span>
            <textarea name="message" rows={4} className="field resize-y font-body" style={{ fontWeight: 420 }} />
          </label>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-6 border-t pt-7">
            <div>
              <span className="type-data mb-3 block text-fg-muted">{demoCopy.form.preferredFinish}</span>
              <FinishPicker value={colorway} onChange={setColorway} showNames={false} />
              <span className="type-data mt-2 block text-fg-dim">{finishName}</span>
            </div>
            <ActionButton type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? demoCopy.form.sending : ENDPOINT ? demoCopy.form.request : demoCopy.form.openEmail}
            </ActionButton>
          </div>

          <p aria-live="polite" className="mt-5 text-ui leading-relaxed text-fg-dim">
            {status === 'error'
              ? `${demoCopy.status.error} ${company.mobiles[0]} · ${company.emails[0]}`
              : status === 'handed-off'
                ? `${demoCopy.status.handedOff} ${company.emails[0]}`
                : ENDPOINT
                  ? demoCopy.status.endpoint
                  : demoCopy.status.mailto}
          </p>
        </form>
      </Reveal>
    </ContactShell>
  );
}

/** Left column of the contact section: the ways to reach a human directly. */
function ContactShell({ children }: { children: React.ReactNode }) {
  const { copy } = useLocale();
  const demoCopy = copy.demo;
  return (
    <section id="demo" className="grain relative z-20 bg-ink-950">
      <div className="measure py-20 md:py-24">
        <SectionHead title={demoCopy.heading} rule={false} />
        <div className="mt-12 grid gap-y-16 md:mt-16 md:grid-12">
          {/*
            Sticky beside the taller form, so the phone number stays in reach for
            anyone who would rather call than type — and so the column does not
            end in a stretch of empty background.
          */}
          <Reveal className="md:col-span-5 md:sticky md:top-28 md:self-start">
            <dl className="border-t">
              <ContactRow label={demoCopy.contact.call}>
                {[...company.phones, ...company.mobiles].map((n) => (
                  <a key={n} href={`tel:${n.replace(/[^\d+]/g, '')}`} className="link-rule block">
                    {n}
                  </a>
                ))}
              </ContactRow>
              <ContactRow label={demoCopy.contact.email}>
                {company.emails.map((e) => (
                  <a key={e} href={`mailto:${e}`} className="link-rule block break-all">
                    {e}
                  </a>
                ))}
              </ContactRow>
              <ContactRow label={demoCopy.contact.office}>
                <span className="block">{copy.company.address}</span>
              </ContactRow>
              <ContactRow label={demoCopy.contact.follow}>
                <SocialLinks />
              </ContactRow>
            </dl>
          </Reveal>
          {children}
        </div>
      </div>
    </section>
  );
}

function SocialLinks() {
  const { copy } = useLocale();
  return (
    <div className="flex flex-wrap gap-3" aria-label={copy.a11y.socialLinks}>
      {company.socials.map((social) => {
        const id = social.label.toLowerCase();
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={social.label}
            title={social.label}
            className="grid size-11 place-items-center border border-ink-600 text-fg transition-colors duration-200 hover:border-teal-300 hover:text-teal-300"
          >
            <SocialIcon id={id} />
          </a>
        );
      })}
    </div>
  );
}

function SocialIcon({ id }: { id: string }) {
  if (id === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.6" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (id === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor">
        <path d="M14.2 3h3.1c.3 2 1.5 3.3 3.7 3.7v3.1a8.3 8.3 0 0 1-3.7-1.2v6.3a6 6 0 1 1-5.9-6v3.2a2.8 2.8 0 1 0 2.8 2.8V3Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor">
      <path d="M13.8 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.7-.1-1.5-.2-2.3-.2-2.3 0-4 1.4-4 4.1v2.3H8V13h2.7v8h3.1Z" />
    </svg>
  );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
      <dt className="type-data text-fg-dim">{label}</dt>
      <dd className="type-data leading-relaxed text-fg">{children}</dd>
    </div>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  type = 'text',
  ...rest
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  type?: string;
} & React.ComponentPropsWithoutRef<'input'>) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <label className="block">
      {/* Wraps rather than overflowing when the field is in a narrow column. */}
      <span className="type-data mb-2 flex flex-wrap items-baseline justify-between gap-x-3 text-fg-muted">
        {label}
        {hint && !error ? <span className="text-fg-dim">{hint}</span> : null}
      </span>
      <input
        name={name}
        type={type}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error ? (
        <span id={`${name}-error`} className="type-data mt-2 block text-signal-bright">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Confirmation({ title, body, onReset }: { title: string; body: string; onReset: () => void }) {
  const { copy } = useLocale();
  return (
    <Reveal className="md:col-span-6 md:col-start-7">
      <div className="border-t pt-8">
        <h3 className="type-h3 font-display text-teal-300">{title}</h3>
        <p className="mt-5 max-w-[42ch] text-lead text-fg-muted">{body}</p>
        <button onClick={onReset} className="type-data mt-8 text-fg-muted underline underline-offset-4 hover:text-fg">
          {copy.demo.form.another}
        </button>
      </div>
    </Reveal>
  );
}
