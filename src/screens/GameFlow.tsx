import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import type { Nav } from '@/App';
import { Button } from '@/components/Button';
import { Confetti } from '@/components/Confetti';
import { CountdownRing } from '@/components/CountdownRing';
import { ScoreHeader } from '@/components/ScoreHeader';
import { useGameTimer } from '@/hooks/useGameTimer';
import { AR, toAr } from '@/i18n/ar';
import { reverseGraphemes } from '@/lib/grapheme';
import { shuffle } from '@/lib/questionSelector';
import { WHOAMI_POINTS } from '@/lib/scoring';
import { playSound } from '@/lib/soundManager';
import {
  selectActivePlayer,
  selectChallenge,
  selectCurrentQuestion,
  selectIsTimed,
  selectProgress,
  selectRoundDelta,
  useGameStore,
} from '@/store/gameStore';
import type { ChallengeType, PlayerIndex, Question } from '@/types';

const PLAYER_COLORS = ['var(--color-p1)', 'var(--color-p2)'] as const;

/** Routes the game phases to their screens. */
export function GameFlow({ nav }: { nav: Nav }) {
  const phase = useGameStore((s) => s.phase);
  const config = useGameStore((s) => s.config);

  // A hard refresh or direct visit without a configured game goes home.
  useEffect(() => {
    if (phase === 'idle' || !config) nav.go('home');
  }, [phase, config, nav]);

  if (!config) return null;

  if (phase === 'roundIntro') return <RoundIntro />;
  if (phase === 'playing' || phase === 'betweenTurns') return <Play />;
  if (phase === 'roundResult') return <RoundResult />;
  if (phase === 'finished') return <Final nav={nav} />;
  return null;
}

// ---- Round intro ---------------------------------------------------------------

function RoundIntro() {
  const config = useGameStore((s) => s.config)!;
  const roundIndex = useGameStore((s) => s.roundIndex);
  const challenge = useGameStore(selectChallenge)!;
  const startRound = useGameStore((s) => s.startRound);

  const info = AR.challenges[challenge];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-evenly px-5 py-8">
      <header className="animate-pop-in text-center">
        <p className="text-amber font-bold">
          {AR.roundIntro.round(roundIndex + 1, config.challenges.length)}
        </p>
        <h1 className="mt-1 text-5xl font-black sm:text-6xl">{info.name}</h1>
        <p className="text-txt2 mt-2 font-semibold">{info.short}</p>
      </header>

      <section className="animate-pop-in border-line bg-surface border-s-accent rounded-2xl border border-s-4 p-6"
        style={{ animationDelay: '0.15s' }}
      >
        <p className="text-accent mb-2 text-sm font-bold">{AR.roundIntro.refereeRead}</p>
        <p className="text-lg leading-9 sm:text-xl sm:leading-10">{info.rules}</p>
      </section>

      <div className="animate-pop-in" style={{ animationDelay: '0.3s' }}>
        <Button big onClick={startRound}>
          {AR.roundIntro.begin}
        </Button>
      </div>
    </main>
  );
}

// ---- Play ------------------------------------------------------------------------

