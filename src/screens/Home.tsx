import type { Nav } from '@/App';
import { Button } from '@/components/Button';
import { AR } from '@/i18n/ar';
import { useGameStore } from '@/store/gameStore';
import type { Category } from '@/types';

/** The categories illustrated on the logo — football, movies, anime, Tunisia, geography, history & politics. */
const PREVIEW_CATEGORIES: Category[] = [
  'football',
  'movies',
  'anime',
  'tunisia',
  'geography',
  'history',
];

export function HomeScreen({ nav }: { nav: Nav }) {
  const reset = useGameStore((s) => s.reset);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-between px-6 py-10 sm:py-14">
      <div className="flex flex-col items-center gap-4 pt-4 sm:pt-8">
        <div className="border-accent/50 size-36 shrink-0 overflow-hidden rounded-[2rem] border-[3px] bg-white shadow-[0_0_40px_-8px_var(--color-accent)] sm:size-44">
          <img src="/logo.png" alt={AR.appName} className="size-full object-cover" />
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-accent text-4xl font-black sm:text-5xl">{AR.appName}</span>
          <span className="text-txt3 text-xs font-black tracking-[0.4em] uppercase">
            {AR.appNameEn}
          </span>
        </div>

        <p className="max-w-xs text-center text-lg font-bold">{AR.tagline}</p>

        <div className="flex flex-wrap items-center justify-center gap-2 px-2">
          {PREVIEW_CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="border-line bg-surface text-txt2 rounded-full border px-3 py-1 text-xs font-bold"
            >
              {AR.categories[cat]}
            </span>
          ))}
        </div>

        <p className="text-txt2 text-sm font-semibold">{AR.home.subtitle}</p>
      </div>

      <nav className="flex flex-col gap-3 pb-4">
        <Button
          big
          onClick={() => {
            reset();
            nav.go('setup');
          }}
        >
          {AR.home.newGame}
        </Button>
        <Button variant="secondary" onClick={() => nav.go('packs')}>
          {AR.home.packs}
        </Button>
        <Button variant="secondary" onClick={() => nav.go('history')}>
          {AR.home.history}
        </Button>
        <Button variant="ghost" onClick={() => nav.go('settings')}>
          {AR.home.settings}
        </Button>
      </nav>
    </main>
  );
}
