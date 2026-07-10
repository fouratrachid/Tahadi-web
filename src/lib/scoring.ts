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
export const WHOAMI_POINTS = [20, 15, 10, 5] as const;

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
  /** Timed rapid-fire pool size selected per player turn. */
  speed: { timed: true as const, poolPerTurn: 30 },
  /** Untimed, referee-paced, shared: any team may answer. */
  reversed: { timed: false as const, total: 10 },
  whoAmI: { timed: false as const, total: 6 },
  ordering: { timed: false as const, total: 6 },
  /** Shared head-to-head questions (tabletop buzzer). */
  bell: { timed: false as const, total: 8 },
} as const;

/** Number of *resolved* (non-skipped) questions a steps-based round needs. */
export function stepsTarget(challenge: ChallengeType): number {
  const plan = ROUND_PLAN[challenge];
  return 'total' in plan ? plan.total : 0;
}
