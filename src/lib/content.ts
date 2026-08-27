/**
 * Language-neutral product configuration and contact details. Visitor-facing
 * English and Nepali copy lives in `translations.ts`.
 */

export const company = {
  legalName: 'Gaire Freshpods Pvt. Ltd.',
  name: 'Gaire Freshpods',
  tagline: "Your Helmet's Hygiene Partner",
  role: 'Authorised distributor for Nepal',
  vision: "To be Nepal's leading smart helmet sanitization brand.",
  mission:
    'To make every ride safer, fresher, and germ-free through innovation in automated, contactless disinfection technology.',
  address: {
    line: 'Kalikanagar, Butwal-11',
    district: 'Rupandehi',
    country: 'Nepal',
  },
  registeredAt: 'Butwal-11, Nepal',
  phones: ['071-480283', '071-438283'],
  mobiles: ['9851425337', '9851430337'],
  emails: ['gairefreshpods@gmail.com', 'info.gairefreshpods@gmail.com'],
  socials: [
    { label: 'Instagram', handle: '@gairefreshpod.nepal', href: 'https://www.instagram.com/gairefreshpod.nepal/' },
    { label: 'TikTok', handle: '@gaire.freshpod', href: 'https://www.tiktok.com/@gaire.freshpod' },
    { label: 'Facebook', handle: 'Gaire Freshpods', href: 'https://www.facebook.com/' },
  ],
} as const;

export const colorways = [
  {
    id: 'yellow',
    name: 'Sunflare Yellow',
    hex: '#fdd100',
    /** Linear-space body colour handed to the 3D material. */
    body: '#fbc700',
    image: 'machine-yellow',
    /**
     * Whether the printed graphics are the dark house teal or reversed out to
     * white, following the real cabinets: the two lighter finishes keep the
     * teal, the red one reverses.
     */
    ink: 'dark',
  },
  {
    id: 'blue',
    name: 'Glacier Blue',
    hex: '#14cbd4',
    body: '#0fc3cc',
    image: 'machine-blue',
    ink: 'dark',
  },
  {
    id: 'red',
    name: 'Crimson Red',
    hex: '#e30b10',
    body: '#dd0a0f',
    image: 'machine-red',
    ink: 'light',
  },
] as const;

export type ColorwayId = (typeof colorways)[number]['id'];
