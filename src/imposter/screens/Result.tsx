import type { Nav } from '@/App';
import { Button } from '@/components/Button';
import { AR } from '@/i18n/ar';
import { selectWinner, useImposterStore } from '@/imposter/store/imposterStore';

export function ResultScreen({ nav }: { nav: Nav }) {
  const round = useImposterStore((s) => s.round);
  const playAgain = useImposterStore((s) => s.playAgain);
  const changeSettings = useImposterStore((s) => s.changeSettings);
  const backToGames = useImposterStore((s) => s.backToGames);
  const winner = useImposterStore(selectWinner);

  if (!round || round.eliminated == null) return null;
  const names = round.config.players.map((p) => p.trim()).filter(Boolean);
  const eliminatedName = names[round.eliminated];
  const role = round.roles[round.eliminated];

  const roleLabel =
    role === 'imposter'
      ? AR.imposter.result.wasImposter
      : role === 'fake'
        ? AR.imposter.result.wasFake
        : AR.imposter.result.wasNormal;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <div className="border-line bg-surface flex w-full flex-col items-center gap-2 rounded-2xl border p-6">
        <p className="text-txt2 font-bold">{AR.imposter.result.eliminated(eliminatedName)}</p>
        <p className="text-xl font-black">{roleLabel}</p>
      </div>

      <div className="border-line bg-surface flex w-full flex-col items-center gap-1 rounded-2xl border p-6">
        <p className="text-txt2 text-sm font-bold">{AR.imposter.result.theWordWas}</p>
        <p className="text-2xl font-black">{round.word}</p>
        {round.fakeWord ? (
          <>
            <p className="text-txt2 mt-2 text-sm font-bold">{AR.imposter.result.theFakeWordWas}</p>
            <p className="text-lg font-black">{round.fakeWord}</p>
          </>
        ) : null}
      </div>

      <h2 className={`text-3xl font-black ${winner === 'players' ? 'text-accent' : 'text-danger'}`}>
        {winner === 'players' ? AR.imposter.result.playersWin : AR.imposter.result.imposterWin}
      </h2>

      <div className="flex w-full flex-col gap-3 pt-4">
        <Button big variant="amber" onClick={playAgain}>
          {AR.imposter.result.playAgain}
        </Button>
        <Button variant="secondary" onClick={changeSettings}>
          {AR.imposter.result.changeSettings}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            backToGames();
            nav.go('home');
          }}
        >
          {AR.imposter.result.backToGames}
        </Button>
      </div>
    </main>
  );
}
