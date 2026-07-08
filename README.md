# تحدّي (Tahadi) — Web Version

The web version of the Tahadi offline Arabic party trivia game: two contestants and one referee who holds the device, reads questions aloud, and judges answers. Fully client-side — no backend, no accounts, everything bundled.

This is a port of the React Native app in `../Tahadi`; the game logic (state machine, question selector, scoring, grapheme-safe word reversal) and all ~700 Arabic questions are shared with it.

## Stack

- **Vite 8 + React 19 + TypeScript (strict)**
- **Tailwind CSS v4** (via `@tailwindcss/vite`, theme tokens in `src/index.css`)
- **Zustand** — one strict state machine (`idle → roundIntro → playing → betweenTurns → roundResult → finished`); illegal transitions are no-ops
- Cairo font (Arabic subsets, self-hosted via `@fontsource/cairo`)
- Full **RTL** (`<html dir="rtl">` + logical Tailwind utilities)
- Sounds: synthesized WAVs in `public/sounds`, played via `HTMLAudioElement`
- Haptics: `navigator.vibrate` where supported (Android browsers)
- Persistence: `localStorage` (settings, last 20 games, used-question ids per pack)

## Responsive design

Mobile-first — the referee typically holds a phone:

- Game screens are a single fluid column (`max-w-xl/2xl`), controls ≥ 56px tall for fast tapping
- Setup, packs, and history switch to two-column grids from `sm:` up
- `min-h-dvh` layouts, no horizontal scroll at any width
- The countdown is timestamp-based (`Date.now()` + `requestAnimationFrame`) — no drift; switching tabs auto-pauses the timer and resumes with the exact remaining time

## Run

```bash
npm install
npm run dev       # http://localhost:5173
```

## Quality gates

```bash
npm run build     # tsc -b (strict) + vite build
npm run lint      # oxlint
```

## Deploy

`npm run build` produces a static `dist/` (relative base path, so it works from any subfolder). Host it on anything static — GitHub Pages, Netlify, Vercel, nginx.

## Layout

```
src/
  screens/        Home, Setup, GameFlow (intro/play/results/final), Packs, History, Settings
  components/     Button, CountdownRing, ScoreHeader, Confetti, ScreenHeader
  store/          gameStore (state machine) + settingsStore
  lib/            questionSelector, scoring, grapheme, packs, storage, soundManager, haptics
  i18n/ar.ts      every user-facing string (Arabic, MSA)
  assets/packs/   20 bundled question packs (JSON, imported at build time)
public/sounds/    6 synthesized WAV effects
```
