/**
 * Pure, testable question-selection logic.
 *
 * Two levels of exclusion:
 *  - `hardExcluded`: ids that must NEVER be selected (questions already used in
 *    the current game). Always respected.
 *  - `usedIds` (soft): ids used in previous games (persisted per pack). Unused
 *    questions are always preferred; when they run out the pack is considered
 *    exhausted and the remainder is filled from previously-used questions —
 *    the caller should then clear its persisted used-id record for that pack.
 *
 * A single selection never contains duplicates. RNG is injectable so selection
 * is deterministic in unit tests.
 */

import type { Question } from '@/types';

export type Rng = () => number;

export interface SelectionResult {
  selected: Question[];
  /** True when unused questions ran out and previously-used ones were reused. */
  exhausted: boolean;
}

/** Fisher–Yates shuffle producing a new array; does not mutate input. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function selectQuestions(
  pool: readonly Question[],
  count: number,
  usedIds: ReadonlySet<string>,
  rng: Rng = Math.random,
  hardExcluded: ReadonlySet<string> = new Set(),
): SelectionResult {
  const wanted = Math.max(0, Math.floor(count));
  if (wanted === 0 || pool.length === 0) {
    return { selected: [], exhausted: false };
  }

  // Candidates exclude hard-excluded ids unconditionally.
  const candidates = pool.filter((q) => !hardExcluded.has(q.id));
  const fresh = candidates.filter((q) => !usedIds.has(q.id));

  if (fresh.length >= wanted) {
    return { selected: shuffle(fresh, rng).slice(0, wanted), exhausted: false };
  }

  // Exhausted: take every fresh question first, then fill the remainder from
  // previously-used ones. Capped at the candidate count if the pool is tiny.
  const reusable = candidates.filter((q) => usedIds.has(q.id));
  const fill = shuffle(reusable, rng).slice(0, wanted - fresh.length);
  return { selected: shuffle([...fresh, ...fill], rng), exhausted: true };
}
