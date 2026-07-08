/**
 * Tahadi game store: a strict state machine (ported from the mobile app).
 *
 *   idle → setup → roundIntro → playing → betweenTurns → roundResult → finished
 *
 * All game logic lives here; components are presentational. Illegal transitions
 * are no-ops. Timing is timestamp-based (turnEndsAt), so pause/resume and tab
 * switches are exact and drift-free.
 *
 * Only `speed` is a timed per-team turn. Every other challenge (whoAmI,
 * ordering, reversed, bell) presents shared questions: either team may answer,
 * and the referee credits whichever team actually answered. `bell` additionally
 * runs a tabletop buzzer sub-state machine (bellPhase/bellBuzzer) so the phone
 * can be laid flat between the two teams.
 */

import { create } from 'zustand';

import { hapticError, hapticLight, hapticSelect, hapticSuccess } from '@/lib/haptics';
import { CATEGORIES, CHALLENGE_TYPES, getPool, packKey } from '@/lib/packs';
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

/** Tabletop buzzer sub-state for the bell challenge. */
export type BellPhase = 'idle' | 'armed' | 'buzzed' | 'steal';

interface GameState {
  phase: Phase;
  config: GameConfig | null;
  scores: [number, number];
  roundIndex: number;
  roundStartScores: [number, number];

  timedTurns: [Question[], Question[]] | null; // speed only
  steps: Step[] | null; // whoAmI / ordering / reversed / bell (all shared)

  turnPlayer: PlayerIndex; // speed only
  qIndex: number;

  revealedHints: number;
  orderingRevealed: boolean;

  bellPhase: BellPhase;
  bellBuzzer: PlayerIndex | null;
  /** High-res timestamp of the winning tap — later events with an earlier stamp steal the buzzer. */
  bellBuzzTime: number | null;

  turnEndsAt: number | null;
  pausedRemainingMs: number | null;
  isPaused: boolean;

  usedIds: UsedIdsByPack;
  sessionUsed: Set<string>;

  lastRecord: GameRecord | null;

  configureGame: (config: GameConfig) => boolean;
  startRound: () => void;
  startTurn: (player: PlayerIndex) => void; // speed only
  answerCorrect: () => void; // speed only
  awardCorrect: (team: PlayerIndex) => void; // whoAmI / ordering / reversed
  answerWrong: () => void; // speed / whoAmI / ordering / reversed
  skipQuestion: () => void; // every challenge
  revealHint: () => void;
  revealOrder: () => void;
  armBell: () => void;
  buzz: (team: PlayerIndex, timeStamp: number) => void;
  bellJudge: (correct: boolean) => void;
  bellNoOne: () => void;
  endTurn: () => void; // speed only
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
  if (c.categories.length < 1 || c.categories.length > CATEGORIES.length) return false;
  if (c.challenges.length < 1 || c.challenges.length > CHALLENGE_TYPES.length) return false;
  if (new Set(c.challenges).size !== c.challenges.length) return false;
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

function otherPlayer(player: PlayerIndex): PlayerIndex {
  return player === 0 ? 1 : 0;
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

  if (challenge === 'speed') {
    const perTurn = ROUND_PLAN.speed.poolPerTurn;
    timedTurns = [draw(perTurn), draw(perTurn)];
  } else {
    // whoAmI / ordering / reversed / bell: shared questions, either team answers.
    const total = ROUND_PLAN[challenge].total;
    const questions = draw(total);
    steps = questions.map((question) => ({ player: null, question }));
  }

  return {
    timedTurns,
    steps,
    turnPlayer: 0,
    qIndex: 0,
    revealedHints: 1,
    orderingRevealed: false,
    bellPhase: 'idle',
    bellBuzzer: null,
    bellBuzzTime: null,
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
  const reset = {
    revealedHints: 1,
    orderingRevealed: false,
    bellPhase: 'idle' as BellPhase,
    bellBuzzer: null,
    bellBuzzTime: null,
  };
  if (state.qIndex + 1 < total) {
    return { qIndex: state.qIndex + 1, ...reset };
  }
  return {
    phase: 'roundResult',
    turnEndsAt: null,
    pausedRemainingMs: null,
    isPaused: false,
    ...reset,
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
    bellPhase: 'idle',
    bellBuzzer: null,
    bellBuzzTime: null,
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
      if (challenge === 'speed') {
        set({
          phase: 'playing',
          turnPlayer: 0,
          qIndex: 0,
          turnEndsAt: Date.now() + s.config.timerSec * 1000,
          isPaused: false,
          pausedRemainingMs: null,
        });
      } else {
        set({ phase: 'playing', qIndex: 0, bellPhase: 'idle', bellBuzzer: null, bellBuzzTime: null });
      }
    },

    startTurn: (player) => {
      const s = get();
      if (s.phase !== 'playing' && s.phase !== 'betweenTurns') return;
      if (!s.config) return;
      if (challengeOf(s.config, s.roundIndex) !== 'speed') return;
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
      if (challengeOf(s.config, s.roundIndex) !== 'speed') return;
      const scores = addScore(s.scores, s.turnPlayer, CORRECT_POINTS.speed);
      const partial = { scores, ...advanceTimedPartial({ ...s, scores }) };
      playSound('correct');
      hapticSuccess();
      commit(partial, s.phase);
    },

    awardCorrect: (team) => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      const challenge = challengeOf(s.config, s.roundIndex);
      let points: number;
      if (challenge === 'whoAmI') points = whoAmIPoints(s.revealedHints);
      else if (challenge === 'ordering') points = CORRECT_POINTS.ordering;
      else if (challenge === 'reversed') points = CORRECT_POINTS.reversed;
      else return; // bell uses bellJudge
      const scores = addScore(s.scores, team, points);
      const partial = { scores, ...advanceStepPartial(s) };
      playSound('correct');
      hapticSuccess();
      commit(partial, s.phase);
    },

    answerWrong: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      const challenge = challengeOf(s.config, s.roundIndex);
      let partial: Partial<GameState>;
      if (challenge === 'speed') {
        partial = advanceTimedPartial(s);
      } else if (challenge === 'whoAmI' || challenge === 'ordering' || challenge === 'reversed') {
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
      const partial =
        challenge === 'speed' ? advanceTimedPartial(s) : advanceStepPartial(s);
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

    armBell: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      if (challengeOf(s.config, s.roundIndex) !== 'bell') return;
      if (s.bellPhase !== 'idle') return;
      hapticSelect();
      set({ bellPhase: 'armed', bellBuzzer: null, bellBuzzTime: null });
    },

    buzz: (team, timeStamp) => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      if (challengeOf(s.config, s.roundIndex) !== 'bell') return;
      if (s.bellPhase === 'armed') {
        playSound('tick');
        hapticSelect();
        set({ bellPhase: 'buzzed', bellBuzzer: team, bellBuzzTime: timeStamp });
        return;
      }
      // Near-simultaneous taps arrive as separate pointerdown events; if the
      // other team's tap carries an earlier timestamp, it wins the buzzer.
      if (
        s.bellPhase === 'buzzed' &&
        s.bellBuzzer !== team &&
        s.bellBuzzTime != null &&
        timeStamp < s.bellBuzzTime
      ) {
        set({ bellBuzzer: team, bellBuzzTime: timeStamp });
      }
    },

