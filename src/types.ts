/**
 * Core domain types for Tahadi.
 * The Question shape matches the bundled pack JSON files in assets/packs.
 */

export type Category =
  | 'football'
  | 'anime'
  | 'movies'
  | 'general'
  | 'religion'
  | 'geography'
  | 'history'
  | 'tunisia';

export type ChallengeType = 'speed' | 'whoAmI' | 'reversed' | 'ordering' | 'bell';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: Category;
  challengeType: ChallengeType;
  text: string;
  answer: string;
  /** whoAmI only: exactly 4 progressive hints. */
  hints?: string[];
  /** ordering only: 4–5 items stored in the CORRECT order (shuffled for display). */
  items?: string[];
  /** Optional authoring metadata; not required by game logic. */
  difficulty?: Difficulty;
}

/** Player index. Exactly two contestants. */
export type PlayerIndex = 0 | 1;

export type TimerSeconds = 15 | 30 | 45 | 60;

export interface GameConfig {
  /** Two contestant names. The referee holds the phone. */
  players: [string, string];
  /** 1–3 selected categories. */
  categories: Category[];
  /** Exactly 4 challenge types, in the order they will be played. */
  challenges: ChallengeType[];
  timerSec: TimerSeconds;
}

/** Strict game state-machine phases. */
export type Phase =
  | 'idle'
  | 'setup'
  | 'roundIntro'
  | 'playing'
  | 'betweenTurns'
  | 'roundResult'
  | 'finished';

/**
 * A single referee-paced step for untimed challenges (whoAmI, ordering, bell).
 * `player` is null for shared/head-to-head steps (bell).
 */
export interface Step {
  player: PlayerIndex | null;
  question: Question;
}

export interface GameRecord {
  id: string;
  date: number;
  players: [string, string];
  scores: [number, number];
  /** 0 or 1 for a winner, -1 for a tie. */
  winner: PlayerIndex | -1;
  categories: Category[];
  challenges: ChallengeType[];
}

export interface Settings {
  sound: boolean;
  haptics: boolean;
}

/** Persisted used-question ids, keyed by `${category}.${challengeType}`. */
export type UsedIdsByPack = Record<string, string[]>;
