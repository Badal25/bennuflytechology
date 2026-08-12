/**
 * Social/OG image helpers.
 *
 * CMS images come in arbitrary sizes and aspect ratios, which makes shared
 * links look inconsistent. These helpers route any absolute image URL through
 * the wsrv.nl image CDN, which resizes, crops and re-encodes on the fly and
 * caches the result globally — no server-side image processing required.
 */

const CDN = "https://wsrv.nl/";

/** Social cards are 1.91:1 — the size Facebook, LinkedIn, X and Slack expect. */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export function isAbsoluteUrl(url?: string | null): url is string {
  return !!url && /^https?:\/\//i.test(url);
}

type Opts = {
  width?: number;
  height?: number;
  /** "cover" crops to fill, "contain" pads with a background. */
  fit?: "cover" | "contain";
  quality?: number;
  format?: "jpg" | "png" | "webp";
  /** Background used when padding (hex without #). */
  background?: string;
};

/** Resize + optimize any absolute image URL through the image CDN. */
export function optimizedImageUrl(src?: string | null, opts: Opts = {}): string | null {
  if (!isAbsoluteUrl(src)) return null;
  // Already proxied — don't double-wrap.
  if (src.startsWith(CDN)) return src;

  const {
    width = OG_WIDTH,
    height = OG_HEIGHT,
    fit = "cover",
    quality = 82,
    format = "jpg",
    background = "0B1020",
  } = opts;

  const p = new URLSearchParams({
    url: src.replace(/^https?:\/\//i, ""),
    w: String(width),
    h: String(height),
    fit,
    a: "attention", // smart crop towards the most interesting region
    q: String(quality),
    output: format,
    il: "", // progressive/interlaced encoding
  });
  if (fit === "contain") {
    p.set("cbg", background);
  }
  return `${CDN}?${p.toString()}`;
}

/** 1200x630 social card derived from a CMS image. Returns null when unusable. */
export function socialImageUrl(src?: string | null): string | null {
  return optimizedImageUrl(src, { width: OG_WIDTH, height: OG_HEIGHT, fit: "cover" });
}

/** Optimized in-page image (keeps the 16:9 hero ratio) plus a srcset for retina. */
export function contentImage(src?: string | null, width = 1200) {
  const url = optimizedImageUrl(src, { width, height: Math.round((width * 9) / 16), fit: "cover" });
  if (!url) return null;
  const at = (w: number) =>
    optimizedImageUrl(src, { width: w, height: Math.round((w * 9) / 16), fit: "cover" });
  return {
    src: url,
    srcSet: [640, 960, 1200, 1600]
      .map((w) => `${at(w)} ${w}w`)
      .join(", "),
    sizes: "(min-width: 768px) 768px, 100vw",
  };
}