    bellJudge: (correct) => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      if (challengeOf(s.config, s.roundIndex) !== 'bell') return;
      if (s.bellPhase !== 'buzzed' && s.bellPhase !== 'steal') return;
      const team = s.bellBuzzer;
      if (team == null) return;

      if (correct) {
        const scores = addScore(s.scores, team, CORRECT_POINTS.bell);
        playSound('correct');
        hapticSuccess();
        commit({ scores, ...advanceStepPartial(s) }, s.phase);
        return;
      }

      playSound('wrong');
      hapticError();
      if (s.bellPhase === 'buzzed') {
        // First answer was wrong: offer the other team a steal attempt.
        set({ bellPhase: 'steal', bellBuzzer: otherPlayer(team) });
        return;
      }
      // Steal attempt was also wrong: nobody scores, move on.
      commit(advanceStepPartial(s), s.phase);
    },

    bellNoOne: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      if (challengeOf(s.config, s.roundIndex) !== 'bell') return;
      if (s.bellPhase !== 'armed') return;
      hapticLight();
      commit(advanceStepPartial(s), s.phase);
    },

    endTurn: () => {
      const s = get();
      if (s.phase !== 'playing' || !s.config) return;
      if (challengeOf(s.config, s.roundIndex) !== 'speed') return;
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
        bellPhase: 'idle',
        bellBuzzer: null,
        bellBuzzTime: null,
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
  return selectChallenge(s) === 'speed';
}

export function selectCurrentQuestion(s: GameState): Question | null {
  if (selectIsTimed(s)) {
    return s.timedTurns?.[s.turnPlayer]?.[s.qIndex] ?? null;
  }
  return s.steps?.[s.qIndex]?.question ?? null;
}

export function selectActivePlayer(s: GameState): PlayerIndex | null {
  const challenge = selectChallenge(s);
  if (challenge === 'speed') return s.turnPlayer;
  if (challenge === 'bell' && (s.bellPhase === 'buzzed' || s.bellPhase === 'steal')) {
    return s.bellBuzzer;
  }
  return null;
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
