/** Core domain types for the Imposter party game module. */

export type ImposterCategory =
  | 'football'
  | 'movies'
  | 'anime'
  | 'tunisia'
  | 'geography'
  | 'history'
  | 'politics'
  | 'general'
  | 'food'
  | 'technology'
  | 'animals'
  | 'brands';

export type ImposterDifficulty = 'easy' | 'medium' | 'hard';

export interface WordEntry {
  id: string;
  category: ImposterCategory;
  word: string;
  difficulty: ImposterDifficulty;
  /** Related words for Fake Word mode, ordered closest-meaning first. */
  relatedWords: string[];
}

export type ImposterMode = 'classic' | 'double' | 'fakeWord';

export type Role = 'normal' | 'imposter' | 'fake';

export interface ImposterConfig {
  players: string[];
  category: ImposterCategory | 'random';
  difficulty: ImposterDifficulty | 'mixed';
  mode: ImposterMode;
  imposterCount: 1 | 2;
  timerSec: 60 | 120 | 300;
  customWord: string | null;
}

export type ImposterPhase =
  | 'home'
  | 'setup'
  | 'reveal'
  | 'discussion'
  | 'voting'
  | 'result';

export interface ImposterRound {
  config: ImposterConfig;
  word: string;
  fakeWord: string | null;
  roles: Role[];
  revealIndex: number;
  revealed: boolean;
  votes: number[];
  eliminated: number | null;
}

export interface ImposterStats {
  gamesPlayed: number;
  playerWins: number;
  imposterWins: number;
  categoryPlays: Partial<Record<ImposterCategory, number>>;
}
