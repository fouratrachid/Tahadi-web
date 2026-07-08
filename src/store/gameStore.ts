/**
 * Tahadi game store: a strict state machine (ported from the mobile app).
 *
 *   idle → setup → roundIntro → playing → betweenTurns → roundResult → finished
 *
 * All game logic lives here; components are presentational. Illegal transitions
 * are no-ops. Timing is timestamp-based (turnEndsAt), so pause/resume and tab
 * switches are exact and drift-free.
 */

import { create } from 'zustand';

import { hapticError, hapticLight, hapticSelect, hapticSuccess } from '@/lib/haptics';
import { getPool, packKey } from '@/lib/packs';
import { selectQuestions } from '@/lib/questionSelector';
import { CORRECT_POINTS, ROUND_PLAN, whoAmIPoints } from '@/lib/scoring';
import { playSound } from '@/lib/soundManager';
import { addHistory, clearUsedIds, loadUsedIds, saveUsedIds } from '@/lib/storage';
import type {
  ChallengeType,
  GameConfig,
  GameRecord,
  Phase,
  PlayerIndex,
  Question,
  Step,
  UsedIdsByPack,
} from '@/types';

interface GameState {
  phase: Phase;
  config: GameConfig | null;
  scores: [number, number];
  roundIndex: number;
  roundStartScores: [number, number];

  timedTurns: [Question[], Question[]] | null; // speed / reversed
  steps: Step[] | null; // whoAmI / ordering / bell

  turnPlayer: PlayerIndex;
  qIndex: number;

  revealedHints: number;
  orderingRevealed: boolean;

  turnEndsAt: number | null;
  pausedRemainingMs: number | null;
  isPaused: boolean;

  usedIds: UsedIdsByPack;
  sessionUsed: Set<string>;

  lastRecord: GameRecord | null;

  configureGame: (config: GameConfig) => boolean;
  startRound: () => void;
  startTurn: (player: PlayerIndex) => void;
  answerCorrect: () => void;
  answerWrong: () => void;
  skipQuestion: () => void;
  revealHint: () => void;
  revealOrder: () => void;
  awardBell: (player: PlayerIndex | null) => void;
  endTurn: () => void;
  endRound: () => void;
  nextRound: () => void;
  endGame: () => void;
  rematch: () => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
  resetUsed: () => void;
}

const TIMER_VALUES = [15, 30, 45, 60];

function validateConfig(c: GameConfig): boolean {
  if (!c || !Array.isArray(c.players) || c.players.length !== 2) return false;
  if (!c.players[0]?.trim() || !c.players[1]?.trim()) return false;
  if (c.categories.length < 1 || c.categories.length > 3) return false;
  if (c.challenges.length !== 4 || new Set(c.challenges).size !== 4) return false;
  if (!TIMER_VALUES.includes(c.timerSec)) return false;
  return true;
}

