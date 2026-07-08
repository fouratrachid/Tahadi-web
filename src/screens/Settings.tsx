import { useState } from 'react';

import type { Nav } from '@/App';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AR } from '@/i18n/ar';
import { hapticSuccess } from '@/lib/haptics';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="border-line flex min-h-14 cursor-pointer items-center justify-between border-b py-2 last:border-b-0">
      <span className="font-bold">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 cursor-pointer rounded-full transition ${
          checked ? 'bg-accent-dark' : 'bg-surface-alt'
        }`}
      >
        <span
          className={`absolute top-1 size-6 rounded-full transition-all ${
            checked ? 'bg-accent start-7' : 'bg-txt3 start-1'
          }`}
        />
      </button>
    </label>
  );
}

export function SettingsScreen({ nav }: { nav: Nav }) {
  const sound = useSettingsStore((s) => s.sound);
  const haptics = useSettingsStore((s) => s.haptics);
  const setSound = useSettingsStore((s) => s.setSound);
  const setHaptics = useSettingsStore((s) => s.setHaptics);
  const resetUsed = useGameStore((s) => s.resetUsed);
  const [resetDone, setResetDone] = useState(false);

  return (
    <main className="mx-auto w-full max-w-xl px-5 pb-10 sm:px-8">
      <ScreenHeader title={AR.settings.title} onBack={() => nav.go('home')} />

      <section className="border-line bg-surface mb-5 rounded-2xl border px-5 py-2">
        <Toggle label={AR.settings.sound} checked={sound} onChange={setSound} />
        <Toggle label={AR.settings.haptics} checked={haptics} onChange={setHaptics} />
      </section>

      <Button
        variant="secondary"
        onClick={() => {
          resetUsed();
          hapticSuccess();
          setResetDone(true);
        }}
      >
        {resetDone ? AR.settings.resetUsedDone : AR.settings.resetUsed}
      </Button>

      <section className="border-line bg-surface mt-5 rounded-2xl border p-5 text-center">
        <p className="text-txt2 text-sm">{AR.settings.about}</p>
        <p className="text-txt3 mt-2 text-xs">{`${AR.settings.version} ١٫٠٫٠`}</p>
      </section>
    </main>
  );
}
