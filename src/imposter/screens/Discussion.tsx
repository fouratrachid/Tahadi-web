import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { AR, toAr } from '@/i18n/ar';
import { playSound } from '@/lib/soundManager';
import { useImposterStore } from '@/imposter/store/imposterStore';

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${toAr(m)}:${toAr(s.toString().padStart(2, '0'))}`;
}

export function DiscussionScreen() {
  const round = useImposterStore((s) => s.round);
  const startVoting = useImposterStore((s) => s.startVoting);
  const [remaining, setRemaining] = useState<number>(round?.config.timerSec ?? 120);

  useEffect(() => {
    setRemaining(round?.config.timerSec ?? 120);
  }, [round?.config.timerSec]);

  useEffect(() => {
    if (remaining <= 0) {
      playSound('timeUp');
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  if (!round) return null;
  const names = round.config.players.map((p) => p.trim()).filter(Boolean);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <span className="text-5xl">💬</span>
      <h1 className="text-accent text-2xl font-black">{AR.imposter.discussion.title}</h1>
      <p className="text-txt2 max-w-xs font-bold">{AR.imposter.discussion.subtitle}</p>

      <div className="border-accent bg-surface flex size-32 items-center justify-center rounded-full border-[3px] text-3xl font-black tabular-nums">
        {formatTime(remaining)}
      </div>
      {remaining <= 0 ? (
        <p className="text-danger font-bold">{AR.imposter.discussion.timeUp}</p>
      ) : null}

      <div className="border-line bg-surface w-full rounded-2xl border p-4">
        <h2 className="text-accent mb-1 text-sm font-bold">{AR.imposter.discussion.orderTitle}</h2>
        <p className="text-txt3 mb-3 text-xs font-semibold">{AR.imposter.discussion.orderSubtitle}</p>
        <ol className="flex flex-col gap-2">
          {round.hintOrder.map((playerIndex, i) => (
            <li
              key={playerIndex}
              className="border-line bg-surface-alt flex items-center gap-3 rounded-xl border-[1.5px] px-3 py-2"
            >
              <span className="bg-accent text-bg grid size-7 shrink-0 place-items-center rounded-full text-sm font-black">
                {toAr(i + 1)}
              </span>
              <span className="font-bold">{names[playerIndex]}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="w-full pt-2">
        <Button big variant="amber" onClick={startVoting}>
          {AR.imposter.discussion.startVote}
        </Button>
      </div>
    </main>
  );
}