function addScore(
  scores: [number, number],
  player: PlayerIndex,
  points: number,
): [number, number] {
  const next: [number, number] = [scores[0], scores[1]];
  next[player] += points;
  return next;
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function challengeOf(config: GameConfig, roundIndex: number): ChallengeType {
  return config.challenges[roundIndex];
}

/** Build the plan (questions + pointers) for a round, updating used-id tracking. */
function buildRound(
  state: GameState,
  config: GameConfig,
  roundIndex: number,
): Partial<GameState> {
  const challenge = challengeOf(config, roundIndex);
  const pool = getPool(config.categories, challenge);

  // Hard exclusion: never repeat a question within the current game.
  const sessionUsed = new Set(state.sessionUsed);
  const usedIds: UsedIdsByPack = { ...state.usedIds };

  // Soft exclusion: ids used in previous games (persisted per pack).
  const softUsed = new Set<string>();
  for (const category of config.categories) {
    for (const id of usedIds[packKey(category, challenge)] ?? []) softUsed.add(id);
  }

  const markUsed = (questions: Question[]): void => {
    for (const q of questions) {
      sessionUsed.add(q.id);
      const key = packKey(q.category, q.challengeType);
      usedIds[key] = [...(usedIds[key] ?? []), q.id];
    }
  };

  const draw = (count: number): Question[] => {
    const { selected, exhausted } = selectQuestions(
      pool,
      count,
      softUsed,
      Math.random,
      sessionUsed,
    );
    if (exhausted) {
      // Unused questions ran out: reset the persisted used-ids for the packs
      // in play so future games start fresh.
      for (const category of config.categories) {
        usedIds[packKey(category, challenge)] = [];
      }
      softUsed.clear();
    }
    markUsed(selected);
    return selected;
  };

  let timedTurns: [Question[], Question[]] | null = null;
  let steps: Step[] | null = null;

  if (challenge === 'speed' || challenge === 'reversed') {
    const perTurn = ROUND_PLAN[challenge].poolPerTurn;
    timedTurns = [draw(perTurn), draw(perTurn)];
  } else if (challenge === 'bell') {
    const questions = draw(ROUND_PLAN.bell.total);
    steps = questions.map((question) => ({ player: null, question }));
  } else {
    // whoAmI / ordering: alternate players so each gets an equal share.
    const total = ROUND_PLAN[challenge].total;
    const questions = draw(total);
    steps = questions.map((question, i) => ({
      player: (i % 2) as PlayerIndex,
      question,
    }));
  }

  return {
    timedTurns,
    steps,
    turnPlayer: 0,
    qIndex: 0,
    revealedHints: 1,
    orderingRevealed: false,
    usedIds,
    sessionUsed,
    roundStartScores: [state.scores[0], state.scores[1]],
    turnEndsAt: null,
    pausedRemainingMs: null,
    isPaused: false,
  };
}

// ---- transition helpers (pure) ----------------------------------------------

function endTurnPartial(state: GameState): Partial<GameState> {
  const common = { turnEndsAt: null, pausedRemainingMs: null, isPaused: false };
  if (state.turnPlayer === 0) {
    return { ...common, phase: 'betweenTurns' as Phase };
  }
  return { ...common, phase: 'roundResult' as Phase };
}

function advanceTimedPartial(state: GameState): Partial<GameState> {
  const turn = state.timedTurns?.[state.turnPlayer] ?? [];
  if (state.qIndex + 1 < turn.length) {
    return { qIndex: state.qIndex + 1 };
  }
  return endTurnPartial(state);
}

function advanceStepPartial(state: GameState): Partial<GameState> {
  const total = state.steps?.length ?? 0;
  if (state.qIndex + 1 < total) {
    return { qIndex: state.qIndex + 1, revealedHints: 1, orderingRevealed: false };
  }
  return {
    phase: 'roundResult',
    turnEndsAt: null,
    pausedRemainingMs: null,
    isPaused: false,
  };
}

export const useGameStore = create<GameState>((set, get) => {
  const commit = (partial: Partial<GameState>, prevPhase: Phase): void => {
    set(partial);
    const next = partial.phase;
    if (next && next !== prevPhase) {
      if (next === 'roundResult') playSound('roundWin');
      else if (next === 'finished') playSound('gameWin');
    }
  };

  const persistUsed = (): void => {
    saveUsedIds(get().usedIds);
  };

  return {
    phase: 'idle',
    config: null,
    scores: [0, 0],
    roundIndex: 0,
    roundStartScores: [0, 0],
    timedTurns: null,
    steps: null,
    turnPlayer: 0,
    qIndex: 0,
    revealedHints: 1,
    orderingRevealed: false,
    turnEndsAt: null,
    pausedRemainingMs: null,
    isPaused: false,
    usedIds: loadUsedIds(),
    sessionUsed: new Set<string>(),
    lastRecord: null,

    configureGame: (config) => {
      if (get().phase === 'playing') return false;
      if (!validateConfig(config)) return false;
      const base: GameState = {
        ...get(),
        config,
        scores: [0, 0],
        roundIndex: 0,
        sessionUsed: new Set<string>(),
        lastRecord: null,
      };
      const round = buildRound(base, config, 0);
      set({ ...base, ...round, phase: 'roundIntro' });
      persistUsed();
      return true;
    },

    startRound: () => {
      const s = get();
      if (s.phase !== 'roundIntro' || !s.config) return;
      const challenge = challengeOf(s.config, s.roundIndex);
      if (challenge === 'speed' || challenge === 'reversed') {
        set({
          phase: 'playing',
          turnPlayer: 0,
          qIndex: 0,
          turnEndsAt: Date.now() + s.config.timerSec * 1000,
          isPaused: false,
          pausedRemainingMs: null,
        });
      } else {
        set({ phase: 'playing', qIndex: 0 });
      }
    },

    startTurn: (player) => {
      const s = get();
      if (s.phase !== 'playing' && s.phase !== 'betweenTurns') return;
      if (!s.config) return;
      const challenge = challengeOf(s.config, s.roundIndex);
      if (challenge !== 'speed' && challenge !== 'reversed') return;
      set({
        phase: 'playing',
        turnPlayer: player,
        qIndex: 0,
        turnEndsAt: Date.now() + s.config.timerSec * 1000,
        isPaused: false,
        pausedRemainingMs: null,
      });
    },

    answerCorrect: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      const challenge = challengeOf(s.config, s.roundIndex);
      let partial: Partial<GameState>;
      if (challenge === 'speed' || challenge === 'reversed') {
        const scores = addScore(s.scores, s.turnPlayer, CORRECT_POINTS[challenge]);
        partial = { scores, ...advanceTimedPartial({ ...s, scores }) };
      } else if (challenge === 'whoAmI') {
        const player = s.steps?.[s.qIndex].player;
        if (player == null) return;
        const scores = addScore(s.scores, player, whoAmIPoints(s.revealedHints));
        partial = { scores, ...advanceStepPartial(s) };
      } else if (challenge === 'ordering') {
        const player = s.steps?.[s.qIndex].player;
        if (player == null) return;
        const scores = addScore(s.scores, player, CORRECT_POINTS.ordering);
        partial = { scores, ...advanceStepPartial(s) };
      } else {
        return; // bell uses awardBell
      }
      playSound('correct');
      hapticSuccess();
      commit(partial, s.phase);
    },

    answerWrong: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      const challenge = challengeOf(s.config, s.roundIndex);
      let partial: Partial<GameState>;
      if (challenge === 'speed' || challenge === 'reversed') {
        partial = advanceTimedPartial(s);
      } else if (challenge === 'whoAmI' || challenge === 'ordering') {
        partial = advanceStepPartial(s);
      } else {
        return;
      }
      playSound('wrong');
      hapticError();
      commit(partial, s.phase);
    },

    skipQuestion: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      const challenge = challengeOf(s.config, s.roundIndex);
      let partial: Partial<GameState>;
      if (challenge === 'speed' || challenge === 'reversed') {
        partial = advanceTimedPartial(s);
      } else if (challenge === 'whoAmI' || challenge === 'ordering') {
        partial = advanceStepPartial(s);
      } else {
        return;
      }
      hapticLight();
      commit(partial, s.phase);
    },

    revealHint: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      if (challengeOf(s.config, s.roundIndex) !== 'whoAmI') return;
      if (s.revealedHints >= 4) return;
      hapticSelect();
      set({ revealedHints: s.revealedHints + 1 });
    },

    revealOrder: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      if (challengeOf(s.config, s.roundIndex) !== 'ordering') return;
      hapticSelect();
      set({ orderingRevealed: true });
    },

    awardBell: (player) => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      if (challengeOf(s.config, s.roundIndex) !== 'bell') return;
      let scores = s.scores;
      if (player != null) {
        scores = addScore(s.scores, player, CORRECT_POINTS.bell);
        playSound('correct');
        hapticSuccess();
      } else {
        hapticLight();
      }
      commit({ scores, ...advanceStepPartial(s) }, s.phase);
    },

    endTurn: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      const challenge = challengeOf(s.config, s.roundIndex);
      if (challenge !== 'speed' && challenge !== 'reversed') return;
      const partial = endTurnPartial(s);
      if (partial.phase === 'betweenTurns') playSound('timeUp');
      commit(partial, s.phase);
    },

    endRound: () => {
      const s = get();
      if (s.phase !== 'playing' && s.phase !== 'betweenTurns') return;
      commit(
        { phase: 'roundResult', turnEndsAt: null, isPaused: false, pausedRemainingMs: null },
        s.phase,
      );
    },

    nextRound: () => {
      const s = get();
      if (s.phase !== 'roundResult' || !s.config) return;
      const next = s.roundIndex + 1;
      if (next >= s.config.challenges.length) {
        get().endGame();
        return;
      }
      const base: GameState = { ...s, roundIndex: next };
      const round = buildRound(base, s.config, next);
      set({ ...base, ...round, phase: 'roundIntro' });
      persistUsed();
    },

    endGame: () => {
      const s = get();
      if (s.phase !== 'roundResult' && s.phase !== 'playing' && s.phase !== 'betweenTurns') {
        return;
      }
      if (!s.config) return;
      const [a, b] = s.scores;
      const winner: PlayerIndex | -1 = a === b ? -1 : a > b ? 0 : 1;
      const record: GameRecord = {
        id: genId(),
        date: Date.now(),
        players: s.config.players,
        scores: [a, b],
        winner,
        categories: s.config.categories,
        challenges: s.config.challenges,
      };
      set({ phase: 'finished', lastRecord: record });
      playSound('gameWin');
      addHistory(record);
    },

    rematch: () => {
      const s = get();
      if (s.phase !== 'finished' || !s.config) return;
      const base: GameState = {
        ...s,
        scores: [0, 0],
        roundIndex: 0,
        // New game: the no-repeat guarantee restarts; previous games' ids stay
        // in the persisted usedIds so fresh questions are still preferred.
        sessionUsed: new Set<string>(),
        lastRecord: null,
      };
      const round = buildRound(base, s.config, 0);
      set({ ...base, ...round, phase: 'roundIntro' });
      persistUsed();
    },

    reset: () => {
      set({
        phase: 'idle',
        config: null,
        scores: [0, 0],
        roundIndex: 0,
        roundStartScores: [0, 0],
        timedTurns: null,
        steps: null,
        turnPlayer: 0,
        qIndex: 0,
        revealedHints: 1,
        orderingRevealed: false,
        turnEndsAt: null,
        pausedRemainingMs: null,
        isPaused: false,
        sessionUsed: new Set<string>(),
        lastRecord: null,
      });
    },

    pause: () => {
      const s = get();
      if (s.phase !== 'playing' || s.isPaused) return;
      const remaining = s.turnEndsAt != null ? Math.max(0, s.turnEndsAt - Date.now()) : null;
      set({ isPaused: true, pausedRemainingMs: remaining, turnEndsAt: null });
    },

    resume: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.isPaused) return;
      const endsAt = s.pausedRemainingMs != null ? Date.now() + s.pausedRemainingMs : null;
      set({ isPaused: false, turnEndsAt: endsAt, pausedRemainingMs: null });
    },

    resetUsed: () => {
      set({ usedIds: {}, sessionUsed: new Set<string>() });
      clearUsedIds();
    },
  };
});

