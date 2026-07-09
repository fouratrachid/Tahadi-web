import { Button } from '@/components/Button';
import { AR } from '@/i18n/ar';
import { useImposterStore } from '@/imposter/store/imposterStore';

export function VotingScreen() {
  const round = useImposterStore((s) => s.round);
  const castVote = useImposterStore((s) => s.castVote);
  const finishVoting = useImposterStore((s) => s.finishVoting);

  if (!round) return null;
  const names = round.config.players.map((p) => p.trim()).filter(Boolean);
  const totalVotes = round.votes.reduce((a, b) => a + b, 0);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <h1 className="text-accent text-2xl font-black">{AR.imposter.voting.title}</h1>
        <p className="text-txt2 mt-2 text-sm font-bold">{AR.imposter.voting.subtitle}</p>
        {round.eliminatedIndices.length > 0 ? (
          <p className="text-txt3 mt-1 text-xs font-bold">
            {AR.imposter.voting.alreadyOut(
              round.eliminatedIndices.map((i) => names[i]).join('، '),
            )}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2.5">
        {names.map((name, i) =>
          round.eliminatedIndices.includes(i) ? null : (
            <button
              key={i}
              onClick={() => castVote(i)}
              className="border-line bg-surface hover:bg-surface-alt flex min-h-14 cursor-pointer items-center justify-between rounded-xl border-[1.5px] px-4 font-bold transition active:scale-[0.98]"
            >
              <span>{name}</span>
              {round.votes[i] > 0 ? (
                <span className="bg-accent text-bg grid size-8 place-items-center rounded-full text-sm font-black">
                  {round.votes[i]}
                </span>
              ) : null}
            </button>
          ),
        )}
      </div>

      <Button big variant="amber" disabled={totalVotes === 0} onClick={finishVoting}>
        {AR.imposter.voting.finish}
      </Button>
    </main>
  );
}
