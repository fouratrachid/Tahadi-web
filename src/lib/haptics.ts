/**
 * Web haptics via the Vibration API (supported on Android browsers; a silent
 * no-op elsewhere). Respects the haptics setting.
 */

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

function vibrate(pattern: number | number[]): void {
  if (!enabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // unsupported — ignore
  }
}

export function hapticSuccess(): void {
  vibrate([20, 30, 40]);
}

export function hapticError(): void {
  vibrate([60, 40, 60]);
}

export function hapticLight(): void {
  vibrate(12);
}

export function hapticSelect(): void {
  vibrate(8);
}
