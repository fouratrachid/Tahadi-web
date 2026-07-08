import { useMemo } from 'react';

import type { Nav } from '@/App';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AR, toAr } from '@/i18n/ar';
import { loadHistory } from '@/lib/storage';

const PLAYER_COLORS = ['var(--color-p1)', 'var(--color-p2)'] as const;

function formatDate(ms: number): string {
  const d = new Date(ms);
  return toAr(
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
  );
}

export function HistoryScreen({ nav }: { nav: Nav }) {
  const records = useMemo(loadHistory, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-10 sm:px-8">
      <ScreenHeader title={AR.history.title} onBack={() => nav.go('home')} />

      {records.length === 0 ? (
        <div className="flex flex-col items-center gap-3 pt-20 text-center">
          <span className="text-5xl">🎲</span>
          <p className="text-txt2 font-bold">{AR.history.empty}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {records.map((rec) => {
            const winnerColor =
              rec.winner === -1 ? 'var(--color-amber)' : PLAYER_COLORS[rec.winner];
            return (
              <article
                key={rec.id}
                className="border-line bg-surface rounded-2xl border border-s-4 p-4"
                style={{ borderInlineStartColor: winnerColor }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-bold">
                    {`${rec.players[0]} ${AR.history.vs} ${rec.players[1]}`}
                  </h2>
                  <span className="text-txt3 text-xs">{formatDate(rec.date)}</span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl font-black" style={{ color: PLAYER_COLORS[0] }}>
                    {toAr(rec.scores[0])}
                  </span>
                  <span className="text-sm font-bold" style={{ color: winnerColor }}>
                    {rec.winner === -1 ? AR.history.tie : AR.final.winner(rec.players[rec.winner])}
                  </span>
                  <span className="text-2xl font-black" style={{ color: PLAYER_COLORS[1] }}>
                    {toAr(rec.scores[1])}
                  </span>
                </div>
                <p className="text-txt2 text-xs">
                  {rec.categories.map((c) => AR.categories[c]).join(' · ')}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