// ---- derived selectors (pure; safe to call with a state snapshot) -----------

export function selectChallenge(s: GameState): ChallengeType | null {
  return s.config ? challengeOf(s.config, s.roundIndex) : null;
}

export function selectIsTimed(s: GameState): boolean {
  const c = selectChallenge(s);
  return c === 'speed' || c === 'reversed';
}

export function selectCurrentQuestion(s: GameState): Question | null {
  if (selectIsTimed(s)) {
    return s.timedTurns?.[s.turnPlayer]?.[s.qIndex] ?? null;
  }
  return s.steps?.[s.qIndex]?.question ?? null;
}

export function selectActivePlayer(s: GameState): PlayerIndex | null {
  if (selectIsTimed(s)) return s.turnPlayer;
  return s.steps?.[s.qIndex]?.player ?? null;
}

export function selectProgress(s: GameState): { index: number; total: number } {
  if (selectIsTimed(s)) {
    return { index: s.qIndex + 1, total: s.timedTurns?.[s.turnPlayer]?.length ?? 0 };
  }
  return { index: s.qIndex + 1, total: s.steps?.length ?? 0 };
}

export function selectRoundDelta(s: GameState): [number, number] {
  return [
    s.scores[0] - s.roundStartScores[0],
    s.scores[1] - s.roundStartScores[1],
  ];
}
