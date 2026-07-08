import type { Nav } from '@/App';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AR, toAr } from '@/i18n/ar';
import { CATEGORIES, CHALLENGE_TYPES, categoryTotal, getPack, grandTotal } from '@/lib/packs';

export function PacksScreen({ nav }: { nav: Nav }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-10 sm:px-8">
      <ScreenHeader title={AR.packs.title} onBack={() => nav.go('home')} />
      <p className="text-accent mb-5 text-sm font-bold">{AR.packs.total(grandTotal())}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <section
            key={cat}
            className="border-line bg-surface border-s-accent rounded-2xl border border-s-4 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">{AR.categories[cat]}</h2>
              <span className="text-amber text-sm font-bold">
                {`${toAr(categoryTotal(cat))} ${AR.packs.questions}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHALLENGE_TYPES.map((ch) => (
                <div
                  key={ch}
                  className="bg-surface-alt flex flex-col items-center rounded-lg px-3 py-1.5"
                >
                  <span className="text-txt2 text-xs">{AR.challenges[ch].name}</span>
                  <span className="text-sm font-bold">{toAr(getPack(cat, ch).length)}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
