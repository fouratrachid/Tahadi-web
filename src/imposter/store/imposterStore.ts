/**
 * Imposter game store: a small state machine mirroring the trivia gameStore's
 * conventions (Zustand, pure transition helpers, phase guards on every action).
 *
 *   home → setup → reveal → discussion → voting → result
 *
 * Anti-peek: `revealIndex` gates which single player's role is visible; the
 * reveal screen only ever reads `round.roles[round.revealIndex]`.
 */

import { create } from 'zustand';

import { hapticSelect, hapticSuccess } from '@/lib/haptics';
import { playSound } from '@/lib/soundManager';
import { pickFakeWord, pickWord } from '@/imposter/lib/words';
import { loadUsedWordIds, recordGame, saveUsedWordIds } from '@/imposter/lib/storage';
import type { ImposterConfig, ImposterPhase, ImposterRound, Role } from '@/imposter/types';

interface ImposterState {
  phase: ImposterPhase;
  round: ImposterRound | null;
  usedWordIds: string[];

  configure: (config: ImposterConfig) => boolean;
  revealCurrent: () => void;
  hideAndPass: () => void;
  startDiscussion: () => void;
  startVoting: () => void;
  castVote: (playerIndex: number) => void;
  finishVoting: () => void;
  playAgain: () => void;
  changeSettings: () => void;
  backToGames: () => void;
  reset: () => void;
}

function validateConfig(c: ImposterConfig): boolean {
  if (!c || !Array.isArray(c.players)) return false;
  const names = c.players.map((p) => p.trim()).filter(Boolean);
  if (names.length < 3 || names.length > 15) return false;
  if (c.mode === 'classic' && c.imposterCount === 2 && names.length < 6) return false;
  if (!c.customWord && c.category === 'random') return true;
  return true;
}

/** Fisher–Yates shuffle of player indices. */
function shuffledIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildRound(config: ImposterConfig, usedWordIds: string[]): ImposterRound {
  const names = config.players.map((p) => p.trim()).filter(Boolean);
  const n = names.length;
  const excludeIds = new Set(usedWordIds);

  const category = config.category === 'random'
    ? (['football', 'movies', 'anime', 'tunisia', 'geography', 'history', 'politics', 'general', 'food', 'technology', 'animals', 'brands'] as const)[Math.floor(Math.random() * 12)]
    : config.category;

  const entry = config.customWord ? null : pickWord(category, config.difficulty, excludeIds);
  const word = config.customWord?.trim() || entry?.word || 'كلمة';

  const roles: Role[] = new Array(n).fill('normal');
  const order = shuffledIndices(n);
  let fakeWord: string | null = null;

  if (config.mode === 'fakeWord') {
    roles[order[0]] = 'fake';
    fakeWord = entry ? pickFakeWord(entry, config.difficulty) : 'كلمة أخرى';
  } else {
    const impCount = config.mode === 'double' ? 2 : config.imposterCount;
    for (let i = 0; i < Math.min(impCount, n - 1); i++) roles[order[i]] = 'imposter';
  }

  return {
    config,
    word,
    fakeWord,
    roles,
    revealIndex: 0,
    revealed: false,
    votes: new Array(n).fill(0),
    eliminated: null,
  };
}

export const useImposterStore = create<ImposterState>((set, get) => ({
  phase: 'home',
  round: null,
  usedWordIds: loadUsedWordIds(),

  configure: (config) => {
    if (!validateConfig(config)) return false;
    const round = buildRound(config, get().usedWordIds);
    set({ round, phase: 'reveal' });
    return true;
  },

  revealCurrent: () => {
    const s = get();
    if (s.phase !== 'reveal' || !s.round) return;
    hapticSelect();
    set({ round: { ...s.round, revealed: true } });
  },

  hideAndPass: () => {
    const s = get();
    if (s.phase !== 'reveal' || !s.round) return;
    const nextIndex = s.round.revealIndex + 1;
    if (nextIndex >= s.round.roles.length) {
      set({ round: { ...s.round, revealed: false }, phase: 'discussion' });
      return;
    }
    set({ round: { ...s.round, revealIndex: nextIndex, revealed: false } });
  },

  startDiscussion: () => {
    const s = get();
    if (s.phase !== 'reveal' || !s.round) return;
    set({ phase: 'discussion' });
  },

  startVoting: () => {
    const s = get();
    if (s.phase !== 'discussion' || !s.round) return;
    set({ phase: 'voting', round: { ...s.round, votes: new Array(s.round.roles.length).fill(0), eliminated: null } });
  },

  castVote: (playerIndex) => {
    const s = get();
    if (s.phase !== 'voting' || !s.round) return;
    const votes = [...s.round.votes];
    votes[playerIndex] += 1;
    hapticSelect();
    set({ round: { ...s.round, votes } });
  },

  finishVoting: () => {
    const s = get();
    if (s.phase !== 'voting' || !s.round) return;
    const votes = s.round.votes;
    let max = -1;
    let eliminated = -1;
    votes.forEach((v, i) => {
      if (v > max) {
        max = v;
        eliminated = i;
      }
    });
    if (eliminated < 0) eliminated = 0;

    const eliminatedRole = s.round.roles[eliminated];
    const imposterRoles: Role[] = ['imposter', 'fake'];
    const remainingImposters = s.round.roles.filter(
      (r, i) => imposterRoles.includes(r) && i !== eliminated,
    ).length;
    const playersWon = imposterRoles.includes(eliminatedRole) && remainingImposters === 0;

    playSound(playersWon ? 'gameWin' : 'roundWin');
    if (playersWon) hapticSuccess();

    const nextUsedWordIds = [...get().usedWordIds, `${s.round.config.category}:${s.round.word}`];
    saveUsedWordIds(nextUsedWordIds);
    recordGame(s.round.config.category === 'random' ? 'general' : s.round.config.category, playersWon);

    set({
      round: { ...s.round, eliminated },
      usedWordIds: nextUsedWordIds,
      phase: 'result',
    });
  },

  playAgain: () => {
    const s = get();
    if (s.phase !== 'result' || !s.round) return;
    const round = buildRound(s.round.config, get().usedWordIds);
    set({ round, phase: 'reveal' });
  },

  changeSettings: () => {
    set({ phase: 'setup' });
  },

  backToGames: () => {
    set({ phase: 'home', round: null });
  },

  reset: () => {
    set({ phase: 'home', round: null });
  },
}));

export function selectCurrentRole(s: ImposterState): Role | null {
  return s.round ? s.round.roles[s.round.revealIndex] : null;
}

export function selectCurrentPlayerName(s: ImposterState): string {
  if (!s.round) return '';
  const names = s.round.config.players.map((p) => p.trim()).filter(Boolean);
  return names[s.round.revealIndex] ?? '';
}

export function selectWinner(s: ImposterState): 'players' | 'imposter' | null {
  if (s.phase !== 'result' || !s.round || s.round.eliminated == null) return null;
  const role = s.round.roles[s.round.eliminated];
  const remaining = s.round.roles.filter(
    (r, i) => (r === 'imposter' || r === 'fake') && i !== s.round!.eliminated,
  ).length;
  return (role === 'imposter' || role === 'fake') && remaining === 0 ? 'players' : 'imposter';
}
