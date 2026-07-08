/**
 * Pure scoring rules for each challenge type.
 */

import type { ChallengeType } from '@/types';

/** Fixed points awarded for a correct answer, per challenge. */
export const CORRECT_POINTS: Record<
  Exclude<ChallengeType, 'whoAmI'>,
  number
> = {
  speed: 10,
  reversed: 15,
  ordering: 20,
  bell: 10,
};

/** whoAmI: guessing earlier (fewer hints revealed) scores more. */
export const WHOAMI_POINTS = [40, 30, 20, 10] as const;

/**
 * Points for a correct whoAmI guess given how many hints are currently
 * revealed (1..4). Clamped defensively.
 */
export function whoAmIPoints(hintsRevealed: number): number {
  const idx = Math.max(1, Math.min(4, Math.floor(hintsRevealed))) - 1;
  return WHOAMI_POINTS[idx];
}

/** Number of shared/turn steps or questions expected per round, by challenge. */
export const ROUND_PLAN = {
  /** Timed rapid-fire pool size selected per player turn.
   *  2 * poolPerTurn must not exceed the per-pack minimum so the two turns
   *  never draw overlapping questions (speed min 60, reversed min 40). */
  speed: { timed: true as const, poolPerTurn: 30 },
  reversed: { timed: true as const, poolPerTurn: 20 },
  /** Untimed, referee-paced: total questions across both players. */
  whoAmI: { timed: false as const, total: 6, perPlayer: 3 },
  ordering: { timed: false as const, total: 6, perPlayer: 3 },
  /** Shared head-to-head questions. */
  bell: { timed: false as const, total: 8 },
} as const;
