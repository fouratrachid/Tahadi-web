/**
 * Bundled Imposter word datasets. Vite eagerly imports every JSON file in
 * imposter/data at build time — no network requests, fully offline.
 */

import type { ImposterCategory, ImposterDifficulty, WordEntry } from '@/imposter/types';

export const IMPOSTER_CATEGORIES: ImposterCategory[] = [
  'football',
  'movies',
  'anime',
  'tunisia',
  'geography',
  'history',
  'politics',
  'general',
  'food',
  'technology',
  'animals',
  'brands',
];

const modules = import.meta.glob('../data/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Omit<WordEntry, 'category'>[]>;

const WORDS: Record<ImposterCategory, WordEntry[]> = {} as Record<ImposterCategory, WordEntry[]>;
for (const [path, entries] of Object.entries(modules)) {
  const category = path.split('/').pop()!.replace(/\.json$/, '') as ImposterCategory;
  WORDS[category] = entries.map((e) => ({ ...e, category }));
}

export function getWords(category: ImposterCategory): WordEntry[] {
  return WORDS[category] ?? [];
}

export function categoryWordCount(category: ImposterCategory): number {
  return getWords(category).length;
}

/** Uniform random pick, optionally filtered by difficulty and excluding recently-used ids. */
export function pickWord(
  category: ImposterCategory,
  difficulty: ImposterDifficulty | 'mixed',
  excludeIds: ReadonlySet<string>,
): WordEntry | null {
  let pool = getWords(category);
  if (difficulty !== 'mixed') pool = pool.filter((w) => w.difficulty === difficulty);
  let fresh = pool.filter((w) => !excludeIds.has(w.id));
  if (fresh.length === 0) fresh = pool; // exhausted: allow repeats rather than failing
  if (fresh.length === 0) return null;
  return fresh[Math.floor(Math.random() * fresh.length)];
}

/**
 * Pick a fake word related to `entry`, respecting difficulty: easy = furthest
 * related word (most obviously different), hard = closest (index 0).
 */
export function pickFakeWord(entry: WordEntry, difficulty: ImposterDifficulty | 'mixed'): string {
  const related = entry.relatedWords.filter((w) => w !== entry.word);
  if (related.length === 0) return entry.word;
  if (difficulty === 'easy') return related[related.length - 1];
  if (difficulty === 'hard') return related[0];
  return related[Math.floor(Math.random() * related.length)];
}

export function pickRandomCategory(): ImposterCategory {
  return IMPOSTER_CATEGORIES[Math.floor(Math.random() * IMPOSTER_CATEGORIES.length)];
}
