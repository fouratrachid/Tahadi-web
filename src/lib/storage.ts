/**
 * localStorage persistence: settings, game history, and used-question ids.
 * All reads are defensive (corrupt/missing data returns a safe default).
 */

import type { GameRecord, Settings, UsedIdsByPack } from '@/types';

const KEYS = {
  settings: 'tahadi/settings',
  history: 'tahadi/history',
  usedIds: 'tahadi/usedIds',
} as const;

const HISTORY_LIMIT = 20;

export const DEFAULT_SETTINGS: Settings = { sound: true, haptics: true };

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
    // Persistence is best-effort (e.g. private browsing quota).
  }
}

// ---- Settings ----------------------------------------------------------------

export function loadSettings(): Settings {
  const s = readJson<Partial<Settings>>(KEYS.settings, DEFAULT_SETTINGS);
  return {
    sound: typeof s.sound === 'boolean' ? s.sound : DEFAULT_SETTINGS.sound,
    haptics: typeof s.haptics === 'boolean' ? s.haptics : DEFAULT_SETTINGS.haptics,
  };
}

export function saveSettings(settings: Settings): void {
  writeJson(KEYS.settings, settings);
}

// ---- History -----------------------------------------------------------------

export function loadHistory(): GameRecord[] {
  const list = readJson<GameRecord[]>(KEYS.history, []);
  return Array.isArray(list) ? list : [];
}

/** Prepend a record and keep only the most recent HISTORY_LIMIT games. */
export function addHistory(record: GameRecord): GameRecord[] {
  const next = [record, ...loadHistory()].slice(0, HISTORY_LIMIT);
  writeJson(KEYS.history, next);
  return next;
}

// ---- Used question ids -------------------------------------------------------

export function loadUsedIds(): UsedIdsByPack {
  const map = readJson<UsedIdsByPack>(KEYS.usedIds, {});
  return map && typeof map === 'object' ? map : {};
}

export function saveUsedIds(map: UsedIdsByPack): void {
  writeJson(KEYS.usedIds, map);
}

export function clearUsedIds(): void {
  writeJson(KEYS.usedIds, {});
}
