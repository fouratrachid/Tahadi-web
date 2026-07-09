import { Button } from '@/components/Button';
import { AR } from '@/i18n/ar';
import { useImposterStore } from '@/imposter/store/imposterStore';

/** Shown when a double-imposter game catches one imposter but another remains at large. */
export function CaughtScreen() {
  const round = useImposterStore((s) => s.round);
  const continueVoting = useImposterStore((s) => s.continueVoting);

  if (!round || round.eliminated == null) return null;
  const names = round.config.players.map((p) => p.trim()).filter(Boolean);
  const eliminatedName = names[round.eliminated];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <span className="text-5xl">🕵️</span>
      <div className="border-line bg-surface flex w-full flex-col items-center gap-2 rounded-2xl border p-6">
        <p className="text-txt2 font-bold">{AR.imposter.caught.eliminated(eliminatedName)}</p>
        <p className="text-accent text-xl font-black">{AR.imposter.caught.wasImposter}</p>
      </div>
      <p className="text-txt2 max-w-xs font-bold">{AR.imposter.caught.subtitle}</p>
      <div className="w-full pt-2">
        <Button big variant="amber" onClick={continueVoting}>
          {AR.imposter.caught.continueVoting}
        </Button>
      </div>
    </main>
  );
}
