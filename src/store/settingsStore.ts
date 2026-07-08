/**
 * Settings store: sound + haptics toggles, persisted to localStorage and
 * mirrored into the sound/haptics managers.
 */

import { create } from 'zustand';

import { setHapticsEnabled } from '@/lib/haptics';
import { setSoundEnabled } from '@/lib/soundManager';
import { loadSettings, saveSettings } from '@/lib/storage';
import type { Settings } from '@/types';

interface SettingsState extends Settings {
  setSound: (value: boolean) => void;
  setHaptics: (value: boolean) => void;
}

const initial = loadSettings();
setSoundEnabled(initial.sound);
setHapticsEnabled(initial.haptics);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...initial,

  setSound: (value) => {
    setSoundEnabled(value);
    set({ sound: value });
    saveSettings({ sound: value, haptics: get().haptics });
  },

  setHaptics: (value) => {
    setHapticsEnabled(value);
    set({ haptics: value });
    saveSettings({ sound: get().sound, haptics: value });
  },
}));
