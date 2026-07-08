import type { Nav } from '@/App';
import { Button } from '@/components/Button';
import { AR } from '@/i18n/ar';
import { useGameStore } from '@/store/gameStore';

export function HomeScreen({ nav }: { nav: Nav }) {
  const reset = useGameStore((s) => s.reset);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-between px-6 py-12 sm:py-16">
      <div className="flex flex-col items-center gap-3 pt-8 sm:pt-14">
        <div className="border-accent mb-3 rounded-[28px] border-[3px] px-10 py-2">
          <span className="text-accent text-7xl font-black sm:text-8xl">{AR.appName}</span>
        </div>
        <p className="text-xl font-bold">{AR.tagline}</p>
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
