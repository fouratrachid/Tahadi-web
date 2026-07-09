import { useState } from 'react';

import type { Nav } from '@/App';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AR } from '@/i18n/ar';
import { useImposterStore } from '@/imposter/store/imposterStore';
import { loadStats } from '@/imposter/lib/storage';

export function ImposterHomeScreen({ nav }: { nav: Nav }) {
  const goSetup = useImposterStore((s) => s.changeSettings);
  const [showRules, setShowRules] = useState(false);
  const stats = loadStats();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-between px-6 py-10 sm:py-14">
      <ScreenHeader title="" onBack={() => nav.go('home')} />

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <span className="text-6xl">🕵️</span>
        <h1 className="text-accent text-4xl font-black">{AR.imposter.home.title}</h1>
        <p className="max-w-xs text-center text-lg font-bold">{AR.imposter.home.tagline}</p>

        {stats.gamesPlayed > 0 ? (
          <div className="border-line bg-surface mt-2 flex gap-4 rounded-xl border px-4 py-2 text-xs font-bold">
            <span>{AR.imposter.stats.gamesPlayed}: {stats.gamesPlayed}</span>
            <span>{AR.imposter.stats.playerWins}: {stats.playerWins}</span>
            <span>{AR.imposter.stats.imposterWins}: {stats.imposterWins}</span>
          </div>
        ) : null}

        {showRules ? (
          <div className="border-line bg-surface mt-2 rounded-2xl border p-4 text-sm font-semibold leading-relaxed">
            {AR.imposter.home.rulesText}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 pb-4">
        <Button big variant="amber" onClick={goSetup}>
          {AR.imposter.home.start}
        </Button>
        <Button variant="secondary" onClick={() => setShowRules((v) => !v)}>
          {AR.imposter.home.howToPlay}
        </Button>
      </div>
    </main>
  );
}
