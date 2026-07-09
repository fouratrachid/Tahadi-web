import { useState } from 'react';

import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AR } from '@/i18n/ar';
import { hapticSelect } from '@/lib/haptics';
import { IMPOSTER_CATEGORIES } from '@/imposter/lib/words';
import { loadPlayers, savePlayers } from '@/imposter/lib/storage';
import { useImposterStore } from '@/imposter/store/imposterStore';
import type {
  ImposterCategory,
  ImposterDifficulty,
  ImposterMode,
} from '@/imposter/types';

const TIMERS: (60 | 120 | 300)[] = [60, 120, 300];
const TIMER_LABELS: Record<60 | 120 | 300, string> = {
  60: 'دقيقة واحدة',
  120: 'دقيقتان',
  300: '5 دقائق',
};

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-5 py-2 text-sm font-bold transition active:scale-[0.97] ${
        selected
          ? 'bg-accent border-accent text-bg'
          : 'bg-surface border-line text-txt hover:bg-surface-alt'
      }`}
    >
      {label}
    </button>
  );
}

export function ImposterSetupScreen() {
  const configure = useImposterStore((s) => s.configure);
  const backToGames = useImposterStore((s) => s.backToGames);

  const [players, setPlayers] = useState<string[]>(() => {
    const saved = loadPlayers();
    return saved.length >= 3 ? saved : ['', '', ''];
  });
  const [category, setCategory] = useState<ImposterCategory | 'random'>('random');
  const [difficulty, setDifficulty] = useState<ImposterDifficulty | 'mixed'>('mixed');
  const [mode, setMode] = useState<ImposterMode>('classic');
  const [imposterCount, setImposterCount] = useState<1 | 2>(1);
  const [timerSec, setTimerSec] = useState<60 | 120 | 300>(120);
  const [useCustomWord, setUseCustomWord] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [error, setError] = useState<string | null>(null);

  const updatePlayer = (i: number, value: string): void => {
    setPlayers((prev) => prev.map((p, idx) => (idx === i ? value : p)));
  };

  const addPlayer = (): void => {
    if (players.length >= 15) return;
    hapticSelect();
    setPlayers((prev) => [...prev, '']);
  };

  const removePlayer = (i: number): void => {
    if (players.length <= 3) return;
    hapticSelect();
    setPlayers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onStart = (): void => {
    const names = players.map((p) => p.trim()).filter(Boolean);
    if (names.length < 3 || names.length > 15) {
      setError(AR.imposter.setup.errPlayers);
      return;
    }
    if (mode === 'double' && names.length < 6) {
      setError(AR.imposter.setup.errDoubleNeedsPlayers);
      return;
    }
    if (useCustomWord && !customWord.trim()) {
      setError(AR.imposter.setup.errCustomWord);
      return;
    }
    setError(null);
    savePlayers(names);
    const ok = configure({
      players: names,
      category,
      difficulty,
      mode,
      imposterCount: mode === 'double' ? 2 : imposterCount,
      timerSec,
      customWord: useCustomWord ? customWord.trim() : null,
    });
    if (!ok) setError(AR.imposter.setup.errPlayers);
  };

  const inputClass =
    'bg-surface border-line focus:border-accent min-h-12 w-full rounded-xl border-[1.5px] px-4 text-base font-bold outline-none transition placeholder:text-txt3';

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-10 sm:px-8">
      <ScreenHeader title={AR.imposter.setup.title} onBack={backToGames} />

      {/* Players */}
      <h2 className="text-accent mt-6 mb-3 text-lg font-bold">
        {AR.imposter.setup.playersTitle}
      </h2>
      <div className="flex flex-col gap-2">
        {players.map((name, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={name}
              onChange={(e) => updatePlayer(i, e.target.value)}
              placeholder={`${AR.imposter.setup.playerPlaceholder} ${i + 1}`}
              maxLength={16}
              className={inputClass}
            />
            {players.length > 3 ? (
              <button
                onClick={() => removePlayer(i)}
                className="text-danger border-line bg-surface min-h-12 shrink-0 cursor-pointer rounded-xl border-[1.5px] px-4 font-black"
              >
                ✕
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {players.length < 15 ? (
        <div className="mt-2">
          <Button variant="secondary" onClick={addPlayer}>
            {AR.imposter.setup.addPlayer}
          </Button>
        </div>
      ) : null}

      {/* Category */}
      <h2 className="text-accent mt-8 mb-3 text-lg font-bold">{AR.imposter.setup.categoryTitle}</h2>
      <div className="flex flex-wrap gap-2.5">
        <Chip
          label={AR.imposter.setup.randomCategory}
          selected={category === 'random'}
          onClick={() => {
            hapticSelect();
            setCategory('random');
          }}
        />
        {IMPOSTER_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={AR.imposter.categories[cat]}
            selected={category === cat}
            onClick={() => {
              hapticSelect();
              setCategory(cat);
            }}
          />
        ))}
      </div>

      {/* Difficulty */}
      <h2 className="text-accent mt-8 mb-3 text-lg font-bold">{AR.imposter.setup.difficultyTitle}</h2>
      <div className="flex flex-wrap gap-2.5">
        {(['easy', 'medium', 'hard', 'mixed'] as const).map((d) => (
          <Chip
            key={d}
            label={AR.imposter.setup.difficulty[d]}
            selected={difficulty === d}
            onClick={() => {
              hapticSelect();
              setDifficulty(d);
            }}
          />
        ))}
      </div>

      {/* Mode */}
      <h2 className="text-accent mt-8 mb-3 text-lg font-bold">{AR.imposter.setup.modeTitle}</h2>
      <div className="flex flex-col gap-2.5">
        {(['classic', 'double', 'fakeWord', 'mixed'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              hapticSelect();
              setMode(m);
            }}
            className={`flex min-h-14 cursor-pointer flex-col items-start gap-0.5 rounded-xl border-[1.5px] p-3 text-start transition active:scale-[0.98] ${
              mode === m ? 'border-accent bg-surface-alt' : 'border-line bg-surface hover:bg-surface-alt'
            }`}
          >
            <span className="font-bold">{AR.imposter.setup.mode[m]}</span>
            <span className="text-txt3 text-xs">{AR.imposter.setup.modeDesc[m]}</span>
          </button>
        ))}
      </div>

      {mode === 'classic' ? (
        <>
          <h2 className="text-accent mt-8 mb-3 text-lg font-bold">
            {AR.imposter.setup.imposterCountTitle}
          </h2>
          <div className="flex flex-wrap gap-2.5">
            <Chip
              label={AR.imposter.setup.oneImposter}
              selected={imposterCount === 1}
              onClick={() => {
                hapticSelect();
                setImposterCount(1);
              }}
            />
            <Chip
              label={AR.imposter.setup.twoImposters}
              selected={imposterCount === 2}
              onClick={() => {
                hapticSelect();
                setImposterCount(2);
              }}
            />
          </div>
        </>
      ) : null}

      {/* Custom word */}
      <h2 className="text-accent mt-8 mb-3 text-lg font-bold">{AR.imposter.setup.customWordToggle}</h2>
      <div className="flex flex-col gap-2.5">
        <Chip
          label={AR.imposter.setup.customWordToggle}
          selected={useCustomWord}
          onClick={() => {
            hapticSelect();
            setUseCustomWord((v) => !v);
          }}
        />
        {useCustomWord ? (
          <input
            value={customWord}
            onChange={(e) => setCustomWord(e.target.value)}
            placeholder={AR.imposter.setup.customWordPlaceholder}
            maxLength={24}
            className={inputClass}
          />
        ) : null}
      </div>

      {/* Timer */}
      <h2 className="text-accent mt-8 mb-3 text-lg font-bold">{AR.imposter.setup.timerTitle}</h2>
      <div className="flex flex-wrap gap-2.5">
        {TIMERS.map((t) => (
          <Chip
            key={t}
            label={TIMER_LABELS[t]}
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
        <Button big variant="amber" onClick={onStart}>
          {AR.imposter.setup.start}
        </Button>
      </div>
    </main>
  );
}
