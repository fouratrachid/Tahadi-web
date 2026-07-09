/**
 * Bundled question packs. Vite eagerly imports every JSON file in
 * src/assets/packs at build time — no network requests, fully offline.
 */

import type { Category, ChallengeType, Question } from '@/types';

export const CATEGORIES: Category[] = [
  'football',
  'anime',
  'movies',
  'general',
  'religion',
  'geography',
  'history',
  'tunisia',
  'tunisiaSeries',
  'tunisiaFootball',
];
export const CHALLENGE_TYPES: ChallengeType[] = [
  'speed',
  'whoAmI',
  'reversed',
  'ordering',
  'bell',
];

export function packKey(category: Category, challenge: ChallengeType): string {
  return `${category}.${challenge}`;
}

const modules = import.meta.glob('../assets/packs/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Question[]>;

const PACKS: Record<string, Question[]> = {};
for (const [path, questions] of Object.entries(modules)) {
  // "../assets/packs/football.speed.json" -> "football.speed"
  const key = path.split('/').pop()!.replace(/\.json$/, '');
  PACKS[key] = questions;
}

/** All questions for one pack. */
export function getPack(category: Category, challenge: ChallengeType): Question[] {
  return PACKS[packKey(category, challenge)] ?? [];
}

/** Merged pool across the selected categories for one challenge type. */
export function getPool(
  categories: readonly Category[],
  challenge: ChallengeType,
): Question[] {
  const pool: Question[] = [];
  for (const category of categories) {
    const pack = PACKS[packKey(category, challenge)];
    if (pack) pool.push(...pack);
  }
  return pool;
}

export function categoryTotal(category: Category): number {
  return CHALLENGE_TYPES.reduce((sum, c) => sum + getPack(category, c).length, 0);
}

export function grandTotal(): number {
  return CATEGORIES.reduce((sum, cat) => sum + categoryTotal(cat), 0);
}