function Play() {
  const phase = useGameStore((s) => s.phase);
  const config = useGameStore((s) => s.config)!;
  const scores = useGameStore((s) => s.scores);
  const roundIndex = useGameStore((s) => s.roundIndex);
  const challenge = useGameStore(selectChallenge)!;
  const question = useGameStore(selectCurrentQuestion);
  const activePlayer = useGameStore(selectActivePlayer);
  const progress = useGameStore(useShallow(selectProgress));
  const turnEndsAt = useGameStore((s) => s.turnEndsAt);
  const isPaused = useGameStore((s) => s.isPaused);
  const isTimed = useGameStore(selectIsTimed);

  const startTurn = useGameStore((s) => s.startTurn);
  const endTurn = useGameStore((s) => s.endTurn);
  const pause = useGameStore((s) => s.pause);
  const resume = useGameStore((s) => s.resume);

  // Pause automatically when the tab is hidden mid-turn.
  useEffect(() => {
    const onVisibility = (): void => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pause]);

  const durationMs = config.timerSec * 1000;
  const timerRunning = phase === 'playing' && isTimed && !isPaused && turnEndsAt != null;

  const { progress: ringProgress, secondsLeft } = useGameTimer({
    endsAt: turnEndsAt,
    durationMs,
    running: timerRunning,
    onExpire: () => {
      playSound('timeUp');
      endTurn();
    },
    onTick: () => playSound('tick'),
  });

  const names = config.players;

  if (phase === 'betweenTurns') {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-evenly px-5 py-8">
        <div className="animate-pop-in flex flex-col items-center gap-3 text-center">
          <p className="text-amber text-xl font-bold">{AR.play.timeUp}</p>
          <h2 className="text-4xl font-black sm:text-5xl">{AR.play.getReady(names[1])}</h2>
        </div>
        <Button big onClick={() => startTurn(1)}>
          {AR.play.nextPlayer}
        </Button>
      </main>
    );
  }

  if (!question) return null;

  if (challenge === 'bell') {
    return (
      <BellArena
        names={names}
        scores={scores}
        roundIndex={roundIndex}
        totalRounds={config.challenges.length}
        question={question}
        progress={progress}
        isPaused={isPaused}
        pause={pause}
        resume={resume}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-4 sm:px-6">
      <ScoreHeader
        names={names}
        scores={scores}
        activePlayer={activePlayer}
        centerTop={AR.challenges[challenge].name}
        centerBottom={AR.roundIntro.round(roundIndex + 1, config.challenges.length)}
      />

      {/* Meta row */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={isPaused ? resume : pause}
          className="border-line bg-surface text-amber min-h-9 cursor-pointer rounded-full border px-4 text-sm font-bold"
        >
          {isPaused ? AR.play.resume : AR.play.pause}
        </button>
        <span className="text-txt2 text-sm font-bold">
          {AR.play.questionOf(progress.index, progress.total)}
        </span>
        {activePlayer != null ? (
          <span className="text-sm font-bold" style={{ color: PLAYER_COLORS[activePlayer] }}>
            {AR.play.turnOf(names[activePlayer])}
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Timer */}
      {isTimed ? (
        <div className="mt-4 flex justify-center">
          <CountdownRing progress={ringProgress} seconds={secondsLeft} size={150} />
        </div>
      ) : null}

      {/* Question (dimmed while paused) */}
      <div className={`relative my-4 flex flex-1 items-center transition ${isPaused ? 'opacity-10' : ''}`}>
        <QuestionArea key={question.id} challenge={challenge} question={question} />
      </div>

      {isPaused ? (
        <div className="border-amber bg-surface-alt fixed inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded-2xl border px-10 py-5">
          <p className="text-amber text-xl font-black">{AR.play.paused}</p>
        </div>
      ) : null}

      {/* Referee controls */}
      <div className={isPaused ? 'pointer-events-none' : ''}>
        <Controls challenge={challenge} names={names} />
      </div>
    </main>
  );
}

function QuestionArea({ challenge, question }: { challenge: ChallengeType; question: Question }) {
  const revealedHints = useGameStore((s) => s.revealedHints);
  const orderingRevealed = useGameStore((s) => s.orderingRevealed);

  // Shuffled display order for the ordering challenge, stable per question.
  const shuffledItems = useMemo(
    () => (question.items ? shuffle(question.items) : []),
    [question],
  );

  const card =
    'bg-surface border-line animate-pop-in w-full rounded-2xl border p-6 sm:p-8';
  const answerRow = 'border-line mt-5 border-t pt-4';

  if (challenge === 'whoAmI') {
    return (
      <div className={card}>
        {(question.hints ?? []).slice(0, revealedHints).map((hint, i) => (
          <div key={i} className="animate-pop-in mb-3 flex items-start gap-3">
            <span className="bg-amber text-bg mt-1 grid size-7 shrink-0 place-items-center rounded-full text-sm font-black">
              {toAr(i + 1)}
            </span>
            <p className="text-lg leading-8 sm:text-xl">{hint}</p>
          </div>
        ))}
        <div className={answerRow}>
          <p className="text-amber text-sm font-bold">{`${AR.play.answerLabel}: ${question.answer}`}</p>
        </div>
      </div>
    );
  }

  if (challenge === 'reversed') {
    return (
      <div className={`${card} text-center`}>
        <p className="text-3xl font-black tracking-widest sm:text-4xl" dir="ltr">
          {reverseGraphemes(question.text)}
        </p>
        <div className={answerRow}>
          <p className="text-amber text-sm font-bold">{`${AR.play.answerLabel}: ${question.answer}`}</p>
        </div>
      </div>
    );
  }

  if (challenge === 'ordering') {
    const display = orderingRevealed ? (question.items ?? []) : shuffledItems;
    return (
      <div className={card}>
        <p className="mb-4 text-center text-xl font-bold sm:text-2xl">{question.text}</p>
        {orderingRevealed ? (
          <p className="text-accent mb-2 text-center text-sm font-bold">{AR.play.correctOrder}</p>
        ) : null}
        <ul className="flex flex-col gap-2">
          {display.map((item, i) => (
            <li
              key={`${orderingRevealed}-${i}`}
              className="bg-surface-alt animate-pop-in flex min-h-11 items-center gap-3 rounded-xl px-4 py-2"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {orderingRevealed ? (
                <span className="bg-accent text-bg grid size-7 shrink-0 place-items-center rounded-full text-sm font-black">
                  {toAr(i + 1)}
                </span>
              ) : null}
              <span className="font-semibold">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // speed: plain large question + referee answer
  return (
    <div className={`${card} text-center`}>
      <p className="text-2xl leading-10 font-bold sm:text-3xl sm:leading-12">{question.text}</p>
      <div className={answerRow}>
        <p className="text-amber text-sm font-bold">{`${AR.play.answerLabel}: ${question.answer}`}</p>
      </div>
    </div>
  );
}

/** Two team buttons for crediting whichever team answered a shared question. */
function TeamAwardRow({
  names,
  onAward,
  points,
}: {
  names: [string, string];
  onAward: (team: PlayerIndex) => void;
  points?: number;
}) {
  return (
    <div className="flex gap-2.5">
      {([0, 1] as PlayerIndex[]).map((p) => (
        <button
          key={p}
          onClick={() => onAward(p)}
          className="min-h-14 flex-1 cursor-pointer rounded-2xl px-3 text-base font-black transition active:scale-[0.97] sm:text-lg"
          style={{ backgroundColor: PLAYER_COLORS[p], color: 'var(--color-bg)' }}
        >
          {points != null ? `${names[p]} +${toAr(points)}` : names[p]}
        </button>
      ))}
    </div>
  );
}

function WrongSkipRow({ onWrong, onSkip }: { onWrong: () => void; onSkip: () => void }) {
  return (
    <div className="flex gap-2.5">
      <Button variant="danger" className="flex-1" onClick={onWrong}>
        {`✗ ${AR.play.wrong}`}
      </Button>
      <Button variant="secondary" className="flex-1" onClick={onSkip}>
        {AR.play.skip}
      </Button>
    </div>
  );
}

function Controls({ challenge, names }: { challenge: ChallengeType; names: [string, string] }) {
  const revealedHints = useGameStore((s) => s.revealedHints);
  const orderingRevealed = useGameStore((s) => s.orderingRevealed);
  const answerCorrect = useGameStore((s) => s.answerCorrect);
  const awardCorrect = useGameStore((s) => s.awardCorrect);
  const answerWrong = useGameStore((s) => s.answerWrong);
  const skipQuestion = useGameStore((s) => s.skipQuestion);
  const revealHint = useGameStore((s) => s.revealHint);
  const revealOrder = useGameStore((s) => s.revealOrder);

  if (challenge === 'whoAmI') {
    return (
      <div className="flex flex-col gap-2.5">
        {revealedHints < 4 ? (
          <Button variant="amber" onClick={revealHint}>
            {`${AR.play.revealHint} (${toAr(revealedHints + 1)}/${toAr(4)})`}
          </Button>
        ) : null}
        <p className="text-txt2 text-center text-sm font-bold">{AR.play.whoAnswered}</p>
        <TeamAwardRow names={names} onAward={awardCorrect} points={WHOAMI_POINTS[revealedHints - 1] ?? 10} />
        <WrongSkipRow onWrong={answerWrong} onSkip={skipQuestion} />
      </div>
    );
  }

  if (challenge === 'ordering') {
    if (!orderingRevealed) {
      return (
        <Button variant="amber" onClick={revealOrder}>
          {AR.play.revealOrder}
        </Button>
      );
    }
    return (
      <div className="flex flex-col gap-2.5">
        <p className="text-txt2 text-center text-sm font-bold">{AR.play.whoAnswered}</p>
        <TeamAwardRow names={names} onAward={awardCorrect} />
        <WrongSkipRow onWrong={answerWrong} onSkip={skipQuestion} />
      </div>
    );
  }

  if (challenge === 'reversed') {
    return (
      <div className="flex flex-col gap-2.5">
        <p className="text-txt2 text-center text-sm font-bold">{AR.play.whoAnswered}</p>
        <TeamAwardRow names={names} onAward={awardCorrect} />
        <WrongSkipRow onWrong={answerWrong} onSkip={skipQuestion} />
      </div>
    );
  }

  // speed: fast ✓ / ✗ / skip, single-team timed turn
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2.5">
        <Button variant="danger" big className="flex-1" onClick={answerWrong}>
          {`✗ ${AR.play.wrong}`}
        </Button>
        <Button big className="flex-1" onClick={answerCorrect}>
          {`✓ ${AR.play.correct}`}
        </Button>
      </div>
      <Button variant="secondary" onClick={skipQuestion}>
        {AR.play.skip}
      </Button>
    </div>
  );
}

// ---- Bell — tabletop buzzer -------------------------------------------------------

function BellZone({
  team,
  name,
  active,
  highlighted,
  onTap,
  rotated = false,
}: {
  team: PlayerIndex;
  name: string;
  active: boolean;
  highlighted: boolean;
  onTap: (timeStamp: number) => void;
  rotated?: boolean;
}) {
  const color = PLAYER_COLORS[team];
  const lit = active || highlighted;
  return (
    <button
      // pointerdown (not click): simultaneous two-finger taps fire one event per
      // finger with sub-ms timestamps, while click may never fire for multi-touch.
      onPointerDown={(e) => onTap(e.timeStamp)}
      disabled={!active}
      className={`flex min-h-[25dvh] flex-1 cursor-pointer touch-none flex-col items-center justify-center gap-2 rounded-2xl border-4 transition select-none active:scale-[0.98] disabled:cursor-default ${
        rotated ? 'rotate-180' : ''
      }`}
      style={{
        backgroundColor: lit ? color : 'var(--color-surface-alt)',
        borderColor: highlighted ? 'var(--color-warn)' : 'transparent',
      }}
    >
      <span
        className="text-2xl font-black sm:text-3xl"
        style={{ color: lit ? 'var(--color-bg)' : 'var(--color-txt3)' }}
      >
        {name}
      </span>
      {active ? (
        <span className="text-sm font-bold" style={{ color: 'var(--color-bg)', opacity: 0.9 }}>
          {AR.play.bellTapZone}
        </span>
      ) : null}
    </button>
  );
}

function BellArena({
  names,
  scores,
  roundIndex,
  totalRounds,
  question,
  progress,
  isPaused,
  pause,
  resume,
}: {
  names: [string, string];
  scores: [number, number];
  roundIndex: number;
  totalRounds: number;
  question: Question;
  progress: { index: number; total: number };
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
}) {
  const bellPhase = useGameStore((s) => s.bellPhase);
  const bellBuzzer = useGameStore((s) => s.bellBuzzer);
  const armBell = useGameStore((s) => s.armBell);
  const buzz = useGameStore((s) => s.buzz);
  const bellJudge = useGameStore((s) => s.bellJudge);
  const bellNoOne = useGameStore((s) => s.bellNoOne);
  const skipQuestion = useGameStore((s) => s.skipQuestion);

  const zoneActive = bellPhase === 'armed' && !isPaused;
  const questionHidden = bellPhase === 'armed';
  const buzzedTeam = bellPhase === 'buzzed' || bellPhase === 'steal' ? bellBuzzer : null;
  const buzzedName = buzzedTeam != null ? names[buzzedTeam] : '';

  // The answer is never shown automatically — the referee must tap to reveal it,
  // so it isn't spoiled on the tabletop screen when a team buzzes. Reset the
  // reveal whenever the buzzer arms or a new question begins (bellPhase resets
  // to 'idle' between questions).
  const [answerShown, setAnswerShown] = useState(false);
  useEffect(() => {
    if (bellPhase === 'idle' || bellPhase === 'armed') setAnswerShown(false);
  }, [bellPhase]);

  return (
    <main className="mx-auto flex h-dvh w-full max-w-2xl flex-col gap-2 px-3 py-3 sm:px-6">
      <BellZone
        team={1}
        name={names[1]}
        active={zoneActive}
        highlighted={buzzedTeam === 1}
        onTap={(ts) => buzz(1, ts)}
        rotated
      />

      <div className="border-line bg-surface shrink-0 rounded-2xl border p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={isPaused ? resume : pause}
            className="border-line bg-surface-alt text-amber min-h-9 cursor-pointer rounded-full border px-4 text-sm font-bold"
          >
            {isPaused ? AR.play.resume : AR.play.pause}
          </button>
          <span className="text-txt2 text-sm font-bold">
            {`${AR.challenges.bell.name} · ${AR.roundIntro.round(roundIndex + 1, totalRounds)} · ${AR.play.questionOf(progress.index, progress.total)}`}
          </span>
          <span className="text-sm font-bold">
            <span style={{ color: PLAYER_COLORS[0] }}>{toAr(scores[0])}</span>
            {' – '}
            <span style={{ color: PLAYER_COLORS[1] }}>{toAr(scores[1])}</span>
          </span>
        </div>

        {questionHidden ? (
          <p className="text-txt3 mt-3 text-center text-lg font-bold sm:text-xl">
            {AR.play.bellHidden}
          </p>
        ) : (
          <>
            <p
              className={`mt-3 text-center text-lg font-bold sm:text-xl ${isPaused ? 'opacity-10' : ''}`}
            >
              {question.text}
            </p>
            {!isPaused ? (
              <div className="mt-2 flex justify-center">
                {answerShown ? (
                  <p className="text-amber text-center text-sm font-bold">
                    {`${AR.play.answerLabel}: ${question.answer}`}
                  </p>
                ) : (
                  <button
                    onClick={() => setAnswerShown(true)}
                    className="border-line bg-surface-alt text-amber min-h-9 cursor-pointer rounded-full border px-4 text-sm font-bold"
                  >
                    {AR.play.bellRevealAnswer}
                  </button>
                )}
              </div>
            ) : null}
          </>
        )}

        {isPaused ? (
          <p className="text-amber mt-3 text-center text-lg font-black">{AR.play.paused}</p>
        ) : (
          <div className="mt-4">
            {bellPhase === 'idle' ? (
              <div className="flex flex-col gap-2.5">
                <p className="text-txt2 text-center text-sm font-semibold">{AR.play.bellReadFirst}</p>
                <Button onClick={armBell}>{AR.play.bellArm}</Button>
                <Button variant="ghost" onClick={skipQuestion}>
                  {AR.play.skip}
                </Button>
              </div>
            ) : null}

            {bellPhase === 'armed' ? (
              <div className="flex flex-col gap-2.5">
                <p className="text-accent animate-pulse text-center text-sm font-bold">
                  {AR.play.bellArmedHint}
                </p>
                <div className="flex gap-2.5">
                  <Button variant="secondary" className="flex-1" onClick={bellNoOne}>
                    {AR.play.noOne}
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={skipQuestion}>
                    {AR.play.skip}
                  </Button>
                </div>
              </div>
            ) : null}

            {bellPhase === 'buzzed' || bellPhase === 'steal' ? (
              <div className="flex flex-col gap-2.5">
                <p
                  className="text-center text-lg font-black"
                  style={{ color: buzzedTeam != null ? PLAYER_COLORS[buzzedTeam] : undefined }}
                >
                  {bellPhase === 'steal' ? AR.play.bellSteal(buzzedName) : AR.play.bellBuzzed(buzzedName)}
                </p>
                <p className="text-txt2 text-center text-sm font-bold">{AR.play.bellWasCorrect}</p>
                <div className="flex gap-2.5">
                  <Button variant="danger" className="flex-1" onClick={() => bellJudge(false)}>
                    {`✗ ${AR.play.wrong}`}
                  </Button>
                  <Button className="flex-1" onClick={() => bellJudge(true)}>
                    {`✓ ${AR.play.correct}`}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <BellZone
        team={0}
        name={names[0]}
        active={zoneActive}
        highlighted={buzzedTeam === 0}
        onTap={(ts) => buzz(0, ts)}
      />
    </main>
  );
}

// ---- Round result ------------------------------------------------------------------

function ScoreBar({
  index,
  name,
  delta,
  total,
  maxScore,
  delay,
}: {
  index: PlayerIndex;
  name: string;
  delta: number;
  total: number;
  maxScore: number;
  delay: number;
}) {
  const color = PLAYER_COLORS[index];
  const width = Math.max(6, (maxScore > 0 ? total / maxScore : 0) * 100);
  return (
    <div className="mb-5">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-bold">{name}</span>
        <span className="text-sm font-bold" style={{ color }}>{`+${toAr(delta)}`}</span>
      </div>
      <div className="bg-surface-alt h-10 overflow-hidden rounded-xl">
        <div
          className="animate-grow-bar grid h-full place-items-center rounded-xl px-2"
          style={{ width: `${width}%`, backgroundColor: color, animationDelay: `${delay}ms` }}
        >
          <span className="text-bg text-sm font-black">{toAr(total)}</span>
        </div>
      </div>
    </div>
  );
}

function RoundResult() {
  const config = useGameStore((s) => s.config)!;
  const scores = useGameStore((s) => s.scores);
  const roundIndex = useGameStore((s) => s.roundIndex);
  const delta = useGameStore(useShallow(selectRoundDelta));
  const nextRound = useGameStore((s) => s.nextRound);

  const isLastRound = roundIndex + 1 >= config.challenges.length;
  const maxScore = Math.max(scores[0], scores[1], 1);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-evenly px-5 py-8">
      <header className="animate-pop-in text-center">
        <p className="text-amber font-bold">
          {AR.roundIntro.round(roundIndex + 1, config.challenges.length)}
        </p>
        <h1 className="text-4xl font-black sm:text-5xl">{AR.roundResult.title}</h1>
      </header>

      <section
        className="animate-pop-in border-line bg-surface rounded-2xl border p-6"
        style={{ animationDelay: '0.15s' }}
      >
        <p className="text-txt2 mb-5 text-sm font-bold">
          {`${AR.roundResult.roundPoints} · ${AR.roundResult.total}`}
        </p>
        <ScoreBar index={0} name={config.players[0]} delta={delta[0]} total={scores[0]} maxScore={maxScore} delay={200} />
        <ScoreBar index={1} name={config.players[1]} delta={delta[1]} total={scores[1]} maxScore={maxScore} delay={400} />
      </section>

      <div className="animate-pop-in" style={{ animationDelay: '0.3s' }}>
        <Button big onClick={nextRound}>
          {isLastRound ? AR.roundResult.finish : AR.roundResult.next}
        </Button>
      </div>
    </main>
  );
}

// ---- Final -----------------------------------------------------------------------

function Final({ nav }: { nav: Nav }) {
  const config = useGameStore((s) => s.config)!;
  const scores = useGameStore((s) => s.scores);
  const rematch = useGameStore((s) => s.rematch);
  const reset = useGameStore((s) => s.reset);

  const [a, b] = scores;
  const isTie = a === b;
  const winnerIndex: PlayerIndex = a >= b ? 0 : 1;
  const winnerColor = isTie ? 'var(--color-amber)' : PLAYER_COLORS[winnerIndex];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-evenly px-5 py-8">
      <Confetti />

      <header className="animate-pop-in flex flex-col items-center gap-4 text-center">
        <p className="text-txt2 text-lg font-bold">{AR.final.title}</p>
        <div
          className="grid size-28 place-items-center rounded-full border-[3px] sm:size-32"
          style={{ borderColor: winnerColor }}
        >
          <span className="text-6xl">🏆</span>
        </div>
        <h1 className="text-3xl font-black sm:text-4xl" style={{ color: winnerColor }}>
          {isTie ? AR.final.tie : AR.final.winner(config.players[winnerIndex])}
        </h1>
      </header>

      <section
        className="animate-pop-in border-line bg-surface rounded-2xl border p-6"
        style={{ animationDelay: '0.2s' }}
      >
        {([0, 1] as PlayerIndex[]).map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <span className="text-lg font-bold" style={{ color: PLAYER_COLORS[i] }}>
              {config.players[i]}
            </span>
            <span className="text-xl font-black">{`${toAr(scores[i])} ${AR.final.points}`}</span>
          </div>
        ))}
      </section>

      <div className="animate-pop-in flex flex-col gap-3" style={{ animationDelay: '0.35s' }}>
        <Button big onClick={rematch}>
          {AR.final.rematch}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            reset();
            nav.go('home');
          }}
        >
          {AR.final.newGame}
        </Button>
      </div>
    </main>
  );
}
