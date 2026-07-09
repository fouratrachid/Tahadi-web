import { useEffect } from 'react';

import { Button } from '@/components/Button';
import { AR, toAr } from '@/i18n/ar';
import { selectCurrentPlayerName, selectCurrentRole, useImposterStore } from '@/imposter/store/imposterStore';

/** Card-flip reveal with a blur cover screen; role data only ever renders for the current index. */
export function RevealScreen() {
  const round = useImposterStore((s) => s.round);
  const revealCurrent = useImposterStore((s) => s.revealCurrent);
  const hideAndPass = useImposterStore((s) => s.hideAndPass);
  const role = useImposterStore(selectCurrentRole);
  const name = useImposterStore(selectCurrentPlayerName);

  // Block accidental back-navigation while roles are being revealed.
  useEffect(() => {
    history.pushState(null, '', location.href);
    const onPop = (): void => {
      history.pushState(null, '', location.href);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (!round) return null;
  const total = round.roles.length;
  const revealed = round.revealed;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-10">
      <p className="text-txt3 text-sm font-bold">
        {AR.imposter.reveal.progress(round.revealIndex + 1, total)}
      </p>

      {!revealed ? (
        <div className="flex flex-col items-center gap-6">
          <div className="border-accent/50 bg-surface flex size-56 flex-col items-center justify-center gap-3 rounded-3xl border-[3px] shadow-[0_0_40px_-8px_var(--color-accent)]">
            <span className="text-5xl">📱</span>
            <span className="text-txt2 px-4 text-center text-sm font-bold">
              {AR.imposter.reveal.passHint}
            </span>
          </div>
          <h2 className="text-accent text-2xl font-black">{AR.imposter.reveal.passTo(name)}</h2>
          <Button big variant="amber" onClick={revealCurrent}>
            {AR.imposter.reveal.revealBtn}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <SecretCard role={role} word={round.word} fakeWord={round.fakeWord} />
          <Button big onClick={hideAndPass}>
            {AR.imposter.reveal.hideAndPass}
          </Button>
        </div>
      )}

      <p className="text-txt3 text-xs font-bold">{toAr(round.revealIndex + 1)} / {toAr(total)}</p>
    </main>
  );
}

function SecretCard({
  role,
  word,
  fakeWord,
}: {
  role: 'normal' | 'imposter' | 'fake' | null;
  word: string;
  fakeWord: string | null;
}) {
  if (role === 'imposter') {
    return (
      <div className="border-danger bg-surface flex w-72 flex-col items-center gap-3 rounded-3xl border-[3px] p-8 text-center shadow-[0_0_40px_-8px_var(--color-danger)]">
        <span className="text-5xl">🕵️</span>
        <h3 className="text-danger text-xl font-black">{AR.imposter.reveal.imposterTitle}</h3>
        <p className="text-txt2 text-sm font-bold">{AR.imposter.reveal.imposterDesc}</p>
      </div>
    );
  }
  if (role === 'fake') {
    return (
      <div className="border-amber bg-surface flex w-72 flex-col items-center gap-3 rounded-3xl border-[3px] p-8 text-center shadow-[0_0_40px_-8px_var(--color-amber)]">
        <span className="text-5xl">🤫</span>
        <h3 className="text-amber text-xl font-black">{AR.imposter.reveal.fakeTitle}</h3>
        <p className="text-txt2 text-sm font-bold">{AR.imposter.reveal.fakeWord}</p>
        <p className="text-2xl font-black">{fakeWord}</p>
        <p className="text-txt3 text-xs font-semibold">{AR.imposter.reveal.fakeDesc}</p>
      </div>
    );
  }
  return (
    <div className="border-accent bg-surface flex w-72 flex-col items-center gap-3 rounded-3xl border-[3px] p-8 text-center shadow-[0_0_40px_-8px_var(--color-accent)]">
      <span className="text-5xl">✅</span>
      <h3 className="text-accent text-xl font-black">{AR.imposter.reveal.normalTitle}</h3>
      <p className="text-txt2 text-sm font-bold">{AR.imposter.reveal.normalWord}</p>
      <p className="text-2xl font-black">{word}</p>
    </div>
  );
}
