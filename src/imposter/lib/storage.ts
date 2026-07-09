/** localStorage persistence for the Imposter module: remembered players, stats, used-word ids. */

import type { ImposterCategory, ImposterStats } from '@/imposter/types';

const KEYS = {
  players: 'tahadi/imposter/players',
  stats: 'tahadi/imposter/stats',
  usedIds: 'tahadi/imposter/usedIds',
} as const;

const DEFAULT_STATS: ImposterStats = { gamesPlayed: 0, playerWins: 0, imposterWins: 0, categoryPlays: {} };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort
  }
}

export function loadPlayers(): string[] {
  const list = readJson<string[]>(KEYS.players, []);
  return Array.isArray(list) ? list : [];
}

export function savePlayers(players: string[]): void {
  writeJson(KEYS.players, players);
}

export function loadStats(): ImposterStats {
  const s = readJson<Partial<ImposterStats>>(KEYS.stats, DEFAULT_STATS);
  return {
    gamesPlayed: s.gamesPlayed ?? 0,
    playerWins: s.playerWins ?? 0,
    imposterWins: s.imposterWins ?? 0,
    categoryPlays: s.categoryPlays ?? {},
  };
}

export function recordGame(category: ImposterCategory, playersWon: boolean): ImposterStats {
  const stats = loadStats();
  stats.gamesPlayed += 1;
  if (playersWon) stats.playerWins += 1;
  else stats.imposterWins += 1;
  stats.categoryPlays[category] = (stats.categoryPlays[category] ?? 0) + 1;
  writeJson(KEYS.stats, stats);
  return stats;
}

export function loadUsedWordIds(): string[] {
  const list = readJson<string[]>(KEYS.usedIds, []);
  return Array.isArray(list) ? list : [];
}

export function saveUsedWordIds(ids: string[]): void {
  writeJson(KEYS.usedIds, ids.slice(-300));
}
