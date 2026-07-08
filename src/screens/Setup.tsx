import { useState } from 'react';

import type { Nav } from '@/App';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AR, toAr } from '@/i18n/ar';
import { hapticSelect } from '@/lib/haptics';
import { CATEGORIES, CHALLENGE_TYPES } from '@/lib/packs';
import { useGameStore } from '@/store/gameStore';
import type { Category, ChallengeType, TimerSeconds } from '@/types';

const TIMERS: TimerSeconds[] = [15, 30, 45, 60];
const MAX_CATEGORIES = CATEGORIES.length;
const MAX_CHALLENGES = CHALLENGE_TYPES.length;

function Chip({
  label,
  selected,
  badge,
  onClick,
}: {
  label: string;
  selected: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-5 py-2 text-sm font-bold transition active:scale-[0.97] ${
        selected
          ? 'bg-accent border-accent text-bg'
          : 'bg-surface border-line text-txt hover:bg-surface-alt'
      }`}
    >
      {badge ? (
        <span className="bg-bg text-accent grid size-6 shrink-0 place-items-center rounded-full text-xs font-black">
          {badge}
        </span>
      ) : null}
      {label}
    </button>
  );
}

export function SetupScreen({ nav }: { nav: Nav }) {
  const configureGame = useGameStore((s) => s.configureGame);

  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [categories, setCategories] = useState<Category[]>(['football']);
  const [challenges, setChallenges] = useState<ChallengeType[]>([
    'speed',
    'whoAmI',
    'reversed',
    'bell',
  ]);
  const [timerSec, setTimerSec] = useState<TimerSeconds>(30);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (cat: Category): void => {
    hapticSelect();
    setCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat);
      if (prev.length >= MAX_CATEGORIES) return prev;
      return [...prev, cat];
    });
  };

  const toggleChallenge = (ch: ChallengeType): void => {
    hapticSelect();
    setChallenges((prev) => {
      if (prev.includes(ch)) return prev.filter((c) => c !== ch);
      if (prev.length >= MAX_CHALLENGES) return prev;
      return [...prev, ch];
    });
  };

  const onStart = (): void => {
    if (!name1.trim() || !name2.trim()) {
      setError(AR.setup.errNames);
      return;
    }
    if (categories.length < 1) {
      setError(AR.setup.errCategories);
      return;
    }
    if (challenges.length < 1) {
      setError(AR.setup.errChallenges);
      return;
    }
    setError(null);
    const ok = configureGame({
      players: [name1.trim(), name2.trim()],
      categories,
      challenges,
      timerSec,
    });
    if (ok) nav.go('game');
  };

  const inputClass =
    'bg-surface border-line focus:border-accent min-h-14 w-full rounded-xl border-[1.5px] px-4 text-lg font-bold outline-none transition placeholder:text-txt3';

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-10 sm:px-8">
      <ScreenHeader title={AR.setup.title} onBack={() => nav.go('home')} />

      {/* Players */}
      <h2 className="text-accent mt-6 mb-3 text-lg font-bold">{AR.setup.playersTitle}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-p1 text-sm font-bold">{AR.setup.player1}</span>
          <input
            value={name1}
            onChange={(e) => setName1(e.target.value)}
            placeholder={AR.setup.playerPlaceholder}
            maxLength={16}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-p2 text-sm font-bold">{AR.setup.player2}</span>
          <input
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            placeholder={AR.setup.playerPlaceholder}
            maxLength={16}
            className={inputClass}
          />
        </label>
      </div>

      {/* Categories */}
      <h2 className="text-accent mt-8 mb-3 text-lg font-bold">{AR.setup.categoriesTitle}</h2>
      <div className="flex flex-wrap gap-2.5">
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={AR.categories[cat]}
            selected={categories.includes(cat)}
            onClick={() => toggleCategory(cat)}
          />
        ))}
      </div>

      {/* Challenges */}
      <h2 className="text-accent mt-8 mb-1 text-lg font-bold">{AR.setup.challengesTitle}</h2>
      <p className="text-txt3 mb-3 text-xs font-semibold">{AR.setup.orderHint}</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {CHALLENGE_TYPES.map((ch) => {
          const order = challenges.indexOf(ch);
          const selected = order >= 0;
          return (
            <button
              key={ch}
              onClick={() => toggleChallenge(ch)}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-[1.5px] p-3 text-start transition active:scale-[0.98] ${
                selected
                  ? 'border-accent bg-surface-alt'
                  : 'border-line bg-surface hover:bg-surface-alt'
              }`}
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-black ${
                  selected ? 'bg-accent text-bg' : 'bg-surface-hi text-txt3'
                }`}
              >
                {selected ? toAr(order + 1) : '·'}
              </span>
              <span className="flex flex-col">
                <span className={`font-bold ${selected ? 'text-txt' : 'text-txt2'}`}>
                  {AR.challenges[ch].name}
                </span>
                <span className="text-txt3 text-xs">{AR.challenges[ch].short}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Timer */}
      <h2 className="text-accent mt-8 mb-3 text-lg font-bold">{AR.setup.timerTitle}</h2>
      <div className="flex flex-wrap gap-2.5">
        {TIMERS.map((t) => (
          <Chip
            key={t}
            label={`${toAr(t)} ${AR.setup.seconds}`}
            selected={timerSec === t}
            onClick={() => {
              hapticSelect();
              setTimerSec(t);
            }}
          />
        ))}
      </div>

      {error ? (
        <p className="text-danger mt-6 text-center font-bold" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8">
        <Button big onClick={onStart}>
          {AR.setup.start}
        </Button>
      </div>
    </main>
  );
}
