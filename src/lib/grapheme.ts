/**
 * Grapheme-aware string utilities.
 *
 * The reversed-word challenge must reverse a string by grapheme cluster, not by
 * UTF-16 code unit. This keeps Arabic combining marks (diacritics) attached to
 * their base letter and keeps astral code points (emoji, surrogate pairs)
 * intact. Uses Intl.Segmenter when available (correct Unicode segmentation) and
 * falls back to a manual splitter that handles surrogate pairs, Arabic
 * combining marks, and zero-width joiners.
 */

// Arabic diacritics / combining marks + variation selectors + ZWJ that should
// attach to the preceding base character in the fallback path. Matching lone
// combining marks is intentional here — that's how they get merged into the
// preceding grapheme. (no-misleading-character-class is disabled for this file
// in .oxlintrc.json for that reason.)
const COMBINING =
  /[\u{0610}-\u{061A}\u{064B}-\u{065F}\u{0670}\u{06D6}-\u{06DC}\u{06DF}-\u{06E4}\u{06E7}\u{06E8}\u{06EA}-\u{06ED}\u{200D}\u{FE00}-\u{FE0F}]/u;

type SegmenterCtor = new (
  locale?: string,
  options?: { granularity?: 'grapheme' | 'word' | 'sentence' },
) => { segment: (input: string) => Iterable<{ segment: string }> };

export function toGraphemes(input: string): string[] {
  const IntlAny = Intl as unknown as { Segmenter?: SegmenterCtor };
  if (typeof IntlAny.Segmenter === 'function') {
    try {
      const seg = new IntlAny.Segmenter('ar', { granularity: 'grapheme' });
      const out: string[] = [];
      for (const part of seg.segment(input)) {
        out.push(part.segment);
      }
      return out;
    } catch {
      // fall through to manual splitter
    }
  }
  return fallbackGraphemes(input);
}

function fallbackGraphemes(input: string): string[] {
  // Array.from iterates by code point, so surrogate pairs stay whole.
  const codePoints = Array.from(input);
  const out: string[] = [];
  let prevWasJoiner = false;
  for (const cp of codePoints) {
    const isJoiner = cp === '‍';
    if (out.length > 0 && (COMBINING.test(cp) || prevWasJoiner)) {
      out[out.length - 1] += cp;
    } else {
      out.push(cp);
    }
    prevWasJoiner = isJoiner;
  }
  return out;
}

/** Reverse a string by grapheme cluster. */
export function reverseGraphemes(input: string): string {
  return toGraphemes(input).reverse().join('');
}
