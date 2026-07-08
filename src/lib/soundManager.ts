/**
 * Web sound-effect manager. WAV files live in public/sounds and are preloaded
 * as HTMLAudioElements; replay resets currentTime. Respects the sound setting.
 */

const NAMES = ['correct', 'wrong', 'tick', 'timeUp', 'roundWin', 'gameWin'] as const;

export type SoundName = (typeof NAMES)[number];

const players = new Map<SoundName, HTMLAudioElement>();
let enabled = true;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

export function initSound(): void {
  if (players.size > 0) return;
  for (const name of NAMES) {
    try {
      const audio = new Audio(`${import.meta.env.BASE_URL}sounds/${name}.wav`);
      audio.preload = 'auto';
      players.set(name, audio);
    } catch {
      // ignore individual load failures
    }
  }
}

export function playSound(name: SoundName): void {
  if (!enabled) return;
  const player = players.get(name);
  if (!player) return;
  try {
    player.currentTime = 0;
    void player.play().catch(() => {
      // Autoplay policies can reject before the first user gesture — ignore.
    });
  } catch {
    // ignore playback errors
  }
}
