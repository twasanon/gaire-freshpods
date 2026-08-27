import { useState } from 'react';
import { media, type MediaName } from '../generated/media';

type Props = {
  name: MediaName;
  alt: string;
  /** Passed straight to the `sizes` attribute — always set it deliberately. */
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Reserve the box via aspect-ratio. Off when a parent already fixes height. */
  reserve?: boolean;
};

/**
 * Responsive image with AVIF/WebP sources and an inlined 20px placeholder, so
 * the layout has its final size on the very first paint and never shifts.
 */
export function Media({ name, alt, sizes, className = '', priority = false, reserve = true }: Props) {
  const entry = media[name];
  const [loaded, setLoaded] = useState(false);
  const srcSet = (ext: string) => entry.widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(', ');
  const fallbackWidth = entry.widths[entry.widths.length - 1];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={reserve ? { aspectRatio: String(entry.aspect) } : undefined}
    >
      <img
        src={entry.lqip}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-contain blur-xl transition-opacity duration-700"
        style={{ opacity: loaded ? 0 : 1 }}
      />
      {/*
        `picture` is inline by default, which leaves the image without a definite
        box to size against — the intrinsic width then leaks out as the min-content
        width and can force a flex parent wider than the viewport.
      */}
      <picture className="block h-full w-full">
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
        <img
          src={`/img/${name}-${fallbackWidth}.webp`}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className="relative h-full w-full object-contain transition-opacity duration-500"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      </picture>
    </div>
  );
}
